import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import { loadEnvConfig } from '@next/env'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return

  const contents = readFileSync(filePath, 'utf8')
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (!key) continue
    if (process.env[key] && process.env[key] !== 'undefined' && process.env[key] !== 'null') continue

    process.env[key] = value
  }
}

// Only load .env files in dev — production gets env vars from the platform (Render, etc.)
if (process.env.NODE_ENV !== 'production') {
  loadEnvConfig(process.cwd())

  for (const envFile of ['.env.local', '.env.development.local', '.env.development', '.env']) {
    loadEnvFile(path.join(process.cwd(), envFile))
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrisma(): PrismaClient {
  const rawUrl = process.env['DATABASE_URL']?.trim()
  const hasValidUrl =
    !!rawUrl &&
    rawUrl !== 'undefined' &&
    rawUrl !== 'null' &&
    !rawUrl.includes('undefined') &&
    !rawUrl.includes('null')

  const isProd = process.env['NODE_ENV'] === 'production'
  const useTursoInDev = process.env['USE_TURSO_IN_DEV'] === 'true'

  // In local dev, default to SQLite unless explicitly opting into Turso.
  if (!isProd && !useTursoInDev) {
    const devUrl =
      hasValidUrl && rawUrl.startsWith('file:') ? rawUrl : 'file:./prisma/dev.db'
    console.log('[db:init]', { pid: process.pid, branch: 'sqlite-dev', devUrl })
    return new PrismaClient({
      datasources: { db: { url: devUrl } },
      log: ['query'],
    })
  }

  if (!hasValidUrl) {
    throw new Error('DATABASE_URL is required in production runtime')
  }

  const url = rawUrl
  const isLibsql =
    url.startsWith('libsql://') ||
    url.startsWith('https://') ||
    url.startsWith('http://')

  if (!isLibsql) {
    return new PrismaClient({
      datasources: { db: { url } },
      log: ['query'],
    })
  }

  const authToken = process.env['TURSO_AUTH_TOKEN']?.trim()
  const hasAuthToken = !!authToken && authToken !== 'undefined' && authToken !== 'null'

  console.log('[db:init]', {
    pid: process.pid,
    branch: 'libsql-adapter',
    urlPreview: `${url.slice(0, 20)}...`,
    hasAuthToken,
  })

  const client = createClient({
    url,
    authToken: hasAuthToken ? authToken : undefined,
  })
  const adapter = new PrismaLibSQL(client)

  return new PrismaClient({
    adapter,
    log: ['query'],
  })
}

// Proxy defers PrismaClient creation to first use, preventing Turbopack
// from evaluating env var accesses at module-init / build time.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrisma()
    }
    const client = globalForPrisma.prisma
    const value = Reflect.get(client as object, prop, client)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})