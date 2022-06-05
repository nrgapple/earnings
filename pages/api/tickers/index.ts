import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

/**
 * @swagger
 * /api/tickers:
 *   get:
 *     description: searches for a company ticker
 *     responses:
 *       200:
 *         description: hello world
 */
const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search } = _req.query
    const results = await prisma.company.findMany({
      where: {
        OR: [
          {
            ticker: {
              startsWith: search as string,
              mode: 'insensitive',
            },
          },
          {
            name: {
              startsWith: search as string,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 5,
      select: {
        ticker: true,
        name: true,
      },
    })
    return res.json(results)
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
