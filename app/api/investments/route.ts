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

    const { userId, planId, amount, paymentMethod } = await request.json()

    if (!userId || !planId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 })
    }

    // Преобразуем planId в число если это строка
    const numericPlanId = typeof planId === 'string' && planId.startsWith('plan-') 
      ? parseInt(planId.replace('plan-', ''), 10)
      : parseInt(planId, 10)

    if (isNaN(numericPlanId)) {
      return NextResponse.json({ error: 'Неверный ID плана' }, { status: 400 })
    }

    // Получаем план инвестиций
    const planResult = await query(
      `SELECT id, name, min_amount, max_amount, profit_rate, duration_days
       FROM investment_plans 
       WHERE id = $1 AND is_active = true`,
      [numericPlanId]
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

    // Рассчитываем параметры инвестиции
    const investmentPlan = planResult.rows[0];
    const dailyProfitRate = parseFloat(investmentPlan.daily_profit_rate || investmentPlan.profit_rate);
    const duration = parseInt(investmentPlan.duration_days);
    const dailyProfit = (amount * dailyProfitRate) / 100
    const totalProfit = dailyProfit * duration
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + duration)

    // Создаем инвестицию
    const startDate = new Date()


    const investmentResult = await query(
      `INSERT INTO investments 
       (user_id, plan_id, amount, status, start_date, end_date, daily_profit, total_profit, duration)
       VALUES ($1::uuid, $2, $3, 'active', $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, numericPlanId, amount, startDate, endDate, dailyProfit, totalProfit, duration]
    )

    // Обновляем баланс пользователя
    await query(
      'UPDATE users SET balance = balance - $1, total_invested = total_invested + $1 WHERE id = $2::uuid',
      [amount, userId]
    )

    // Создаем транзакцию
    await query(
      `INSERT INTO transactions 
       (user_id, type, amount, status, description, method, plan_id)
       VALUES ($1::uuid, 'investment', $2, 'completed', $3, $4, $5)`,
      [userId, 'investment', amount, 'completed', `Инвестиция в план "${plan.name}"`, paymentMethod, numericPlanId]
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