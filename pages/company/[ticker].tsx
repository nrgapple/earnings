import { Col, Container, Grid, Link, Row, Text } from '@nextui-org/react'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '..'
import { GraphCard } from '../../components/GraphCard'
import Layout from '../../components/Layout'
import { CompaniesResp, Report } from '../../interfaces'
import { formatDate, groupBy } from '../../utils'

const CompanyPage = () => {
  const router = useRouter()
  const { ticker } = router.query
  const url = `/api/earnings?search=${ticker}`
  const { data, error } = useSWR<CompaniesResp, Error>(url, fetcher)

  const secReportLinks = useMemo(() => {
    if (data?.companies.length > 0) {
      const company = data.companies[0]
      return Object.entries(
        company.tags['Assets'].reduce((reportsByYear, currentReport) => {
          const formattedDate = formatDate(currentReport.end)
          const newReport = {
            ...currentReport,
            end: formattedDate,
          }
          const year = formattedDate.split('-')[0]
          if (reportsByYear[year]) {
            reportsByYear[year].push(newReport)
          } else {
            reportsByYear[year] = [newReport]
          }
          return reportsByYear
        }, {} as { [key: string]: Report[] })
      ).map(([year, reports]: [string, Report[]]) => {
        return (
          <Grid xs={3}>
            <Col>
              <Row>{year}</Row>
              {reports.map((report) => (
                <Row>
                  <Link
                    target={'_blank'}
                    href={`https://www.sec.gov/ix?doc=/Archives/edgar/data/${report.secLink}`}
                  >{`${formatDate(report.end)}`}</Link>
                </Row>
              ))}
            </Col>
          </Grid>
        )
      })
    }
    return null
  }, [data])

  return (
    <Layout>
      <Grid.Container>
        <Grid css={{ p: '$11' }} xs={12}>
          {data &&
            data.companies &&
            data.companies.map((company) => (
              <GraphCard
                key={company.ticker}
                height="600px"
                company={company}
                showFilters
              />
            ))}
        </Grid>
      </Grid.Container>
      <Text css={{ pl: '$18' }} h4>
        SEC Filings
      </Text>
      <Grid.Container gap={1}>{secReportLinks}</Grid.Container>
    </Layout>
  )
}

export default CompanyPage
