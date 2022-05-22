import { config } from '../config/config'
import {
  EarningsMetric,
  TagsKey,
  Earnings,
  TagData,
  Report,
  ReportPretty,
  EarningMap,
} from '../types'
import { load } from './parser'
import {
  sumFunc,
  sortReports,
  objArrToObj,
  unique,
  getQuarterFromEndDate,
  addQ4IfMissing,
} from './utils'

// export const normalizeValues = (earnings: EarningsMetric[]) => {
//   return earnings.map((earning) => {
//     const minMaxCache = new Map<TagsKey, [number, number]>()
//     const values = Object.entries(earning.metrics).map(
//       ([key, value]: [string, number]) => {
//         const tagKey = key as TagsKey
//         if (!minMaxCache.has(tagKey)) {
//           const growths = mapTrim(earnings, (x) => x.metrics[tagKey])
//           minMaxCache.set(tagKey, [Math.min(...growths), Math.max(...growths)])
//         }
//         const [min, max] = minMaxCache.get(tagKey)!

//         const norm = normalize(value, min, max, -1, 1)
//         return {
//           key: key as keyof TagsObject,
//           value: isNaN(norm) ? 0 : norm,
//         }
//       }
//     )
//     const normalized = {} as Record<keyof TagsObject, number>
//     values.forEach((x) => {
//       normalized[x.key] = x.value
//     })

//     return { ticker: earning.ticker, metrics: normalized } as EarningsMetric
//   })
// }

/**
 * Takes a list of earnings and gets the percent growth per quarter.
 *
 * @param earnings
 * @returns the score for every companies.
 */

export const cleanEarningsData = (earnings: Earnings[]) => {
  return earnings.map((earning) => {
    const earningMapArr = Object.entries(earning.tags)
      .map(
        ([tag, tagData]) =>
          ({
            key: tag,
            value: tagData.units.USD,
          } as EarningMap)
      )
      .filter((x) => x.value)
    const earningMap2 = objArrToObj<string, ReportPretty[]>(earningMapArr)
    const parsedMetrics = load({ ticker: earning.ticker, metrics: earningMap2 })
    return {
      ...parsedMetrics,
      metrics: Object.entries(parsedMetrics.metrics)
        .filter((x) => x[1])
        .reduce((record, [tag, reports]) => {
          const uniqueSortedReports = unique<ReportPretty>(
            sortReports(reports, 'end'),
            (report) => report.end
          ).map((x) => ({
            end: x.end,
            val: x.val,
            fp: getQuarterFromEndDate(x).fp,
            fy: getQuarterFromEndDate(x).fy,
          }))
          record[tag] = addQ4IfMissing(uniqueSortedReports).filter(
            (x) => x.fp !== 'FY'
          )
          return record
        }, {} as Record<string, ReportPretty[]>),
    } as EarningsMetric
  })
}

export const getScore = (metics: Record<TagsKey, number>) =>
  Object.entries(config.weights)
    .map(([key, weight]) => {
      return metics[key as TagsKey] ?? 0 * weight
    })
    .reduce(sumFunc)

// export const getAllScores = (earnings: EarningsMetric[]) =>
//   earnings.map(({ ticker, metrics }) => {
//     const score = getScore(metrics)
//     return { score, ticker }
//   })
