import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Токен не предоставлен" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any
    const userId = decoded.userId

    // Get user data
    const userResult = await query(
      `
      SELECT 
        id, email, full_name as name, balance, total_invested as "totalInvested",
        total_earned as "totalProfit", role_id, 
        (SELECT COUNT(*) FROM users WHERE referral_code = $1) as "referralCount"
      FROM users 
      WHERE id = $1
    `,
      [userId],
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    const user = userResult.rows[0]
    user.isAdmin = user.role_id <= 2

    // Get investments
    const investmentsResult = await query(
      `
      SELECT 
        i.*, 
        ip.name as plan_name,
        ip.daily_percent,
        ip.duration_days
      FROM investments i
      LEFT JOIN investment_plans ip ON i.plan_id = ip.id
      WHERE i.user_id = $1 AND i.status = 'active'
      ORDER BY i.created_at DESC
    `,
      [userId],
    )

    const investments = investmentsResult.rows.map((inv) => ({
      ...inv,
      investment_plans: {
        name: inv.plan_name,
        daily_percent: inv.daily_percent,
      },
    }))

    // Get recent transactions
    const transactionsResult = await query(
      `
      SELECT 
        id, type, amount, status, created_at, description, payment_method,
        (SELECT name FROM investment_plans WHERE id = plan_id) as plan_name
      FROM transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `,
      [userId],
    )

    return NextResponse.json({
      user,
      investments,
      transactions: transactionsResult.rows,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
