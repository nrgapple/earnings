export interface FilingResp {
  name: string
  tickers: string[]
  exchanges: string[]
  filings: {
    recent: {
      accessionNumber: string[]
      form: string[]
      primaryDocument: string[]
    }
  }
}

export interface ReportResp {
  cik: number
  facts: {
    'us-gaap': TagsObject
  }
}

export type OperationType = '+' | '-' | '/' | '*'

export type TagsObject = Record<string, TagData>

export type TagsKey = Extract<keyof TagsObject, string>

export interface Earnings {
  ticker: string
  tags: TagsObject
  accns?: {
    name: string
    link: string
  }[]
}

export interface EarningsMetric {
  ticker: string
  metrics: Record<TagsKey, ReportPretty[]>
}

export interface EarningsScore {
  ticker: string
  score: number
}

export interface TagData {
  label: string
  description: string
  units: {
    USD: Report[]
    CNY: Report[]
    [key: string]: Report[]
  }
}

export interface Report {
  val?: number
  form: string
  fy: number
  fp: string
  start: string
  end: string
  filed: string
  frame: string
}

export interface ReportPretty {
  val?: number
  fy: number
  fp: string
  start?: string
  end: string
  filed?: string
  form?: string
  frame?: string
  accn?: string
  link?: string
  endMonths?: number
  ttm?: number
}

export interface CompanyProfile {
  lastYearRptDt: string
  lastYearEPS: string
  time: string
  symbol: string
  name: string
  marketCap: string
  fiscalQuarterEnding: string
  epsForecast: string
  noOfEsts: string
}

export interface CalendarEarnings {
  data: {
    rows: CompanyProfile[]
  }
}

export interface TickerInfo {
  cik_str: number | string
  ticker: string
  title?: string
}

export type Defined<T> = Exclude<T, undefined>

export interface EarningMap {
  key: string
  value: ReportPretty[]
}
