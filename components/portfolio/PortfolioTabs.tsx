"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExitedInvestments } from "./ExitedInvestments"
import { CurrentInvestments } from "./CurrentInvestments"

export function PortfolioTabs() {
  return (
    <Tabs defaultValue="current" className="w-full">
      <div className="flex justify-center mb-8">
        <TabsList className="bg-gray-100 rounded-full p-1">
          <TabsTrigger
            value="current"
            className="rounded-2xl px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white h-auto"
          >
            Current investments
          </TabsTrigger>
          <TabsTrigger
            value="exited"
            className="rounded-2xl px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white h-auto"
          >
            Exited investments
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="current">
        <CurrentInvestments />
      </TabsContent>

      <TabsContent value="exited">
        <ExitedInvestments />
      </TabsContent>
    </Tabs>
  )
}
