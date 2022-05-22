import { Prisma } from '@prisma/client'
import { config } from './config'
import { getAllEarningReportsByDate } from './stocks'
import {
  hasCache,
  getCachedEarnings,
  setCachedEarnings,
} from './data/dataCache'
import { cleanEarningsData } from './utils/process'
import { Earnings } from './types'
import { errorsCache, getDomesticCompanies, unique } from './utils'
import prisma from '../lib/prisma'
require('dotenv').config()

const getEarnings = async (filePath: string) => {
  let earnings: Earnings[]
  if (config.useCache && hasCache(filePath)) {
    earnings = await getCachedEarnings(filePath)
  } else {
    earnings = (await getAllEarningReportsByDate(config.date)) as Earnings[]
    await setCachedEarnings(filePath, earnings)
  }
  return earnings
}

const main = async () => {
  try {
    const filePath = `${config.filePath}/${config.date}.json`
    const earnings = await getEarnings(filePath)
    const domesticEarnings = getDomesticCompanies(earnings)
    const companiesCleaned = cleanEarningsData(domesticEarnings)

    // await prisma.company.createMany({
    //   data: companiesCleaned.map(
    //     (x) =>
    //       ({
    //         ticker: x.ticker,
    //       } as Prisma.CompanyCreateManyInput)
    //   ),
    // })
    // const all = await prisma.report.findMany()
    await prisma.report.deleteMany({})

    for await (const company of companiesCleaned) {
      console.log('doing company: ', company.ticker)
      await prisma.report.createMany({
        data: Object.entries(company.metrics).flatMap(([tag, reports]) => {
          return reports.map((report) => {
            const { fp, fy, val, end, start } = report
            return {
              fp,
              fy,
              end: new Date(end),
              start: start ? new Date(start) : undefined,
              val,
              tag,
              companyTicker: company.ticker,
            } as Prisma.ReportCreateManyInput
          })
        }),
      })
    }
  } catch (e) {
    errorsCache.push(e)
  } finally {
    console.log('Errors: ', errorsCache?.length ? errorsCache : 'None')
    await prisma.$disconnect()
  }
}

main()
