"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure that component only renders client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Avoid hydration mismatch
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <button
      onClick={toggleTheme}
      className="bg-brandGreen-dark text-white py-2 px-4 rounded hover:bg-brandGreen transition-colors"
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  )
}
