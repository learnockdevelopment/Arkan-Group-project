
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { MobileAppSection } from "@/components/mobile-app-section"
import { FeaturedOpportunities } from "@/components/featured-opportunities"
import { CTABanner } from "@/components/cta-banner"
import { WhyArkanSection } from "@/components/why-arkan-section"
import { PartnersSection } from "@/components/partners-section"
function HomePage() {
  return (
    <div>
      <HeroSection />
      <HowItWorks />
      <MobileAppSection />
      <FeaturedOpportunities />
      <CTABanner />
      <WhyArkanSection />
      <PartnersSection />

    </div>
  )
}

export default HomePage