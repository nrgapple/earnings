import { Report } from '../interfaces'

export const timeout = (time: number) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(null)
    }, time)
  })

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

export const toPercentFormat = (val: number) => {
  return `${val.toFixed(2)}%`
}

export const currencyFormatter = (currency: string = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  })

export const labelFormatter = (v: number) => {
  return new Date(v * 1000).toLocaleDateString('en-US')
}

export const priceFormatter = (v) => {
  return currencyFormatter('USD')
    .format(v / 100000)
    .slice(0, -3)
}

export const calcYoYGrowth = (reports: Report[]) => {
  if (reports) {
    const allData = reports.reduce(
      (data, currentReport) => {
        const lastYearReport = reports.find(
          (x) => x.fp === currentReport.fp && x.fy === currentReport.fy - 1
        )
        if (!lastYearReport) return data
        const percentYoY = calcPercentGrowth(lastYearReport, currentReport)
        return {
          totalPercent: (data.totalPercent += percentYoY),
          quarters: (data.quarters += 1),
          [currentReport.end]: toPercentFormat(percentYoY),
        }
      },
      { totalPercent: 0, quarters: 0 }
    )
    return toPercentFormat(allData.totalPercent / allData.quarters)
  }
  return null
}

export const calcPercentGrowth = (prev: Report, curr: Report) => {
  if (!prev.val || !curr.val) {
    return 0
  }
  return ((curr.val - prev.val) / Math.abs(prev.val)) * 100
}

export const sortReports = (reports: Report[], field1: keyof Report) => {
  return reports.sort(
    (a, b) => new Date(a[field1]!).getTime() - new Date(b[field1]!).getTime()
  )
}
