"use client"

import { PortfolioTabs } from "@/components/portfolio/PortfolioTabs"

export default function PortfolioPage() {
  return (
    <div className="px-6 md:px-16 py-10 max-w-7xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
          Portfolio
        </span>
        <h1 className="text-2xl md:text-3xl font-semibold">Your Investment Portfolio</h1>
        <p className="text-gray-500">
          Start your journey today by exploring our exclusive opportunities.
        </p>
      </div>

      <PortfolioTabs />
    </div>
  )
}
