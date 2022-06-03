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
import stringToColor from 'string-to-color'
import { labelFormatter, priceFormatter } from '../../utils'
import { useTagGraph } from './useTagGraph'
import { Card, Grid, Text } from '@nextui-org/react'
import { Report } from '../../interfaces'

export interface TagGraphProps {
  tags: Record<string, Report[]>
}

export const TagGraph = (props: TagGraphProps) => {
  const { data, dot } = useTagGraph(props)
  const { tags } = props
  const [currDot, setCurrDot] = dot

  return (
    <ResponsiveContainer width="100%" height={'100%'} debounce={200}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 5, bottom: 5, left: 20 }}
      >
        {Object.keys(tags).map((key) => (
          <Line
            activeDot={{
              onMouseEnter(_, event) {
                setCurrDot(event)
              },
              onMouseLeave(_, event) {
                setCurrDot(undefined)
              },
            }}
            key={key}
            type="monotone"
            dataKey={key}
            stroke={stringToColor(key)}
            connectNulls
          />
        ))}
        <Tooltip
          itemStyle={{ height: '1px' }}
          labelFormatter={labelFormatter}
          // formatter={priceFormatter}
          allowEscapeViewBox={{ y: true }}
          content={(props: TooltipProps<number, number>) => (
            <CustomTooltip {...props} dot={currDot} />
          )}
        />
        <XAxis dataKey={'name'} tickFormatter={labelFormatter}></XAxis>
        <YAxis
          scale={'sqrt'}
          //interval={0}
          // tickFormatter={priceFormatter}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  )
}

const CustomTooltip = ({
  active,
  dot,
  payload,
}: TooltipProps<number, number> & { dot: any }) => {
  if (active && dot) {
    return (
      <Card css={{ width: 'auto' }}>
        <Grid.Container
          direction="column"
          css={{ zIndex: 9999, width: 'auto' }}
        >
          <Grid>
            <Text h5>{labelFormatter(dot['payload']['name'])}</Text>
          </Grid>
          <Grid css={{ width: 'auto' }}>
            <Text h5 color={dot['fill']}>
              {dot['dataKey']}
            </Text>
          </Grid>
          <Grid>
            <Text>{Math.round(dot['value'] * 100) / 100}</Text>
          </Grid>
        </Grid.Container>
      </Card>
    )
  }

  return null
}
