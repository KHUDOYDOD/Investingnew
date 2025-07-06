import { HeroSection } from "@/components/hero-section"
import { TrustIndicators } from "@/components/trust-indicators"
import { UserActivityRows } from "@/components/user-activity-rows"
import { NewUsersShowcase } from "@/components/new-users-showcase"
import { LiveActivityFeed } from "@/components/live-activity-feed"
import Statistics from "@/components/statistics"
import { InvestmentPlans } from "@/components/investment-plans"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="flex flex-col items-stretch gap-16">
      {/* 1. 🎯 HeroSection */}
      <HeroSection />

      {/* 2. 🛡️ TrustIndicators */}
      <TrustIndicators />

      {/* 3. 📈 UserActivityRows */}
      <UserActivityRows />

      {/* 4. 👥 NewUsersShowcase */}
      <NewUsersShowcase />

      {/* 5. ⚡ LiveActivityFeed */}
      <LiveActivityFeed />

      {/* 6. 📊 Statistics */}
      <Statistics />

      {/* 7. 💰 InvestmentPlans */}
      <InvestmentPlans />

      {/* 8. ✨ Features */}
      <Features />

      {/* 9. 💬 Testimonials */}
      <Testimonials />

      {/* 10. ❓ FAQ */}
      <FAQ />

      {/* 11. 🔗 Footer */}
      <Footer />
    </main>
  )
}
