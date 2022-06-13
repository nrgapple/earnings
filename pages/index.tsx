import useSWR from 'swr'
import { Grid, Loading, Pagination, Text } from '@nextui-org/react'
import { useMemo, useState } from 'react'
import { CompaniesResp } from '../interfaces'
import Layout from '../components/Layout'
import { GraphList } from '../components/GraphList'
import { BrowseTable } from '../components/BrowseTable'

// @ts-ignore
export const fetcher = async (...args) => {
  // @ts-ignore
  const resp = await fetch(...args)
  const data = await resp.json()
  return data
}

const Home = () => {
  // const [pageNumber, setPageNumber] = useState(1)
  // const url = useMemo(
  //   () => `/api/earnings?page=${pageNumber - 1}`,
  //   [pageNumber]
  // )
  // const { data, error } = useSWR<CompaniesResp, Error>(url, fetcher)
  // const loading = !data && !error

  return (
    <Layout>
      <Grid.Container gap={2} justify="center">
        <Grid.Container gap={2} justify="center">
          <Grid xs={12}>
            <BrowseTable />
          </Grid>
        </Grid.Container>
      </Grid.Container>
    </Layout>
  )
}

export default Home
