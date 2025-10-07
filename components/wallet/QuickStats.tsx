import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const transactions = [
  { id: 1, type: "Deposit", date: "2024-01-15", amount: "+$25,000", status: "Completed", color: "text-green-600", category: "deposit" },
  // ... other transactions
];

export default function QuickStats() {
  const stats = useMemo(() => {
    const totalDeposits = transactions
      .filter(t => t.amount.startsWith('+'))
      .reduce((sum, t) => sum + parseFloat(t.amount.replace('+$', '').replace(',', '')), 0);
    
    const totalWithdrawals = transactions
      .filter(t => t.amount.startsWith('-'))
      .reduce((sum, t) => sum + parseFloat(t.amount.replace('-$', '').replace(',', '')), 0);
    
    const activeInvestments = transactions
      .filter(t => t.status === 'Active')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount.replace('$', '').replace(',', ''))), 0);
    
    return { totalDeposits, totalWithdrawals, activeInvestments };
  }, []);

  return (
    <>
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Invested</div>
              <div className="text-2xl font-bold text-gray-900">$95,000</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total ROI</div>
              <div className="text-green-600 font-bold text-xl">32.5%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Active Investments</div>
              <div className="text-xl font-bold text-purple-600">${stats.activeInvestments.toLocaleString()}</div>
            </div>
            <Progress value={65} className="h-2 bg-gray-200" />
            <div className="text-xs text-gray-500 text-center">65% of annual target</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Deposits</span>
            <span className="text-green-600 font-semibold">+${stats.totalDeposits.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Withdrawals</span>
            <span className="text-red-600 font-semibold">-${stats.totalWithdrawals.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Net Flow</span>
            <span className={cn(
              "font-semibold",
              stats.totalDeposits > stats.totalWithdrawals ? "text-green-600" : "text-red-600"
            )}>
              {stats.totalDeposits > stats.totalWithdrawals ? '+' : ''}
              ${(stats.totalDeposits - stats.totalWithdrawals).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">My Cards</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <span className="text-2xl">💳</span>
          </div>
          <Button variant="outline" className="w-full border-gray-300 rounded-xl py-2.5 font-medium">
            + Add New Card
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl border-0">
        <CardContent className="p-6 text-center space-y-4">
          <div className="font-bold text-xl">Payment Questions?</div>
          <div className="text-blue-100 text-sm leading-relaxed">
            Our support team is available 24/7 to help you with any inquiries
          </div>
          <Button className="bg-white text-blue-600 hover:bg-blue-50 w-full font-semibold py-2.5 rounded-xl">
            Contact support →
          </Button>
        </CardContent>
      </Card>
    </>
  );
}