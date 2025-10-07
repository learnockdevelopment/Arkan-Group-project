"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronDown } from "lucide-react";
// import { toast } from "sonner"; // Uncomment if using shadcn/toast

export default function Login() {
  // ---------------------------------
  // Login logic (commented for now)
  // ---------------------------------
  /*
  const [formData, setFormData] = useState({
    countryCode: "+20",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      // toast.success("Logged in successfully!");
      console.log("Login success:", data);

      // Optionally redirect
      // router.push("/dashboard");

    } catch (err) {
      console.error(err);
      // toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <section className="min-h-[70vh] flex flex-col ">
     

      {/* Main Card */}
      <div className="flex flex-1 justify-center items-center px-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Login To Your Account
          </h1>

          <form
            className="space-y-6"
            // onSubmit={handleSubmit} // Uncomment when enabling logic
          >
            {/* Phone Field */}
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

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-[#133E66] hover:bg-[#0f3051] text-white rounded-lg text-base font-semibold py-5"
              // disabled={loading}
            >
              {/* {loading ? "Logging in..." : "Login"} */}
              Login
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-5 leading-relaxed">
            By proceeding, you agree to the{" "}
            <a href="#" className="text-[#133E66] hover:underline font-medium">
              terms and conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#133E66] hover:underline font-medium">
              privacy policy
            </a>
            .
          </p>

          {/* Sign Up link */}
          <p className="text-center mt-6 text-sm text-[#133E66] font-medium cursor-pointer">
            Don’t have an account? <span className="underline">Sign Up</span>
          </p>
        </div>
      </div>
    </section>
  );
}
