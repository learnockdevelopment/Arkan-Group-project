"use client";
import SectionCard from "@/components/account/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <SectionCard title="Change PIN">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md">
        <Input type="password" placeholder="Current PIN" />
        <Input type="password" placeholder="New PIN" />
        <Input type="password" placeholder="Confirm New PIN" />
      </div>
      <Button className="mt-6 bg-[#133E66] hover:bg-[#0f3051] text-white">
        Change PIN
      </Button>
    </SectionCard>
  );
}
