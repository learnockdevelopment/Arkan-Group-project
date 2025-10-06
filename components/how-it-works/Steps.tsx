"use client";

import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Explore Opportunities",
    description:
      "Browse hundreds of opportunities tailored to your goals. Use smart filters to search by location, budget, or ROI.",
    linkText: "Explore Projects",
  },
  {
    number: "02",
    title: "Choose investment type",
    description:
      "Pick the investment type that fits your strategy — Single Units, Bundles, or Full Projects.",
    linkText: "View Investment Options",
  },
  {
    number: "03",
    title: "Invest Securely",
    description:
      "Create your account in minutes, verify your identity, and start investing safely through our secure platform.",
    linkText: "Create an Account",
  },
  {
    number: "04",
    title: "Track & Grow",
    description:
      "Monitor your portfolio, receive updates, and enjoy sustainable returns via our web & mobile app.",
    linkText: "Download App",
  },
];

export default function StepsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="   gap-32 flex-wrap    md:px-24  lg:px-42 xl:px-52 relative justify-center lg:flex hidden">
        {steps.map((step, i) => (
          <div key={i} className="relative flex flex-col items-start xl:w-1/4 ">
            <span className="absolute -left-24 inset-y-0 flex items-center text-7xl  font-extrabold text-[#0A355C]/40 select-none">
              {step.number}
            </span>

            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold leading-snug">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
                <a
                  href="#"
                  className="inline-flex items-center text-[#0A355C] font-medium text-sm hover:underline"
                >
                  {step.linkText}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>


      <div className="  flex  flex-wrap gap-8   md:px-18  lg:px-28 xl:px-32 relative justify-center lg:hidden ">
        {steps.map((step, i) => (
          <div key={i} className="relative flex flex-col items-start w-full xl:w-1/4 ">
          

            <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold leading-snug">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
                <a
                  href="#"
                  className="inline-flex items-center text-[#0A355C] font-medium text-sm hover:underline"
                >
                  {step.linkText}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>



      
    </section>
  );
}
