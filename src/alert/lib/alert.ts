import axios from 'axios'
import 'dotenv/config'

const trigger = process.env.IFTTTTRIGGER
const key = process.env.IFTTTKEY
const target = `https://maker.ifttt.com/trigger/${trigger}/json/with/key/${key}`

const alert = async (message: string) => {

  if (!trigger || !key) {
    throw Error(`IFTTTTRIGGER (${trigger}) and IFTTTKEY (${key}) must be set in env`)
  }
  const data = { "value1": message }
  await axios.request({
    method: 'POST',
    url: target,
    data: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  })
}

export { alert }