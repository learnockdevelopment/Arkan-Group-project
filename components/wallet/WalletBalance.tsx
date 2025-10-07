import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WalletBalance() {
  return (
    <Card className="lg:col-span-2 bg-[linear-gradient(90deg,rgba(174,159,255,1)_0%,rgba(61,148,224,1)_50%,rgba(0,128,243,1)_100%)] text-white shadow-xl border-0">
      <CardContent className="p-8 flex flex-col gap-6">
        <div className="text-blue-100 text-lg font-medium">Current Balance</div>
        <div className="text-4xl font-bold">20,300.50 EG</div>
        <div className="flex gap-4 mt-2">
          <Button 
            variant="secondary" 
            className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-semibold py-2.5 rounded-xl"
          >
            Withdraw
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-transparent border-white text-white hover:bg-white/10 font-semibold py-2.5 rounded-xl"
          >
            Top Up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}