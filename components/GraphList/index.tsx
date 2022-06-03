import { Grid } from '@nextui-org/react'
import { Company } from '../../interfaces'
import { GraphCard } from '../GraphCard'

interface Props {
  companies: Company[]
}

export const GraphList = ({ companies }: Props) => {
  return (
    <>
      {companies.map((company) => (
        <Grid xs={12} sm={6} md={4} key={company.ticker}>
          <GraphCard height="250px" company={company} />
        </Grid>
      ))}
    </>
  )
}
