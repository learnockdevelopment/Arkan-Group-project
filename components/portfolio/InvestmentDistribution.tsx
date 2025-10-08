"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const COLORS = ["#FBBF24", "#1E3A8A", "#CBD5E1"]

interface DistributionItem {
  name: string
  value: number
}

export function InvestmentDistribution({
  data,
}: {
  data: DistributionItem[]
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Investment Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
