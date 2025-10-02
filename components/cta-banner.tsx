import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTABanner() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className=" mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
            Start your real estate journey today with Arkan Shares – smart, simple, and secure.
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto text-balance">
            Join thousands of investors who trust Arkan Shares for their real estate investment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90  !px-8 !py-6 text-base  !rounded-2xl border border-transparent">
              Start Investing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-secondary text-secondary hover:text-secondary bg-transparent   !px-8 !py-6 text-base  !rounded-2xl"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
