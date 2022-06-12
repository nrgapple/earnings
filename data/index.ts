import { currentYear } from '../constants'
import { FullIndexYear, TickerInfo } from '../interfaces'
import { userAgent } from '../constants'

export const getFullYearIndex = async () => {
  const response = await fetch(
    `https://www.sec.gov/Archives/edgar/daily-index/${currentYear}/index.json`,
    {
      headers: {
        'User-Agent': userAgent,
      },
    }
  )
  return response.json() as Promise<FullIndexYear>
}

export const getIndexFilings = async (currentQuarter: string) => {
  const response = await fetch(
    `https://www.sec.gov/Archives/edgar/daily-index/${currentYear}/${currentQuarter}/index.json`,
    {
      headers: {
        'User-Agent': userAgent,
      },
    }
  )
  return response.json() as Promise<FullIndexYear>
}

export const getFilings = async (
  currentQuarter: string,
  filingName: string
) => {
  const response = await fetch(
    `https://www.sec.gov/Archives/edgar/daily-index/${currentYear}/${currentQuarter}/${filingName}`,
    {
      headers: {
        'User-Agent': userAgent,
      },
    }
  )
  return (await response.text()).split('\n').slice(11)
}
/**
 * Uses the SEC EDGAR api to get a list of all company tickers with
 * their cik number.
 *
 * @returns a list of all company tickers w/ cik number
 */

export const getCompanyTickers = async (ciks: string[]) => {
  const tickers = await fetch(
    'https://www.sec.gov/files/company_tickers.json',
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent,
      },
    }
  )
  const companies = (await tickers.json()) as { [key: string]: TickerInfo }
  return Object.values(companies).filter((x) =>
    ciks.includes(x.cik_str.toString())
  )
}
