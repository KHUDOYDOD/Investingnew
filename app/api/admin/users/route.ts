import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (status !== "all") {
      whereClause += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*) as count FROM users ${whereClause}
    `,
      params,
    )
    const total = Number.parseInt(countResult.rows[0]?.count || "0")

    // Get users
    const usersResult = await query(
      `
      SELECT 
        u.id, u.email, u.full_name, u.balance, u.total_invested, u.total_earned,
        u.status, u.created_at, u.last_login, u.country, u.phone,
        ur.name as role_name,
        (SELECT COUNT(*) FROM transactions WHERE user_id = u.id) as transaction_count
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `,
      [...params, limit, offset],
    )

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      users: usersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка получения пользователей",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, data } = await request.json()

    switch (action) {
      case "update_status":
        await query(
          `
          UPDATE users SET status = $1, updated_at = NOW() 
          WHERE id = $2
        `,
          [data.status, userId],
        )
        break

      case "update_balance":
        await query(
          `
          UPDATE users SET balance = $1, updated_at = NOW() 
          WHERE id = $2
        `,
          [data.balance, userId],
        )
        break

      case "delete":
        await query("DELETE FROM users WHERE id = $1", [userId])
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Неизвестное действие",
          },
          { status: 400 },
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка обновления пользователя",
      },
      { status: 500 },
    )
  }
}
