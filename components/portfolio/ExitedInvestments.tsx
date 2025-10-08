"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { InvestmentCard } from "./InvestmentCard"
import { InvestmentDistribution } from "./InvestmentDistribution"
import { UpcomingPayouts } from "./UpcomingPayouts"
import { allProperties } from "@/app/data/properties"

// Empty state for Exited Investments tab

export function ExitedInvestments() {
  // Mock exited investments data (kept for future when not empty)
  const exitedMock = [
    {
      name: "Palm Heights",
      type: "Bundle",
      initial: "$65,000",
      exitValue: "$96,000",
      roi: "20%",
      duration: "20 Month",
      status: "Successfully Exited",
    },
    {
      name: "City Walk Plaza",
      type: "Unit",
      initial: "$40,000",
      exitValue: "$58,000",
      roi: "18%",
      duration: "16 Month",
      status: "Successfully Exited",
    },
    {
      name: "The Arcade",
      type: "Project",
      initial: "$80,000",
      exitValue: "$112,000",
      roi: "22%",
      duration: "24 Month",
      status: "Early Exit",
    },
  ]

  const featured = allProperties.slice(0, 3).map((p) => ({
    id: p.id,
    title: p.name,
    location: p.location,
    price: typeof p.price === "number" ? p.price : Number(p.price || 0),
    roi: 15, // static for demo
    duration: 20, // static for demo
    funded: false,
    image: p.image,
    rating: 4.6,
    reviews: 128,
  }))

  const hasExited = exitedMock.length > 0
  const distribution = [
    { name: "Residential", value: 125000 },
    { name: "Commercial", value: 120000 },
    { name: "Mixed-use", value: 50000 },
  ]

  return (
    <div className="space-y-10">
      {/* Empty state banner (hidden when data exists) */}
      {!hasExited && (
        <div className="bg-gray-50 rounded-xl px-6 py-10 text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
            🏙️
          </div>
          <h3 className="text-base font-semibold mb-1">
            You don't have any exited investments yet.
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Start your investment journey today
          </p>
          <Link href="/explore">
            <Button className="rounded-full px-5">Browse Properties →</Button>
          </Link>
        </div>
      )}

      {hasExited && (
        <>
          {/* Exited investment cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {exitedMock.map((item, i) => (
              <InvestmentCard key={i} data={item} />
            ))}
          </div>

          {/* Distribution + Payouts */}
          <div className="grid md:grid-cols-2 gap-6">
            <InvestmentDistribution data={distribution} />
            <UpcomingPayouts />
          </div>
        </>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-6 bg-gray-50 rounded-xl p-6 text-center">
        <div>
          <div className="text-xl font-semibold text-blue-900">200+</div>
          <div className="text-xs text-gray-500">Active Investors</div>
        </div>
        <div>
          <div className="text-xl font-semibold text-blue-900">$50M+</div>
          <div className="text-xs text-gray-500">Total Invested</div>
        </div>
        <div>
          <div className="text-xl font-semibold text-blue-900">18.5%</div>
          <div className="text-xs text-gray-500">Average ROI</div>
        </div>
      </div>

      {/* Exclusive Opportunities - same card design as Current Investments */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-center">Exclusive Opportunities</h2>
        <p className="text-xs text-gray-500 text-center">Exclusive Opportunities</p>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Card key={p.id} className="rounded-xl overflow-hidden border shadow-sm">
              <Link href={`/explore/${p.id}`} className="relative block">
                <Image
                  src={p.image}
                  alt={p.title}
                  width={800}
                  height={600}
                  className="h-56 w-full object-cover"
                />
                <span className="absolute left-4 top-4 text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  Coming Soon
                </span>
              </Link>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
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
                      <span className="text-green-600">{p.roi}%</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1">
                      <span>Investment duration</span>
                      <span>{p.duration} Month</span>
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
      </div>
    </div>
  )
}
