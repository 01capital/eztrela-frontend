"use client"
import { WalletEntry, WalletInfo } from "../types"

interface Props {
  wallets: WalletEntry[]
  selectedWallet: string | null
  allWalletData: Record<string, WalletInfo>
  onSelectWallet: (walletAddr: string) => void
  onAddWallet: () => void
  onAggregate: () => void
}

export default function Sidebar({
  wallets,
  selectedWallet,
  allWalletData,
  onSelectWallet,
  onAddWallet,
  onAggregate,
}: Props) {

  function getWalletBalance(address: string): number {
    const wData = allWalletData[address]
    if (!wData?.balance?.tokens) return 0
    let sum = 0
    wData.balance.tokens.forEach((t) => {
      sum += t.balanceUSD
    })
    return sum
  }

  return (
    <aside className="flex flex-col h-full p-2 scrollbar-hide overflow-y-auto">
      {/* More sophisticated aggregator button */}
      {wallets.length > 1 && (
        <button
          onClick={onAggregate}
          className="block w-full mb-3 bg-gradient-to-r from-green-400 to-green-600 
                     text-white py-2 px-3 rounded font-semibold shadow hover:scale-105 transform transition-transform"
        >
          Combine All Wallets
        </button>
      )}

      {/* Insert "My Portfolio(s)" heading below aggregator */}
      <div className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
        My Portfolio(s)
      </div>

      {/* Wallet List */}
      <div className="mb-4">
        {wallets.map((w) => {
          const isActive = w.address === selectedWallet
          const totalBalance = getWalletBalance(w.address)
          return (
            <div
              key={w.address}
              onClick={() => onSelectWallet(w.address)}
              className={`mb-2 p-2 rounded cursor-pointer ${
                isActive
                  ? "bg-brandGreen text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold truncate">
                <span className="text-xl">{w.avatar}</span>
                <span>{w.name}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Wallet */}
      {wallets.length < 3 ? (
        <button
          onClick={onAddWallet}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                     text-black dark:text-white py-2 px-3 rounded w-full"
        >
          + Add Wallet
        </button>
      ) : (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          You have 3 wallets already
        </div>
      )}
    </aside>
  )
}
