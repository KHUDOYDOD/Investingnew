// ⚠️ Stubbed SQL query – replace with real DB logic in production
export async function query<Row = Record<string, unknown>>(
  _sql: string,
  _params: unknown[] = [],
): Promise<{ rows: Row[]; rowCount: number }> {
  if (process.env.NODE_ENV === "development") {
    console.warn("[database] query() stub was called. Provide a real DB implementation for production.")
  }
  return { rows: [], rowCount: 0 }
}

// Заглушка для базы данных без внешних зависимостей
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  joinedAt: string
  country?: string
  totalInvested?: number
  totalProfit?: number
}

export interface Transaction {
  id: number
  userId: number
  type: "deposit" | "withdrawal" | "profit"
  amount: number
  status: "pending" | "completed" | "failed"
  createdAt: string
  description?: string
}

export interface Investment {
  id: number
  userId: number
  planId: number
  amount: number
  profit: number
  status: "active" | "completed" | "cancelled"
  startDate: string
  endDate?: string
}

// Моковые данные
export const mockUsers: User[] = [
  {
    id: 1,
    name: "Александр Петров",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    joinedAt: "2024-01-15T10:30:00Z",
    country: "RU",
    totalInvested: 50000,
    totalProfit: 12500,
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    joinedAt: "2024-01-14T15:45:00Z",
    country: "ES",
    totalInvested: 25000,
    totalProfit: 6250,
  },
  {
    id: 3,
    name: "John Smith",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    joinedAt: "2024-01-13T09:20:00Z",
    country: "US",
    totalInvested: 75000,
    totalProfit: 18750,
  },
]

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    userId: 1,
    type: "deposit",
    amount: 10000,
    status: "completed",
    createdAt: "2024-01-15T11:00:00Z",
    description: "Пополнение счета",
  },
  {
    id: 2,
    userId: 2,
    type: "profit",
    amount: 1250,
    status: "completed",
    createdAt: "2024-01-15T10:45:00Z",
    description: "Прибыль по инвестиции",
  },
  {
    id: 3,
    userId: 3,
    type: "withdrawal",
    amount: 5000,
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    description: "Вывод средств",
  },
]

// Функции для работы с данными
export async function getUsers(limit = 10): Promise<User[]> {
  // Имитация задержки API
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockUsers.slice(0, limit)
}

export async function getTransactions(limit = 10): Promise<Transaction[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockTransactions.slice(0, limit)
}

export async function getStatistics() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    totalUsers: mockUsers.length,
    totalInvestments: mockUsers.reduce((sum, user) => sum + (user.totalInvested || 0), 0),
    totalProfit: mockUsers.reduce((sum, user) => sum + (user.totalProfit || 0), 0),
    activeInvestments: 1247,
    completedInvestments: 3892,
    averageReturn: 18.5,
  }
}

// Mock implementations for getClient, testConnection, initializeDatabase, and pool
export async function getClient() {
  console.warn("[database] getClient() stub was called. Provide a real DB implementation for production.")
  return {}
}

export async function testConnection() {
  console.warn("[database] testConnection() stub was called. Provide a real DB implementation for production.")
  return true
}

export async function initializeDatabase() {
  console.warn("[database] initializeDatabase() stub was called. Provide a real DB implementation for production.")
  return true
}

export const pool = {
  query: async () => {
    console.warn("[database] pool.query() stub was called. Provide a real DB implementation for production.")
    return { rows: [], rowCount: 0 }
  },
}
