import { Line, LineChart, ResponsiveContainer } from 'recharts'
import stringToColor from 'string-to-color'
import { labelFormatter, priceFormatter } from '../../utils'
import { Report } from '../../interfaces'
import { useTagGraph } from '../TagGraph'

export interface TagGraphProps {
  reports: Report[]
}

export const MicroGraph = (props: TagGraphProps) => {
  const { data } = useTagGraph({
    tags: {
      test: props.reports,
    },
  })

  return (
    <ResponsiveContainer width="100%" height={'100%'} debounce={200}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 5, bottom: 5, left: 20 }}
      >
        <Line
          type="monotone"
          dataKey={'test'}
          stroke={'green'}
          connectNulls
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
