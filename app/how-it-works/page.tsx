import React from "react";
import { HowItWorks } from "@/components/how-it-works";
import StepsSection from "@/components/how-it-works/Steps";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
function page() {
  return (
    <section className="">
      <div className=" ">
        <HowItWorks
          title="How It Works?"
          description={`“Investing Made Simple”`}
          titleClass="!text-base font-medium bg-[#FFEBB1] px-4 py-2 rounded-full inline-block"
          descriptionClass="!text-5xl font-bold !text-black max-w-3xl mx-auto text-balance"
        />
      </div>
      <div>
        <StepsSection />
      </div>

      <div className="max-w-3xl mx-auto my-12">
        <h2 className="!text-4xl text-center font-bold !text-black mb-8">
          “With Arkan Shares, investing is not just profitable it’s effortless.”
        </h2>
        <div className="flex justify-center">
          <Button className="rounded-2xl !px-6 !py-3 text-base h-auto ">
            {" "}
            View Details{" "}
                        <ArrowRight className="w-5 h-5"/>

          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto my-16 mt-32 px-6">
      <div className="flex justify-between gap-24 items-cente lg:flex-row flex-col">
<div>
<p className="max-w-32 mx-auto bg-[#FFEBB1] rounded-full text-center p-1 mb-4">Arkan App</p>
<h2 className="!text-4xl text-center font-bold !text-black mb-8 max-w-2xl mx-auto">Check out and pay the down payment online</h2>
<div className="flex justify-end">
<Button className="rounded-2xl !px-6 !py-3 text-base h-auto ">
            {" "}
            Download the app{" "}
            <ArrowRight className="w-5 h-5"/>
          </Button>
          </div>
          </div>
<div>
  <img src="/mobiles-arkan.png" alt="mobiles" className="w-full max-h-[700px]"/>
</div>
      </div>


      </div>
    </section>
  );
}

export default page;
