"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { InvestmentDistribution } from "./InvestmentDistribution"
import { UpcomingPayouts } from "./UpcomingPayouts"
import { ExpandPortfolio } from "./ExpandPortfolio"
import { allProperties } from "@/app/data/properties"

export function CurrentInvestments() {
  const items = allProperties.slice(0, 3)

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((p) => (
          <Card key={p.id} className="rounded-xl overflow-hidden border shadow-sm">
            <Link href={`/explore/${p.id}`} className="relative block">
              <Image
                src={p.image}
                alt={p.name}
                width={800}
                height={600}
                className="h-56 w-full object-cover"
              />
              <span className="absolute left-4 top-4 text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                In Progress
              </span>
            </Link>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{p.location}</p>
                </div>
                <p className="text-xs text-gray-600">${Number(p.price).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Progress</p>
                <Progress value={68} className="h-2" />
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1">
                    <span>Expected ROI</span>
                    <span className="text-green-600">20%</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1">
                    <span>Investment duration</span>
                    <span>20 Month</span>
                  </div>
                </div>
              </div>

              <Button asChild variant="secondary" className="w-full justify-between rounded-md bg-primary text-white hover:bg-gray-700">
                <Link href={`/explore/${p.id}`}>
                  <span>View Details</span>
                  <span>→</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InvestmentDistribution
          data={[
            { name: "Residential", value: 130000 },
            { name: "Commercial", value: 110000 },
            { name: "Mixed-use", value: 60000 },
          ]}
        />
        <UpcomingPayouts />
      </div>

      <ExpandPortfolio />
    </div>
  )
}


