import useSWR from 'swr'
import { Grid, Loading, Pagination, Text } from '@nextui-org/react'
import { useEffect, useMemo, useState } from 'react'
import { CompaniesResp } from '../interfaces'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import { Graph } from '../components/Graph'

// @ts-ignore
const fetcher = async (...args) => {
  // @ts-ignore
  const resp = await fetch(...args)
  const data = await resp.json()
  return data
}

const Home = () => {
  const { query } = useRouter()
  const [pageNumber, setPageNumber] = useState(1)
  const [search, setSearch] = useState<string>()
  const url = useMemo(
    () =>
      `/api/earnings?page=${pageNumber - 1}${
        search ? `&search=${search}` : ''
      }`,
    [search, pageNumber]
  )
  const { data, error } = useSWR<CompaniesResp, Error>(url, fetcher)
  const loading = !data && !error

  useEffect(() => {
    if (query?.ticker) {
      setSearch(query.ticker as string)
    }
  }, [query])

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
          <Grid.Container justify="center" gap={2} direction="column">
            {data && <Graph companies={data.companies} />}
            {data && data.companies?.length && (
              <Grid xs justify="center">
                <Pagination
                  total={data.pages}
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
