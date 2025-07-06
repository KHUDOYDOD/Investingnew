// app/api/statistics/route.ts
// Edge-runtime compatible API route
export const runtime = "edge"

export async function GET() {
  // Static demo data — OK in edge
  const stats = [
    { id: "users", label: "Total Users", value: 12875, delta: 4.2 },
    { id: "invested", label: "Total Invested", value: 4523000, delta: 3.7 },
    { id: "payouts", label: "Total Payouts", value: 1950000, delta: 2.1 },
    { id: "activePlans", label: "Active Plans", value: 3240, delta: 1.3 },
  ]

  return Response.json({ stats }, { status: 200 })
}

// components/statistics.tsx
export default Statistics

// components/hero-section.tsx
export default HeroSection;

// components/trust-indicators.tsx
export default TrustIndicators;

// components/user-activity-rows.tsx
export default UserActivityRows;

// components/new-users-showcase.tsx
export default NewUsersShowcase;

// components/live-activity-feed.tsx
export default LiveActivityFeed;

// components/investment-plans.tsx
export default InvestmentPlans;

// components/features.tsx
export default Features;

// components/testimonials.tsx
export default Testimonials;

// components/faq.tsx
export default FAQ;

// components/footer.tsx
export default SiteFooter;
