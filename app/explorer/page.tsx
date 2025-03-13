"use client"

import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react"
import Select from "react-select"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { AnimatePresence, motion } from "framer-motion"
import { FaPaperPlane } from "react-icons/fa"
import { HiArrowNarrowLeft } from "react-icons/hi"

/** Minimal coin shape matching your /coins.json */
interface Coin {
  id: string
  symbol: string
  name: string
  image: string
}

/** Chat message shape. */
interface Message {
  role: "user" | "assistant"
  content: string
}

// Random phrases for the first big “report” load
const LOADING_PHRASES = [
  "Collecting financial status...",
  "Reviewing on-chain data...",
  "Gathering macro indicators...",
  "Generating in-depth report...",
  "Evaluating market volatility...",
  "Analyzing news data...",
  "Calling the Financial Agent..."
]

// Typewriter helper
async function typewriter(
  setFunc: (txt: string) => void,
  text: string,
  speed = 20
) {
  const words = text ? text.split(" ") : []
  let current = ""
  for (let i = 0; i < words.length; i++) {
    await new Promise(r => setTimeout(r, speed))
    current += (i > 0 ? " " : "") + words[i]
    setFunc(current)
  }
}

// react-select styling
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "#fff",
    borderColor: state.isFocused ? "#aaa" : "#ccc",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#bbb",
    },
    minHeight: "2.4rem",
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "#fff",
    border: "1px solid #ccc",
  }),
  option: (base: any, { isFocused }: any) => ({
    ...base,
    backgroundColor: isFocused ? "#eee" : "#fff",
    color: "#333",
    cursor: "pointer",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#333",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "#666",
  }),
  input: (base: any) => ({
    ...base,
    color: "#000",
  }),
}

/** Typing indicator for empty assistant bubble */
const TypingDots: React.FC = () => (
  <div className="flex items-center space-x-1">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="text-2xl"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 0.8,
          delay: i * 0.2
        }}
      >
        •
      </motion.span>
    ))}
  </div>
)

