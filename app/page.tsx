import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { MobileAppSection } from "@/components/mobile-app-section"
import { FeaturedOpportunities } from "@/components/featured-opportunities"
import { CTABanner } from "@/components/cta-banner"
import { WhyArkanSection } from "@/components/why-arkan-section"
import { PartnersSection } from "@/components/partners-section"
import { Footer } from "@/components/footer"
import HomePage from "@/components/pages/HomePage"
export default function App() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HomePage />
      <Footer />
    </main>
  )
}
