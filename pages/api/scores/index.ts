import { NextApiRequest, NextApiResponse } from 'next'
import { Company, CompaniesResp } from '../../../interfaces'
import prisma from '../../../lib/prisma'

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
    const companies = (await prisma.company.findMany({
      where: {
        ticker: 'AAPL',
      },
      // skip: cursor,
      // take: endAmount,
      include: {
        Report: true,
      },
    })) as Company[]

    if (!Array.isArray(companies)) {
      throw new Error('Cannot find data')
    }

    console.log('earnings', companies)

    console.log({
      endAmount,
      cusser: p * 10,
      l: companies.length,
      dl: companies.length,
    })

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
