"use client"

import React, { useMemo, useState } from "react"
import { Doughnut, Bar } from "react-chartjs-2"
import { BsRobot } from "react-icons/bs"
import { HiOutlineCog } from "react-icons/hi"
import { FiCopy } from "react-icons/fi"
import { FaCheckCircle } from "react-icons/fa"

import { PortfolioSummary, TokenInfo, WalletEntry } from "../types"
import "../chart"

interface Props {
  wallets: WalletEntry[]
  selectedWallet: string | null
  portfolioSummary: PortfolioSummary
  donutData: any
  barData: any
  holdings: TokenInfo[]
  onAiIconClick: () => void
  onConfigureWallet: (walletAddr: string) => void
  aiActive: boolean
}

export default function MainSection({
  wallets,
  selectedWallet,
  portfolioSummary,
  donutData,
  barData,
  holdings,
  onAiIconClick,
  onConfigureWallet,
  aiActive,
}: Props) {
  const isAggregator = selectedWallet === "AGGREGATE"

  // [NEW] Keep track of which wallet we just copied
  const [copiedWalletAddr, setCopiedWalletAddr] = useState<string | null>(null)

  // find current wallet if single
  const currentWallet = useMemo(() => {
    if (!selectedWallet || isAggregator) return null
    return wallets.find((w) => w.address === selectedWallet) || null
  }, [selectedWallet, isAggregator, wallets])

  // daily $ P&L
  const dailyDollarChange =
    portfolioSummary.totalValueUSD * (portfolioSummary.dailyChangePercent / 100)

  // [NEW] Enhanced copy function
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Mark that this wallet address was successfully copied
      setCopiedWalletAddr(text)
      // Revert after 2 seconds
      setTimeout(() => setCopiedWalletAddr(null), 2000)
    })
  }

  // For aggregator, show holder emojis if available
  function renderHolderEmojis(token: TokenInfo) {
    if (!isAggregator || !token.holderAddresses) return null
    const avatars = token.holderAddresses.map((addr) => {
      const w = wallets.find((wx) => wx.address === addr)
      return w ? w.avatar : "❓"
    })
    return (
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
        {avatars.join(" ")}
      </span>
    )
  }

  // Sort holdings descending by balanceUSD
  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => b.balanceUSD - a.balanceUSD)
  }, [holdings])

  return (
    <div className="flex-1 flex flex-col">
      {/* TOP BAR */}
      <div className="p-4 flex justify-between items-center">
        {selectedWallet ? (
          <>
            {/* Left side: wallet info */}
            <div>
              {isAggregator ? (
                <div>
                  <div className="flex items-center space-x-2 text-xl font-bold mb-1">
                    <span>Aggregate</span>
                  </div>
                  <div className="text-2xl text-gray-700 dark:text-gray-300 font-semibold">
                    ${portfolioSummary.totalValueUSD.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {portfolioSummary.lastUpdated}
                  </div>
                </div>
              ) : currentWallet ? (
                <div>
                  <div className="flex items-center space-x-2 text-xl font-bold mb-1">
                    <span className="text-2xl">{currentWallet.avatar}</span>
                    <span>{currentWallet.name}</span>
                    <button
                      onClick={() => copyToClipboard(currentWallet.address)}
                      className="hover:text-brandGreen dark:hover:text-brandGreen-light text-sm"
                      title="Copy wallet address"
                    >
                      {/* [NEW] If 'copiedWalletAddr' matches this address => check icon, else copy icon */}
                      {copiedWalletAddr === currentWallet.address ? (
                        <FaCheckCircle size={14} />
                      ) : (
                        <FiCopy size={14} />
                      )}
                    </button>
                  </div>
                  <div className="text-2xl text-gray-800 dark:text-gray-100 font-semibold">
                    ${portfolioSummary.totalValueUSD.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {portfolioSummary.lastUpdated}
                  </div>
                </div>
              ) : (
                <div className="text-xl font-bold mb-1">
                  Portfolio: {selectedWallet}
                </div>
              )}
            </div>

            {/* Right side: daily $ & daily %, gear, AI */}
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <div
                  className={
                    dailyDollarChange >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {dailyDollarChange >= 0 ? "+" : ""}
                  $
                  {Math.abs(dailyDollarChange).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div
                  className={
                    portfolioSummary.dailyChangePercent >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {portfolioSummary.dailyChangePercent.toFixed(2)}% (24h)
                </div>
              </div>
              {/* Configure gear button */}
              {!isAggregator && currentWallet && (
                <button
                  className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full"
                  title="Configure This Wallet"
                  onClick={() => onConfigureWallet(currentWallet.address)}
                >
                  <HiOutlineCog size={20} />
                </button>
              )}

              <button
                onClick={onAiIconClick}
                className={`p-2 rounded-full transition-colors ${
                  aiActive
                    ? "bg-brandGreen text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                title="AI Insights"
              >
                <BsRobot size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            Select a wallet or click “Aggregate Portfolio” to begin.
          </div>
        )}
      </div>

      {selectedWallet && (
        <div className="flex-1 p-4 overflow-auto scrollbar-hide">
          {/* 
            Example 2-col layout for donut & bar charts
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Donut Chart block */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg min-h-[350px]">
              <h3 className="text-lg font-semibold mb-2">Portfolio Allocation</h3>
              <div className="w-full h-[280px]">
                {donutData ? (
                  <Doughnut data={donutData} options={donutData.options} />
                ) : (
                  <NoData />
                )}
              </div>
            </div>

            {/* Bar Chart block */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg min-h-[350px]">
              <h3 className="text-lg font-semibold mb-2">
                Top vs Worst Performers (24h)
              </h3>
              <div className="w-full h-[280px]">
                {barData ? (
                  <Bar data={barData} options={barData.options} />
                ) : (
                  <NoData />
                )}
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg mt-8">
            <h3 className="font-semibold mb-2">Holdings</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700">
                  <th className="py-3 text-left">Coin</th>
                  <th className="py-3 text-right">Amount</th>
                  <th className="py-3 text-right">Value (USD)</th>
                  <th className="py-3 text-right">24h %</th>
                  <th className="py-3 text-right">Portfolio %</th>
                </tr>
              </thead>
              <tbody>
                {sortedHoldings.map((h, idx) => {
                  const totalVal = portfolioSummary.totalValueUSD
                  const ratio = totalVal ? (h.balanceUSD / totalVal) * 100 : 0
                  let pctDisplay = ratio.toFixed(2)
                  if (ratio < 0.01 && ratio > 0) {
                    pctDisplay = "<0.01"
                  }

                  return (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-1 flex items-center space-x-2">
                        {h.imgUrl ? (
                          <img
                            src={h.imgUrl}
                            alt={h.name}
                            className="w-5 h-5 rounded"
                          />
                        ) : (
                          <span className="w-5 h-5 bg-gray-400 rounded" />
                        )}
                        <span>
                          {h.name} ({h.symbol})
                        </span>
                        {renderHolderEmojis(h)}
                      </td>
                      <td className="py-3 text-right">
                        {h.amount
                          ? h.amount.toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })
                          : "--"}
                      </td>
                      <td className="py-3 text-right">
                        $
                        {h.balanceUSD.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`py-3 text-right ${
                          h.pCh24h != null
                            ? h.pCh24h < 0
                              ? "text-red-500"
                              : "text-green-500"
                            : ""
                        }`}
                      >
                        {h.pCh24h != null ? h.pCh24h.toFixed(2) + "%" : "--"}
                      </td>
                      <td className="py-3 text-right">{pctDisplay}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable fallback for empty charts
function NoData() {
  return <div className="text-gray-500 dark:text-gray-400">No data</div>
}
