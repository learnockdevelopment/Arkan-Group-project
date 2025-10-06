"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Page() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Login To Your Account
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Welcome! Please enter your phone number to get started.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-gray-700 text-sm font-medium">
              Phone Number
            </Label>
            <div className="flex items-center gap-2">
              {/* Country Code Selector */}
              <Select defaultValue="+20">
                <SelectTrigger className="w-[100px] border-gray-300 focus-visible:ring-blue-500">
                  <SelectValue placeholder="+20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">🇺🇸 +1 (US)</SelectItem>
                  <SelectItem value="+44">🇬🇧 +44 (UK)</SelectItem>
                  <SelectItem value="+20">🇪🇬 +20 (EG)</SelectItem>
                  <SelectItem value="+971">🇦🇪 +971 (UAE)</SelectItem>
                  <SelectItem value="+966">🇸🇦 +966 (KSA)</SelectItem>
                </SelectContent>
              </Select>

              {/* Phone Input */}
              <Input
                id="phone"
                type="number"
                placeholder="Enter phone number"
                className="flex-1 border-gray-300 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-2 transition"
          >
            Login
          </Button>
        </form>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
          By proceeding, you agree to the{" "}
          <a href="#" className="text-blue-600 hover:underline font-medium">
            terms and conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline font-medium">
            privacy policy
          </a>
          .
        </p>
      </div>

      {/* Sign Up link */}
      <div className="mt-6 text-gray-700 text-sm">
        Don’t have an account?{" "}
        <a href="#" className="text-blue-600 hover:underline font-medium">
          Sign Up
        </a>
      </div>
    </section>
  );
}

export default Page;
