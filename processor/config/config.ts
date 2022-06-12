import { ReportPretty } from '../types'

const callback = (first: ReportPretty, second: ReportPretty) => {
  return {
    start: first.start,
    end: first.end,
    val: (first.ttm! / second.ttm!) * 100,
    fp: first.fp,
    fy: first.fy,
  } as ReportPretty
}

const ratios = {
  ReturnOnAssets: {
    tags: ['NetIncomeLoss', 'Assets'] as const,
    callback,
  },
  ReturnOnEquity: {
    tags: ['NetIncomeLoss', 'Equity'] as const,
    callback,
  },
  ReturnOnOperations: {
    tags: ['NetCashFlowsOperating', 'Equity'] as const,
    callback,
  },
  ReturnOnSales: {
    tags: ['NetIncomeLoss', 'Revenues'] as const,
    callback,
  },
} as const

export const config = {
  useCache: true,
  filePath: './processor/cache',
  earningsChunkSize: 11,
  waitTime: 1000,
  date: '2022-05-12',
  quaters: 1,
  currencies: ['USD'],
  ratios,
}
