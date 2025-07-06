import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
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

    const { plan_id, amount } = await request.json()

    if (!plan_id || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Неверные данные для инвестирования' }, { status: 400 })
    }

    console.log('Creating investment for user:', decoded.userId, 'plan:', plan_id, 'amount:', amount)

    // Проверяем план инвестирования
    const planResult = await query(
      'SELECT * FROM investment_plans WHERE id = $1 AND is_active = true',
      [plan_id]
    )

    if (planResult.rows.length === 0) {
      return NextResponse.json({ error: 'План инвестирования не найден' }, { status: 404 })
    }

    const plan = planResult.rows[0]

    // Проверяем минимальную сумму
    if (amount < plan.min_amount) {
      return NextResponse.json({ 
        error: `Минимальная сумма инвестирования: $${plan.min_amount}` 
      }, { status: 400 })
    }

    // Проверяем максимальную сумму
    if (plan.max_amount && amount > plan.max_amount) {
      return NextResponse.json({ 
        error: `Максимальная сумма инвестирования: $${plan.max_amount}` 
      }, { status: 400 })
    }

    // Проверяем баланс пользователя
    const userResult = await query(
      'SELECT balance FROM users WHERE id = $1',
      [decoded.userId]
    )

    const userBalance = parseFloat(userResult.rows[0]?.balance || '0')
    if (userBalance < amount) {
      return NextResponse.json({ error: 'Недостаточно средств на балансе' }, { status: 400 })
    }

    // Начинаем транзакцию
    await query('BEGIN')

    try {
      // Создаем инвестицию
      const investmentResult = await query(
        `INSERT INTO investments (user_id, plan_id, amount, status, total_profit, daily_profit, start_date, end_date, created_at)
         VALUES ($1, $2, $3, 'active', 0, 0, CURRENT_TIMESTAMP, $4, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          decoded.userId,
          plan_id,
          amount,
          new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000)
        ]
      )

      // Создаем транзакцию
      await query(
        `INSERT INTO transactions (user_id, type, amount, status, description, payment_method, created_at)
         VALUES ($1, 'investment', $2, 'completed', $3, 'balance', CURRENT_TIMESTAMP)`,
        [
          decoded.userId,
          amount,
          `Инвестирование в план "${plan.name}"`
        ]
      )

      // Списываем средства с баланса
      await query(
        'UPDATE users SET balance = balance - $1, total_invested = total_invested + $1 WHERE id = $2',
        [amount, decoded.userId]
      )

      await query('COMMIT')

      console.log('Investment created successfully:', investmentResult.rows[0])

      return NextResponse.json({
        success: true,
        investment: investmentResult.rows[0],
        message: 'Инвестиция успешно создана',
        voiceData: {
          amount: amount,
          planName: plan.name
        }
      })

    } catch (error) {
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Error creating investment:', error)
    return NextResponse.json({ error: 'Ошибка создания инвестиции' }, { status: 500 })
  }
}
