import './App.css'
import { ThemeProvider } from 'next-themes'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Pages />
      <Toaster />
    </ThemeProvider>
  )
}

export default App 