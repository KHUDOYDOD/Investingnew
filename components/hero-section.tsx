"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/components/settings-provider"

import { TrendingUp, Shield, Users, DollarSign, ArrowRight, Play, BarChart3, Wallet } from "lucide-react"

export function HeroSection() {
  const { siteSettings, loading } = useSettings()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const defaultHeroSettings = {
    enabled: true,
    title: "Инвестируйте с умом, получайте стабильный доход",
    subtitle:
      "Профессиональная инвестиционная платформа с ежедневными выплатами, высокой доходностью и гарантированной безопасностью",
    badge_text: "Платформа работает с 2025 года",
    button1_text: "Начать инвестировать",
    button1_link: "/register",
    button2_text: "Войти в систему",
    button2_link: "/login",
    show_buttons: true,
    background_animation: true,
    show_stats: true,
    stats_users: "15K+",
    stats_users_label: "Активных инвесторов",
    stats_invested: "$2.8M",
    stats_invested_label: "Общие инвестиции",
    stats_return: "24.8%",
    stats_return_label: "Средняя доходность",
    stats_reliability: "99.9%",
    stats_reliability_label: "Надежность",
  }

  type HeroSettings = typeof defaultHeroSettings

  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings)

  useEffect(() => {
    setMounted(true)

    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem("authToken")
      const userId = localStorage.getItem("userId")
      const userDataStr = localStorage.getItem("userData")
      
      if (token && userId) {
        setIsAuthenticated(true)
        if (userDataStr) {
          try {
            setUserData(JSON.parse(userDataStr))
          } catch (error) {
            console.error("Error parsing user data:", error)
          }
        }
      }
    }

    // Load hero settings from admin panel
    const loadHeroSettings = async () => {
      try {
        const response = await fetch("/api/admin/hero-settings")
        if (!response.ok) return
        const incoming = await response.json()

        // If API returned at least an `enabled` flag, merge it into current state
        if (incoming && typeof incoming === "object" && "enabled" in incoming) {
          setHeroSettings((prev) => ({ ...prev, ...incoming }))
        }
      } catch (error) {
        console.error("Error loading hero settings:", error)
      }
    }

    checkAuth()
    loadHeroSettings()

    // Listen for auth changes
    const handleStorageChange = () => {
      checkAuth()
    }

    // Check auth status periodically for real-time updates
    const authInterval = setInterval(checkAuth, 5000)

    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(authInterval)
    }
  }, [])

  if (!mounted || loading) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-pulse">
            <div className="h-16 bg-slate-700 rounded-lg mb-6 mx-auto max-w-4xl"></div>
            <div className="h-6 bg-slate-700 rounded-lg mb-8 mx-auto max-w-3xl"></div>
            <div className="h-12 bg-slate-700 rounded-lg mx-auto max-w-xs"></div>
          </div>
        </div>
      </section>
    )
  }

  if (!heroSettings?.enabled) {
    return null
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Investment Background */}
      <div className="absolute inset-0 z-0">
        {/* Main background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9)), url('/placeholder.svg?height=1080&width=1920&text=Investment+Trading+Charts')`,
          }}
        />

        {/* Animated overlay elements */}
        <div className="absolute inset-0">
          {/* Floating charts and graphs */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg backdrop-blur-sm border border-green-500/30 animate-pulse">
            <div className="p-4 h-full flex flex-col justify-between">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <div className="text-right">
                <div className="text-green-400 text-sm font-bold">+24.8%</div>
                <div className="text-green-300 text-xs">ROI</div>
              </div>
            </div>
          </div>

          <div className="absolute top-40 right-20 w-28 h-28 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg backdrop-blur-sm border border-blue-500/30 animate-pulse">
            <div className="p-3 h-full flex flex-col justify-between">
              <DollarSign className="h-5 w-5 text-blue-400" />
              <div className="text-right">
                <div className="text-blue-400 text-sm font-bold">$2.8M</div>
                <div className="text-blue-300 text-xs">Invested</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-32 left-20 w-36 h-24 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-lg backdrop-blur-sm border border-purple-500/30 animate-pulse">
            <div className="p-3 h-full flex items-center justify-between">
              <Users className="h-6 w-6 text-purple-400" />
              <div className="text-right">
                <div className="text-purple-400 text-sm font-bold">15,420</div>
                <div className="text-purple-300 text-xs">Investors</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-lg backdrop-blur-sm border border-yellow-500/30 animate-pulse">
            <div className="p-4 h-full flex flex-col justify-between">
              <Shield className="h-6 w-6 text-yellow-400" />
              <div className="text-right">
                <div className="text-yellow-400 text-sm font-bold">99.9%</div>
                <div className="text-yellow-300 text-xs">Security</div>
              </div>
            </div>
          </div>

          {/* Particle effect */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl text-center relative z-10 px-4">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            {heroSettings.badge_text}
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            <span
              dangerouslySetInnerHTML={{
                __html: heroSettings.title
                  .replace(
                    /умом/g,
                    '<span class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">умом</span>',
                  )
                  .replace(
                    /стабильный/g,
                    '<span class="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">стабильный</span>',
                  ),
              }}
            />
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            <span
              dangerouslySetInnerHTML={{
                __html: heroSettings.subtitle
                  .replace(
                    /ежедневными выплатами/g,
                    '<span class="text-blue-400 font-semibold">ежедневными выплатами</span>',
                  )
                  .replace(
                    /высокой доходностью/g,
                    '<span class="text-green-400 font-semibold">высокой доходностью</span>',
                  )
                  .replace(
                    /гарантированной безопасностью/g,
                    '<span class="text-purple-400 font-semibold">гарантированной безопасностью</span>',
                  ),
              }}
            />
          </p>

          {/* CTA Buttons */}
          {heroSettings.show_buttons && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isAuthenticated ? (
                // Buttons for authenticated users
                <>
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white px-10 py-5 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-110 transition-all duration-500 group border-2 border-white/20"
                    >
                      {/* Animated background overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      {/* Pulsing glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/30 to-purple-400/30 blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                      
                      <div className="relative z-10 flex items-center">
                        <BarChart3 className="mr-3 h-6 w-6 group-hover:rotate-12 group-hover:scale-125 transition-all duration-500" />
                        Личный кабинет
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 group-hover:scale-125 transition-all duration-500" />
                      </div>
                      
                      {/* Corner sparkles */}
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white/60 rounded-full group-hover:scale-150 group-hover:bg-yellow-300 transition-all duration-300 animate-pulse"></div>
                      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full group-hover:scale-150 group-hover:bg-cyan-300 transition-all duration-300 animate-pulse delay-200"></div>
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/investments">
                    <Button
                      size="lg"
                      variant="outline"
                      className="relative overflow-hidden border-3 border-gradient-to-r from-cyan-400 to-blue-500 bg-slate-900/80 backdrop-blur-xl text-white hover:bg-slate-800/90 px-10 py-5 text-lg font-bold rounded-2xl transform hover:scale-110 transition-all duration-500 group shadow-xl hover:shadow-cyan-500/25 border-2 border-cyan-400/50 hover:border-cyan-300"
                    >
                      {/* Animated border glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Moving light effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200"></div>
                      
                      <div className="relative z-10 flex items-center">
                        <Wallet className="mr-3 h-6 w-6 group-hover:rotate-12 group-hover:scale-125 transition-all duration-500" />
                        Начать инвестировать
                        <TrendingUp className="ml-3 h-6 w-6 group-hover:translate-y-[-4px] group-hover:scale-125 transition-all duration-500" />
                      </div>
                      
                      {/* Floating particles effect */}
                      <div className="absolute top-1 right-3 w-1 h-1 bg-cyan-400 rounded-full group-hover:scale-150 group-hover:bg-yellow-400 transition-all duration-300 animate-bounce"></div>
                      <div className="absolute bottom-1 left-3 w-1 h-1 bg-blue-400 rounded-full group-hover:scale-150 group-hover:bg-green-400 transition-all duration-300 animate-bounce delay-150"></div>
                    </Button>
                  </Link>
                </>
              ) : (
                // Buttons for non-authenticated users (original)
                <>
                  <Link href={heroSettings.button1_link}>
                    <Button
                      size="lg"
                      className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-110 transition-all duration-500 group border-2 border-white/20"
                    >
                      {/* Animated background overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      {/* Pulsing glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                      
                      <div className="relative z-10 flex items-center">
                        <DollarSign className="mr-3 h-6 w-6 group-hover:rotate-12 group-hover:scale-125 transition-all duration-500" />
                        {heroSettings.button1_text}
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 group-hover:scale-125 transition-all duration-500" />
                      </div>
                      
                      {/* Corner sparkles */}
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white/60 rounded-full group-hover:scale-150 group-hover:bg-yellow-300 transition-all duration-300 animate-pulse"></div>
                      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full group-hover:scale-150 group-hover:bg-cyan-300 transition-all duration-300 animate-pulse delay-200"></div>
                    </Button>
                  </Link>
                  
                  <Link href={heroSettings.button2_link}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="relative overflow-hidden border-3 border-gradient-to-r from-slate-400 to-slate-600 bg-slate-800/80 backdrop-blur-xl text-white hover:bg-slate-700/90 px-10 py-5 text-lg font-bold rounded-2xl transform hover:scale-110 transition-all duration-500 group shadow-xl hover:shadow-slate-500/25 border-2 border-slate-600/50 hover:border-slate-400"
                    >
                      {/* Animated border glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-slate-400/20 via-slate-500/20 to-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Moving light effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200"></div>
                      
                      <div className="relative z-10 flex items-center">
                        <Play className="mr-3 h-6 w-6 group-hover:scale-125 transition-all duration-500" />
                        {heroSettings.button2_text}
                        <Shield className="ml-3 h-6 w-6 group-hover:scale-125 transition-all duration-500" />
                      </div>
                      
                      {/* Floating particles effect */}
                      <div className="absolute top-1 right-3 w-1 h-1 bg-slate-400 rounded-full group-hover:scale-150 group-hover:bg-blue-400 transition-all duration-300 animate-bounce"></div>
                      <div className="absolute bottom-1 left-3 w-1 h-1 bg-slate-500 rounded-full group-hover:scale-150 group-hover:bg-purple-400 transition-all duration-300 animate-bounce delay-150"></div>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Stats Preview */}
          {heroSettings.show_stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-2">{heroSettings.stats_users}</div>
                <div className="text-slate-400 text-sm">{heroSettings.stats_users_label}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">{heroSettings.stats_invested}</div>
                <div className="text-slate-400 text-sm">{heroSettings.stats_invested_label}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">{heroSettings.stats_return}</div>
                <div className="text-slate-400 text-sm">{heroSettings.stats_return_label}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
                  {heroSettings.stats_reliability}
                </div>
                <div className="text-slate-400 text-sm">{heroSettings.stats_reliability_label}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
