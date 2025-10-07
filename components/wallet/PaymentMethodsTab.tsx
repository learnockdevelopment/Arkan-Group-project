import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import WalletBalance from "./WalletBalance";
import { ArrowRight } from "lucide-react";
const paymentMethods = [
  { type: "Credit Card", last4: "4242", expiry: "12/25", primary: true },
  { type: "Bank Transfer", bank: "Chase", last4: "8634", primary: false },
];

export default function PaymentMethodsTab() {
  return (
    <div>
        <div className="mb-6">
                <WalletBalance />
        </div>
    <div className="flex flex-col gap-16 w-full mt-24">
      <div className="flex flex-col items-center justify-center gap-4 max-w-[300px] mx-auto">
        <Image src="/building.svg" width={81} height={81} alt="building"/>
    <h3 className="font-semibold text-2xl text-center">You currently have no active investments.</h3>
    <p className="text-center">Explore Single Units, Bundles, or Full Projects to start your journey.”</p>
    <Button  className="bg-primary text-white py-6 rounded-xl !px-10">Browse opportunities <ArrowRight width={14} height={12}/></Button>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 max-w-[300px] mx-auto bg-[#F8F8F8] mt-12">
        {/* <Image src="/building.svg" width={81} height={81} alt="building"/> */}
    <h3 className="font-semibold text-2xl text-center">Payment Questions?</h3>
    <p className="text-center">Our support team is available 24/7</p>
    <Button  className="bg-primary text-white py-6 rounded-xl !px-10">Contact support <ArrowRight width={14} height={12}/></Button>
      </div>
    </div>
    </div>
  );
}