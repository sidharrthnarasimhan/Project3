import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/clerk-react'
import App from '@/App.jsx'
import '@/index.css'

// Import Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ClerkProvider>
) 