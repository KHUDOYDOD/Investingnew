import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import jwt from 'jsonwebtoken'

export async function GET(request: Request) {
  try {
    // Получаем userId из токена
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                 request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]

    if (!token) {
      return NextResponse.json({ error: 'Токен не найден' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

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