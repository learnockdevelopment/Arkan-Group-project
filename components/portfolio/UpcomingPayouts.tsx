import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const payouts = [
  { name: "Marina Bay Residences", date: "2024-01-15", amount: "+$25,000" },
  { name: "Marina Bay Residences", date: "2024-01-15", amount: "+$25,000" },
  { name: "Marina Bay Residences", date: "2024-01-15", amount: "+$25,000" },
]

export function UpcomingPayouts() {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Upcoming Payouts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {payouts.map((payout, i) => (
          <div
            key={i}
            className="flex justify-between items-center border rounded-lg px-4 py-2"
          >
            <div>
              <p className="font-medium text-sm">{payout.name}</p>
              <p className="text-xs text-gray-500">{payout.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{payout.amount}</p>
              <p className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Pending
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
