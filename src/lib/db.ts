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

// Read env vars via dynamic keys so Turbopack cannot inline them at build time.
function env(key: string) {
  return process.env[key]
}

export const db =
  globalForPrisma.prisma ??
  (() => {
    const isBuildPhase = env('NEXT_PHASE') === 'phase-production-build'
    const isProductionRuntime = env('NODE_ENV') === 'production' && !isBuildPhase
    const useTursoInDev = env('USE_TURSO_IN_DEV') === 'true'

    if (isBuildPhase) {
      if (env('NODE_ENV') !== 'production')
        console.log('[db:init]', { pid: process.pid, branch: 'buildPhase' })
      return new PrismaClient({ log: ['query'] })
    }

    const rawUrl = env('DATABASE_URL')?.trim()
    const hasValidUrl =
      !!rawUrl &&
      rawUrl !== 'undefined' &&
      rawUrl !== 'null' &&
      !rawUrl.includes('undefined') &&
      !rawUrl.includes('null')

    if (env('NODE_ENV') !== 'production') {
      console.log('[db]', {
        isBuildPhase,
        isProductionRuntime,
        useTursoInDev,
        hasValidUrl,
        databaseUrlPreview: rawUrl ? `${rawUrl.slice(0, 10)}...` : null,
      })
    }

    // In local dev, default to SQLite unless explicitly opting into Turso.
    if (!isProductionRuntime && !useTursoInDev) {
      const devUrl =
        hasValidUrl && rawUrl.startsWith('file:') ? rawUrl : 'file:./prisma/dev.db'

      if (env('NODE_ENV') !== 'production')
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

    // Use Prisma's datasource directly for non-libsql production URLs.
    if (!isLibsql) {
      if (env('NODE_ENV') !== 'production')
        console.log('[db:init]', { pid: process.pid, branch: 'prisma-direct', urlPreview: `${url.slice(0, 10)}...` })

      return new PrismaClient({
        datasources: { db: { url } },
        log: ['query'],
      })
    }

    const authToken = env('TURSO_AUTH_TOKEN')?.trim()
    const hasAuthToken = !!authToken && authToken !== 'undefined' && authToken !== 'null'
    if (env('NODE_ENV') !== 'production') {
      console.log('[db:init]', {
        pid: process.pid,
        branch: 'libsql-adapter',
        urlPreview: `${url.slice(0, 10)}...`,
        hasAuthToken,
      })
    }

    const client = createClient({
      url,
      authToken: hasAuthToken ? authToken : undefined,
    })
    const adapter = new PrismaLibSQL(client)

    return new PrismaClient({
      adapter,
      log: ['query'],
    })
  })()

if (env('NODE_ENV') !== 'production') globalForPrisma.prisma = db