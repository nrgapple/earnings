import useSWR from 'swr'
import {
  Button,
  Card,
  Container,
  Grid,
  Input,
  Loading,
  Pagination,
  Text,
} from '@nextui-org/react'
import { useState } from 'react'
import { TagGraph } from '../../../components/TagGraph'
import { CompaniesResp } from '../../../interfaces'

// @ts-ignore
const fetcher = async (...args) => {
  // @ts-ignore
  const resp = await fetch(...args)
  const data = await resp.json()
  return data
}

const Earnings = () => {
  const [pageNumber, setPageNumber] = useState(1)
  const [search, setSearch] = useState<string>()
  const { data, error } = useSWR<CompaniesResp, Error>(
    `/api/scores?page=${pageNumber - 1}${search ? `&search=${search}` : ''}`,
    fetcher
  )
  const [searchInput, setSearchInput] = useState<string>()

  const loading = !data && !error

  return (
    <Container fluid>
      <Grid.Container gap={2} justify="center">
        <Grid xs={12} justify="center">
          <Text h1>Company Growths</Text>
        </Grid>
        {loading ? (
          <Loading />
        ) : error ? (
          <Text h4>There was an error: {error.message}</Text>
        ) : (
          <Grid.Container justify="center" gap={2}>
            <Grid xs={8}>
              <Input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                }}
                css={{ width: '100%' }}
              />
            </Grid>
            <Grid xs={4}>
              <Button
                onClick={() => {
                  setSearch(searchInput)
                }}
              >
                Search
              </Button>
            </Grid>
            <Grid xs={12} justify="center">
              <Pagination
                total={data.pages}
                page={pageNumber}
                onChange={(p) => {
                  console.log('here')
                  setPageNumber(p)
                }}
              />
            </Grid>
            {data.companies.map((x) => (
              <Grid key={x.ticker} xs={12}>
                <Card style={{ width: 'full' }}>
                  <Grid.Container gap={2}>
                    <Grid>
                      <Text h3>{x.ticker}</Text>
                    </Grid>
                    <Grid xs={12}>{<TagGraph tags={x.tags} />}</Grid>
                  </Grid.Container>
                </Card>
              </Grid>
            ))}
          </Grid.Container>
        )}
      </Grid.Container>
    </Container>
  )
}

export default Earnings
