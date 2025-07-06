import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    // Total users
    const usersResult = await query("SELECT COUNT(*) as count FROM users")
    const totalUsers = Number.parseInt(usersResult.rows[0]?.count || "0")

    // New users today
    const newUsersResult = await query(`
      SELECT COUNT(*) as count FROM users 
      WHERE DATE(created_at) = CURRENT_DATE
    `)
    const newUsersToday = Number.parseInt(newUsersResult.rows[0]?.count || "0")

    // Total transactions
    const transactionsResult = await query("SELECT COUNT(*) as count FROM transactions")
    const totalTransactions = Number.parseInt(transactionsResult.rows[0]?.count || "0")

    // Pending transactions
    const pendingResult = await query(`
      SELECT COUNT(*) as count FROM transactions 
      WHERE status = 'pending'
    `)
    const pendingTransactions = Number.parseInt(pendingResult.rows[0]?.count || "0")

    // Total invested
    const investedResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE type = 'investment' AND status = 'completed'
    `)
    const totalInvested = Number.parseFloat(investedResult.rows[0]?.total || "0")

    // Total withdrawn
    const withdrawnResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE type = 'withdrawal' AND status = 'completed'
    `)
    const totalWithdrawn = Number.parseFloat(withdrawnResult.rows[0]?.total || "0")

    // Active investments
    const activeInvestmentsResult = await query(`
      SELECT COUNT(*) as count FROM investments 
      WHERE status = 'active'
    `)
    const activeInvestments = Number.parseInt(activeInvestmentsResult.rows[0]?.count || "0")

    // Platform balance
    const balanceResult = await query(`
      SELECT COALESCE(SUM(balance), 0) as total FROM users
    `)
    const platformBalance = Number.parseFloat(balanceResult.rows[0]?.total || "0")

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        newUsersToday,
        totalTransactions,
        pendingTransactions,
        totalInvested,
        totalWithdrawn,
        activeInvestments,
        platformBalance,
        profit: totalInvested - totalWithdrawn,
        conversionRate: totalUsers > 0 ? ((activeInvestments / totalUsers) * 100).toFixed(1) : "0",
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка получения статистики",
      },
      { status: 500 },
    )
  }
}
