"use client"

import React from "react"
import { motion } from "framer-motion"

export default function TypingDots(){
  return (
    <div className="flex items-center space-x-1">
      {[0,1,2].map(i=>(
        <motion.span
          key={i}
          className="text-xl"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            repeatType:"reverse",
            duration:0.8,
            delay: i*0.2
          }}
        >
          •
        </motion.span>
      ))}
    </div>
  )
}