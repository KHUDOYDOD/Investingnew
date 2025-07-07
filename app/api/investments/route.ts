import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      return NextResponse.json({ error: 'Токен не предоставлен' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }

    const { planId, amount } = await request.json()

    if (!planId || !amount) {
      return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 })
    }

    // Получаем план инвестиций
    const planResult = await query(
      'SELECT * FROM investment_plans WHERE id = $1 AND is_active = true',
      [planId]
    )

    if (planResult.rows.length === 0) {
      return NextResponse.json({ error: 'План инвестиций не найден' }, { status: 404 })
    }

    const plan = planResult.rows[0]

    // Проверяем минимальную и максимальную сумму
    if (amount < plan.min_amount || amount > plan.max_amount) {
      return NextResponse.json({ 
        error: `Сумма должна быть от $${plan.min_amount} до $${plan.max_amount}` 
      }, { status: 400 })
    }

    // Проверяем баланс пользователя
    const userResult = await query(
      'SELECT balance FROM users WHERE id = $1::uuid',
      [decoded.userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const userBalance = parseFloat(userResult.rows[0].balance)
    if (userBalance < amount) {
      return NextResponse.json({ error: 'Недостаточно средств' }, { status: 400 })
    }

    // Создаем инвестицию
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + plan.duration_days)

    const investmentResult = await query(
      `INSERT INTO investments 
       (user_id, plan_id, amount, status, start_date, end_date, daily_profit_rate, total_profit)
       VALUES ($1::uuid, $2, $3, 'active', $4, $5, $6, 0)
       RETURNING *`,
      [decoded.userId, planId, amount, startDate, endDate, plan.daily_profit_rate]
    )

    // Обновляем баланс пользователя
    await query(
      'UPDATE users SET balance = balance - $1, total_invested = total_invested + $1 WHERE id = $2::uuid',
      [amount, decoded.userId]
    )

    // Создаем транзакцию
    await query(
      `INSERT INTO transactions 
       (user_id, type, amount, status, description, method, plan_id)
       VALUES ($1::uuid, 'investment', $2, 'completed', $3, 'balance', $4)`,
      [decoded.userId, amount, `Инвестиция в план "${plan.name}"`, planId]
    )

    return NextResponse.json({
      success: true,
      investment: investmentResult.rows[0],
      message: 'Инвестиция создана успешно'
    })

  } catch (error) {
    console.error('Investment creation error:', error)
    return NextResponse.json({ error: 'Ошибка создания инвестиции' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}