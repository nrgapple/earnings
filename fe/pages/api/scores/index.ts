import { NextApiRequest, NextApiResponse } from 'next'
import Redis from 'ioredis'
import { EarningsMetric, EarningsResp } from '../../../interfaces'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const redis = new Redis(process.env.REDIS_URL)
  try {
    const data = await redis.get('data')
    const { page } = _req.query

    const dataJson = JSON.parse(data)
    if (!Array.isArray(dataJson)) {
      throw new Error('Cannot find data')
    }
    const earnings = dataJson as EarningsMetric[]
    const numPages = Math.floor(earnings.length / 10)

    const count = 10
    const p = page ? Number(page as string) : 0
    const cursor = p * count
    const endAmount =
      earnings.length - cursor < count ? earnings.length - cursor : count
    const dataFromPage = earnings.slice(cursor, cursor + endAmount)
    console.log({
      endAmount,
      cusser: p * 10,
      l: earnings.length,
      dl: dataFromPage.length,
    })

    res.status(200).json({
      earnings: dataFromPage,
      pages: numPages,
      current: p,
    } as EarningsResp)
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err.message })
  } finally {
    redis.quit()
  }
}

export default handler
