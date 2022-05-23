import useSWR from 'swr'
import {
  Button,
  Card,
  Container,
  Divider,
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

  const loading = !data && !error

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
    <Grid.Container gap={2} justify="center">
      <Grid xs={12} justify="center">
        <Text h1>Company Growths</Text>
      </Grid>
      <Grid xs={12} sm={6}>
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
                console.log('here')
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
                  console.log('here')
                  setPageNumber(p)
                }}
              />
            </Grid>
          )}
        </Grid.Container>
      )}
    </Grid.Container>
  )
}

export default Earnings
