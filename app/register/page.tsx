"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronDown } from "lucide-react";
// import { toast } from "sonner"; // Uncomment if you use toast notifications (shadcn/toast)

export default function CreateAccount() {
  // ---------------------------------
  // Stepper logic (commented for now)
  // ---------------------------------
  /*
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  */

  // ---------------------------------
  // Registration logic (commented for now)
  // ---------------------------------
  /*
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    countryCode: "+20",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to register");

      const data = await res.json();

      // toast.success("Account created successfully!");
      console.log("Registered:", data);
      // nextStep(); // Uncomment when stepper is enabled

    } catch (err) {
      console.error(err);
      // toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <section className="min-h-screen flex flex-col ">
      {/* Top Nav */}
      

      {/* Main Card */}
      <div className="flex flex-col">
        
      <div className="flex flex-1 justify-center items-center px-4 mt-24">
        <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-8 md:p-12">
            <div className="bg-[#FFCA00] flex items-center gap-2 px-6 py-3 rounded-xl w-fit cursor-pointer mb-12">
        <ChevronLeft size={18} />
        <span className="font-semibold text-sm">Back To Login</span>
      </div>
          {/* Stepper (commented for now) */}
          {/*
          <div className="mb-8 flex justify-between items-center">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center w-full">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                    step > i + 1
                      ? "bg-[#FFCA00] text-black"
                      : step === i + 1
                      ? "bg-[#133E66] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className="flex-1 h-[2px] bg-gray-200 mx-2"></div>
                )}
              </div>
            ))}
          </div>
          */}

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Create Account
          </h1>

          <form
            className="space-y-6"
            // onSubmit={handleSubmit} // Uncomment when logic is enabled
          >
            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  First Name
                </label>
                <Input
                  placeholder="Your first Name"
                  className="bg-gray-100 border-none focus-visible:ring-0"
                  // name="firstName"
                  // value={formData.firstName}
                  // onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Last Name
                </label>
                <Input
                  placeholder="Your last Name"
                  className="bg-gray-100 border-none focus-visible:ring-0"
                  // name="lastName"
                  // value={formData.lastName}
                  // onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md w-[110px]">
                  <img
                    src="https://flagcdn.com/w20/eg.png"
                    alt="Egypt Flag"
                    className="w-5 h-5 rounded-sm"
                  />
                  <span className="text-sm text-gray-700 font-medium">+20</span>
                  <ChevronDown size={14} className="text-gray-500 ml-auto" />
                </div>
                <Input
                  type="tel"
                  placeholder="012555688888"
                  className="flex-1 bg-gray-100 border-none focus-visible:ring-0"
                  // name="phone"
                  // value={formData.phone}
                  // onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="Email@gmail.com"
                className="bg-gray-100 border-none focus-visible:ring-0"
                // name="email"
                // value={formData.email}
                // onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-[#133E66] hover:bg-[#0f3051] text-white rounded-full text-base font-semibold py-5"
              // disabled={loading}
            >
              {/* {loading ? "Signing Up..." : "Sign Up"} */}
              Sign Up
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-[#133E66] font-medium cursor-pointer">
            Login
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}
