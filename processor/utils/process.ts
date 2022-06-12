import { config } from '../config/config'
import { EarningsMetric, Earnings, ReportPretty, EarningMap } from '../types'
import { load } from './parser'
import { objArrToObj, groupBy, sortReports, getMonthsBetween } from './utils'

export const calculateYtdToQuarter = (reports: ReportPretty[]) => {
  if (reports.some((x) => !x.start)) {
    return reports.map((x) => ({
      ...x,
      ttm: x.val,
    }))
  }

  const quarterlyReports = reports
    .reduce((quarterlyReports, currentReport) => {
      if (currentReport.endMonths === 3) {
        quarterlyReports.push(currentReport)
        return quarterlyReports
      }
      const preQuarterlyReports = quarterlyReports.filter(
        (x) =>
          x.endMonths === 3 && getMonthsBetween(currentReport.end, x.end)! < 11
      )
      if (preQuarterlyReports.length === 3) {
        const nineMonthRevenue = preQuarterlyReports.reduce(
          (acc, curr) => (acc += curr.val!),
          0
        )
        quarterlyReports.push({
          ...currentReport,
          start: preQuarterlyReports[2].end,
          val: currentReport.val! - nineMonthRevenue,
          endMonths: 3,
        } as ReportPretty)
      }
      const trailingMonthEnd = quarterlyReports.find(
        (x) =>
          x.endMonths === currentReport.endMonths! - 3 &&
          getMonthsBetween(currentReport.end, x.end)! <= 3
      )
      if (trailingMonthEnd) {
        quarterlyReports.push({
          ...currentReport,
          start: trailingMonthEnd.end,
          val: currentReport.val! - trailingMonthEnd.val!,
          endMonths: 3,
        } as ReportPretty)
      }
      return quarterlyReports
    }, [] as ReportPretty[])
    .filter((x) => x !== undefined) as ReportPretty[]

  return quarterlyReports.map((report) => {
    const ttm = quarterlyReports.filter((x) => {
      const monthsBetween = getMonthsBetween(report.end, x.end)
      return monthsBetween && monthsBetween < 11 && monthsBetween > 1
    })
    let prevVals

    if (ttm.length === 3) {
      prevVals = ttm.reduce((acc, report) => (acc += report.val!), 0)
    }
    return {
      ...report,
      ttm: prevVals ? report.val! + prevVals : undefined,
    } as ReportPretty
  })
}

const calculateRatios = (cleanedEarnings: EarningsMetric) => {
  Object.entries(config.ratios).forEach(([tag, meta]) => {
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
}

const cleanCompanyEarnings = (earning: Earnings) => {
  const earningMap = objArrToObj<string, ReportPretty[]>(
    Object.entries(earning.tags).map(([tag, tagData]) => {
      return {
        key: tag,
        value: tagData.units.USD,
      } as EarningMap
    })
  )
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
  calculateRatios(cleanedEarnings)
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
