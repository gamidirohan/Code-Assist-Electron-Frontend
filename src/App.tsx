import SubscribedApp from "./_pages/SubscribedApp"
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient
} from "@tanstack/react-query"
import { useEffect, useState, useCallback } from "react"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "./components/ui/toast"

// Extend the Window interface to include custom properties
declare global {
  interface Window {
    __IS_INITIALIZED__?: boolean
    __LANGUAGE__?: string
    __MODEL__?: string
    __CREDITS__: number | undefined
  }
}
import { ToastContext } from "./contexts/toast"

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: Infinity,
      retry: 1,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
})

// Root component that provides the QueryClient
function App() {
  type ToastVariant = "neutral" | "success" | "error"

  const [toastState, setToastState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: ToastVariant;
  }>({
    open: false,
    title: "",
    description: "",
    variant: "neutral"
  })
  const [credits, setCredits] = useState<number>(999) // Set a high default value
  const [currentLanguage, setCurrentLanguage] = useState<string>("python")
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentModel, setCurrentModel] = useState("llama3-70b-8192")

  // Helper function to safely update credits
  const updateCredits = useCallback((newCredits: number) => {
    setCredits(newCredits)
    window.__CREDITS__ = newCredits
  }, [])

  // Helper function to safely update language
  const updateLanguage = useCallback((newLanguage: string) => {
    setCurrentLanguage(newLanguage)
    window.__LANGUAGE__ = newLanguage
  }, [])

  // Helper function to mark initialization complete
  const markInitialized = useCallback(() => {
    setIsInitialized(true)
    window.__IS_INITIALIZED__ = true
  }, [])

  // Show toast method
  const showToast = useCallback(
    (
      title: string,
      description: string,
      variant: "neutral" | "success" | "error"
    ) => {
      setToastState({
        open: true,
        title,
        description,
        variant
      })
    },
    []
  )

  // Initialize app with default values
  useEffect(() => {
    // Set default values
    updateCredits(999) // High number of credits
    updateLanguage("python")
    markInitialized()
  }, [updateCredits, updateLanguage, markInitialized])

  // Close toast after delay
  useEffect(() => {
    if (toastState.open) {
      const timer = setTimeout(() => {
        setToastState((prev) => ({ ...prev, open: false }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toastState.open])

  // Render the main app directly without authentication check
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContext.Provider value={{ showToast }}>
        <ToastProvider>
          <div className="min-h-screen bg-transparent">
            <SubscribedApp
              credits={credits}
              currentLanguage={currentLanguage}
              setLanguage={updateLanguage}
            />
            <Toast
              open={toastState.open}
              onOpenChange={(open) =>
                setToastState((prev) => ({ ...prev, open }))
              }
              variant={toastState.variant}
            >
              <div className="grid gap-1">
                {toastState.title && <ToastTitle>{toastState.title}</ToastTitle>}
                {toastState.description && (
                  <ToastDescription>{toastState.description}</ToastDescription>
                )}
              </div>
            </Toast>
            <ToastViewport />
          </div>
        </ToastProvider>
      </ToastContext.Provider>
    </QueryClientProvider>
  )
}

export default App
