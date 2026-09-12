import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Recreate the client when the cached instance predates a schema change
// (e.g. a new model like ContentSubmission added via `prisma db push` while
// the dev server is running) — otherwise the stale delegate is undefined.
function hasAllModels(c: PrismaClient): boolean {
  return (
    'contentSubmission' in c &&
    'languageDraft' in c &&
    'vocabulary' in c &&
    'readingPassage' in c
  );
}

export const db =
  globalForPrisma.prisma && hasAllModels(globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : (globalForPrisma.prisma = new PrismaClient({
        log: ['query'],
      }))