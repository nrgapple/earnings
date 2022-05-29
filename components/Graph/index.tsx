import { Card, Divider, Grid, Text } from '@nextui-org/react'
import { useState } from 'react'
import Select, { MultiValue } from 'react-select'
import { CompanyMetrics } from '../../constants'
import { Company } from '../../interfaces'
import { calcYoYGrowth, objArrToObj } from '../../utils'
import { TagGraph } from '../TagGraph'

interface Props {
  companies: Company[]
}

export const Graph = ({ companies }: Props) => {
  const [selectedTags, setSelectedTags] = useState<
    MultiValue<{
      value: string
      label: string
    }>
  >(null)

  const filteredTags = (company: Company) => {
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
  }

  return (
    <>
      {companies.map((company) => (
        <Grid key={company.ticker}>
          <Card style={{ width: 'full' }}>
            <Card.Header>
              <Grid.Container direction="column">
                <Grid>
                  <Grid.Container alignItems="center" justify="space-between">
                    <Grid>
                      <Text h3>{company.ticker}</Text>
                    </Grid>
                    <Grid>
                      <Text>🔥</Text>
                    </Grid>
                  </Grid.Container>
                </Grid>
                <Grid>
                  <Grid.Container>
                    {Object.entries(CompanyMetrics).map(([row, data]) => (
                      <Grid xs={4} direction="column">
                        {data.map((x) => (
                          <Text weight={'bold'}>
                            {row === 'income' ? x.name : x}:{' '}
                            {calcYoYGrowth(
                              company.tags[x.tag?.find((x) => company.tags[x])]
                            )}
                          </Text>
                        ))}
                      </Grid>
                    ))}
                  </Grid.Container>
                </Grid>
              </Grid.Container>
            </Card.Header>
            <Divider />
            <Card.Body>
              <Select
                defaultValue={selectedTags}
                isMulti
                onChange={setSelectedTags}
                options={Object.keys(company.tags).map((tag) => ({
                  value: tag,
                  label: tag.split(/(?=[A-Z])/).join(' '),
                }))}
              />
              <TagGraph tags={filteredTags(company)} />
            </Card.Body>
          </Card>
        </Grid>
      ))}
    </>
  )
}
