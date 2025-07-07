import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      return NextResponse.json({ error: 'Токен не предоставлен' }, { status: 401 })
    }

    // Верифицируем токен
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    // Получаем инвестиции пользователя
    const result = await query(
      `SELECT 
        i.id,
        i.plan_name,
        i.amount,
        i.daily_profit,
        i.total_profit,
        i.progress,
        i.status,
        i.start_date,
        i.end_date,
        i.days_left,
        i.days_total,
        ip.profit_rate,
        ip.duration_days
      FROM investments i
      LEFT JOIN investment_plans ip ON i.plan_id = ip.id
      WHERE i.user_id = $1::uuid AND i.status = 'active'
      ORDER BY i.start_date DESC`,
      [decoded.userId]
    )

    return NextResponse.json({
      success: true,
      investments: result.rows
    })

  } catch (error) {
    console.error('Dashboard investments API error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}