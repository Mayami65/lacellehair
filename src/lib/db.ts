import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  (() => {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is required')

    const authToken = process.env.TURSO_AUTH_TOKEN
    const client = createClient({ url, authToken })
    const adapter = new PrismaLibSQL(client)

    return new PrismaClient({
      adapter,
      log: ['query'],
    })
  })()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db