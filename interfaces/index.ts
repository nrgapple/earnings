import { CompanyMetrics } from '../constants'

export interface Company {
  ticker: string
  id: string
  tags: Record<string, Report[]>
}

export interface DBCompany {
  ticker: string
  id: string
  reports: Report[]
}

export interface Report {
  id: string
  val?: number
  form?: string
  fy: number
  fp: string
  start: string
  end: string
  filed?: string
  frame?: string
  tag: string
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
  cik_str: number
  ticker: string
  title: string
}

export type Defined<T> = Exclude<T, undefined>

export interface CompaniesResp {
  companies: Company[]
  pages: number
  current: number
}

export interface SearchResult {
  ticker: string
}

export type MetricType = keyof typeof CompanyMetrics

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
  endMonths?: number
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

export interface EarningMap {
  key: string
  value: ReportPretty[]
}
