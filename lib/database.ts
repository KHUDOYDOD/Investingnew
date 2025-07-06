import { Pool } from 'pg'

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Real SQL query function
export async function query<Row = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<{ rows: Row[]; rowCount: number }> {
  try {
    const result = await pool.query(sql, params)
    return { rows: result.rows as Row[], rowCount: result.rowCount || 0 }
  } catch (error) {
    console.error('[database] Query error:', error)
    throw error
  }
}

// Database types
export interface User {
  id: string
  full_name: string
  email: string
  password_hash: string
  phone?: string
  country?: string
  balance: number
  total_invested: number
  total_earned: number
  referral_code?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  user_id: string
  type: "deposit" | "withdrawal" | "profit" | "investment"
  amount: number
  status: "pending" | "completed" | "failed"
  created_at: string
  description?: string
}

export interface Investment {
  id: number
  user_id: string
  plan_id: number
  amount: number
  total_profit: number
  status: "active" | "completed" | "cancelled"
  start_date: string
  end_date?: string
}

// Real database functions
export async function getUsers(limit = 10): Promise<User[]> {
  const result = await query<User>('SELECT * FROM users LIMIT $1', [limit])
  return result.rows
}

export async function getTransactions(limit = 10): Promise<Transaction[]> {
  const result = await query<Transaction>('SELECT * FROM transactions ORDER BY created_at DESC LIMIT $1', [limit])
  return result.rows
}

export async function getStatistics() {
  const [usersResult, investmentsResult] = await Promise.all([
    query<{ count: string }>('SELECT COUNT(*) as count FROM users'),
    query<{ total_invested: string; total_earned: string }>('SELECT SUM(total_invested) as total_invested, SUM(total_earned) as total_earned FROM users')
  ])
  
  const totalUsers = parseInt(usersResult.rows[0]?.count || '0')
  const totalInvestments = parseFloat(investmentsResult.rows[0]?.total_invested || '0')
  const totalProfit = parseFloat(investmentsResult.rows[0]?.total_earned || '0')
  
  return {
    totalUsers,
    totalInvestments,
    totalProfit,
    activeInvestments: 0, // будет реализовано позже
    completedInvestments: 0, // будет реализовано позже
    averageReturn: totalInvestments > 0 ? (totalProfit / totalInvestments) * 100 : 0,
  }
}

// Database utility functions
export async function getClient() {
  return pool.connect()
}

export async function testConnection() {
  try {
    const result = await pool.query('SELECT 1')
    return result.rows.length > 0
  } catch (error) {
    console.error('[database] Connection test failed:', error)
    return false
  }
}

export async function initializeDatabase() {
  try {
    // Check if users table exists
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `)
    return result.rows.length > 0
  } catch (error) {
    console.error('[database] Database initialization check failed:', error)
    return false
  }
}

// Export the pool for direct usage
export { pool }

// Authentication functions
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function getUserByEmailOrName(emailOrName: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1 OR full_name = $1', 
    [emailOrName]
  )
  return result.rows[0] || null
}

export async function createUser(userData: {
  email: string
  full_name: string
  password_hash: string
  phone?: string
  country?: string
}): Promise<User> {
  const result = await query<User>(`
    INSERT INTO users (email, full_name, password_hash, phone, country, balance, total_invested, total_earned)
    VALUES ($1, $2, $3, $4, $5, 0, 0, 0)
    RETURNING *
  `, [userData.email, userData.full_name, userData.password_hash, userData.phone, userData.country])
  
  return result.rows[0]
}