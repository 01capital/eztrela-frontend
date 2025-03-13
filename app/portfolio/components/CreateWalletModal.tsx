"use client"

import { useState, useEffect } from "react"
import { IoClose } from "react-icons/io5"
import { WalletEntry } from "../types"
import dynamic from "next/dynamic"

// We'll only SSR false for emoji picker
const EmojiPicker = dynamic(() => import("@emoji-mart/react"), { ssr: false })

interface Props {
  isOpen: boolean
  editingWallet: WalletEntry | null
  walletError?: string
  onClose: () => void
  onCreateWallet: (emoji: string, address: string, name: string, disconnect?: boolean) => void
}

// Animal-only emojis
const ANIMAL_EMOJIS = [
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁",
  "🐮","🐷","🐸","🐵","🐔","🐦","🐤","🐴","🐗","🐺","🦝",
  "🦓","🦍","🦧","🦮","🐑","🐡","🐊","🦕","🦖","🦎","🐍","🦦"
  // ... add as many as you like
]

export default function CreateWalletModal({
  isOpen,
  editingWallet,
  walletError,
  onClose,
  onCreateWallet,
}: Props) {
  const [selectedEmoji, setSelectedEmoji] = useState("🌏")
  const [walletAddress, setWalletAddress] = useState("")
  const [portfolioName, setPortfolioName] = useState("")
  const [showPickerOverlay, setShowPickerOverlay] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setShowPickerOverlay(false)

    if (editingWallet) {
      // Editing => use the existing
      setSelectedEmoji(editingWallet.avatar)
      setWalletAddress(editingWallet.address)
      setPortfolioName(editingWallet.name)
    } else {
      // Not editing => pick random animal
      const randomIdx = Math.floor(Math.random() * ANIMAL_EMOJIS.length)
      setSelectedEmoji(ANIMAL_EMOJIS[randomIdx])

      setWalletAddress("")
      setPortfolioName("")
    }
  }, [isOpen, editingWallet])

  if (!isOpen) return null

  // [LOCALSTORAGE CHANGE] function to add or remove in localStorage
  function updateLocalStorage(addOrRemove: "add"|"remove", address: string, newWallet?: WalletEntry) {
    try {
      const raw = localStorage.getItem("eztrelaWallets") // or "wallets"
      const stored: WalletEntry[] = raw ? JSON.parse(raw) : []

      if (addOrRemove === "add" && newWallet) {
        // push new
        stored.push(newWallet)
      } else if (addOrRemove === "remove") {
        // remove any matching address
        const idx = stored.findIndex((w) => w.address === address)
        if (idx !== -1) {
          stored.splice(idx, 1)
        }
      }
      // write back
      localStorage.setItem("eztrelaWallets", JSON.stringify(stored))
    } catch (err) {
      console.error("Error updating localStorage wallets:", err)
    }
  }

  function handleSubmit() {
    // create or edit
    const trimmedAddr = walletAddress.trim()
    const trimmedName = portfolioName.trim()
    if (!trimmedAddr || !trimmedName) {
      // optionally handle user error, 
      // but typically you rely on parent's walletError
    }

    if (!editingWallet) {
      // new wallet => store in localStorage
      // [LOCALSTORAGE CHANGE]
      updateLocalStorage("add", trimmedAddr, {
        avatar: selectedEmoji,
        address: trimmedAddr,
        name: trimmedName,
      } as WalletEntry)
    } else {
      // editing => remove old, re-add new if user changed address
      // or just re-add with the new data
      updateLocalStorage("remove", editingWallet.address)
      updateLocalStorage("add", trimmedAddr, {
        avatar: selectedEmoji,
        address: trimmedAddr,
        name: trimmedName,
      } as WalletEntry)
    }

    // call parent's logic
    onCreateWallet(selectedEmoji, trimmedAddr, trimmedName)
  }

  function handleDisconnect() {
    if (!editingWallet) return

    // [LOCALSTORAGE CHANGE] remove from localStorage
    updateLocalStorage("remove", editingWallet.address)

    onCreateWallet(selectedEmoji, editingWallet.address, editingWallet.name, true)
  }

  // The overlay
  const overlay = showPickerOverlay ? (
    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-2 rounded shadow">
        <EmojiPicker
          theme="light"
          previewPosition="none"
          navPosition="bottom"
          emojiButtonSize={40}
          perLine={12}
          onEmojiSelect={(emoji: any) => {
            setSelectedEmoji(emoji.native)
            setShowPickerOverlay(false)
          }}
        />
      </div>
    </div>
  ) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]">
      <div className="relative bg-white dark:bg-gray-800 w-[32rem] p-6 rounded text-black dark:text-white">
        {overlay}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <IoClose size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {editingWallet ? "Edit Wallet" : "Create New Wallet"}
        </h2>

        {/* Avatar */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Portfolio Avatar</label>
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{selectedEmoji}</span>
            <button
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded"
              onClick={() => setShowPickerOverlay(true)}
            >
              Change
            </button>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Wallet Address</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent
                       transition-shadow shadow-sm hover:shadow-md"
            placeholder="0x1234..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>

        {/* Portfolio name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Portfolio Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent
                       transition-shadow shadow-sm hover:shadow-md"
            placeholder="My Solana Wallet"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
          />
        </div>

        {/* Error */}
        {walletError && (
          <div className="text-red-500 text-sm mb-2">
            {walletError}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-6">
          {editingWallet && (
            <button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Disconnect Wallet
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleSubmit}
            className="bg-brandGreen hover:bg-brandGreen-dark text-white px-4 py-2 rounded shadow"
          >
            {editingWallet ? "Save Changes" : "Create Connection"}
          </button>
        </div>
      </div>
    </div>
  )
}
