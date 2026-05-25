import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import * as schema from "./schema"
import { loadEnvConfig } from "@next/env"
import { existsSync, readFileSync } from "fs"
import path from "path"

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return
  const contents = readFileSync(filePath, "utf8")
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex === -1) continue
    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()
    if (!key) continue
    if (process.env[key] && process.env[key] !== "undefined" && process.env[key] !== "null") continue
    process.env[key] = value
  }
}

if (process.env.NODE_ENV !== "production") {
  loadEnvConfig(process.cwd())
  for (const file of [".env.local", ".env.development.local", ".env.development", ".env"]) {
    loadEnvFile(path.join(process.cwd(), file))
  }
}

function getDbUrl() {
  const raw = process.env["DATABASE_URL"]?.trim()
  if (!raw || raw === "undefined" || raw === "null") return null
  return raw
}

function createDb() {
  const dbUrl = getDbUrl()
  const isProd = process.env["NODE_ENV"] === "production"
  const useTursoInDev = process.env["USE_TURSO_IN_DEV"] === "true"

  // Local dev: SQLite
  if (!isProd && !useTursoInDev) {
    const url = dbUrl && dbUrl.startsWith("file:") ? dbUrl : "file:./prisma/dev.db"
    console.log("[db:init]", { pid: process.pid, branch: "sqlite-dev", url })
    const client = createClient({ url })
    return drizzle(client, { schema })
  }

  if (!dbUrl) {
    throw new Error("DATABASE_URL is required in production runtime")
  }

  // Non-libsql URL: use Prisma-compatible direct URL (e.g., PostgreSQL, MySQL)
  const isLibsql = dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://") || dbUrl.startsWith("http://")
  if (!isLibsql) {
    console.log("[db:init]", { pid: process.pid, branch: "direct", urlPreview: dbUrl.slice(0, 10) + "..." })
    const client = createClient({ url: dbUrl })
    return drizzle(client, { schema })
  }

  // Turso / libsql
  const authToken = process.env["TURSO_AUTH_TOKEN"]?.trim()
  const hasToken = !!authToken && authToken !== "undefined" && authToken !== "null"
  console.log("[db:init]", {
    pid: process.pid,
    branch: "libsql-adapter",
    urlPreview: dbUrl.slice(0, 20) + "...",
    hasAuthToken: hasToken,
  })

  const client = createClient({
    url: dbUrl,
    authToken: hasToken ? authToken : undefined,
  })
  return drizzle(client, { schema })
}

const globalForDb = globalThis as unknown as { db: ReturnType<typeof createDb> | undefined }

export const db: ReturnType<typeof createDb> = globalForDb.db ?? (globalForDb.db = createDb())
export { schema }
