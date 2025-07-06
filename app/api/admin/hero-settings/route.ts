import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM hero_settings 
      WHERE id = 1
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        enabled: true,
        title: "Инвестируйте с умом, получайте стабильный доход",
        subtitle:
          "Профессиональная инвестиционная платформа с ежедневными выплатами, высокой доходностью и гарантированной безопасностью",
        badge_text: "Платформа работает с 2025 года",
        button1_text: "Начать инвестировать",
        button1_link: "/register",
        button2_text: "Войти в систему",
        button2_link: "/login",
        show_buttons: true,
        background_animation: true,
        show_stats: true,
        stats_users: "15K+",
        stats_users_label: "Активных инвесторов",
        stats_invested: "$2.8M",
        stats_invested_label: "Общие инвестиции",
        stats_return: "24.8%",
        stats_return_label: "Средняя доходность",
        stats_reliability: "99.9%",
        stats_reliability_label: "Надежность",
      })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching hero settings:", error)
    return NextResponse.json({
      enabled: true,
      title: "Инвестируйте с умом, получайте стабильный доход",
      subtitle:
        "Профессиональная инвестиционная платформа с ежедневными выплатами, высокой доходностью и гарантированной безопасностью",
      badge_text: "Платформа работает с 2025 года",
      button1_text: "Начать инвестировать",
      button1_link: "/register",
      button2_text: "Войти в систему",
      button2_link: "/login",
      show_buttons: true,
      background_animation: true,
      show_stats: true,
      stats_users: "15K+",
      stats_users_label: "Активных инвесторов",
      stats_invested: "$2.8M",
      stats_invested_label: "Общие инвестиции",
      stats_return: "24.8%",
      stats_return_label: "Средняя доходность",
      stats_reliability: "99.9%",
      stats_reliability_label: "Надежность",
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    const result = await query(
      `
      INSERT INTO hero_settings (
        id, enabled, title, subtitle, badge_text, button1_text, button1_link,
        button2_text, button2_link, show_buttons, background_animation, show_stats,
        stats_users, stats_users_label, stats_invested, stats_invested_label,
        stats_return, stats_return_label, stats_reliability, stats_reliability_label,
        updated_at
      ) VALUES (
        1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        enabled = $1, title = $2, subtitle = $3, badge_text = $4,
        button1_text = $5, button1_link = $6, button2_text = $7, button2_link = $8,
        show_buttons = $9, background_animation = $10, show_stats = $11,
        stats_users = $12, stats_users_label = $13, stats_invested = $14,
        stats_invested_label = $15, stats_return = $16, stats_return_label = $17,
        stats_reliability = $18, stats_reliability_label = $19, updated_at = NOW()
      RETURNING *
    `,
      [
        settings.enabled,
        settings.title,
        settings.subtitle,
        settings.badge_text,
        settings.button1_text,
        settings.button1_link,
        settings.button2_text,
        settings.button2_link,
        settings.show_buttons,
        settings.background_animation,
        settings.show_stats,
        settings.stats_users,
        settings.stats_users_label,
        settings.stats_invested,
        settings.stats_invested_label,
        settings.stats_return,
        settings.stats_return_label,
        settings.stats_reliability,
        settings.stats_reliability_label,
      ],
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error("Error updating hero settings:", error)
    return NextResponse.json({ success: false, error: "Ошибка обновления настроек" }, { status: 500 })
  }
}
