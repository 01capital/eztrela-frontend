// types.ts

// Represents a single token/coin, possibly including an icon URL and a list of wallet addresses that hold it (if aggregator).
export interface TokenInfo {
    symbol: string
    name: string
    balanceUSD: number
    amount?: number
    pCh24h?: number
    price?: number
  
    // NEW: optional coin icon
    imgUrl?: string
  
    // If aggregator, we might store an array of addresses that hold this token
    holderAddresses?: string[]
  }
  
  // WalletInfo is returned by the backend for each wallet, containing base_token + tokens
  export interface WalletInfo {
    wallet: string
    balance?: {
      base_token?: {
        name: string
        symbol: string
        balanceUSD: number
        amount: number
        pCh24h?: number
        price?: number
        imgUrl?: string // same for base token icon
      }
      tokens?: TokenInfo[]
    }
  }
  
  // The user’s local representation of a wallet (in the front end)
  export interface WalletEntry {
    address: string
    name: string
    avatar: string
  }
  
  // AI Analysis Response
  export interface AnalysisResponse {
    analysis: string
    session_id: string
  }
  
  // Chat message
  export interface Message {
    role: "user" | "assistant"
    content: string
  }
  
  // Summary info used in main charts
  export interface PortfolioSummary {
    totalValueUSD: number
    dailyChangePercent: number
    lastUpdated: string
  }
  