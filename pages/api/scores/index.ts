import { Prisma, PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { Company, CompaniesResp, DBCompany } from '../../../interfaces'
import prisma from '../../../lib/prisma'
import { groupBy } from '../../../processor/utils'

const count = 10
const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  //const redis = new Redis(process.env.REDIS_URL)
  try {
    //const data = await redis.get('data')
    const { page } = _req.query
    //const dataJson = JSON.parse(data)
    const companyCount = await prisma.company.count({})
    const numPages = Math.floor(companyCount / 10)
    const p = page ? Number(page as string) : 0
    const cursor = p * count
    const endAmount =
      companyCount - cursor < count ? companyCount - cursor : count
    const dbCompanies = (await prisma.company.findMany({
      skip: cursor,
      take: endAmount,
      include: {
        reports: true,
      },
    })) as DBCompany[]

    if (!Array.isArray(dbCompanies)) {
      throw new Error('Cannot find data')
    }

    console.log({
      endAmount,
      cusser: p * 10,
      l: dbCompanies.length,
      dl: dbCompanies.length,
    })
    const companies = dbCompanies.map(
      (c) =>
        ({
          ...c,
          tags: groupBy(c.reports, (v) => v.tag),
        } as Company)
    )

    res.status(200).json({
      companies,
      pages: numPages,
      current: p,
    } as CompaniesResp)
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err.message })
  } finally {
    //redis.quit()
  }
}

export default handler
