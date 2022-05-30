import moment from 'moment'
import { config } from '../config'
import { Defined, Earnings, ReportPretty, TagData, TagsKey } from '../types'

export const errorsCache = [] as unknown[]

export const growthValues = [] as unknown[]

export const getMonthsEnd = (end: string, start?: string) => {
  if (!start) return undefined
  return moment(end).diff(moment(start), 'months', true)
}

export const groupBy = <T>(arr: T[], func: (v: T) => string | undefined) => {
  return arr.reduce((prev, curr) => {
    const key = func(curr)
    if (!key) {
      return prev
    }
    return {
      ...prev,
      [key]: [...(prev[key] ?? []), curr],
    }
  }, {} as Record<string, T[]>)
}

export const unique = <T extends unknown>(arr: T[], func: (v: T) => string) => {
  const result = new Map<string, T>()
  arr.forEach((x) => result.set(func(x), x))
  return [...result.values()]
}

export const mapTrim = <T extends unknown, TR extends unknown>(
  arr: T[],
  func: (val: T) => TR
) => arr.map(func).filter((x) => x !== undefined) as Defined<TR>[]

export const normalize = (
  val: number,
  valMin: number,
  valMax: number,
  min: number,
  max: number
) => {
  return ((val - valMin) / (valMax - valMin)) * (max - min) + min
}

export const getChunks = (a: unknown[], size: number) =>
  Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
    a.slice(i * size, i * size + size)
  )

export const sortReports = (
  reports: ReportPretty[],
  field1: keyof ReportPretty
) => {
  return reports.sort(
    (a, b) => new Date(a[field1]!).getTime() - new Date(b[field1]!).getTime()
  )
}

export const timeout = (time: number) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(null)
    }, time)
  })

export const calcPercentGrowth = (prev: ReportPretty, curr: ReportPretty) => {
  if (!prev.val || !curr.val) {
    return 0
  }
  return ((curr.val - prev.val) / Math.abs(prev.val)) * 100
}

/**
 * Filters out all of the tags that are not included in the configuration
 * file.
 *
 * @param companyTagsMap
 * @returns only configured tags
 */
export const getConfiguredTags = <T extends unknown>(
  companyTagsMap: Record<TagsKey, T>
) => {
  const configuredTags = {} as Record<TagsKey, T>
  Object.keys(config.weights).forEach((key) => {
    if (companyTagsMap[key as TagsKey])
      configuredTags[key as TagsKey] = companyTagsMap[key as TagsKey]
  })
  return configuredTags
}

export const getDomesticCompanies = (earning: Earnings[]) => {
  return earning.filter((earnings) => {
    return earnings.tags
      ? Object.values(earnings.tags).find((tagData: TagData) => {
          if (tagData.units.USD) {
            return !!tagData.units.USD.find((report) => {
              return report.form === '10-K' || report.form === '10-Q'
            })
          }
          return false
        })
      : false
  })
}

export const sumFunc = <T extends number>(a: T, b: T) => a + b

/**
 * Takes an array of maps and converts it into a single map.
 *
 * @param arr
 * @returns a map version of the array
 */

export const objArrToObj = <T extends string, TV extends unknown>(
  arr: {
    key: T
    value: TV
  }[]
) => {
  const result = {} as Record<T, TV>
  arr.forEach((item) => {
    result[item.key] = item.value
  })

  return result
}

export const getQuarterFromMonth = (endMonth: number) => {
  if (endMonth > 2 && endMonth < 5) {
    return 'Q1'
  } else if (endMonth > 5 && endMonth < 8) {
    return 'Q2'
  } else if (endMonth > 8 && endMonth < 11) {
    return 'Q3'
  } else {
    return 'Q4'
  }
}

