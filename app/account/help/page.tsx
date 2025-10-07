"use client";
import SectionCard from "@/components/account/SectionCard";

export default function Page() {
  return (
    <SectionCard title="Help & Support">
      <div className="space-y-3">
        <p className="text-gray-700">FAQs</p>
        <p className="text-gray-700">Live Chat Support</p>
      </div>
    </SectionCard>
  );
}
