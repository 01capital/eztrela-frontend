"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import {
  WalletInfo,
  AnalysisResponse,
  Message,
  TokenInfo,
  PortfolioSummary,
  WalletEntry,
} from "./types"
import Sidebar from "./components/Sidebar"
import MainSection from "./components/MainSection"
import AiReportPanel from "./components/AiReportPanel"
import NoWalletLanding from "./components/NoWalletLanding"
import CreateWalletModal from "./components/CreateWalletModal"
import { Chart, ArcElement } from "chart.js"
Chart.register(ArcElement)

const EB_BASE_URL = "http://localhost:8000"

export default function PortfolioPage() {
  // --------------------------------------------------
  // 1) State: up to 3 wallets
  // --------------------------------------------------
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [allWalletData, setAllWalletData] = useState<Record<string, WalletInfo>>({})

  // [SPINNER CHANGE] a new state for wallet data loading
  const [isLoadingWalletData, setIsLoadingWalletData] = useState(false)

  // --------------------------------------------------
  // 2) Chart & Holdings Data
  // --------------------------------------------------
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValueUSD: 0,
    dailyChangePercent: 0,
    lastUpdated: new Date().toLocaleString(),
  })
  const [donutData, setDonutData] = useState<any>(null)
  const [barData, setBarData] = useState<any>(null)
  const [holdings, setHoldings] = useState<TokenInfo[]>([])

  // For PDF or reference in AiReportPanel
  const [reportWalletName, setReportWalletName] = useState("")

  // --------------------------------------------------
  // 3) AI Side Panel
  // --------------------------------------------------
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const rotatingMsgs = [
    "Evaluating Latest News…",
    "Analyzing Portfolio Distribution…",
    "Fetching Market Sentiment…",
    "Calculating Risk Metrics…",
    "Compiling AI Insights…",
  ]
  const [currentMsg, setCurrentMsg] = useState(rotatingMsgs[0])
  const msgIndexRef = useRef(0)
  const [analysisText, setAnalysisText] = useState("")
  const [analysisSessionId, setAnalysisSessionId] = useState("")
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)

  // rotating messages effect
  useEffect(() => {
    if (!analysisLoading) {
      msgIndexRef.current = 0
      setCurrentMsg(rotatingMsgs[0])
      return
    }
    const interval = setInterval(() => {
      msgIndexRef.current = (msgIndexRef.current + 1) % rotatingMsgs.length
      setCurrentMsg(rotatingMsgs[msgIndexRef.current])
    }, 1500)
    return () => clearInterval(interval)
  }, [analysisLoading])

  // --------------------------------------------------
  // 4) CREATE / EDIT WALLET
  // --------------------------------------------------
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletEntry | null>(null)
  const [walletError, setWalletError] = useState("")

  function handleCreateWalletClick() {
    setEditingWallet(null)
    setWalletError("")
    setIsCreatingWallet(true)
  }

  function handleConfigureWallet(address: string) {
    const w = wallets.find((wx) => wx.address === address)
    if (!w) return
    setEditingWallet(w)
    setWalletError("")
    setIsCreatingWallet(true)
  }

  function handleCreateWallet(
    emoji: string,
    address: string,
    name: string,
    disconnect?: boolean
  ) {
    setWalletError("")
    if (disconnect && editingWallet) {
      // remove this wallet
      setWallets((prev) => prev.filter((x) => x.address !== editingWallet.address))
      if (selectedWallet === editingWallet.address) {
        setSelectedWallet(null)
      }
      setIsCreatingWallet(false)
      setEditingWallet(null)
      return
    }
    if (!address.trim() || !name.trim()) {
      setWalletError("Please provide a wallet address and portfolio name.")
      return
    }

    // check duplicates
    const existing = wallets.find(
      (x) => x.address.toLowerCase() === address.trim().toLowerCase()
    )
    if (editingWallet) {
      // edit mode
      if (existing && existing.address !== editingWallet.address) {
        setWalletError("A wallet with this address already exists.")
        return
      }
    } else {
      // new
      if (existing) {
        setWalletError("A wallet with this address already exists.")
        return
      }
      if (wallets.length >= 3) {
        setWalletError("You can only have up to 3 wallets.")
        return
      }
    }

    if (editingWallet) {
      // update
      setWallets((prev) =>
        prev.map((w) =>
          w.address === editingWallet.address
            ? { address: address.trim(), name: name.trim(), avatar: emoji }
            : w
        )
      )
      if (selectedWallet === editingWallet.address) {
        setSelectedWallet(address.trim())
      }
    } else {
      // create
      setWallets((prev) => [
        ...prev,
        { address: address.trim(), name: name.trim(), avatar: emoji },
      ])
    }
    setIsCreatingWallet(false)
    setEditingWallet(null)
  }

  function handleCancelWalletCreation() {
    setIsCreatingWallet(false)
    setEditingWallet(null)
  }

  // --------------------------------------------------
  // 5) SELECT WALLET
  // --------------------------------------------------
  async function handleSelectWallet(walletAddr: string) {
    setSelectedWallet(walletAddr)
    // reset AI
    setIsAiOpen(false)
    setAnalysisLoading(false)
    setAnalysisText("")
    setAnalysisSessionId("")
    setChatMessages([])

    // [SPINNER CHANGE]: show spinner if single wallet & not aggregator
    if (walletAddr !== "AGGREGATE" && !allWalletData[walletAddr]) {
      try {
        setIsLoadingWalletData(true) // <— Start spinner
        const data = await fetchSingleWallet(walletAddr)
        if (data) {
          setAllWalletData((prev) => ({ ...prev, [walletAddr]: data }))
        }
      } finally {
        setIsLoadingWalletData(false) // <— Stop spinner
      }
    }
  }

  async function fetchSingleWallet(walletAddr: string): Promise<WalletInfo | null> {
    try {
      const res = await fetch(`${EB_BASE_URL}/wallets?wallets=${walletAddr}`)
      if (!res.ok) throw new Error("Error fetching wallet data.")
      const raw = await res.json()
      const wData: WalletInfo = raw[walletAddr]

      // Insert base_token as normal token
      if (wData.balance?.base_token) {
        const b = wData.balance.base_token
        const baseToken: TokenInfo = {
          name: b.name,
          symbol: b.symbol,
          balanceUSD: b.balanceUSD,
          amount: b.amount,
          pCh24h: b.pCh24h,
          price: b.price,
          imgUrl: b.imgUrl,
        }
        wData.balance.tokens = wData.balance.tokens
          ? [baseToken, ...wData.balance.tokens]
          : [baseToken]
      }
      return wData
    } catch (err) {
      console.error(err)
      return null
    }
  }

  // --------------------------------------------------
  // 6) AGGREGATE
  // --------------------------------------------------
  async function handleAggregatePortfolio() {
    if (wallets.length < 2) return
    setSelectedWallet("AGGREGATE")
    // reset AI
    setIsAiOpen(false)
    setAnalysisLoading(false)
    setAnalysisText("")
    setAnalysisSessionId("")
    setChatMessages([])

    for (const w of wallets) {
      if (!allWalletData[w.address]) {
        // optionally also show spinner if aggregator data not loaded
        setIsLoadingWalletData(true)
        const data = await fetchSingleWallet(w.address)
        if (data) {
          setAllWalletData((prev) => ({ ...prev, [w.address]: data }))
        }
        setIsLoadingWalletData(false)
      }
    }
    setTimeout(buildAggregator, 300)
  }

  function buildAggregator() {
    const aggregator = { wallet: "AGGREGATE", balance: { tokens: [] as TokenInfo[] } }
    const tokenMap = new Map<string, any>()

    for (const w of wallets) {
      const wData = allWalletData[w.address]
      if (!wData?.balance?.tokens) continue
      for (const t of wData.balance.tokens) {
        const key = t.symbol + "_" + (t.imgUrl || "")
        if (!tokenMap.has(key)) {
          tokenMap.set(key, {
            ...t,
            holders: [w.address],
          })
        } else {
          const existing = tokenMap.get(key)
          existing.balanceUSD += t.balanceUSD
          if (existing.amount && t.amount) {
            existing.amount += t.amount
          }
          // Weighted daily
          const totalVal = existing.balanceUSD
          const oldVal = totalVal - t.balanceUSD
          const oldPct = existing.pCh24h || 0
          const newPct = t.pCh24h || 0
          const newWeighted =
            (oldPct * oldVal + newPct * t.balanceUSD) / totalVal
          existing.pCh24h = newWeighted
          existing.holders.push(w.address)
        }
      }
    }

    aggregator.balance.tokens = Array.from(tokenMap.values()).map((obj) => ({
      name: obj.name,
      symbol: obj.symbol,
      balanceUSD: obj.balanceUSD,
      amount: obj.amount,
      pCh24h: obj.pCh24h,
      price: obj.price,
      imgUrl: obj.imgUrl,
      holderAddresses: obj.holders,
    }))

    setAllWalletData((prev) => ({ ...prev, AGGREGATE: aggregator }))
  }

  // --------------------------------------------------
  // 7) BUILD CHARTS
  // --------------------------------------------------
  useEffect(() => {
    if (!selectedWallet) {
      resetChartData()
      return
    }
    const wData = allWalletData[selectedWallet]
    if (!wData?.balance?.tokens) {
      resetChartData()
      return
    }

    let walletName = "Aggregate"
    if (selectedWallet !== "AGGREGATE") {
      const found = wallets.find((x) => x.address === selectedWallet)
      walletName = found ? found.name : selectedWallet
    }
    setReportWalletName(walletName)

    const tokens = wData.balance.tokens
    const totalVal = tokens.reduce((acc, t) => acc + t.balanceUSD, 0)
    let dailyChange = 0
    tokens.forEach((t) => {
      const ratio = totalVal ? t.balanceUSD / totalVal : 0
      dailyChange += (t.pCh24h || 0) * ratio
    })

    setPortfolioSummary({
      totalValueUSD: totalVal,
      dailyChangePercent: dailyChange,
      lastUpdated: new Date().toLocaleString(),
    })

    const withRatios = tokens.map((t) => {
      const ratio = totalVal > 0 ? t.balanceUSD / totalVal : 0
      return { ...t, ratio }
    })
    const mainTokens = withRatios.filter((t) => t.ratio >= 0.0001)
    const tinyTokens = withRatios.filter((t) => t.ratio < 0.0001)

    if (tinyTokens.length > 0) {
      const sumUSD = tinyTokens.reduce((acc, x) => acc + x.balanceUSD, 0)
      const sumRatio = tinyTokens.reduce((acc, x) => acc + x.ratio, 0)
      let weightedPCh = 0
      if (sumUSD > 0) {
        weightedPCh =
          tinyTokens.reduce(
            (acc, x) => acc + (x.pCh24h || 0) * x.balanceUSD,
            0
          ) / sumUSD
      }
      mainTokens.push({
        name: "Others",
        symbol: "OTH",
        balanceUSD: sumUSD,
        amount: 0,
        pCh24h: weightedPCh,
        ratio: sumRatio,
        imgUrl: "",
      })
    }
    mainTokens.sort((a, b) => b.ratio - a.ratio)

    const labels = mainTokens.map((t) => t.symbol)
    const values = mainTokens.map((t) => t.balanceUSD)
    const colorPalette = [
      "#3B82F6",
      "#EC4899",
      "#FBBF24",
      "#22C55E",
      "#8B5CF6",
      "#F43F5E",
      "#6B7280",
      "#14B8A6",
    ]

    const donut = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colorPalette,
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { display: true, position: "bottom" },
          title: { display: false },
        },
      },
    }
    setDonutData(donut)

    const sortedByPct = [...tokens].sort(
      (a, b) => (b.pCh24h || 0) - (a.pCh24h || 0)
    )
    const top3 = sortedByPct.slice(0, 3)
    const bottom3 = sortedByPct.slice(-3).reverse()
    const barLabels = [
      ...top3.map((t) => t.symbol),
      ...bottom3.map((t) => t.symbol),
    ]
    const barVals = [
      ...top3.map((t) => t.pCh24h),
      ...bottom3.map((t) => t.pCh24h),
    ]

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 10 },
      elements: { line: { borderWidth: 2 }, point: { radius: 3 } },
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "rgba(255,255,255,0.08)" } },
      },
    }

    const barConfig = {
      labels: barLabels,
      datasets: [
        {
          label: "24h % Change",
          data: barVals,
          backgroundColor: (ctx: any) => {
            const val = ctx.dataset.data[ctx.index]
            return val < 0 ? "#EF4444" : "#10B981"
          },
        },
      ],
      options: chartOptions,
    }
    setBarData(barConfig)
    setHoldings(tokens)
  }, [selectedWallet, allWalletData])

  function resetChartData() {
    setReportWalletName("")
    setPortfolioSummary({
      totalValueUSD: 0,
      dailyChangePercent: 0,
      lastUpdated: new Date().toLocaleString(),
    })
    setDonutData(null)
    setBarData(null)
    setHoldings([])
  }

  // --------------------------------------------------
  // 8) AI
  // --------------------------------------------------
  async function handleAiIconClick() {
    if (!selectedWallet) return
    setIsAiOpen(true)
    setAnalysisLoading(true)
    setAnalysisText("")
    setAnalysisSessionId("")
    setChatMessages([])
    setChatInput("")

    try {
      let addresses: string[]
      if (selectedWallet === "AGGREGATE") {
        addresses = wallets.map((w) => w.address)
      } else {
        addresses = [selectedWallet]
      }
      const param = addresses.join(",")
      const res = await fetch(`${EB_BASE_URL}/analyze_portfolio?wallets=${param}`)
      if (!res.ok) throw new Error("Failed to fetch analysis")
      const data: AnalysisResponse = await res.json()

      setAnalysisText(data.analysis)
      setAnalysisSessionId(data.session_id)
    } catch (err) {
      console.error(err)
    } finally {
      setAnalysisLoading(false)
    }
  }

  async function handleSendChat() {
    if (!analysisSessionId || !chatInput.trim()) return
    setIsChatLoading(true)
    setChatMessages((prev) => [...prev, { role: "user", content: chatInput }])
    setChatMessages((prev) => [...prev, { role: "assistant", content: "" }])

    const userMessage = chatInput
    setChatInput("")

    try {
      const res = await fetch(`${EB_BASE_URL}/analyze_portfolio/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: analysisSessionId,
          user_message: userMessage,
        }),
      })
      if (!res.ok) throw new Error("Chat request failed.")
      const data = await res.json()
      const reply = data.assistant_reply || ""

      let currentContent = ""
      for (let i = 0; i < reply.length; i++) {
        await new Promise((r) => setTimeout(r, 15))
        currentContent += reply[i]
        setChatMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "assistant",
            content: currentContent,
          }
          return updated
        })
      }
    } catch (error) {
      console.error(error)
      setChatMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Error occurred. Please try again.",
        }
        return updated
      })
    } finally {
      setIsChatLoading(false)
    }
  }

  function handleCloseAi() {
    setIsAiOpen(false)
  }

  // Check if user has any wallet
  const hasWallets = wallets.length > 0

  return (
    <div className="flex h-full">
      {/* If no wallets => landing */}
      {!hasWallets && !isCreatingWallet ? (
        <NoWalletLanding onCreateWalletClick={handleCreateWalletClick} />
      ) : hasWallets ? (
        // 3-column layout
        <div className="flex h-full w-full bg-white dark:bg-gray-900 text-black dark:text-white">
          {/* LEFT SIDEBAR => aggregator, etc. */}
          <div className="w-64 h-full overflow-y-auto scrollbar-hide">
            <Sidebar
              wallets={wallets}
              selectedWallet={selectedWallet}
              allWalletData={allWalletData}
              onSelectWallet={handleSelectWallet}
              onAddWallet={handleCreateWalletClick}
              onAggregate={handleAggregatePortfolio}
            />
          </div>

          {/* MAIN AREA */}
          <div className="flex-1 h-full overflow-y-auto scrollbar-hide">
            {/* [SPINNER CHANGE]: If isLoadingWalletData => show spinner, else main content */}
            {isLoadingWalletData ? (
              <div className="flex h-full items-center justify-center">
                {/* A basic tailwind spinner */}
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brandGreen border-t-transparent"></div>
              </div>
            ) : (
              <MainSection
                wallets={wallets}
                selectedWallet={selectedWallet}
                portfolioSummary={portfolioSummary}
                donutData={donutData}
                barData={barData}
                holdings={holdings}
                onAiIconClick={handleAiIconClick}
                onConfigureWallet={handleConfigureWallet}
                aiActive={isAiOpen}
              />
            )}
          </div>

          {/* AI SIDEBAR => keep scroll */}
          <AiReportPanel
            isOpen={isAiOpen}
            onClose={handleCloseAi}
            loading={analysisLoading}
            currentMsg={currentMsg}
            analysisText={analysisText}
            chatMessages={chatMessages}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSendChat={handleSendChat}
            isChatLoading={isChatLoading}
            pdfWalletName={reportWalletName}
            pdfLastUpdated={portfolioSummary.lastUpdated}
          />
        </div>
      ) : (
        // If 0 wallets but isCreating => show NoWalletLanding behind modal
        <NoWalletLanding onCreateWalletClick={handleCreateWalletClick} />
      )}

      {/* CREATE WALLET MODAL */}
      {isCreatingWallet && (
        <CreateWalletModal
          isOpen={isCreatingWallet}
          editingWallet={editingWallet}
          walletError={walletError}
          onClose={handleCancelWalletCreation}
          onCreateWallet={handleCreateWallet}
        />
      )}
    </div>
  )
}