export const getFiscalYearQs = (
  year: number,
  missingQ: 'Q1' | 'Q2' | 'Q3' | 'Q4'
) => {
  let fp
  let fy
  switch (missingQ) {
    case 'Q1':
      return [
        {
          fp: 'Q4',
          fy: year - 1,
        },
        {
          fp: 'Q3',
          fy: year - 1,
        },
        {
          fp: 'Q2',
          fy: year - 1,
        },
      ]
    case 'Q2':
      return [
        {
          fp: 'Q1',
          fy: year,
        },
        {
          fp: 'Q4',
          fy: year - 1,
        },
        {
          fp: 'Q3',
          fy: year - 1,
        },
      ]
    case 'Q3':
      return [
        {
          fp: 'Q2',
          fy: year,
        },
        {
          fp: 'Q1',
          fy: year,
        },
        {
          fp: 'Q4',
          fy: year - 1,
        },
      ]
    case 'Q4':
      return [
        {
          fp: 'Q3',
          fy: year,
        },
        {
          fp: 'Q2',
          fy: year,
        },
        {
          fp: 'Q1',
          fy: year,
        },
      ]
    default:
      break
  }
}

export const setQuarterFromFrame = (report: ReportPretty) => {
  const frame = report.frame?.replace('CY', '')
  const splitFrame = frame!.split('Q')
  const fp = splitFrame?.length === 2 ? `Q${splitFrame[1]}` : 'FY'
  const fy = Number(splitFrame[0])
  return {
    ...report,
    fp,
    fy,
  } as ReportPretty
}

export const calculateYtdToQuarter = (reports: ReportPretty[]) => {
  if (reports.some((x) => !x.start)) {
    return reports
  }
  const reportsByPeriod = Object.values(
    groupBy(reports, (report) => report.fp)
  ).flat()
  if (reportsByPeriod.length === 4) {
    const fullYearReport = reportsByPeriod.find((x) => x.endMonths === 12)
    if (fullYearReport) {
      const quarterlyReports = reportsByPeriod.filter(
        (report) => report.endMonths === 3
      )
      if (quarterlyReports.length === 3) {
        const nineMonthRevenue = quarterlyReports.reduce(
          (acc, curr) => (acc += curr.val!),
          0
        )
        return [
          ...quarterlyReports,
          {
            ...fullYearReport,
            fp: 'Q4',
            val: fullYearReport.val! - nineMonthRevenue,
          } as ReportPretty,
        ]
      }
    }
  }
  if (reportsByPeriod.every((report) => report.start === reports[0].start)) {
    return sortReports(reportsByPeriod, 'endMonths').reduce((data, curr) => {
      if (data.length === 0) {
        data.push(curr)
      } else {
        const prev = data[data.length - 1]
        data.push({
          ...curr,
          start: prev.end,
          val: curr.val! - prev.val!,
          endMonths: 3,
        })
      }
      return data
    }, [] as ReportPretty[])
  }
  return reports
}

export const checkAndAddMissingQuarter = (reports: ReportPretty[]) => {
  const reportsWithMissingQuarter = reports.reduce(
    (values, currReport) => {
      if (currReport.fp === 'FY') {
        const endDateSplit = currReport.end.split('-')
        const month = Number(endDateSplit[1])
        const missingQuarter = getQuarterFromMonth(month)
        const existingReport = reports.find(
          (x) => x.fy === currReport.fy && x.fp === missingQuarter
        )
        if (!existingReport) {
          const matchingQuarters = getFiscalYearQs(
            currReport.fy,
            missingQuarter
          )

          const allQuarterReportsForFiscalYear = reports.filter(
            (x) =>
              !!matchingQuarters?.find(
                (match) => x.fp === match.fp && x.fy === match.fy
              )
          )
          if (allQuarterReportsForFiscalYear.length === 3) {
            const firstThreeQuarterRevs = allQuarterReportsForFiscalYear.reduce(
              (totalRevs, rep) => {
                totalRevs += rep.val ?? 0
                return totalRevs
              },
              0
            )
            values.result.push({
              ...currReport,
              start: allQuarterReportsForFiscalYear[2].end,
              val: currReport.val
                ? currReport.val - firstThreeQuarterRevs
                : undefined,
              fp: missingQuarter,
            })
          }
        }
      } else {
        values.result.push({
          ...currReport,
        })
      }
      return values
    },
    { result: [] as ReportPretty[] }
  )
  return reportsWithMissingQuarter.result
}
