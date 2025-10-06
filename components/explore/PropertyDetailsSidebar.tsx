"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Flame, MessageCircle } from "lucide-react";

const PropertyDetailsSidebar: React.FC = () => {
  const [shares, setShares] = useState(1);

  const handleIncrease = () => {
    if (shares < 30) setShares((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (shares > 1) setShares((prev) => prev - 1);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto text-sm">
      {/* Waitlist Section */}
      <Card className="bg-gradient-to-br from-[#002E81] via-[#0072FF] to-[#00C6FF] text-white border-none rounded-2xl shadow-lg">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <h3 className="font-semibold text-lg mb-2">
            Join the waitlist for priority access
          </h3>
          <p className="bg-white/20 text-white/90 text-xs rounded-full px-3 py-1 mb-4">
            Available on Tuesday, September 10 at 2:00 PM
          </p>

          <p className="text-xs mb-2 flex items-center gap-1 text-white/90">
            <Flame className="w-4 h-4 text-yellow-400" /> 30 shares left
          </p>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Button
              variant="secondary"
              className="rounded-full w-8 h-8 text-lg font-bold bg-white/20 hover:bg-white/30 text-white"
              onClick={handleDecrease}
            >
              -
            </Button>
            <span className="text-2xl font-bold">{shares}</span>
            <Button
              variant="secondary"
              className="rounded-full w-8 h-8 text-lg font-bold bg-white/20 hover:bg-white/30 text-white"
              onClick={handleIncrease}
            >
              +
            </Button>
          </div>

          <Button className="bg-white text-[#002E81] hover:bg-white/90 rounded-full px-6 py-5 text-sm font-semibold">
            Join the waitlist with {shares} {shares > 1 ? "shares" : "share"} →
          </Button>

          <p className="text-xs mt-3 text-white/80">
            You won’t be charged yet. <br />
            First-time users might get instant priority access.
          </p>
        </CardContent>
      </Card>

      {/* Investment Details */}
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-gray-700" />
            <h4 className="font-semibold text-gray-800 text-sm">
              Investment Details
            </h4>
          </div>

          <div className="space-y-2 text-gray-700 text-sm">
            <div className="flex justify-between">
              <span>Property value</span>
              <span className="font-semibold">23,326,786 EGP</span>
            </div>
            <div className="flex justify-between">
              <span>Unit price</span>
              <span>22,057,701 EGP</span>
            </div>
            <div className="flex justify-between">
              <span>Maintenance</span>
              <span>1,169,776 EGP</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            * These amounts are exclusive of Arkan fees.
          </p>

          <div className="border-t border-gray-200 mt-4 pt-3 text-sm">
            <p>
              <span className="font-semibold">Estimated exit date:</span>{" "}
              At delivery in <b>May 2029</b>, or at <b>80% ROI</b>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chat Section */}
      <Card className="bg-gradient-to-br from-[#0072FF] to-[#00C6FF] text-white border-none rounded-2xl shadow-md">
        <CardContent className="p-6 text-center">
          <h4 className="font-semibold text-lg mb-2">
            Still not sure if this property is right for you?
          </h4>
          <p className="text-sm text-white/90 mb-4">
            Chat with a member of our Arkan Shares team
          </p>

          <Button className="bg-white text-[#0072FF] hover:bg-white/90 rounded-full px-6 py-5 text-sm font-semibold flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> Start live chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetailsSidebar;
