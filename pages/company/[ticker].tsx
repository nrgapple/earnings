import { Grid, Link, Text } from '@nextui-org/react'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '..'
import { GraphCard } from '../../components/GraphCard'
import Layout from '../../components/Layout'
import { CompaniesResp } from '../../interfaces'
import { groupBy } from '../../utils'

const CompanyPage = () => {
  const router = useRouter()
  const { ticker } = router.query
  const url = `/api/earnings?search=${ticker}`
  const { data, error } = useSWR<CompaniesResp, Error>(url, fetcher)

  const secReportLinks = useMemo(() => {
    if (data?.companies.length > 0) {
      const company = data.companies[0]
      return company.tags['Assets'].map((x) => {
        return (
          <Grid justify="center" xs={2}>
            <Link
              target={'_blank'}
              href={`https://www.sec.gov/ix?doc=/Archives/edgar/data/${x.secLink}`}
            >{`${x.fp}-${x.fy}`}</Link>
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
      <Grid.Container css={{ p: '$11' }}>{secReportLinks}</Grid.Container>
    </Layout>
  )
}

export default CompanyPage
