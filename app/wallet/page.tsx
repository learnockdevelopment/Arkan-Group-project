"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PaymentMethodsTab from "@/components/wallet/PaymentMethodsTab";
import MoneyManagementTab from "@/components/wallet/MoneyManagementTab";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("money");

  return (
    <div className="flex flex-col items-center w-full py-10 px-4 sm:px-6 space-y-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl">
        <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-black text-sm px-4 py-2 rounded-full font-medium shadow-sm">
          Wallet
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Track, manage, and grow your funds with full transparency.
        </h1>
        <p className="text-gray-600 text-lg max-w-xl">
          Complete control over your investments and transactions in one place.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-7xl">
        <TabsList className="grid grid-cols-2 bg-gray-100 rounded-xl  w-full max-w-md mx-auto h-max">
          <TabsTrigger 
            value="payment" 
            className="rounded-lg py-2.5 font-medium transition-all data-[state=active]:bg-primary data-[state=active]:shadow-sm data-[state=active]:text-white"
          >
            Payment Methods
          </TabsTrigger>
          <TabsTrigger 
            value="money" 
            className="rounded-lg py-2.5 font-medium transition-all data-[state=active]:bg-primary data-[state=active]:shadow-sm data-[state=active]:text-white"
          >
            Money Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-8 mt-8">
          <PaymentMethodsTab />
        </TabsContent>

        <TabsContent value="money" className="space-y-8 mt-8">
          <MoneyManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}