import { ratios } from '../config/config'
import { EarningsMetric, Earnings, ReportPretty, EarningMap } from '../types'
import { load } from './parser'
import {
  objArrToObj,
  groupBy,
  sortReports,
  calculateYtdToQuarter,
  getMonthsBetween,
} from './utils'

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
                Math.round(getMonthsBetween(report.end, report.start) ?? 0) ||
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
        const reportsWithAllQs = calculateYtdToQuarter(reportsForFilingPeriod)
        record[tag] = reportsWithAllQs
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
    const allReports = Object.values(reportsByEnd)
      .flatMap((ratioReports) => {
        if (ratioReports.length === 2) {
          const first = ratioReports[0]
          const second = ratioReports[1]
          return meta.callback(first, second)
        }
      })
      .filter((x) => x !== undefined) as ReportPretty[]
    cleanedEarnings.metrics[tag] = allReports
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
