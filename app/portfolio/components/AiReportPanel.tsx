"use client"

import { useState } from "react"
import { Message } from "../types"
import { IoClose } from "react-icons/io5"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { FaPaperPlane } from "react-icons/fa"


interface Props {
  isOpen: boolean
  onClose: () => void
  loading: boolean
  currentMsg: string
  analysisText: string
  chatMessages: Message[]
  chatInput: string
  onChatInputChange: (val: string) => void
  onSendChat: () => void
  isChatLoading: boolean

  // New props for PDF
  pdfWalletName: string
  pdfLastUpdated: string
}

export default function AiReportPanel({
  isOpen,
  onClose,
  loading,
  currentMsg,
  analysisText,
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendChat,
  isChatLoading,
  pdfWalletName,
  pdfLastUpdated,
}: Props) {

  async function handleDownloadPdf() {
    if (!analysisText) return
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF("p", "pt", "letter") // letter or A4
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)

    // A small margin
    const marginLeft = 40
    let yPos = 50

    doc.text(`Wallet Name: ${pdfWalletName}`, marginLeft, yPos)
    yPos += 20
    doc.text(`Last Updated: ${pdfLastUpdated}`, marginLeft, yPos)
    yPos += 30

    // We handle line wrapping
    const lines = doc.splitTextToSize(analysisText, 500)
    doc.text(lines, marginLeft, yPos)

    doc.save(`EztrelaReport-${pdfWalletName}.pdf`)
  }

  return (
    <div
      className={`
        transition-all duration-300
        border-l border-gray-300 dark:border-gray-700
        bg-gray-50 dark:bg-gray-800
        overflow-y-auto
        h-full
        ${isOpen ? "w-96" : "w-0"}
      `}
    >
      {isOpen && (
        <div className="relative h-full flex flex-col p-4 text-black dark:text-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <IoClose size={20} />
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 flex-1">
              <p className="mb-2 font-semibold">Analyzing your portfolio...</p>
              <p className="text-sm">{currentMsg}</p>
            </div>
          ) : analysisText ? (
            <div className="flex flex-col flex-1 overflow-y-auto pt-6">
              {/* AI Portfolio Report */}
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2 text-center">Portfolio Report</h2>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm prose dark:prose-invert break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisText}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Download PDF Button */}
              <button
                onClick={handleDownloadPdf}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
                           text-black dark:text-white px-4 py-1 rounded mb-3 self-start"
              >
                Download PDF
              </button>

              {/* Chat */}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4 flex flex-col flex-1">
                <h3 className="text-lg font-semibold mb-2 text-center">Chat</h3>
                <div className="flex-1 overflow-y-auto mb-3 space-y-2">
                  {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[80%] p-3 rounded shadow-sm text-sm break-words ${
                      msg.role === "user"
                        ? "bg-brandGreen-dark text-gray-200 ml-auto text-right"
                        : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <div className="text-sm prose dark:prose-invert break-words">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                <input
                  className="flex-grow border border-gray-300 dark:border-gray-600 rounded px-2 py-1
                            bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none"
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => onChatInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isChatLoading) {
                      onSendChat()
                    }
                  }}
                />
                  <button
                    onClick={onSendChat}
                    disabled={isChatLoading}
                    className="bg-brandGreen hover:bg-brandGreen-dark text-white px-3 py-1 rounded flex items-center justify-center"
                  >
                    {isChatLoading ? "..." : <FaPaperPlane size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 text-gray-400">
              No analysis yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
