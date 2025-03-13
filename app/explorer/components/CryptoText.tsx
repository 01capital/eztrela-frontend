"use client"

import React, { useEffect, useState } from "react"

interface CryptoTextProps {
  text: string
  className?: string
  onComplete?: ()=>void
}

/** Minimal type-in effect for the text. */
export default function CryptoText({ text, className, onComplete }: CryptoTextProps){
  const [displayed, setDisplayed]= useState("")

  useEffect(()=>{
    let idx=0
    const timer= setInterval(()=>{
      if(idx< text.length){
        setDisplayed(d=> d+ text[idx])
        idx++
      } else {
        clearInterval(timer)
        onComplete && onComplete()
      }
    },20)
    return ()=> clearInterval(timer)
  },[text,onComplete])

  return (
    <span className={className}>{displayed}</span>
  )
}