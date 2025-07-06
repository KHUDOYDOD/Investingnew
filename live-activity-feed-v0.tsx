"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, Zap, Clock } from "lucide-react"

interface Activity {
  id: string
  type: string
  amount?: number
  user_name: string
  time: string
  plan_name?: string
}

// Демо данные для v0.dev
const demoActivities: Activity[] = [
  {
    id: "1",
    type: "deposit",
    amount: 1250,
    user_name: "Александр К.",
    time: "2 минуты назад",
  },
  {
    id: "2",
    type: "investment",
    amount: 5000,
    user_name: "Мария В.",
    time: "5 минут назад",
    plan_name: "Премиум План"
  },
  {
    id: "3",
    type: "withdrawal",
    amount: 800,
    user_name: "Дмитрий С.",
    time: "12 минут назад",
  },
  {
    id: "4",
    type: "profit",
    amount: 450,
    user_name: "Елена Р.",
    time: "18 минут назад",
  },
  {
    id: "5",
    type: "referral",
    amount: 300,
    user_name: "Андрей М.",
    time: "25 минут назад",
  },
  {
    id: "6",
    type: "deposit",
    amount: 2100,
    user_name: "Ольга П.",
    time: "31 минута назад",
  }
]

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Имитация загрузки данных для v0.dev
    const loadDemoData = () => {
      setTimeout(() => {
        setActivities(demoActivities)
        setLoading(false)
      }, 1500)
    }

    loadDemoData()

    // Имитация обновления каждые 30 секунд
    const interval = setInterval(() => {
      // Добавляем случайную новую активность
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: ["deposit", "withdrawal", "investment", "profit", "referral"][Math.floor(Math.random() * 5)],
        amount: Math.floor(Math.random() * 5000) + 100,
        user_name: ["Иван И.", "Анна К.", "Петр С.", "Наталья В.", "Михаил Р."][Math.floor(Math.random() * 5)],
        time: "только что",
        plan_name: Math.random() > 0.7 ? "Стандартный План" : undefined
      }
      
      setActivities(prev => [newActivity, ...prev.slice(0, 5)])
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpRight className="h-5 w-5" />
      case "withdrawal":
        return <ArrowDownRight className="h-5 w-5" />
      case "investment":
        return <TrendingUp className="h-5 w-5" />
      case "referral":
        return <Users className="h-5 w-5" />
      case "profit":
        return <Zap className="h-5 w-5" />
      default:
        return <TrendingUp className="h-5 w-5" />
    }
  }

  const getActivityConfig = (type: string) => {
    switch (type) {
      case "deposit":
        return {
          gradient: "from-emerald-500 to-teal-600",
          bgGradient: "from-emerald-500/20 to-teal-600/20",
          borderColor: "border-emerald-500/30",
          textColor: "text-emerald-400",
          shadowColor: "shadow-emerald-500/25",
        }
      case "withdrawal":
        return {
          gradient: "from-red-500 to-pink-600",
          bgGradient: "from-red-500/20 to-pink-600/20",
          borderColor: "border-red-500/30",
          textColor: "text-red-400",
          shadowColor: "shadow-red-500/25",
        }
      case "investment":
        return {
          gradient: "from-blue-500 to-indigo-600",
          bgGradient: "from-blue-500/20 to-indigo-600/20",
          borderColor: "border-blue-500/30",
          textColor: "text-blue-400",
          shadowColor: "shadow-blue-500/25",
        }
      case "referral":
        return {
          gradient: "from-yellow-500 to-orange-600",
          bgGradient: "from-yellow-500/20 to-orange-600/20",
          borderColor: "border-yellow-500/30",
          textColor: "text-yellow-400",
          shadowColor: "shadow-yellow-500/25",
        }
      case "profit":
        return {
          gradient: "from-purple-500 to-violet-600",
          bgGradient: "from-purple-500/20 to-violet-600/20",
          borderColor: "border-purple-500/30",
          textColor: "text-purple-400",
          shadowColor: "shadow-purple-500/25",
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

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "deposit":
        return `пополнил счет на $${activity.amount?.toLocaleString()}`
      case "withdrawal":
        return `вывел $${activity.amount?.toLocaleString()}`
      case "investment":
        return `инвестировал $${activity.amount?.toLocaleString()} в ${activity.plan_name || "план"}`
      case "referral":
        return `получил $${activity.amount?.toLocaleString()} с рефералов`
      case "profit":
        return `получил $${activity.amount?.toLocaleString()} прибыли`
      default:
        return `совершил операцию на $${activity.amount?.toLocaleString()}`
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
            <div className="w-12 h-12 border-4 border-t-cyan-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full mx-auto mb-4 animate-spin"></div>
            <p className="text-slate-300 text-lg">Загрузка активности...</p>
          </div>
        </div>
      </section>
    )
  }

  if (activities.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-600/5 to-teal-600/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
              Активность в реальном времени
            </h2>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Следите за последними операциями на нашей платформе
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {activities.map((activity, index) => {
            const config = getActivityConfig(activity.type)

            return (
              <div
                key={activity.id}
                className={`p-6 rounded-2xl border ${config.borderColor} bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl shadow-xl ${config.shadowColor} hover:shadow-2xl transition-all duration-500 relative overflow-hidden group`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: `fadeInUp 0.6s ease-out forwards`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-start relative z-10">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-r ${config.gradient} text-white shadow-lg mr-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1">
                    <p className="text-white text-lg leading-relaxed">
                      <span className="font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                        {activity.user_name}
                      </span>{" "}
                      {getActivityText(activity)}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <p className="text-slate-400 text-sm font-medium">{activity.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Индикатор живой активности */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300 text-sm font-medium">Обновляется каждые 30 секунд</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
