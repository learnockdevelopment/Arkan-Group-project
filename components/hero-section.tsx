import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, DollarSign } from "lucide-react";
import { ArrowRight } from 'lucide-react';


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] bg-[url('/arkanHero.jpg')] bg-cover overflow-hidden flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/arkanHero.jpg"
          alt="Modern house architecture"
          className="w-full h-full object-cover "
        />
        <div className="absolute inset-0 bg-[#31313154]" />
      </div>
      <div className="flex flex-col items-center space-x-3 absolute bg-white bottom-0 left-0 rounded-tr-2xl p-4 w-[450px] h-[150px] z-20">
        <div className="flex flex-col space-y-2 mb-4 items-center">
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://github.com/leerob.png" alt="@leerob" />
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/evilrabbit.png"
                alt="@evilrabbit"
              />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
            <div className="inline-flex flex-col   ps-4">
              <p className="text-[#FBBC04] font-semibold">+500</p>
              <p>Join With Them.</p>
            </div>
          </div>
        </div>
        <button className="bg-[#1A4973] text-white px-16 py-2 rounded-md hover:bg-[#1A4973]/90 flex items-center">
          Start Investing <ArrowRight className="inline-block ml-2" />
        </button>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className=" gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white text-balance leading-tight">
                "Choose the right <span className="text-white">investment</span>{" "}
                for you"
              </h1>
 <div className="relative w-full max-w-md  overflow-hidden rounded-lg my-12">
      <Input
        type="text"
        placeholder="Find your next investment"
        className=" pr-1 bg-white h-12"
      />
      
      <Search className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-12 p-3 text-white bg-[#FBBC04]" />
    </div>
              <p className="text-lg text-white max-w-lg text-balance ">
               Start investing from 200EG own a share in premium real estate projects that generate consistent returns
              </p>
            </div>

            {/* Search Bar */}
            {/* <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Location" className="pl-10" />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Budget Range" className="pl-10" />
                </div>
                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Search className="w-4 h-4 mr-2" />
                  Start Investing
                </Button>
              </div>
            </div> */}
          </div>

          {/* Right Content - Property Image */}
          {/* <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src="/modern-luxury-house.png"
                alt="Modern luxury house"
                className="w-full h-80 object-cover rounded-lg"
              />
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-lg">Premium Villa Project</h3>
                <p className="text-muted-foreground">Expected ROI: 12-15%</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    $250,000
                  </span>
                  <span className="text-sm text-muted-foreground">
                    24 months
                  </span>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
