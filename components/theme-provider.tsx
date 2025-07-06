"use client"

import * as React from "react"

type Theme = "light" | "dark"

interface ThemeProviderProps {
  children: React.ReactNode
  /**
   * Класс-атрибут, который нужно добавить к < html > (по умолчанию "class")
   * В нашем упрощённом провайдере он игнорируется: мы всегда пишем в classList.
   */
  attribute?: string
  /** Тема по умолчанию, если пользователь ещё не выбирал */
  defaultTheme?: Theme
  /** Использовать ли системную тему */
  enableSystem?: boolean
}

const ThemeContext = React.createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({
  theme: "light",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setTheme: () => {},
})

export const useTheme = () => React.useContext(ThemeContext)

/**
 * Упрощённый провайдер темы без внешних зависимостей (`next-themes`).
 * Мы:
 * 1. Читаем сохранённое значение из localStorage, либо системную тему (если enableSystem).
 * 2. Меняем className у < html > (`light` или `dark`).
 * 3. Даём контекст с theme / setTheme.
 *
 * Этого достаточно для Tailwind + `darkMode: "class"`.
 */
export function ThemeProvider({ children, defaultTheme = "light", enableSystem = true }: ThemeProviderProps) {
  const getSystemTheme = (): Theme => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    const saved = window.localStorage.getItem("theme") as Theme | null
    if (saved) return saved
    return enableSystem ? getSystemTheme() : defaultTheme
  })

  // Применяем класс к < html >
  React.useEffect(() => {
    const root = document.documentElement
    root.classList.remove(theme === "dark" ? "light" : "dark")
    root.classList.add(theme)
    window.localStorage.setItem("theme", theme)
  }, [theme])

  // Обновляем тему при смене системной, если включено
  React.useEffect(() => {
    if (!enableSystem) return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = () => setTheme(mq.matches ? "dark" : "light")
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [enableSystem])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
