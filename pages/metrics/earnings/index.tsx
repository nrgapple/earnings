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
  useInput,
} from '@nextui-org/react'
import { useMemo, useState } from 'react'
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
  const url = useMemo(
    () =>
      `/api/scores?page=${pageNumber - 1}${search ? `&search=${search}` : ''}`,
    [search, pageNumber]
  )
  const { data, error } = useSWR<CompaniesResp, Error>(url, fetcher)
  const { value, reset, bindings } = useInput('')

  console.log({ value })
  const loading = !data && !error

  const graphs = useMemo(() => {
    return data ? (
      data.companies.map((x) => (
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
      ))
    ) : (
      <></>
    )
  }, [data])

  return (
    <Container fluid>
      <Grid.Container gap={2} justify="center">
        <Grid xs={12} justify="center">
          <Text h1>Company Growths</Text>
        </Grid>
        <Grid xs={12}>
          <form
            style={{ width: '100%' }}
            onSubmit={(e) => {
              e.preventDefault()
              setSearch(value)
            }}
          >
            <Input
              css={{ width: '100%' }}
              {...bindings}
              onClearClick={reset}
              label="Search"
              type="search"
            />
          </form>
        </Grid>
        {loading ? (
          <Loading />
        ) : error ? (
          <Text h4>There was an error: {error.message}</Text>
        ) : (
          <Grid.Container justify="center" gap={2}>
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
            {graphs}
          </Grid.Container>
        )}
      </Grid.Container>
    </Container>
  )
}

export default Earnings
