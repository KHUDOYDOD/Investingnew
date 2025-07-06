/* ──────────────────────────────────────────────────────────────────────────────
 * VERY-LIGHTWEIGHT SUPABASE MOCK  ✧  CLIENT-SIDE VERSION
 * This stub is ONLY for the v0 preview / “Next.js” runtime.
 * Swap it for the real `@supabase/supabase-js` client in production!
 * ─────────────────────────────────────────────────────────────────────────── */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

type QueryResult<T = any> = {
  data: T
  error: any | null
  /* Chain helpers (no-ops that just return the same object) */
  eq: (..._args: any[]) => QueryResult<T>
  select: (..._columns: any[]) => QueryResult<T>
  single: () => QueryResult<T>
  maybeSingle: () => QueryResult<T | null>
  limit: (..._args: any[]) => QueryResult<T>
}

function makeQuery<T = any>(data: T = [] as unknown as T): QueryResult<T> {
  const result: QueryResult<T> = {
    data,
    error: null,
    eq: () => result,
    select: () => result,
    limit: () => result,
    single: () => ({ ...result, data: Array.isArray(data) ? (data[0] ?? null) : data }) as QueryResult<T>,
    maybeSingle: () => ({ ...result, data: Array.isArray(data) ? (data[0] ?? null) : data }) as QueryResult<T>,
  }
  return result
}

export function createClientComponentClient() {
  return supabase
}

export function createMockClient() {
  return {
    /* Minimal auth helpers just to satisfy existing calls */
    auth: {
      signUp: async () => ({ error: new Error("Use /api/auth/register instead") }),
      signInWithPassword: async () => ({ error: new Error("Use /api/auth/login instead") }),
      signOut: async () => ({ error: new Error("Use /api/auth/logout instead") }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },

    /* PostgREST-style table interface */
    from: () => ({
      select: (..._cols: any[]) => makeQuery(),
      insert: (..._args: any[]) => makeQuery(),
      update: (..._args: any[]) => makeQuery(),
      delete: (..._args: any[]) => makeQuery(),
    }),
  }
}
