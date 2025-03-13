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
      <head>
        {/* 
          1) Insert all your favicon <link> tags, referencing /eztrela_favicon/.
          2) Ensure these files actually exist in /public/eztrela_favicon/.
        */}

        {/* Standard Favicons */}
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/eztrela_favicon/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/eztrela_favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/eztrela_favicon/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/eztrela_favicon/android-icon-192x192.png"
        />

        {/* Apple Touch Icons */}
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/eztrela_favicon/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/eztrela_favicon/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/eztrela_favicon/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/eztrela_favicon/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/eztrela_favicon/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/eztrela_favicon/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/eztrela_favicon/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/eztrela_favicon/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/eztrela_favicon/apple-icon-180x180.png"
        />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta
          name="msapplication-TileImage"
          content="/eztrela_favicon/ms-icon-144x144.png"
        />

        {/* Optional: Web Manifest */}
        <link rel="manifest" href="/eztrela_favicon/site.webmanifest" />
      </head>

      <body
        className={`${inter.className} bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300`}
      >
        <Providers>
          {/* HEADER */}
          <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            {/* LEFT: "Eztrela" text */}
            <div className="text-2xl font-bold text-brandGreen dark:text-brandGreen-light">
              Eztrela
            </div>

            {/* RIGHT: Nav icons + moon toggle */}
            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="flex items-center p-2 hover:text-brandGreen dark:hover:text-brandGreen-light transition-colors"
              >
                <MdHome size={24} />
              </Link>
              <Link
                href="/portfolio"
                className="flex items-center p-2 hover:text-brandGreen dark:hover:text-brandGreen-light transition-colors"
              >
                <MdFolderSpecial size={24} />
              </Link>
              <Link
                href="/explorer"
                className="flex items-center p-2 hover:text-brandGreen dark:hover:text-brandGreen-light transition-colors"
              >
                <MdSearch size={24} />
              </Link>
              <MoonToggle />
            </nav>
          </header>

          {/* MAIN CONTENT */}
          <main className="relative" style={{ height: "calc(100vh - 3.5rem)" }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}