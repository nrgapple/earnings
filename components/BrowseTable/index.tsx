import { Table, useAsyncList } from '@nextui-org/react'
import { useRouter } from 'next/router'
import { CompaniesResp, Company } from '../../interfaces'
import { MicroGraph } from '../MicroGraph'

interface BrowseTableProps {}

export const BrowseTable = ({}: BrowseTableProps) => {
  const { push } = useRouter()
  const load = async ({ signal, cursor }: { signal: any; cursor?: string }) => {
    // If no cursor is available, then we're loading the first page.
    // Otherwise, the cursor is the next URL to load, as returned from the previous page.
    const res = await fetch(cursor || `/api/earnings?page=0`, {
      signal,
    })
    const json = (await res.json()) as CompaniesResp
    const payload = {
      items: json.companies ?? [],
      cursor:
        json.current < json.pages
          ? `/api/earnings?page=${json.current + 1}`
          : undefined,
    }
    console.log(payload)
    return payload
  }
  const list = useAsyncList({ load })

  return (
    <Table
      shadow={false}
      selectionMode="single"
      onSelectionChange={(s) => {
        const select = s as Set<string>
        push(`/company/${[...select][0]}`)
      }}
      sticked
      containerCss={{
        minWidth: '100%',
      }}
      css={{
        height: '500px',
      }}
    >
      <Table.Header>
        <Table.Column>Ticker</Table.Column>
        <Table.Column maxWidth="20rem">Name</Table.Column>
        <Table.Column align="end">Graph</Table.Column>
      </Table.Header>
      <Table.Body
        items={list.items}
        loadingState={list.loadingState}
        onLoadMore={list.loadMore}
      >
        {(company) => (
          <Table.Row key={company.ticker}>
            <Table.Cell>{company.ticker}</Table.Cell>
            <Table.Cell css={{ minWidth: '20rem', textOverflow: 'ellipsis' }}>
              {company.name}
            </Table.Cell>
            <Table.Cell css={{ height: '5rem', width: '15rem' }}>
              <MicroGraph reports={company.tags['ReturnOnEquity']} />
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  )
}
