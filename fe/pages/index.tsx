import useSWR from 'swr'
import { EarningsResp } from '../interfaces'
import { Card, Container, Grid, Loading, Text } from '@nextui-org/react'
import { TagGraph } from '../components/TagGraph'

const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
  const resp = await fetch(input, init)
  const data = await resp.json()
  return data
}

const IndexPage = () => {
  const { data, error } = useSWR<EarningsResp, Error>(
    '/api/scores?page=34',
    fetcher
  )

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
          data.earnings.map((x) => (
            <Grid key={x.ticker}>
              <Card>
                <Grid.Container gap={2}>
                  <Grid>
                    <Text h3>{x.ticker}</Text>
                  </Grid>
                  <Grid xs={12}>{<TagGraph reports={x} />}</Grid>
                </Grid.Container>
              </Card>
            </Grid>
          ))
        )}
      </Grid.Container>
    </Container>
  )
}

export default IndexPage
