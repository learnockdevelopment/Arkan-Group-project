import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TransactionHistory from "./TransactionHistory";
import InvestmentDistribution from "./InvestmentDistribution";
import QuickStats from "./QuickStats";
import WalletBalance from "./WalletBalance";

export default function MoneyManagementTab() {
  return (
    <div className="space-y-8">
      {/* Wallet Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <WalletBalance />
        <InvestmentDistribution />
      </div>

      {/* Transaction History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-2">
          <TransactionHistory />
        </div>
        
        <div className="space-y-6">
          <QuickStats />
        </div>
      </div>
    </div>
  );
}