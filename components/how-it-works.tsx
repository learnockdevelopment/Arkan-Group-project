import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Discover how easy it is to start investing in real estate with Arkan Shares
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Video Thumbnail */}
          <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden shadow-xl">
            <img src="/professional-businessman-explaining-investment-pro.jpg" alt="How it works video" className="w-full h-96 object-cover" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                className="bg-white/90 text-primary hover:bg-white rounded-full w-20 h-20 p-0 shadow-lg"
              >
                <Play className="w-8 h-8 ml-1" fill="currentColor" />
              </Button>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Steps */}
          {/* <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Browse Opportunities</h3>
              <p className="text-muted-foreground">
                Explore our curated selection of real estate investment opportunities
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Invest Securely</h3>
              <p className="text-muted-foreground">Choose your investment amount and complete the secure transaction</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Earn Returns</h3>
              <p className="text-muted-foreground">
                Track your investment and receive regular returns on your portfolio
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}
