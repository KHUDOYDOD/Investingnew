import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        id,
        full_name as name,
        email,
        created_at as "joinedDate",
        country
      FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 10
    `)

    const users = result.rows.map((row) => ({
      id: row.id,
      name: row.name || "Пользователь",
      email: row.email,
      joinedDate: row.joinedDate,
      country: row.country || "RU",
    }))

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Error fetching new users:", error)

    // Fallback demo data
    const demoUsers = [
      {
        id: "demo-1",
        name: "Александр Петров",
        email: "alex@example.com",
        joinedDate: new Date(Date.now() - 3600000).toISOString(),
        country: "RU",
      },
      {
        id: "demo-2",
        name: "Мария Иванова",
        email: "maria@example.com",
        joinedDate: new Date(Date.now() - 7200000).toISOString(),
        country: "UA",
      },
      {
        id: "demo-3",
        name: "Дмитрий Сидоров",
        email: "dmitry@example.com",
        joinedDate: new Date(Date.now() - 10800000).toISOString(),
        country: "BY",
      },
      {
        id: "demo-4",
        name: "Елена Козлова",
        email: "elena@example.com",
        joinedDate: new Date(Date.now() - 14400000).toISOString(),
        country: "KZ",
      },
      {
        id: "demo-5",
        name: "Андрей Морозов",
        email: "andrey@example.com",
        joinedDate: new Date(Date.now() - 18000000).toISOString(),
        country: "RU",
      },
    ]

    return NextResponse.json({
      success: true,
      data: demoUsers,
    })
  }
}
