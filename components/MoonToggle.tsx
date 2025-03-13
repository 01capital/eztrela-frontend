"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { FaMoon } from "react-icons/fa"

export default function MoonToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex items-center p-2 hover:text-brandGreen dark:hover:text-brandGreen-light transition-colors"
    >
      <FaMoon size={20} />
    </button>
  )
}
