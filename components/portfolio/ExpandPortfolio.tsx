import { Button } from "@/components/ui/button"

export function ExpandPortfolio() {
  return (
    <div className="bg-gray-50 text-center p-10 rounded-xl">
      <h2 className="text-lg font-semibold mb-2">Ready to Expand Your Portfolio?</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Discover new exclusive investment opportunities and continue building your wealth with Arkan Shares.
      </p>
      <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-full px-6">
        Explore New Projects →
      </Button>
    </div>
  )
}
