"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, TrendingUp, Heart } from "lucide-react"

export function FeaturedOpportunities() {
  const [activeTab, setActiveTab] = useState("Units")

  const tabs = ["Units", "Bundles", "Projects"]

  const opportunities = [
    {
      id: 1,
      image: "/modern-apartment-exterior.png",
      title: "Luxury Apartments",
      location: "Downtown Dubai",
      price: "$125,000",
      roi: "14%",
      duration: "18 months",
      status: "Available",
      type: "Units",
    },
    {
      id: 2,
      image: "/modern-office-building.png",
      title: "Commercial Complex",
      location: "Business Bay",
      price: "$350,000",
      roi: "16%",
      duration: "24 months",
      status: "Limited",
      type: "Bundles",
    },
    {
      id: 3,
      image: "/residential-villa-development.jpg",
      title: "Villa Development",
      location: "Arabian Ranches",
      price: "$750,000",
      roi: "18%",
      duration: "36 months",
      status: "New",
      type: "Projects",
    },
  ]

  return (
    <section id="opportunities" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Opportunities</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Discover handpicked real estate investment opportunities with attractive returns
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted rounded-lg p-1 inline-flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary  text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {opportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={opportunity.image || "/placeholder.svg"}
                  alt={opportunity.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant={opportunity.status === "New" ? "default" : "secondary"}>{opportunity.status}</Badge>
                </div>
                <button className="absolute top-4 right-4 bg-white/90 rounded-full p-2 hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">{opportunity.title}</h3>
                                    <div className="text-2xl font-bold text-primary">{opportunity.price}</div>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {opportunity.location}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-muted-foreground">Expected ROI</span>
                  </div>
                  <div className="text-right font-semibold text-green-500">{opportunity.roi}</div>

                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-muted-foreground">Duration</span>
                  </div>
                  <div className="text-right font-semibold">{opportunity.duration}</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button className="bg-primary text-white hover:bg-secondary/90 w-full !py-6 text-lg">Invest Now</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            See All Properties
          </Button>
        </div>
      </div>
    </section>
  )
}
