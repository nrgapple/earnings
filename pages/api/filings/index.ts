import { NextApiRequest, NextApiResponse } from 'next'
import { FullIndexYear } from '../../../interfaces'
import prisma from '../../../lib/prisma'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const fullIndexYear = await fetch(
      `https://www.sec.gov/Archives/edgar/daily-index/${new Date().getFullYear()}/index.json`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
        },
      }
    )

    const idxYear = (await fullIndexYear.json()) as FullIndexYear

    const currentQuarter = idxYear.directory.item.pop()

    const fullIndexFilings = await fetch(
      `https://www.sec.gov/Archives/edgar/daily-index/${new Date().getFullYear()}/${
        currentQuarter.name
      }/index.json`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
        },
      }
    )

    const idxFilings = (await fullIndexFilings.json()) as FullIndexYear

    const mostUTDFiling = idxFilings.directory.item
      .filter((x) => /^company.\d+.idx/g.test(x.name))
      .pop()

    const presentFilings = await fetch(
      `https://www.sec.gov/Archives/edgar/daily-index/${new Date().getFullYear()}/${
        currentQuarter.name
      }/${mostUTDFiling.name}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
        },
      }
    )

    const rows = (await presentFilings.text()).split('\n').slice(11)

    const splitRows = rows
      .map((x) => x.split(/  +/))
      .filter((row) => row[1] === '10-Q')

    return res.json(splitRows)
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
