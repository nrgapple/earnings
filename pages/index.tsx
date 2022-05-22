import useSWR from 'swr'
import { EarningsResp } from '../interfaces'
import { Card, Container, Grid, Text } from '@nextui-org/react'
import { useState } from 'react'
import { Nav } from '../components/Nav'

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
      <Grid.Container gap={5} justify="center">
        <Nav />
        <Grid xs={12}>
          <Card>
            <Grid.Container justify="center">
              <Grid xs={12} justify="center">
                <Text h1>Lets Get Started</Text>
              </Grid>
              <Grid xs={12} justify="center">
                <Text h3>Find the info you need.</Text>
              </Grid>
            </Grid.Container>
          </Card>
        </Grid>
      </Grid.Container>
    </Container>
  )
}

export default IndexPage