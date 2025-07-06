import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Валидация данных
    if (!email || !password) {
      return NextResponse.json({ error: "Email и пароль обязательны" }, { status: 400 })
    }

    // Ищем пользователя
    const result = await query(
      `SELECT 
        u.id, u.email, u.password_hash, u.full_name, u.balance, 
        u.total_invested, u.total_earned, u.is_active, u.role_id,
        ur.name as role_name
       FROM users u
       LEFT JOIN user_roles ur ON u.role_id = ur.id
       WHERE u.email = $1`,
      [email],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 })
    }

    const user = result.rows[0]

    // Проверяем активность аккаунта
    if (!user.is_active) {
      return NextResponse.json({ error: "Аккаунт заблокирован" }, { status: 401 })
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 })
    }

    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role_name || "user",
      },
      process.env.NEXTAUTH_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Обновляем время последнего входа
    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id])

    return NextResponse.json({
      success: true,
      message: "Вход выполнен успешно",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        balance: Number.parseFloat(user.balance || "0"),
        totalInvested: Number.parseFloat(user.total_invested || "0"),
        totalEarned: Number.parseFloat(user.total_earned || "0"),
        isAdmin: user.role_id <= 2,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Ошибка сервера при входе" }, { status: 500 })
  }
}
