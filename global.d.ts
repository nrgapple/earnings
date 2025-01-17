export {}

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient
    }
    interface ProcessEnv {
      REDIS_HOST: string
      REDIS_PORT: number
      REDIS_PW: string
      REDIS_URL: string
      ENV: 'test' | 'dev' | 'prod'
      GITHUB_CLIENT_SECRET: string
      GITHUB_CLIENT_ID: string
    }
  }
}
