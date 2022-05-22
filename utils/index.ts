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
