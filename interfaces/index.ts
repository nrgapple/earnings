export interface Company {
  ticker: string
  id: string
  tags: Tag[]
}

export interface Tag {
  name: string
  id: string
  reports: Report[]
}
export interface Report {
  id: string
  val: number | undefined
  end: Date
  start: Date
  fp: string
  fy: number
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
