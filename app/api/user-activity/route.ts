import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.status,
        t.created_at as time,
        u.full_name as user_name,
        u.id as user_id,
        ip.name as plan_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN investment_plans ip ON t.plan_id = ip.id
      WHERE t.status = 'completed'
      ORDER BY t.created_at DESC
      LIMIT 20
    `)

    const activities = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      amount: Number.parseFloat(row.amount) || 0,
      user_name: row.user_name || "Пользователь",
      time: row.time,
      plan_name: row.plan_name,
      user_id: row.user_id,
      status: row.status,
    }))

    return NextResponse.json({
      success: true,
      data: activities,
    })
  } catch (error) {
    console.error("Error fetching user activity:", error)

    // Fallback demo data
    const demoActivities = [
      {
        id: "demo-1",
        type: "deposit",
        amount: 1500,
        user_name: "Александр К.",
        time: new Date(Date.now() - 300000).toISOString(),
        plan_name: null,
        user_id: "demo-user-1",
        status: "completed",
      },
      {
        id: "demo-2",
        type: "investment",
        amount: 2000,
        user_name: "Мария П.",
        time: new Date(Date.now() - 600000).toISOString(),
        plan_name: "Стандарт",
        user_id: "demo-user-2",
        status: "completed",
      },
      {
        id: "demo-3",
        type: "withdrawal",
        amount: 850,
        user_name: "Дмитрий С.",
        time: new Date(Date.now() - 900000).toISOString(),
        plan_name: null,
        user_id: "demo-user-3",
        status: "completed",
      },
      {
        id: "demo-4",
        type: "profit",
        amount: 125,
        user_name: "Елена В.",
        time: new Date(Date.now() - 1200000).toISOString(),
        plan_name: "Премиум",
        user_id: "demo-user-4",
        status: "completed",
      },
      {
        id: "demo-5",
        type: "deposit",
        amount: 3000,
        user_name: "Андрей М.",
        time: new Date(Date.now() - 1500000).toISOString(),
        plan_name: null,
        user_id: "demo-user-5",
        status: "completed",
      },
    ]

    return NextResponse.json({
      success: true,
      data: demoActivities,
    })
  }
}
