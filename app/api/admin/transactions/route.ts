import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const transactionType = searchParams.get("transactionType") || "all"
    const status = searchParams.get("status") || "all"
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (transactionType !== "all") {
      whereClause += ` AND t.type = $${paramIndex}`
      params.push(transactionType)
      paramIndex++
    }

    if (status !== "all") {
      whereClause += ` AND t.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*) as count 
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ${whereClause}
    `,
      params,
    )
    const total = Number.parseInt(countResult.rows[0]?.count || "0")

    // Get transactions
    const transactionsResult = await query(
      `
      SELECT 
        t.id, t.user_id, t.type, t.amount, t.status, t.created_at,
        t.method, t.description, t.fee, t.final_amount,
        u.full_name as user_name, u.email as user_email
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ${whereClause}
      ORDER BY t.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `,
      [...params, limit, offset],
    )

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      transactions: transactionsResult.rows,
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
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка получения транзакций",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, transactionId, data } = await request.json()

    switch (action) {
      case "approve":
        await query(
          `
          UPDATE transactions SET status = 'completed', updated_at = NOW() 
          WHERE id = $1
        `,
          [transactionId],
        )
        break

      case "reject":
        await query(
          `
          UPDATE transactions SET status = 'failed', updated_at = NOW() 
          WHERE id = $1
        `,
          [transactionId],
        )
        break

      case "delete":
        await query("DELETE FROM transactions WHERE id = $1", [transactionId])
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
    console.error("Error updating transaction:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка обновления транзакции",
      },
      { status: 500 },
    )
  }
}
