import { Landing } from "./pages/Landing.jsx"
import { ThemeProvider } from "./contexts/ThemeContext"

function App() {
  return (
    <ThemeProvider>
      <Landing />
    </ThemeProvider>
  )
}

export default App
