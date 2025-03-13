"use client"

import React, { useEffect } from "react"

export default function MatrixBackground() {
  // If you have logic to draw random chars, do it here:
  useEffect(() => {
    // ...
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-0 matrix-bg">
      {/* Possibly a canvas or a <div> with background animation */}
    </div>
  )
}