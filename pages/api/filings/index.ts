import { NextApiRequest, NextApiResponse } from 'next'
import { FullIndexYear } from '../../../interfaces'
import prisma from '../../../lib/prisma'
import { getEarnings } from '../../../processor/main'
import { getAllCompanyData } from '../../../processor/stocks'
import { timeout } from '../../../processor/utils'

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const fullIndexYear = await fetch(
      `https://www.sec.gov/Archives/edgar/daily-index/${new Date().getFullYear()}/index.json`,
      {
        headers: {
          'User-Agent': userAgent,
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
          'User-Agent': userAgent,
        },
      }
    )

    const idxFilings = (await fullIndexFilings.json()) as FullIndexYear

    const mostUTDFiling = idxFilings.directory.item
      .filter((x) => /^company.\d+.idx/g.test(x.name))
      .pop()

    const lastestFilingCount = await prisma.latestFiling.count({
      where: {
        latestDate: new Date(mostUTDFiling['last-modified']),
      },
    })

    // if (lastestFilingCount > 0) {
    //   console.log('no new filings')
    //   return res.status(201)
    // }

    const presentFilings = await fetch(
      `https://www.sec.gov/Archives/edgar/daily-index/${new Date().getFullYear()}/${
        currentQuarter.name
      }/${mostUTDFiling.name}`,
      {
        headers: {
          'User-Agent': userAgent,
        },
      }
    )

    const rows = (await presentFilings.text()).split('\n').slice(11)

    const splitRows = rows
      .map((x) => x.split(/  +/))
      .filter((row) => row[1] === '10-Q' || row[1] === '10-K')

    const ciks = splitRows.map((x) => `${x[2]}`.padStart(10, '0'))

    await timeout(1000)

    const companies = await getAllCompanyData(ciks)
    await getEarnings(
      companies.filter((x) => x.ticker === 'DELL'),
      false
    )

    await prisma.latestFiling.upsert({
      where: {
        latestDate: new Date(mostUTDFiling['last-modified']),
      },
      create: {
        latestDate: new Date(mostUTDFiling['last-modified']),
      },
      update: {
        latestDate: new Date(mostUTDFiling['last-modified']),
      },
    })
    return res.json(splitRows)
  } catch (err: any) {
    return res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler
