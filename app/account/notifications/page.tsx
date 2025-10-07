"use client";
import SectionCard from "@/components/account/SectionCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Page() {
  return (
    <SectionCard title="Notifications">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Email Notifications</Label>
          <Switch />
        </div>
        <div className="flex justify-between items-center">
          <Label>Push Notifications</Label>
          <Switch />
        </div>
      </div>
    </SectionCard>
  );
}
