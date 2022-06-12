import { NextApiRequest, NextApiResponse } from 'next'
import {
  getCompanyTickers,
  getFilings,
  getFullYearIndex,
  getIndexFilings,
} from '../../../data'
import prisma from '../../../lib/prisma'
import { getEarnings } from '../../../processor/main'
import { timeout } from '../../../utils'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const fullIndexYear = await getFullYearIndex()
    const currentQuarter = fullIndexYear.directory.item.pop()
    const fullIndexFilings = await getIndexFilings(currentQuarter.name)
    await timeout(500)
    const mostUTDFiling = fullIndexFilings.directory.item
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

    await timeout(500)
    const presentFilings = await getFilings(
      currentQuarter.name,
      mostUTDFiling.name
    )

    const splitRows = presentFilings
      .map((x) => x.split(/  +/))
      .filter((row) => row[1] === '10-Q' || row[1] === '10-K')

    const ciks = splitRows.map((x) => `${x[2]}`)
    const companies = await getCompanyTickers(ciks)
    await getEarnings(companies, false)

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
