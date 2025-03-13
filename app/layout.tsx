import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import Link from "next/link"
import { MdHome, MdFolderSpecial, MdSearch } from "react-icons/md"
import MoonToggle from "../components/MoonToggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Eztrela AI",
  description: "Your AI-powered crypto platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300`}
      >
        <Providers>
          {/* HEADER */}
          <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            {/* LEFT: Just "Eztrela" text, not clickable */}
            <div className="text-2xl font-bold text-brandGreen dark:text-brandGreen-light">
              Eztrela
            </div>

            {/* RIGHT: Home / Portfolio / Explorer icons + MoonToggle */}
            <nav className="flex items-center space-x-6">
              {/* Home */}
              <Link
                href="/"
                className="flex items-center p-2 hover:text-brandGreen dark:hover:text-brandGreen-light transition-colors"
              >
                <MdHome size={24} />
              </Link>
              {/* Portfolio */}
              <Link
                href="/portfolio"
                className="flex items-center p-2 hover:text-brandGreen dark:hover:text-brandGreen-light transition-colors"
              >
                <MdFolderSpecial size={24} />
              </Link>
              {/* Explorer */}
              <Link
                href="/explorer"
                className="flex items-center p-2 hover:text-brandGreen dark:hover:text-brandGreen-light transition-colors"
              >
                <MdSearch size={24} />
              </Link>

              {/* Moon toggle */}
              <MoonToggle />
            </nav>
          </header>

          {/* MAIN CONTENT: fill leftover screen below header */}
          <main
            className="relative"
            style={{ height: "calc(100vh - 3.5rem)" }}
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
