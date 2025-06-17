# Project Tasks: Real-Time Conversational Co-Pilot

## Decisions Log

*   **Core Architecture:** Electron Frontend, FastAPI Backend, Silero VAD, Faster-Whisper, DeepSeek LLM, ChromaDB for RAG.
*   **Primary Communication:** WebSocket for real-time audio and responses.
*   **UI Layout:** Full-screen with main content area, right sidebar (my/other speech), bottom bar (suggestions).

## To Do

### Frontend (Electron + React)

*   **UI Layout & Shell:**
    *   [ ] Implement basic full-screen Electron window.
    *   [ ] Design and implement the main content area component.
    *   [ ] Design and implement the right sidebar component with two square widgets for "MY_SPEECH" and "OTHER_SPEECH" transcriptions.
    *   [ ] Design and implement the bottom bar component with two long text box widgets for suggestions.
*   **Audio Capture:**
    *   [ ] Implement microphone audio capture.
    *   [ ] Implement system audio loopback capture (OS-specific investigation needed: WASAPI for Windows).
*   **WebSocket Client:**
    *   [ ] Implement WebSocket connection to the FastAPI backend.
    *   [ ] Implement sending `audio_chunk` ("mic" and "system_output") messages.
    *   [ ] Implement handling for `my_speech_transcript_update` messages and display in UI.
    *   [ ] Implement handling for `other_speech_transcript_update` messages and display in UI.
    *   [ ] Implement handling for `ai_suggestion` messages and display in UI.
    *   [ ] Implement handling for `ai_response_chunk` / `ai_response_complete` messages and display in main content UI.
*   **Knowledge Base Interaction (UI):**
    *   [ ] UI for adding new content to the knowledge base.
    *   [ ] UI for displaying knowledge base status (optional).

### Backend (FastAPI)

*   **Server Setup:**
    *   [ ] Basic FastAPI server setup with Uvicorn.
*   **WebSocket Endpoint (`/api/v1/audio_stream`):**
    *   [ ] Implement WebSocket endpoint to receive audio chunks.
    *   [ ] Implement logic to differentiate "mic" and "system_output" streams.
    *   [ ] Buffer incoming audio for each stream.
*   **Audio Processing Pipeline (per stream):**
    *   [ ] Integrate Silero VAD for utterance detection.
    *   [ ] Integrate Faster-Whisper for speech-to-text.
    *   [ ] Tag transcripts as "MY_SPEECH" or "OTHER_SPEECH".
    *   [ ] Send `my_speech_transcript_update` and `other_speech_transcript_update` back to frontend via WebSocket.
*   **Conversation Context & Question Detection:**
    *   [ ] Implement conversation history management.
    *   [ ] Implement question detection logic from "OTHER_SPEECH".
*   **RAG System:**
    *   [ ] Offline script: Preprocess knowledge base, generate embeddings (sentence-transformers), store in ChromaDB.
    *   [ ] Real-time retrieval: Embed question, query ChromaDB.
*   **DeepSeek LLM Orchestration:**
    *   [ ] Construct prompt (history + question + RAG results).
    *   [ ] Call DeepSeek API (streaming).
    *   [ ] Stream `ai_response_chunk` / `ai_response_complete` back to frontend.
    *   [ ] Send `ai_suggestion` (if applicable) back to frontend.
*   **Caching:**
    *   [ ] Implement caching for LLM responses (e.g., `functools.lru_cache`).
*   **Knowledge Base Endpoints:**
    *   [ ] Implement `POST /api/v1/add_to_knowledge_base`.
    *   [ ] Implement `GET /api/v1/knowledge_base_status`.

### General / Project Management

*   [ ] Update `README.md` with backend endpoint details as they are implemented.
*   [ ] Set up environment variables for API keys (e.g., DeepSeek).

## In Progress

*   [X] Define initial MVP plan and architecture (details in `README.md`).
*   [X] Create `TASKS.md` for project tracking.


## Done

*   [X] Initial project setup (based on Interview Coder).
*   [X] Switched to `converse-co-pilot` git branch.
*   [X] Updated `README.md` with the new "Real-Time Conversational Co-Pilot" MVP plan.

## Future Ideas / Backlog

*   Automatic context gathering from active IDE/editor.
*   Voice input/output for commands to the co-pilot itself.
*   Advanced project-wide code analysis.
*   Team collaboration features.
*   Screen recording/video analysis.
*   More sophisticated speaker diarization for multiple "other" speakers.
*   Sentiment/personality analysis from audio.
