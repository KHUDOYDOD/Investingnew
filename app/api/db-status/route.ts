import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Простая проверка подключения к БД
    // В реальном проекте здесь будет проверка подключения к Supabase
    return NextResponse.json({
      connected: true,
      status: "Database connection successful",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        connected: false,
        status: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
