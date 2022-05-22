import { useMemo } from 'react'
import {
  CartesianGrid,
  DotProps,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { EarningsMetric } from '../../interfaces'
import stringToColor from 'string-to-color'
import { labelFormatter, priceFormatter } from '../../utils'
import { useTagGraph } from './useTagGraph'
import { Card, Grid, Text } from '@nextui-org/react'

export interface TagGraphProps {
  reports: EarningsMetric
}

export const TagGraph = ({ reports }: TagGraphProps) => {
  const { data, dot } = useTagGraph({ reports })
  const [currDot, setCurrDot] = dot

  return (
    <ResponsiveContainer width="100%" height={750} debounce={200}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 5, bottom: 50, left: 20 }}
      >
        {Object.keys(reports.metrics).map((x) => (
          <Line
            activeDot={{
              onMouseEnter(_, event) {
                setCurrDot(event)
              },
              onMouseLeave(_, event) {
                setCurrDot(undefined)
              },
            }}
            key={x}
            type="monotone"
            dataKey={x}
            stroke={stringToColor(x)}
            connectNulls
          />
        ))}
        <Tooltip
          itemStyle={{ height: '1px' }}
          labelFormatter={labelFormatter}
          formatter={priceFormatter}
          allowEscapeViewBox={{ y: true }}
          content={(props: TooltipProps<number, number>) => (
            <CustomTooltip {...props} dot={currDot} />
          )}
        />
        <XAxis dataKey={'name'} tickFormatter={labelFormatter}>
          <Label position="insideBottom" offset={-30}>
            Year and Quarter
          </Label>
        </XAxis>
        <YAxis
          scale={'sqrt'}
          label={{
            value: '$ / 100,000',
            angle: -90,
            position: 'insideLeft',
            offset: -10,
          }}
          //interval={0}
          tickFormatter={priceFormatter}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  )
}

const CustomTooltip = ({
  active,
  dot,
}: TooltipProps<number, number> & { dot: DotProps }) => {
  if (active && dot) {
    return (
      <Card css={{ width: '12rem' }}>
        <Grid.Container css={{ zIndex: 9999 }}>
          <Grid xs={12}>
            <Text h5>{labelFormatter(dot['payload']['name'])}</Text>
          </Grid>
          <Grid xs={12}>
            <Text color={dot['fill']}>{`${dot['dataKey']} : ${priceFormatter(
              dot['value']
            )}`}</Text>
          </Grid>
        </Grid.Container>
      </Card>
    )
  }

  return null
}