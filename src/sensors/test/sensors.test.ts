import { readSensors, dhtxxTemp, ds18b20Temp } from '../lib/sensors'
import { read } from 'node-dht-sensor'

jest.mock('rpi-gpio')
jest.mock('node-dht-sensor')

describe('Sensor tests', () => {

  it ('throws an error on invalid dht11/22 sensor type', async () => {
    try {
      await dhtxxTemp(99, '1000')
      throw Error('(Control) Failed to catch the error')
    } catch(err) {
      expect(err.message).toBe('Invalid sensor type 99: 11 or 22')
    }
  })

})

