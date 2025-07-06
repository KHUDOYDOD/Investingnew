"use client"

import { useState, useEffect } from "react"
import { Clock, Globe, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NewUser {
  id: string
  name: string
  email: string
  joinedDate: string
  country: string
}

const countryFlags: Record<string, string> = {
  RU: "🇷🇺",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  FR: "🇫🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  CA: "🇨🇦",
  AU: "🇦🇺",
  JP: "🇯🇵",
  KR: "🇰🇷",
  CN: "🇨🇳",
  IN: "🇮🇳",
  BR: "🇧🇷",
  MX: "🇲🇽",
  UA: "🇺🇦",
  PL: "🇵🇱",
  NL: "🇳🇱",
  SE: "🇸🇪",
  NO: "🇳🇴",
  TR: "🇹🇷",
  AR: "🇦🇷",
  CL: "🇨🇱",
  CO: "🇨🇴",
  BY: "🇧🇾",
  KZ: "🇰🇿",
}

const countryNames: Record<string, string> = {
  RU: "Россия",
  US: "США",
  GB: "Великобритания",
  DE: "Германия",
  FR: "Франция",
  IT: "Италия",
  ES: "Испания",
  CA: "Канада",
  AU: "Австралия",
  JP: "Япония",
  KR: "Южная Корея",
  CN: "Китай",
  IN: "Индия",
  BR: "Бразилия",
  MX: "Мексика",
  UA: "Украина",
  PL: "Польша",
  NL: "Нидерланды",
  SE: "Швеция",
  NO: "Норвегия",
  TR: "Турция",
  AR: "Аргентина",
  CL: "Чили",
  CO: "Колумбия",
  BY: "Беларусь",
  KZ: "Казахстан",
}

interface NewUsersShowcaseProps {
  limit?: number
  showButton?: boolean
}

export function NewUsersShowcase({ limit, showButton = true }: NewUsersShowcaseProps = {}) {
  const [newUsers, setNewUsers] = useState<NewUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCountry, setFilterCountry] = useState("all")

  useEffect(() => {
    const fetchNewUsers = async () => {
      try {
        setLoading(true)

        const response = await fetch("/api/new-users")
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            const usersWithCountries = data.data.map((user: any) => ({
              ...user,
              country: user.country || "RU",
            }))
            setNewUsers(usersWithCountries)
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки новых пользователей:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNewUsers()
    const interval = setInterval(fetchNewUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "только что"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "минуту" : minutes < 5 ? "минуты" : "минут"} назад`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "час" : hours < 5 ? "часа" : "часов"} назад`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"} назад`
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const generateNickname = (name: string, email: string) => {
    if (name && name !== "Anonymous User") {
      const nameParts = name.split(" ")
      if (nameParts.length > 1) {
        return nameParts[0] + " " + nameParts[1].charAt(0) + "."
      }
      return nameParts[0]
    }

    const emailPart = email.split("@")[0]
    return emailPart.charAt(0).toUpperCase() + emailPart.slice(1, 8)
  }

  const filteredUsers = newUsers.filter((user) => {
    const nickname = generateNickname(user.name, user.email)
    const matchesSearch =
      nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterCountry === "all" || user.country === filterCountry
    return matchesSearch && matchesFilter
  })

  const uniqueCountries = Array.from(new Set(newUsers.map((u) => u.country).filter(Boolean)))
  const displayLimit = limit || 6
  const displayUsers = filteredUsers.slice(0, displayLimit)

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex justify-center">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </section>
    )
  }

  // Компактный режим для админ панели
  if (limit && !showButton) {
    return (
      <div className="space-y-3">
        {displayUsers.map((user, index) => {
          const nickname = generateNickname(user.name, user.email)
          const countryFlag = user.country ? countryFlags[user.country] || "🌍" : "🌍"
          const countryName = user.country ? countryNames[user.country] || "Неизвестно" : "Неизвестно"

          return (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors card-hover"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{nickname}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span>{countryFlag}</span>
                    {countryName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-400 font-medium">НОВЫЙ</span>
                </div>
                <p className="text-xs text-slate-500">{formatTimeAgo(user.joinedDate)}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent mb-6">
            Новые участники
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Последние зарегистрированные пользователи со всего мира
          </p>
        </div>

        {/* Фильтры */}
        <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-between items-center animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Поиск по имени пользователя..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus-ring"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterCountry === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCountry("all")}
              className={`btn-animate ${
                filterCountry === "all"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Все страны
            </Button>
            {uniqueCountries.slice(0, 3).map((country) => (
              <Button
                key={country}
                variant={filterCountry === country ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCountry(country || "all")}
                className={`btn-animate ${
                  filterCountry === country
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {country && countryFlags[country]} {country && countryNames[country]}
              </Button>
            ))}
          </div>
        </div>

        {/* Таблица */}
        <div className="overflow-hidden bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-slide-up glass">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Страна
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayUsers.map((user, index) => {
                  const nickname = generateNickname(user.name, user.email)
                  const countryFlag = user.country ? countryFlags[user.country] || "🌍" : "🌍"
                  const countryName = user.country ? countryNames[user.country] || "Неизвестно" : "Неизвестно"

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-white/5 transition-colors duration-300 group animate-fade-in card-hover"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                            {nickname.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-lg font-medium text-white group-hover:text-emerald-300 transition-colors">
                            {nickname}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 mr-3">
                            <Globe className="h-5 w-5 text-emerald-400" />
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl" title={countryName}>
                              {countryFlag}
                            </span>
                            <span className="text-lg font-medium text-emerald-400">{countryName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-emerald-400 text-lg font-medium">НОВЫЙ</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center text-slate-400">
                          <Clock className="h-4 w-4 mr-2" />
                          <div>
                            <div className="text-sm font-medium">{formatDate(user.joinedDate)}</div>
                            <div className="text-xs text-slate-500">{formatTimeAgo(user.joinedDate)}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-slate-400 text-lg">Пользователи не найдены</p>
          </div>
        )}

        {showButton && (
          <div className="mt-8 text-center animate-fade-in-delayed">
            <a href="/all-users">
              <button className="group relative px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-emerald-400/30 btn-animate hover-lift">
                <span className="relative z-10 flex items-center gap-3">
                  👥 Показать всех участников ({filteredUsers.length})
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </button>
            </a>
          </div>
        )}

        {/* Статистика в подвале */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-delayed">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl glass card-hover">
            <div className="text-3xl font-bold text-emerald-400 mb-2">{filteredUsers.length}</div>
            <div className="text-slate-300 text-sm">Показано участников</div>
          </div>

          <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl glass card-hover">
            <div className="text-3xl font-bold text-teal-400 mb-2">{uniqueCountries.length}</div>
            <div className="text-slate-300 text-sm">Стран представлено</div>
          </div>

          <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl glass card-hover">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-medium">ОНЛАЙН</span>
            </div>
            <div className="text-slate-300 text-sm">Обновляется каждые 30 сек</div>
          </div>
        </div>
      </div>
    </section>
  )
}
