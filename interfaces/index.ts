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
  form: string
  fy: number
  fp: string
  start: string
  end: string
  filed: string
  frame: string
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
