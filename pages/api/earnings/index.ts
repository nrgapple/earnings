import { NextApiRequest, NextApiResponse } from 'next'
import { Company, CompaniesResp, DBCompany } from '../../../interfaces'
import prisma from '../../../lib/prisma'
import { groupBy } from '../../../processor/utils'

const count = 20

/**
 * @swagger
 * /api/earnings:
 *   get:
 *     description: Returns company earnings
 *     responses:
 *       200:
 *         description: hello world
 */
const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { page, search } = _req.query
    const companyCount = await prisma.company.count({
      ...(search
        ? {
            where: {
              AND: [
                {
                  reports: {
                    some: {},
                  },
                },
                { ticker: (search as string).toUpperCase() },
              ],
            },
          }
        : {
            where: {
              AND: [
                {
                  reports: {
                    some: {},
                  },
                },
              ],
            },
          }),
    })
    const numPages = Math.floor(companyCount / count)
    const p = page ? Number(page as string) : 0
    const cursor = p * count
    const endAmount =
      companyCount - cursor < count ? companyCount - cursor : count
    const dbCompanies = (await prisma.company.findMany({
      ...(search
        ? {
            where: {
              AND: [
                { ticker: (search as string).toUpperCase() },
                {
                  reports: {
                    some: {},
                  },
                },
              ],
            },
          }
        : {
            where: {
              AND: [
                {
                  reports: {
                    some: {},
                  },
                },
              ],
            },
          }),
      skip: cursor,
      take: endAmount,
      include: {
        reports: true,
      },
    })) as unknown as DBCompany[]

    if (!Array.isArray(dbCompanies)) {
      throw new Error('Cannot find data')
    }

    const companies = dbCompanies.map(
      (c) =>
        ({
          ticker: c.ticker,
          name: c.name,
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
  }
}

export default handler
