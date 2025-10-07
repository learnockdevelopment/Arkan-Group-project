"use client";
import SectionCard from "@/components/account/SectionCard";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Shield, Lock } from "lucide-react";

export default function Page() {
  return (
    <SectionCard 
      title={
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#133E66]" />
          <span>Cards</span>
        </div>
      }
    >
      {/* Empty State */}
      <div className="text-center py-8">
        <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4">
          <img src="/credit-card.svg" className="h-16 w-16 " />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No cards added
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Add your first card to make secure payments and enjoy faster checkout.
        </p>

        <Button className="bg-[#133E66] hover:bg-[#0f3051] text-white px-6 py-2.5">
          <Plus className="h-4 w-4 mr-2" />
          Add New Card
        </Button>
      </div>

      {/* Security Features */}
     
    </SectionCard>
  );
}