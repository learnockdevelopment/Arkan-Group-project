import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const transactions = [
  { id: 1, type: "Deposit", date: "2024-01-15", amount: "+$25,000", status: "Completed", color: "text-green-600", category: "deposit" },
  { id: 2, type: "Investment Return", date: "2024-01-14", amount: "+$1,200", status: "Bundle", color: "text-yellow-600", category: "return" },
  { id: 3, type: "Investment Return", date: "2024-01-14", amount: "+$450", status: "Unit", color: "text-blue-600", category: "return" },
  { id: 4, type: "Withdrawal", date: "2024-01-12", amount: "-$5,000", status: "Completed", color: "text-red-600", category: "withdrawal" },
  { id: 5, type: "Real Estate Investment", date: "2024-01-10", amount: "-$15,000", status: "Active", color: "text-purple-600", category: "investment" },
  { id: 6, type: "Monthly Dividend", date: "2024-01-08", amount: "+$320", status: "Completed", color: "text-green-600", category: "dividend" },
  { id: 7, type: "Service Fee", date: "2024-01-05", amount: "-$25", status: "Completed", color: "text-red-600", category: "fee" },
  { id: 8, type: "Stock Investment", date: "2024-01-03", amount: "-$8,500", status: "Active", color: "text-purple-600", category: "investment" },
  { id: 9, type: "Interest Earned", date: "2024-01-01", amount: "+$150", status: "Completed", color: "text-green-600", category: "interest" },
  { id: 10, type: "Withdrawal Request", date: "2023-12-28", amount: "-$3,000", status: "Processing", color: "text-orange-600", category: "withdrawal" },
  { id: 11, type: "Bonus Credit", date: "2023-12-25", amount: "+$500", status: "Completed", color: "text-green-600", category: "bonus" },
  { id: 12, type: "Crypto Investment", date: "2023-12-20", amount: "-$2,000", status: "Active", color: "text-purple-600", category: "investment" },
];

export default function TransactionHistory() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const typeMatch = typeFilter === "all" || transaction.category === typeFilter;
      
      let timeMatch = true;
      if (timeFilter !== "all") {
        const transactionDate = new Date(transaction.date);
        const now = new Date();
        
        switch (timeFilter) {
          case "week":
            const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
            timeMatch = transactionDate >= oneWeekAgo;
            break;
          case "month":
            const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
            timeMatch = transactionDate >= oneMonthAgo;
            break;
          case "year":
            const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
            timeMatch = transactionDate >= oneYearAgo;
            break;
          default:
            timeMatch = true;
        }
      }
      
      const searchMatch = searchQuery === "" || 
        transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.status.toLowerCase().includes(searchQuery.toLowerCase());
      
      return typeMatch && timeMatch && searchMatch;
    });
  }, [typeFilter, timeFilter, searchQuery]);

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Transaction History</CardTitle>
          <div className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-gray-50 border-gray-200 rounded-xl">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="investment">Investments</SelectItem>
              <SelectItem value="return">Returns</SelectItem>
              <SelectItem value="dividend">Dividends</SelectItem>
              <SelectItem value="interest">Interest</SelectItem>
              <SelectItem value="fee">Fees</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-gray-50 border-gray-200 rounded-xl">
              <SelectValue placeholder="All Times" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Times</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Input 
            placeholder="Search transactions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[200px] bg-gray-50 border-gray-200 rounded-xl"
          />
          
          {(typeFilter !== "all" || timeFilter !== "all" || searchQuery) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setTypeFilter("all");
                setTimeFilter("all");
                setSearchQuery("");
              }}
              className="border-gray-300"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found matching your filters.
          </div>
        ) : (
          <div className="space-y-4 max-h-[950px] overflow-y-auto pr-2">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    transaction.color.includes('green') && "bg-green-100",
                    transaction.color.includes('yellow') && "bg-yellow-100",
                    transaction.color.includes('blue') && "bg-blue-100",
                    transaction.color.includes('red') && "bg-red-100",
                    transaction.color.includes('purple') && "bg-purple-100",
                    transaction.color.includes('orange') && "bg-orange-100"
                  )}>
                    <span className={cn("text-sm font-semibold", transaction.color)}>
                      {transaction.amount.startsWith('+') ? '↑' : transaction.amount.startsWith('-') ? '↓' : '↗'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{transaction.type}</div>
                    <div className="text-sm text-gray-500">{transaction.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("font-bold text-lg", transaction.color)}>{transaction.amount}</div>
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    transaction.status === 'Completed' && "bg-green-100 text-green-700",
                    transaction.status === 'Processing' && "bg-yellow-100 text-yellow-700",
                    transaction.status === 'Active' && "bg-blue-100 text-blue-700",
                    transaction.status === 'Bundle' && "bg-purple-100 text-purple-700",
                    transaction.status === 'Unit' && "bg-indigo-100 text-indigo-700"
                  )}>
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}