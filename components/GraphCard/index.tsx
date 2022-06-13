import { Card, Divider, Grid, Table, Text } from '@nextui-org/react'
import { useCallback, useState } from 'react'
import Select, { MultiValue } from 'react-select'
import { CompanyMetrics } from '../../constants'
import { Company } from '../../interfaces'
import { calcYoYGrowth, objArrToObj } from '../../utils'
import { MicroGraph } from '../MicroGraph'
import { QuickMetrics } from '../QuickMetrics'
import { TagGraph } from '../TagGraph'

interface GraphCardProps {
  company: Company
  height: string
  showFilters?: boolean
}

export const GraphCard = ({
  company,
  height,
  showFilters = false,
}: GraphCardProps) => {
  const [selectedTags, setSelectedTags] = useState<
    MultiValue<{
      value: string
      label: string
    }>
  >([{ value: 'ReturnOnEquity', label: 'Return on Equity' }])

  const filteredTags = useCallback(
    (company: Company) => {
      if (selectedTags && selectedTags.length > 0) {
        return objArrToObj(
          selectedTags.map((x) => {
            return {
              key: x.value,
              value: company.tags[x.value],
            }
          })
        )
      }
      return company.tags
    },
    [company, selectedTags]
  )

  return (
    <Card>
      <Card.Header>
        <Grid dir="column" xs={12}>
          <Text h3>{company.ticker}</Text>
        </Grid>
        <Grid xs={12}>
          <Text>{company.name}</Text>
        </Grid>
      </Card.Header>
      <Divider />
      <Card.Body css={{ height }}>
        {/* <QuickMetrics company={company} /> */}
        {showFilters && (
          <Select
            defaultValue={selectedTags}
            isMulti
            onChange={setSelectedTags}
            options={Object.keys(company.tags).map((tag) => ({
              value: tag,
              label: tag.split(/(?=[A-Z])/).join(' '),
            }))}
          />
        )}
        <MicroGraph tags={filteredTags(company)} />
      </Card.Body>
    </Card>
  )
}
