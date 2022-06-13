import { Table } from '@nextui-org/react'
import { Company } from '../../interfaces'
import { MicroGraph } from '../MicroGraph'

interface BrowseTableProps {
  companies: Company[]
}

export const BrowseTable = ({ companies }: BrowseTableProps) => {
  return (
    <Table>
      <Table.Header></Table.Header>
      <Table.Body>
        {companies.map((company) => (
          <Table.Row>
            <Table.Cell>{company.ticker}</Table.Cell>
            <Table.Cell>{company.name}</Table.Cell>
            <Table.Cell>
              <MicroGraph tags={company.tags['ReturnOnEquity']} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
