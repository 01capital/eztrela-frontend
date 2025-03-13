"use client"

interface Props {
  onCreateWalletClick: () => void
}

export default function NoWalletLanding({ onCreateWalletClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-2xl font-bold">Let’s get started with your first portfolio!</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track profits, losses, and valuation all in one place. 
        </p>

        <div className="mt-6">
          <div
            className="cursor-pointer bg-gray-100 dark:bg-gray-800 p-6 rounded shadow hover:shadow-lg transition"
            onClick={onCreateWalletClick}
          >
            <h2 className="text-lg font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Simply enter your wallet address (no signature needed!) and we'll sync it right away.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
