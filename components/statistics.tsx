"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Users, DollarSign, PiggyBank, ArrowUpRight, Clock } from "lucide-react"

interface Statistic {
  id: string
  label: string
  value: number
  delta: number
  type: string
}

export function Statistics() {
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)

        const response = await fetch("/api/statistics")
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.stats)) {
            setStatistics(data.stats)
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки статистики:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
    // Обновление каждые 5 минут
    const interval = setInterval(fetchStatistics, 300000)

    return () => clearInterval(interval)
  }, [])

  const getStatIcon = (type: string) => {
    switch (type) {
      case "users":
        return <Users className="h-5 w-5" />
      case "deposits":
        return <ArrowUpRight className="h-5 w-5" />
      case "invested":
        return <PiggyBank className="h-5 w-5" />
      case "payouts":
        return <DollarSign className="h-5 w-5" />
      default:
        return <TrendingUp className="h-5 w-5" />
    }
  }

  const getStatConfig = (type: string) => {
    switch (type) {
      case "users":
        return {
          gradient: "from-blue-500 to-indigo-600",
          bgGradient: "from-blue-500/20 to-indigo-600/20",
          borderColor: "border-blue-500/30",
          textColor: "text-blue-400",
          shadowColor: "shadow-blue-500/25",
        }
      case "deposits":
        return {
          gradient: "from-emerald-500 to-teal-600",
          bgGradient: "from-emerald-500/20 to-teal-600/20",
          borderColor: "border-emerald-500/30",
          textColor: "text-emerald-400",
          shadowColor: "shadow-emerald-500/25",
        }
      case "invested":
        return {
          gradient: "from-purple-500 to-violet-600",
          bgGradient: "from-purple-500/20 to-violet-600/20",
          borderColor: "border-purple-500/30",
          textColor: "text-purple-400",
          shadowColor: "shadow-purple-500/25",
        }
      case "payouts":
        return {
          gradient: "from-yellow-500 to-orange-600",
          bgGradient: "from-yellow-500/20 to-orange-600/20",
          borderColor: "border-yellow-500/30",
          textColor: "text-yellow-400",
          shadowColor: "shadow-yellow-500/25",
        }
      default:
        return {
          gradient: "from-gray-500 to-slate-600",
          bgGradient: "from-gray-500/20 to-slate-600/20",
          borderColor: "border-gray-500/30",
          textColor: "text-gray-400",
          shadowColor: "shadow-gray-500/25",
        }
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Загрузка статистики...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-600/5 to-teal-600/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
              Статистика платформы
            </h2>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Актуальные показатели работы нашей инвестиционной платформы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {statistics.map((stat, index) => {
            const config = getStatConfig(stat.type)
            const isPositive = stat.delta >= 0

            return (
              <div
                key={stat.id}
                className={`p-6 rounded-2xl border ${config.borderColor} bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl shadow-xl ${config.shadowColor} hover:shadow-2xl transition-all duration-500 relative overflow-hidden group animate-slide-up card-hover`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-start justify-between relative z-10 mb-4">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-r ${config.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {getStatIcon(stat.type)}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`text-sm font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                      {isPositive ? "+" : ""}
                      {stat.delta}%
                    </span>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-2 tabular-nums group-hover:text-cyan-100 transition-colors">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-slate-300 text-base font-medium group-hover:text-slate-200 transition-colors">
                    {stat.label}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4 relative z-10">
                  <div
                    className={`w-2 h-2 rounded-full ${isPositive ? "bg-emerald-400" : "bg-red-400"} animate-pulse`}
                  ></div>
                  <span className="text-slate-400 text-sm">{isPositive ? "Рост" : "Снижение"} за период</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Индикатор обновления */}
        <div className="mt-16 text-center animate-fade-in-delayed">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full glass">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300 text-sm font-medium">Обновляется каждые 5 минут</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Statistics
