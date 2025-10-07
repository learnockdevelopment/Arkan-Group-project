"use client";
import SectionCard from "@/components/account/SectionCard";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <SectionCard title="ID Verification">
      <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-md p-10">
        <p className="text-gray-500 mb-4">Upload your ID (Passport or National)</p>
        <Button className="bg-[#133E66] hover:bg-[#0f3051] text-white">
          Upload
        </Button>
      </div>
    </SectionCard>
  );
}
