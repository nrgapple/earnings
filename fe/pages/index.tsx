import useSWR from 'swr'
import { EarningsResp } from '../interfaces'
import {
  Card,
  Container,
  Grid,
  Loading,
  Pagination,
  Text,
} from '@nextui-org/react'
import { TagGraph } from '../components/TagGraph'
import { useState } from 'react'

// @ts-ignore
const fetcher = async (...args) => {
  // @ts-ignore
  const resp = await fetch(...args)
  const data = await resp.json()
  return data
}

const IndexPage = () => {
  const [pageNumber, setPageNumber] = useState(1)
  const { data, error } = useSWR<EarningsResp, Error>(
    `/api/scores?page=${pageNumber}`,
    fetcher
  )
  console.log({ pageNumber })

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
            <Grid>
              <Pagination
                total={data.pages}
                page={pageNumber}
                onChange={(p) => {
                  console.log('here')
                  setPageNumber(p)
                }}
              />
            </Grid>
            {data.earnings.map((x) => (
              <Grid key={x.ticker} xs={12}>
                <Card style={{ width: 'full' }}>
                  <Grid.Container gap={2}>
                    <Grid>
                      <Text h3>{x.ticker}</Text>
                    </Grid>
                    <Grid xs={12}>{<TagGraph reports={x} />}</Grid>
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

export default IndexPage
