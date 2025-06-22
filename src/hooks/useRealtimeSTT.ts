import { useState, useRef, useCallback, useEffect } from 'react';

const WEBSOCKET_URL_BASE = 'ws://localhost:8000/ws/jiminy/';

export const useRealtimeSTT = () => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Use a ref to track streaming status to avoid dependency cycles in callbacks
  const isStreamingRef = useRef(false);
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const ws = useRef<WebSocket | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const audioProcessor = useRef<ScriptProcessorNode | null>(null);
  const micStream = useRef<MediaStream | null>(null);

  // Effect to generate a session ID once
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  const stopStreaming = useCallback(() => {
    if (!isStreamingRef.current && !ws.current) return; // Use ref to check status

    console.log('[STT] Stopping streaming...');
    setIsStreaming(false);

    if (micStream.current) {
      micStream.current.getTracks().forEach(track => track.stop());
      micStream.current = null;
      console.log('[STT] Microphone stream stopped.');
    }

    if (audioProcessor.current) {
      audioProcessor.current.disconnect();
      audioProcessor.current.onaudioprocess = null; // Make sure to remove the listener
      audioProcessor.current = null;
      console.log('[STT] Audio processor disconnected.');
    }
    if (audioContext.current && audioContext.current.state !== 'closed') {
      audioContext.current.close().then(() => console.log('[STT] Audio context closed.'));
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // Don't send stop command, just close
      ws.current.close();
      console.log('[STT] WebSocket closing.');
    }
    ws.current = null;
    setIsConnected(false);
  }, []); // No dependencies needed now, safe from re-creation

  const startStreaming = useCallback(async () => {
    if (isStreamingRef.current) { // Use ref to check status
      console.log('[STT] Already streaming.');
      return;
    }

    console.log('[STT] Starting streaming process...');
    setIsStreaming(true); // Set state to trigger re-render
    setTranscript('');
    setInterimTranscript('');

    // Ensure we have a session ID before starting
    if (!sessionId) {
      console.error('[STT] Cannot start streaming without a session ID.');
      return;
    }

    try {
      console.log('[STT] Getting user media...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.current = stream;
      console.log('[STT] User media obtained.');


      console.log('[STT] Creating AudioContext...');
      try {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      } catch (e) {
        console.warn('[STT] Failed to set sampleRate, using default. Error:', e);
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      console.log(`[STT] AudioContext created. Sample rate: ${audioContext.current.sampleRate}Hz`);
      
      const source = audioContext.current.createMediaStreamSource(stream);
      audioProcessor.current = audioContext.current.createScriptProcessor(4096, 1, 1);
      console.log('[STT] Audio processor created.');


      const websocketUrl = `${WEBSOCKET_URL_BASE}${sessionId}`;
      console.log(`[STT] Connecting to WebSocket at ${websocketUrl}...`);
      ws.current = new WebSocket(websocketUrl);
      setIsStreaming(true); // Set streaming true before ws events

      ws.current.onopen = () => {
        console.log('[STT] WebSocket connection OPENED.');
        setIsConnected(true);
        
        console.log('[STT] Sending start_stt command...');
        ws.current?.send(JSON.stringify({ type: 'start_stt' }));

        console.log('[STT] Attaching audioprocess listener.');
        audioProcessor.current?.addEventListener('audioprocess', (event) => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            const inputData = event.inputBuffer.getChannelData(0);
            // Resample if necessary (simple downsampling)
            const sampleRate = audioContext.current?.sampleRate || 44100;
            if (sampleRate > 16000) {
                const compression = sampleRate / 16000;
                const length = Math.floor(inputData.length / compression);
                const result = new Float32Array(length);
                let index = 0, j = 0;
                while (index < length) {
                    result[index] = inputData[Math.floor(j)];
                    j += compression;
                    index++;
                }
                const buffer = new Int16Array(result.length);
                for (let i = 0; i < result.length; i++) {
                    buffer[i] = Math.max(-1, Math.min(1, result[i])) * 32767;
                }
                ws.current.send(buffer.buffer);
            } else {
                const buffer = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    buffer[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
                }
                ws.current.send(buffer.buffer);
            }
          }
        });
        
        console.log('[STT] Connecting audio graph (source -> processor -> destination).');
        if (audioProcessor.current && audioContext.current) {
          source.connect(audioProcessor.current);
          audioProcessor.current.connect(audioContext.current.destination);
        }
      };

      ws.current.onmessage = (event) => {
        console.log('[STT] Raw message received from backend:', event.data);
        try {
            const message = JSON.parse(event.data);
            console.log('[STT] Parsed message:', message);
    
            if (message.event_type === 'transcription') {
              setInterimTranscript(message.text || '');
            } else if (message.event_type === 'vad') {
              setIsSpeaking(message.is_speech);
              if (!message.is_speech && interimTranscript) {
                // When speech ends, move interim to final transcript
                setTranscript(prev => `${prev} ${interimTranscript}`.trim());
                setInterimTranscript('');
              }
            } else if (message.event_type === 'error') {
                console.error('[STT] Received error from backend:', message.data);
            } else {
                console.warn('[STT] Received unhandled message type:', message.event_type, message);
            }
        } catch (error) {
            console.error('[STT] Could not parse message from backend:', event.data, error);
        }
      };

      ws.current.onclose = (event) => {
        console.log(`[STT] WebSocket connection CLOSED. Code: ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);
        stopStreaming(); // Ensure cleanup happens
      };

      ws.current.onerror = (error) => {
        console.error('[STT] WebSocket ERROR:', error);
        setIsConnected(false);
        stopStreaming(); // Ensure cleanup happens
      };

    } catch (error) {
      console.error('[STT] Error starting streaming:', error);
      setIsStreaming(false);
    }
  }, [sessionId, stopStreaming]); // Dependencies are now stable

  return {
    transcript,
    interimTranscript,
    isStreaming,
    isConnected,
    isSpeaking,
    startStreaming,
    stopStreaming,
  };
};
