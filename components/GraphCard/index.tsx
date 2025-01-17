import { Card, Divider, Grid, Text } from '@nextui-org/react'
import { useCallback, useState } from 'react'
import Select, { MultiValue } from 'react-select'
import { CompanyMetrics } from '../../constants'
import { Company } from '../../interfaces'
import { calcYoYGrowth, objArrToObj } from '../../utils'
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
        <Grid.Container>
          {Object.entries(CompanyMetrics).map(([row, data]) =>
            data.map((x) => (
              <>
                <Grid alignItems="center" xs={3}>
                  <Text size={'12px'} weight={'bold'}>
                    {x.name}:
                  </Text>
                </Grid>
                <Grid xs={9}>
                  <Text css={{ pl: '$3' }}>
                    {calcYoYGrowth(
                      company.tags[x.tag.find((x) => company.tags[x])]
                    )}
                  </Text>
                </Grid>
              </>
            ))
          )}
        </Grid.Container>
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
        <TagGraph tags={filteredTags(company)} />
      </Card.Body>
    </Card>
  )
}
