import { Line, LineChart, ResponsiveContainer } from 'recharts'
import stringToColor from 'string-to-color'
import { labelFormatter, priceFormatter } from '../../utils'
import { Report } from '../../interfaces'
import { useTagGraph } from '../TagGraph'

export interface TagGraphProps {
  tags: Record<string, Report[]>
}

export const MicroGraph = (props: TagGraphProps) => {
  const { data } = useTagGraph(props)
  const { tags } = props

  return (
    <ResponsiveContainer width="100%" height={'100%'} debounce={200}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 5, bottom: 5, left: 20 }}
      >
        {Object.keys(tags).map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={stringToColor(key)}
            connectNulls
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
