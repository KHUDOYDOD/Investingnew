import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, country } = await request.json()

    // Валидация данных
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Все обязательные поля должны быть заполнены" }, { status: 400 })
    }

    // Проверяем, существует ли пользователь
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 400 })
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 12)

    // Генерируем реферальный код
    const referralCode = Math.random().toString(36).substring(2, 12).toUpperCase()

    // Создаем пользователя
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, country, referral_code, role_id) 
       VALUES ($1, $2, $3, $4, $5, $6, 3) 
       RETURNING id, email, full_name, balance, total_invested, total_earned, created_at`,
      [email, passwordHash, fullName, phone || null, country || "RU", referralCode],
    )

    const user = result.rows[0]

    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: "user",
      },
      process.env.NEXTAUTH_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Обновляем время последнего входа
    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id])

    return NextResponse.json({
      success: true,
      message: "Регистрация прошла успешно",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        balance: Number.parseFloat(user.balance || "0"),
        totalInvested: Number.parseFloat(user.total_invested || "0"),
        totalEarned: Number.parseFloat(user.total_earned || "0"),
        isAdmin: false,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Ошибка сервера при регистрации" }, { status: 500 })
  }
}
