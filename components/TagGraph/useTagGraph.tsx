import { useMemo, useState } from 'react'
import { DotProps } from 'recharts'
import { TagGraphProps } from './TagGraph'

export const useTagGraph = ({ reports }: TagGraphProps) => {
  const dot = useState<any>()
  const data = useMemo(() => {
    const allData = Object.entries(reports.metrics).flatMap(
      ([tag, reports]) => {
        return reports.map((x) => {
          return {
            name: new Date(x.end).getTime() / 1000,
            [tag]: x.val,
          }
        })
      }
    )

    return allData
      .reduce((prev, curr) => {
        const x = prev.find((x) => x.name === curr.name)
        if (x) {
          x[Object.keys(curr)[1]] = curr[Object.keys(curr)[1]]
        } else {
          prev.push({
            name: curr.name,
            [Object.keys(curr)[1]]: curr[Object.keys(curr)[1]],
          })
        }
        return prev
      }, [])
      .sort((a, b) => a.name - b.name)
  }, [reports])
  return { data, dot } as const
}
