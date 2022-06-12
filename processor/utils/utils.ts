import moment from 'moment'
import { config } from '../config'
import { Defined, Earnings, ReportPretty, TagData, TagsKey } from '../types'

export const errorsCache = [] as unknown[]

export const growthValues = [] as unknown[]

export const getMonthsBetween = (end: string, start?: string) => {
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
