import Layout from '../components/Layout'
import useSWR from 'swr'
import {
  EarningsMetric,
  EarningsResp,
  ReportPretty,
  ScoresData,
} from '../interfaces'
import {
  Card,
  Container,
  Grid,
  Loading,
  Table,
  Text,
  useAsyncList,
  useCollator,
} from '@nextui-org/react'
import { currencyFormatter, objArrToObj, toPercentFormat } from '../utils'
import { TagGraph } from '../components/TagGraph'

const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
  const resp = await fetch(input, init)
  const data = await resp.json()
  console.log(data)
  return data
}

const IndexPage = () => {
  const { data, error } = useSWR<EarningsResp, Error>('/api/scores', fetcher)

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
