import useSWR from 'swr'
import { Grid, Loading, Pagination, Text } from '@nextui-org/react'
import { useMemo, useState } from 'react'
import { CompaniesResp } from '../interfaces'
import Layout from '../components/Layout'
import { GraphList } from '../components/GraphList'

// @ts-ignore
export const fetcher = async (...args) => {
  // @ts-ignore
  const resp = await fetch(...args)
  const data = await resp.json()
  return data
}

const Home = () => {
  const [pageNumber, setPageNumber] = useState(1)
  const url = useMemo(
    () => `/api/earnings?page=${pageNumber - 1}`,
    [pageNumber]
  )
  const { data, error } = useSWR<CompaniesResp, Error>(url, fetcher)
  const loading = !data && !error

  return (
    <Layout>
      <Grid.Container gap={2} justify="center">
        {loading ? (
          <Grid xs={12} justify="center">
            <Loading type="points" />
          </Grid>
        ) : error ? (
          <Text h4>There was an error: {error.message}</Text>
        ) : (
          <Grid.Container gap={2}>
            {data && <GraphList companies={data.companies} />}
            {data && data.companies?.length && (
              <Grid xs={12} justify="center">
                <Pagination
                  total={data.pages + 1}
                  page={pageNumber}
                  onChange={(p) => {
                    setPageNumber(p)
                  }}
                />
              </Grid>
            )}
          </Grid.Container>
        )}
      </Grid.Container>
    </Layout>
  )
}

export default Home