export default function ExplorerPage() {
  const [allCoins, setAllCoins] = useState<Coin[]>([])
  const [coinOptions, setCoinOptions] = useState<any[]>([])
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)

  const [sessionId, setSessionId] = useState("") // => determines “chat mode”
  const [report, setReport] = useState<string | null>(null) // typed big “report”
  const [messages, setMessages] = useState<Message[]>([]) // conversation array

  const [input, setInput] = useState("") // user typed input
  const [loadingFirst, setLoadingFirst] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [isAssistantTyping, setIsAssistantTyping] = useState(false)
  const [showCoinError, setShowCoinError] = useState(false)

  // Scroll container
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const userNearBottomRef = useRef(true)

  const EB_BASE_URL = "https://eztrella-api-865549513483.us-central1.run.app"

  // If we have session => chat mode
  const isChatActive = !!sessionId

  // On mount => load coins
  useEffect(() => {
    fetch("/coins.json")
      .then(r => r.json())
      .then((data: Coin[]) => {
        setAllCoins(data)
        setCoinOptions(buildCoinOptions(data, ""))
      })
      .catch(e => console.error("Error loading coins:", e))
  }, [])

  // Auto-scroll if near bottom
  useEffect(() => {
    if (userNearBottomRef.current) {
      scrollToBottom()
    }
  }, [messages, report])

  // Cycle loading phrases
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (loadingFirst) {
      // Start from phrase 0
      setLoadingIndex(0)
      interval = setInterval(() => {
        setLoadingIndex(prev => {
          const next = prev + 1
          // cycle back
          return next < LOADING_PHRASES.length ? next : 0
        })
      }, 2000)
    } else {
      setLoadingIndex(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [loadingFirst])

  function scrollToBottom() {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth"
    })
  }

  function handleScroll() {
    if (!chatContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    userNearBottomRef.current = (scrollHeight - scrollTop - clientHeight < 100)
  }

  function buildCoinOptions(coins: Coin[], inputVal: string) {
    let filtered = coins
    if (inputVal.trim()) {
      const lower = inputVal.toLowerCase()
      filtered = coins.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        c.symbol.toLowerCase().includes(lower)
      )
    } else {
      filtered = coins.slice(0, 50)
    }
    return filtered.map(coin => ({
      value: coin.id,
      label: (
        <div className="flex items-center gap-2 text-sm">
          <img src={coin.image} alt={coin.symbol} className="w-5 h-5" />
          <span>{coin.name}</span>
          <span className="text-gray-400">({coin.symbol})</span>
        </div>
      )
    }))
  }

  function handleCoinSearch(val: string) {
    setCoinOptions(buildCoinOptions(allCoins, val))
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value.slice(0, 1000) // limit 1000 chars
    setInput(text)
  }

  // “Send”
  async function handleSend() {
    if (!input.trim()) return
    if (!selectedCoin) {
      setShowCoinError(true)
      setTimeout(() => setShowCoinError(false), 2000)
      return
    }

    if (!sessionId) {
      // start chat
      setIsAssistantTyping(true)
      setLoadingFirst(true)
      try {
        const resp = await fetch(`${EB_BASE_URL}/initiate_chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coin_id: selectedCoin.id,
            user_message: input.trim()
          })
        })
        if (!resp.ok) throw new Error(`Error code: ${resp.status}`)

        const data = await resp.json()

        setLoadingFirst(false)
        setSessionId(data.session_id || "")

        let bigReport = data.final_report || ""
        await typewriter(val => setReport(val), bigReport)

        setMessages(prev => [...prev, { role: "user", content: input }])
        setInput("")
        setMessages(prev => [...prev, { role: "assistant", content: "" }])

        const reply = data.assistant_reply || ""
        await typewriter((val) => {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: "assistant", content: val }
            return updated
          })
        }, reply)
      } catch (err) {
        console.error("Error initiating chat:", err)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "assistant", content: "Error. Please try again."
          }
          return updated
        })
      } finally {
        setIsAssistantTyping(false)
      }
    } else {
      // subsequent => /chat
      setIsAssistantTyping(true)
      setMessages(prev => [...prev, { role: "user", content: input }])
      setInput("")
      setMessages(prev => [...prev, { role: "assistant", content: "" }])

      try {
        const resp = await fetch(`${EB_BASE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_message: input
          })
        })
        if (!resp.ok) throw new Error(`Error code: ${resp.status}`)

        const data = await resp.json()
        const reply = data.assistant_reply || ""

        await typewriter((val) => {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: "assistant", content: val }
            return updated
          })
        }, reply)
      } catch (err) {
        console.error("Error continuing chat:", err)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "assistant", content: "Error. Please try again."
          }
          return updated
        })
      } finally {
        setIsAssistantTyping(false)
      }
    }
  }

  // End chat => reset
  function handleReset() {
    setSessionId("")
    setReport(null)
    setMessages([])
    setInput("")
    setIsAssistantTyping(false)
    setLoadingFirst(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 relative">
      {/* 
        A single arrow floating top-right, only if chat is active.
        NO new header, just an absolutely positioned button 
        in the top-right corner, "under" the global header.
      */}
      {isChatActive && (
        <button
          onClick={handleReset}
          className="absolute top-3 left-3 z-10 p-2 hover:text-brandGreen dark:hover:text-brandGreen-light 
                     transition-colors flex items-center"
          title="Exit Chat"
        >
          <HiArrowNarrowLeft size={24} />
        </button>
      )}

      <div className="mx-auto w-full max-w-2xl flex-1 flex flex-col min-h-0">
        {/* If no session => “home” interface */}
        {!isChatActive ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold mb-2">Chat with Eztrela Agent</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select a coin, then ask anything here
              </p>
            </div>

            <div className="w-full max-w-xl space-y-3">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                maxLength={1000}
                style={{ maxHeight: "120px", overflowY: "auto" }}
                className="w-full p-2 border border-gray-300 dark:border-gray-700
                  rounded bg-white dark:bg-gray-700 text-black dark:text-white 
                  focus:outline-none text-sm"
                placeholder="Ask about your coin..."
                disabled={loadingFirst}
              />

              {/* messages appear below the input => no bouncing */}
              <div className="space-y-2">
                <AnimatePresence>
                  {messages.map((msg, idx) => {
                    const isUser = msg.role === "user"
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          p-2 rounded text-sm break-words
                          ${isUser
                            ? "bg-brandGreen-light text-black"
                            : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                          }
                        `}
                      >
                        {msg.content}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* coin search + send */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    placeholder="Search coin..."
                    options={coinOptions}
                    onInputChange={handleCoinSearch}
                    onChange={(option: any) => {
                      const found = allCoins.find(c => c.id === option?.value)
                      setSelectedCoin(found || null)
                    }}
                    isClearable
                    styles={selectStyles}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isAssistantTyping}
                  className="px-4 py-2 rounded bg-brandGreen hover:bg-brandGreen-dark text-white
                    disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaPaperPlane />
                </button>
              </div>

              {showCoinError && (
                <p className="text-xs text-red-500">* Please pick a coin first</p>
              )}

              {/* rotating loading phrases */}
              <AnimatePresence mode="wait">
                {loadingFirst && (
                  <motion.div
                    key={loadingIndex}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-2 text-center"
                  >
                    {LOADING_PHRASES[loadingIndex] || ""}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          // chat mode
          <div className="flex-1 flex flex-col min-h-0">
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto pt-8 px-4 pb-2 scrollbar-hide"
            >
              {report && (
                <div className="mb-4 p-4 border border-gray-300 dark:border-gray-700
                  rounded bg-gray-100 dark:bg-gray-800 text-sm 
                  prose dark:prose-invert break-words"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {report}
                  </ReactMarkdown>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isUser = (msg.role === "user")
                const alignment = isUser ? "justify-end" : "justify-start"
                const isAssistantEmpty = (!isUser && msg.content.trim() === "")
                return (
                  <motion.div
                    key={idx}
                    className={`flex ${alignment} mb-4`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded shadow-sm text-sm break-words
                        ${isUser
                          ? "bg-brandGreen-dark text-black"
                          : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                        }`}
                    >
                      {isAssistantEmpty ? (
                        <TypingDots />
                      ) : (
                        <div className="text-sm prose dark:prose-invert break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* pinned input */}
            <div className="p-3 border-t border-transparent bg-white dark:bg-gray-900">

              {selectedCoin && (
                <div className="flex items-center gap-2 text-sm mb-2 text-gray-600 dark:text-gray-300">
                  <img src={selectedCoin.image} alt={selectedCoin.symbol} className="w-5 h-5" />
                  <span>{selectedCoin.symbol.toUpperCase()}</span>
                </div>
              )}

              <div className="relative flex items-start gap-2">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  maxLength={1000}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-700
                    rounded focus:outline-none bg-white dark:bg-gray-700 text-sm 
                    text-black dark:text-white resize-none"
                  style={{ maxHeight: "120px", overflowY: "auto" }}
                  placeholder="Ask Eztrela anything..."
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isAssistantTyping}
                  className="px-3 py-2 bg-brandGreen hover:bg-brandGreen-dark text-white 
                    rounded disabled:opacity-50 flex items-center justify-center"
                >
                  <FaPaperPlane />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter to send. Shift+Enter for new line.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
