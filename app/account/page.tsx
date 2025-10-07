"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/account/SectionCard";

export default function Page() {
  return (
    <SectionCard title="Personal Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="First Name" className="bg-gray-100"/>
        <Input placeholder="Last Name" className="bg-gray-100"/>
        <Input placeholder="Phone Number" className="bg-gray-100"/>
        <Input placeholder="Email" className="bg-gray-100"/>
        <Input placeholder="Address" className="md:col-span-2 bg-gray-100" />
      </div>
      <Button className="mt-6 bg-[#133E66] hover:bg-[#0f3051] text-white">
        Save
      </Button>
    </SectionCard>
  );
}
