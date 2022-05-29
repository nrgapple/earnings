import useSWR from 'swr'
import {
  Card,
  Divider,
  Grid,
  Loading,
  Pagination,
  Text,
} from '@nextui-org/react'
import { useEffect, useMemo, useState } from 'react'
import { TagGraph } from '../../../components/TagGraph'
import { CompaniesResp } from '../../../interfaces'
import Layout from '../../../components/Layout'
import { useRouter } from 'next/router'

// @ts-ignore
const fetcher = async (...args) => {
  // @ts-ignore
  const resp = await fetch(...args)
  const data = await resp.json()
  return data
}

const Earnings = () => {
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

  const graphs = useMemo(() => {
    return data ? (
      data.companies.map((x) => (
        <Grid key={x.ticker}>
          <Card style={{ width: 'full' }}>
            <Card.Header>
              <Text h3>{x.ticker}</Text>
            </Card.Header>
            <Divider />
            <Card.Body>
              <TagGraph tags={x.tags} />
            </Card.Body>
          </Card>
        </Grid>
      ))
    ) : (
      <></>
    )
  }, [data])

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
            <Grid xs justify="center">
              <Pagination
                total={data.pages}
                page={pageNumber}
                onChange={(p) => {
                  setPageNumber(p)
                }}
              />
            </Grid>
            {graphs}
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

export default Earnings
