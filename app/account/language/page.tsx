"use client";
import SectionCard from "@/components/account/SectionCard";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Page() {
  return (
    <SectionCard title="Language">
      <RadioGroup defaultValue="english" className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="english" id="english" />
          <Label htmlFor="english">English</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="arabic" id="arabic" />
          <Label htmlFor="arabic">Arabic</Label>
        </div>
      </RadioGroup>
    </SectionCard>
  );
}
