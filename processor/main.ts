import { Prisma } from '@prisma/client'
import { config } from './config'
import { getAllCompanyData } from './stocks'
import {
  hasCache,
  getCachedEarnings,
  setCachedEarnings,
} from './data/dataCache'
import { cleanEarningsData } from './utils/process'
import { Earnings, EarningsMetric, ReportResp, TickerInfo } from './types'
import { getChunks, getDomesticCompanies } from './utils'
import prisma from '../lib/prisma'
import { getCompanyFilings, getCompanyReport } from './data'
require('dotenv').config()

const getCompaniesByChunk = async (
  companies: TickerInfo[],
  useCache: boolean = true
) => {
  return (
    await Promise.all(
      companies.map(async (company) => {
        const fullCik = `CIK${`${company.cik_str}`.padStart(10, '0')}`
        const filings = await getCompanyFilings(fullCik)
        const allForms = filings?.filings.recent.form
          .map((x, i) => (x === '10-Q' || x === '10-K' ? i : undefined))
          .filter((x) => x) as number[]
        const accnToAdd = allForms?.map((idx) => {
          const accn = filings?.filings.recent.accessionNumber[idx]
          const document = filings?.filings.recent.primaryDocument[idx]
          const link = `${fullCik.replace('CIK', '')}/${accn
            ?.split('-')
            .join('')}/${document}`
          return {
            name: accn,
            link,
          }
        }) as { name: string; link: string }[]

        const fileName = `${config.filePath}/companyfacts/${fullCik}.json`
        if (useCache && hasCache(fileName)) {
          const data = (await getCachedEarnings(fileName)) as ReportResp
          if (data.facts) {
            return {
              ticker: company.ticker,
              tags: data.facts['us-gaap'],
              accns: accnToAdd,
            } as Earnings
          }
        } else {
          const data = await getCompanyReport(fullCik)
          if (data?.facts) {
            return {
              ticker: company.ticker,
              tags: data.facts['us-gaap'],
              accns: accnToAdd,
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
        const { fp, fy, val, end, start, accn, link } = report
        return {
          fp,
          fy,
          end: new Date(end),
          start: start ? new Date(start) : undefined,
          val,
          tag,
          accn,
          companyTicker: company.ticker,
          secLink: link,
        } as Prisma.ReportCreateManyInput
      })
    }),
  })
}

export const getEarnings = async (companies: TickerInfo[], useZip: boolean) => {
  const companyChunks = getChunks(companies, 100) as TickerInfo[][]
  let i = 0
  for await (const companyChunk of companyChunks) {
    i++
    await prisma.company.createMany({
      skipDuplicates: true,
      data: companyChunk.map((x) => ({
        ticker: x.ticker,
        name: x.title,
      })),
    })
    const earnings = await getCompaniesByChunk(companyChunk, useZip)
    earnings.forEach((x) => {
      console.log(x.ticker)
    })
    const domesticEarnings = getDomesticCompanies(earnings)
    const companiesCleaned = cleanEarningsData(domesticEarnings)
    // await prisma.report.deleteMany({})
    console.log(`loading chunk: ${i}, length: ${companiesCleaned.length}`)
    for await (const cleaned of companiesCleaned) {
      await uploadToPrisma(cleaned)
    }
  }
}

const main2 = async () => {
  const companies = await getAllCompanyData()
  const earnings = await getEarnings(companies, true)
}

// main2()
