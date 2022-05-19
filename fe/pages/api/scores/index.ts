import { NextApiRequest, NextApiResponse } from 'next'
import Redis from 'ioredis'
import { EarningsResp } from '../../../interfaces'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const redis = new Redis(process.env.REDIS_URL)
  try {
    const data = await redis.get('data')
    const { page } = _req.query

    const dataJson = JSON.parse(data)
    if (!Array.isArray(dataJson)) {
      throw new Error('Cannot find data')
    }

    const numPages = Math.floor(dataJson.length / 10)

    const p = page ? Number(page as string) : 0
    const endAmount =
      dataJson.length - p * 10 < 10 ? dataJson.length - p * 10 : 10
    const dataFromPage = dataJson.slice(p * 10, endAmount)

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
