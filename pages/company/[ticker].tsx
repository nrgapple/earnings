import { Card, Grid, Text } from '@nextui-org/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWR from 'swr'
import { fetcher } from '..'
import { GraphCard } from '../../components/GraphCard'
import Layout from '../../components/Layout'
import { CompaniesResp } from '../../interfaces'

const CompanyPage = () => {
  const router = useRouter()
  const { ticker } = router.query
  const url = `/api/earnings?search=${ticker}`
  const { data, error } = useSWR<CompaniesResp, Error>(url, fetcher)

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
    </Layout>
  )
}

export default CompanyPage
