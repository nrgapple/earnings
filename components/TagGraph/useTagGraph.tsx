import { useMemo, useState } from 'react'
import { TagGraphProps } from './TagGraph'

export const useTagGraph = ({ tags }: TagGraphProps) => {
  const dot = useState<any>()
  const data = useMemo(() => {
    const allData = tags.flatMap(({ name, reports }) => {
      return reports.map((x) => {
        return {
          name: new Date(x.end).getTime() / 1000,
          [name]: x.val,
        }
      })
    })

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
  }, [tags])
  return { data, dot } as const
}
