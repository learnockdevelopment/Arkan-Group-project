"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const InvestmentDetails: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full ">
      {/* Investment Structure Section */}
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardContent className="p-6 text-start">
          <h3 className="font-bold text-xl text-gray-800 mb-6 text-center">
            Investment Structure
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
            <div className="space-y-3">
              <div>
                <p className="text-gray-500">Minimum Investment</p>
                <p className="text-xl font-bold">500K EGP <span className="text-sm font-normal text-gray-500">per share</span></p>
              </div>

              <div>
                <p className="text-gray-500">Down Payment (Collective)</p>
                <p className="text-lg font-semibold">100M EGP</p>
              </div>

              <div>
                <p className="text-gray-500">Payment Plan</p>
                <p className="font-medium">Covered by unit sales revenue</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-gray-500">ROI Type</p>
                <p className="text-lg font-semibold">Fixed Returns <span className="text-sm font-normal text-gray-500">Quarterly/Yearly distribution</span></p>
              </div>

              <div>
                <p className="text-gray-500">Expected ROI</p>
                <p className="text-lg font-semibold text-green-600">25% <span className="text-sm font-normal text-gray-500">Long-term projected</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Progress Section */}
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-6">
            Funding Progress
          </h3>

          <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
            <p>
              <span className="font-semibold">200M</span> / 1.3B EGP funded
            </p>
            <p className="text-gray-500">15% completed</p>
          </div>

          <Progress value={15} className="h-2 bg-gray-200 mb-4" />

          <div className="grid grid-cols-3 text-sm text-gray-800">
            <div>
              <p className="text-gray-500">Target Amount</p>
              <p className="font-semibold">1.3B EGP</p>
            </div>
            <div>
              <p className="text-gray-500">Funded Amount</p>
              <p className="font-semibold">200M EGP</p>
            </div>
            <div>
              <p className="text-gray-500">Investors</p>
              <p className="font-semibold">156</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentDetails;
