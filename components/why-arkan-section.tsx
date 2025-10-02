import { TrendingUp, Shield, Zap } from "lucide-react"
import { MapPinHouse } from 'lucide-react';
import { History } from 'lucide-react';
import { Building2 } from 'lucide-react';

export function WhyArkanSection() {
  const features = [
    {
      icon: MapPinHouse,
      title: "High & Reliable Returns",
      description: "Consistent returns with our carefully vetted investment opportunities and expert market analysis.",
    },
    {
      icon: History,
      title: "Transparency & Expert Management",
      description: "Full transparency in all transactions with professional property management and regular updates.",
    },
    {
      icon: Building2,
      title: "Flexible Opportunities",
      description: "Choose from various investment options that fit your budget and risk tolerance.",
    },
  ]

  return (
    <section className="py-20 ">
      <div className=" mx-auto ">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[60vh] ">
          {/* Left Content - Features */}
          <div className="space-y-12 max-w-2xl ml-auto px-4 sm:px-6 lg:px-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Arkan Shares?</h2>
              <p className="text-lg text-muted-foreground text-balance">
                We make real estate investment accessible, transparent, and profitable for everyone.
              </p>
            </div>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="p-3">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="">
              <img
                src="/why-arkan.png"
                alt="Professional real estate expert"
                className="w-full ml-auto max-w-3xl object-cover rounded-lg"
              />
              
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
