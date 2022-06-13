import { Table } from '@nextui-org/react'
import { CompanyMetrics } from '../../constants'
import { Company } from '../../interfaces'
import { calcYoYGrowth } from '../../utils'

interface QuickMetricsProps {
  company: Company
}

export const QuickMetrics = ({ company }: QuickMetricsProps) => {
  return (
    <Table
      lined
      css={{
        height: 'auto',
        minWidth: '100%',
      }}
    >
      <Table.Header>
        <Table.Column>Metrics</Table.Column>
        <Table.Column>Value</Table.Column>
      </Table.Header>
      <Table.Body>
        {CompanyMetrics.income.map((data) => (
          <Table.Row>
            <Table.Cell>{data.name}</Table.Cell>
            <Table.Cell>
              {calcYoYGrowth(
                company.tags[data.tag.find((x) => company.tags[x])]
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
