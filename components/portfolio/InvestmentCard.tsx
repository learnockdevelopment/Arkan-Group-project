import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Investment {
  name: string
  type: string
  initial: string
  exitValue: string
  roi: string
  duration: string
  status: string
}

export function InvestmentCard({ data }: { data: Investment }) {
  const isExited = data.status === "Successfully Exited"
  return (
    <Card className="border rounded-xl shadow-sm">
      <CardHeader className="flex justify-between flex-row items-center">
        <CardTitle className="text-sm">{data.name}</CardTitle>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            data.type === "Bundle"
              ? "bg-yellow-100 text-yellow-700"
              : data.type === "Unit"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {data.type}
        </span>
      </CardHeader>
      <CardContent className="text-sm text-gray-600 space-y-1">
        <p>Initial Investment: {data.initial}</p>
        <p>Exit Value: {data.exitValue}</p>
        <p>Expected ROI: {data.roi}</p>
        <p>Investment duration: {data.duration}</p>
        <div
          className={`mt-3 text-center text-sm font-medium px-3 py-1 rounded-lg ${
            isExited
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {data.status} {isExited && "✅"}
        </div>
      </CardContent>
    </Card>
  )
}
