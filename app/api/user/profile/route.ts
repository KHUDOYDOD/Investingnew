import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'Не указан ID пользователя' }, { status: 400 })
    }

    // Получаем данные пользователя из базы данных
    const result = await query(
      `SELECT 
        id, email, full_name, balance, total_invested, total_earned, 
        phone, country, city, bio, avatar_url, created_at, role_id,
        referral_code,
        (SELECT COUNT(*) FROM users WHERE referral_code = u.referral_code AND id != u.id) as referral_count
      FROM users u
      WHERE id = $1::uuid`,
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const user = result.rows[0]

    // Добавляем дополнительные поля
    const userData = {
      ...user,
      balance: parseFloat(user.balance) || 0,
      total_invested: parseFloat(user.total_invested) || 0,
      total_earned: parseFloat(user.total_earned) || 0,
      referral_count: parseInt(user.referral_count) || 0,
      email_verified: true,
      kyc_verified: false,
      profile: {
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        occupation: 'Инвестор'
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: userData 
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ 
      error: 'Ошибка сервера: ' + error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { userId, full_name, phone, country, city, bio } = data

    if (!userId) {
      return NextResponse.json({ error: 'Не указан ID пользователя' }, { status: 400 })
    }

    // Обновляем данные пользователя
    const result = await query(
      `UPDATE users 
       SET full_name = $1, phone = $2, country = $3, city = $4, bio = $5, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6::uuid
       RETURNING id, email, full_name, balance, total_invested, total_earned, 
               phone, country, city, bio, avatar_url, created_at, role_id,
               referral_code`,
      [full_name || '', phone || '', country || '', city || '', bio || '', userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const user = result.rows[0]

    // Получаем количество рефералов
    const referralResult = await query(
      `SELECT COUNT(*) as count FROM users WHERE referral_code = $1 AND id != $2::uuid`,
      [user.referral_code, userId]
    )

    // Возвращаем обновленные данные
    const userData = {
      ...user,
      balance: parseFloat(user.balance) || 0,
      total_invested: parseFloat(user.total_invested) || 0,
      total_earned: parseFloat(user.total_earned) || 0,
      referral_count: parseInt(referralResult.rows[0]?.count) || 0,
      email_verified: true,
      kyc_verified: false,
      profile: {
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        occupation: 'Инвестор'
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: userData,
      message: 'Профиль успешно обновлен'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ 
      error: 'Ошибка сервера: ' + error.message 
    }, { status: 500 })
  }
}