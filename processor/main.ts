import { Prisma } from '@prisma/client'
import { config } from './config'
import { getAllCompanyData, getAllEarningReportsByDate } from './stocks'
import {
  hasCache,
  getCachedEarnings,
  setCachedEarnings,
} from './data/dataCache'
import { cleanEarningsData } from './utils/process'
import { Earnings, EarningsMetric, ReportResp, TickerInfo } from './types'
import { errorsCache, getChunks, getDomesticCompanies } from './utils'
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

const getCompaniesByChunk = async (companies: TickerInfo[]) => {
  return (
    await Promise.all(
      companies.map(async (company) => {
        const fileName = `${
          config.filePath
        }/companyfacts/CIK${`${company.cik_str}`.padStart(10, '0')}.json`
        if (hasCache(fileName)) {
          const data = (await getCachedEarnings(fileName)) as ReportResp
          if (data.facts) {
            return {
              ticker: company.ticker,
              tags: data.facts['us-gaap'],
            } as Earnings
          }
        }
        return undefined
      })
    )
  ).filter((x) => x) as Earnings[]
}

const uploadToPrisma = async (company: EarningsMetric) => {
  console.log('adding: ', company.ticker)

  await prisma.report.createMany({
    skipDuplicates: true,
    data: Object.entries(company.metrics).flatMap(([tag, reports]) => {
      return reports.map((report) => {
        const { fp, fy, val, end, start, accn } = report
        return {
          fp,
          fy,
          end: new Date(end),
          start: start ? new Date(start) : undefined,
          val,
          tag,
          accn,
          companyTicker: company.ticker,
        } as Prisma.ReportCreateManyInput
      })
    }),
  })
}

const getEarningsFromZip = async (companies: TickerInfo[]) => {
  const companyChunks = getChunks(companies, 100) as TickerInfo[][]
  let i = 0
  for await (const companyChunk of companyChunks) {
    i++
    await prisma.company.createMany({
      skipDuplicates: true,
      data: companyChunk.map((x) => ({
        ticker: x.ticker,
      })),
    })
    const earnings = await getCompaniesByChunk(companyChunk)
    const domesticEarnings = getDomesticCompanies(earnings)
    const companiesCleaned = cleanEarningsData(domesticEarnings)
    // await prisma.report.deleteMany({})
    console.log(`loading chunk: ${i}, length: ${companiesCleaned.length}`)
    for await (const cleaned of companiesCleaned) {
      await uploadToPrisma(cleaned)
    }
    if (i === 10) {
      break
    }
  }
}

const main2 = async () => {
  const companies = await getAllCompanyData()
  const earnings = await getEarningsFromZip(companies)
}

const main = async () => {
  try {
    const filePath = `${config.filePath}/${config.date}.json`
    const earings = await getEarnings(filePath)
    const domesticEarnings = getDomesticCompanies(earings)

    const companiesCleaned = cleanEarningsData([domesticEarnings[0]])
    // await prisma.company.createMany({
    //   data: companiesCleaned.map(
    //     (x) =>
    //       ({
    //         ticker: x.ticker,
    //       } as Prisma.CompanyCreateManyInput)
    //   ),
    // })
    // await prisma.report.deleteMany({})
    for await (const company of companiesCleaned) {
      break
      console.log('doing company: ', company.ticker)
      // await prisma.report.createMany({
      //   data: Object.entries(company.metrics).flatMap(([tag, reports]) => {
      //     return reports.map((report) => {
      //       const { fp, fy, val, end, start } = report
      //       return {
      //         fp,
      //         fy,
      //         end: new Date(end),
      //         start: start ? new Date(start) : undefined,
      //         val,
      //         tag,
      //         companyTicker: company.ticker,
      //       } as Prisma.ReportCreateManyInput
      //     })
      //   }),
      // })
    }
  } catch (e) {
    errorsCache.push(e)
  } finally {
    console.log('Errors: ', errorsCache?.length ? errorsCache : 'None')
    await prisma.$disconnect()
  }
}

main2()
