import { config } from '../config'
import {
  Defined,
  Earnings,
  Report,
  ReportPretty,
  TagData,
  TagsKey,
  TagsObject,
} from '../types'
//@ts-ignore

export const errorsCache = [] as unknown[]

export const growthValues = [] as unknown[]

export const unique = <T extends unknown>(arr: T[], func: (v: T) => string) => {
  const result = new Map<string, T>()
  arr.forEach((x) => result.set(func(x), x))
  return [...result.values()]
}

export const unique2 = <T extends unknown>(
  arr: T[],
  func: (v: T) => string
) => {
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

export const calcPercentGrowth = (prev: Report, curr: Report) => {
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
    return Object.values(earnings.tags).find((tagData: TagData) => {
      if (tagData.units.USD) {
        return !!tagData.units.USD.find((report) => {
          return report.form === '10-K' || report.form === '10-Q'
        })
      }
      return false
    })
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

export const convertCurrencies = (currencies: { [key: string]: Report[] }) => {
  const newCurrencies = {} as Record<string, Report[]>
  Object.keys(currencies).forEach((key) => {
    const currencyConverter = new CC({ from: key, to: 'USD', amount: 100 })
    newCurrencies[key] = currencyConverter
  })

  return newCurrencies
}

export const calculateGrowthPercentPerQuarter = (
  tag: string,
  reports: Report[]
) => {
  if (!reports.length)
    return {
      key: tag as keyof TagsObject,
      value: [],
    }
  const { percent, reportsData } = reports.reduce(
    (previous, currentReport) => {
      const percentGrowth = previous.previousReport
        ? calcPercentGrowth(previous.previousReport, currentReport)
        : undefined
      previous.reportsData.push({
        end: currentReport.end,
        val: currentReport.val,
      })
      return {
        percent: percentGrowth
          ? percentGrowth + previous.percent
          : previous.percent,
        previousReport: currentReport,
        reportsData: previous.reportsData,
      }
    },
    {
      percent: 0,
      previousReport: undefined as Report | undefined,
      reportsData: [] as ReportPretty[],
    }
  )
  return {
    key: tag as keyof TagsObject,
    value: reportsData,
  }
}

function monthDiff(d1: Date, d2: Date) {
  var months
  months = (d2.getFullYear() - d1.getFullYear()) * 12
  months -= d1.getMonth()
  months += d2.getMonth()
  return months <= 0 ? 0 : months
}

export const getQuarterFromEndDate = (report: ReportPretty) => {
  const endMonth = Number(report.end.split('-')[1])
  const endYear = Number(report.end.split('-')[0])
  let fp
  let fy = endYear
  if (endMonth > 2 && endMonth < 5) {
    fp = 'Q1'
  } else if (endMonth > 5 && endMonth < 8) {
    fp = 'Q2'
  } else if (endMonth > 8 && endMonth < 11) {
    fp = 'Q3'
  } else {
    const monthsBetween = report.start
      ? monthDiff(new Date(report.start), new Date(report.end))
      : undefined
    if (monthsBetween && monthsBetween > 6) {
      fp = 'FY'
    } else {
      fp = 'Q4'
    }
    if (endMonth === 1) {
      fy = fy - 1
    }
  }
  return {
    fp,
    fy,
  }
}

export const addQ4IfMissing = (reports: ReportPretty[]) => {
  const reportsWithQ4 = reports.reduce(
    (values, currReport) => {
      if (currReport.fp === 'FY') {
        const allQuarterReportsForYear = reports.filter(
          (x) => x.fy === currReport.fy && x.fp !== 'FY'
        )
        if (allQuarterReportsForYear.length === 3) {
          const firstThreeQuarterRevs = allQuarterReportsForYear.reduce(
            (totalRevs, rep) => {
              totalRevs += rep.val ?? 0
              return totalRevs
            },
            0
          )
          values.result.push({
            ...currReport,
            start: allQuarterReportsForYear[2].end,
            val: currReport.val
              ? currReport.val - firstThreeQuarterRevs
              : undefined,
            fp: 'Q4',
          })
        }
      }

      values.result.push({
        ...currReport,
      })
      return values
    },
    { result: [] as ReportPretty[] }
  )
  return reportsWithQ4.result
}
