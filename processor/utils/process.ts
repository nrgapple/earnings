import { config, ratios } from '../config/config'
import {
  EarningsMetric,
  TagsKey,
  Earnings,
  ReportPretty,
  EarningMap,
} from '../types'
import { load } from './parser'
import {
  sumFunc,
  objArrToObj,
  groupBy,
  sortReports,
  calculateYtdToQuarter,
  getMonthsEnd,
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

const cleanCompanyEarnings = (earning: Earnings) => {
  const earningMapArr = Object.entries(earning.tags)
    .map(
      ([tag, tagData]) =>
        ({
          key: tag,
          value: tagData.units.USD,
        } as EarningMap)
    )
    .filter((x) => x.value)
  const earningMap = objArrToObj<string, ReportPretty[]>(earningMapArr)
  const parsedMetrics = load({ ticker: earning.ticker, metrics: earningMap })
  const cleanedEarnings = {
    ...parsedMetrics,
    metrics: Object.entries(parsedMetrics.metrics)
      .filter((x) => x[1] && x[1].length > 0)
      .reduce((record, [tag, reports]) => {
        const allYTDReports = reports
          .filter(
            (report) =>
              !!earning.accns?.find((accn) => accn.name === report.accn!)
          )
          .map((report) => {
            const accn = earning.accns?.find(
              (accn) => accn.name === report.accn
            )
            return {
              ...report,
              endMonths:
                Math.round(getMonthsEnd(report.end, report.start) ?? 0) ||
                undefined,
              link: accn ? accn.link : undefined,
            }
          })
        const reportsByFiled = groupBy(allYTDReports, (report) => report.filed)
        const reportsForFilingPeriod = sortReports(
          Object.values(reportsByFiled).flatMap(
            (reports) => sortReports(reports, 'end')[reports.length - 1]
          ),
          'end'
        )
        const reportsByYear = groupBy(reportsForFilingPeriod, (report) =>
          report.fy.toString()
        )
        if (tag === 'Revenues') {
          console.log(reportsByYear)
        }

        const reportsWithQ4 = Object.values(reportsByYear).flatMap(
          calculateYtdToQuarter
        )
        record[tag] = reportsWithQ4
        return record
      }, {} as Record<string, ReportPretty[]>),
  } as EarningsMetric

  Object.entries(ratios).forEach(([tag, meta]) => {
    const first = meta.tags[0]
    const second = meta.tags[1]
    if (!cleanedEarnings.metrics[first] || !cleanedEarnings.metrics[second])
      return
    const reportsByEnd = groupBy(
      [
        ...Object.values(cleanedEarnings.metrics[first]).map((report) => {
          return {
            ...report,
            tag: first,
          }
        }),
        ...Object.values(cleanedEarnings.metrics[second]).map((report) => {
          return {
            ...report,
            tag: second,
          }
        }),
      ],
      (report) => report.end
    )
    const allReports = Object.values(reportsByEnd).flat()
    const ratio = Object.values(reportsByEnd)
      .map((reports) => {
        if (reports.length === 2) {
          const firstReport = reports[0]
          const secondReport = reports[1]
          if (!firstReport && !secondReport) return undefined
          const ttmFirst = allReports.filter((x) => {
            const monthsBetween = getMonthsEnd(firstReport.end, x.end)
            return (
              monthsBetween &&
              monthsBetween < 10 &&
              firstReport.tag === x.tag &&
              monthsBetween > 0
            )
          })
          let prevSecondVals = 0
          if (secondReport.tag === 'Revenues') {
            const ttmSecond = allReports.filter((x) => {
              const monthsBetween = getMonthsEnd(secondReport.end, x.end)
              return (
                monthsBetween &&
                monthsBetween < 10 &&
                secondReport.tag === x.tag &&
                monthsBetween > 0
              )
            })
            if (ttmSecond.length !== 3) return
            prevSecondVals = ttmSecond.reduce(
              (prev, acc) => (prev += acc.val!),
              0
            )
          }
          if (ttmFirst.length !== 3) return undefined
          const prevVals = ttmFirst.reduce((prev, acc) => (prev += acc.val!), 0)

          return meta.callback(
            {
              ...firstReport,
              val: firstReport.val! + prevVals,
            },
            { ...secondReport, val: secondReport.val! + prevSecondVals }
          )
        }
      })
      .filter((x) => x) as ReportPretty[]
    cleanedEarnings.metrics[tag] = ratio
  })
  return cleanedEarnings
}

/**
 * Takes a list of earnings and gets the percent growth per quarter.
 *
 * @param earnings
 * @returns the score for every companies.
 */

export const cleanEarningsData = (earnings: Earnings[]) => {
  return earnings.map((earning) => cleanCompanyEarnings(earning))
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
