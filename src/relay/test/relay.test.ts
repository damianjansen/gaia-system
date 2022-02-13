import { setRelayState, toggleFan } from '../lib/relay'
import GPIO, { write } from 'rpi-gpio'
jest.mock('rpi-gpio')
const rpiWrite = write as jest.Mock

describe('Relay tests', () => {

  beforeEach(() => {
    rpiWrite.mockClear()
  })
  it ('throws an error on invalid state', async () => {
    try {
      await setRelayState('EXTREME')
      throw Error('(Control) Failed to catch the error')
    } catch(err) {
      expect(err.message).toBe('Invalid state EXTREME: (HIGH,MID,LOW,OFF)')
    }
  })

  it ('sets the appropriate relays for high', async () => {
    await setRelayState('HIGH')
    expect(rpiWrite).toBeCalledTimes(3)
    expect(rpiWrite).toBeCalledWith(21, GPIO.DIR_LOW)
    expect(rpiWrite).toBeCalledWith(16, GPIO.DIR_LOW)
    expect(rpiWrite).toBeCalledWith(26, GPIO.DIR_LOW)
  })

  it ('sets the appropriate relays for mid', async () => {
    await setRelayState('MID')
    expect(rpiWrite).toBeCalledTimes(3)
    expect(rpiWrite).toBeCalledWith(21, GPIO.DIR_LOW)
    expect(rpiWrite).toBeCalledWith(16, GPIO.DIR_LOW)
    expect(rpiWrite).toBeCalledWith(26, GPIO.DIR_HIGH)
  })

  it ('sets the appropriate relays for low', async () => {
    await setRelayState('LOW')
    expect(rpiWrite).toBeCalledTimes(3)
    expect(rpiWrite).toBeCalledWith(21, GPIO.DIR_LOW)
    expect(rpiWrite).toBeCalledWith(16, GPIO.DIR_HIGH)
    expect(rpiWrite).toBeCalledWith(26, GPIO.DIR_HIGH)
  })

  it ('sets the appropriate relays for off', async () => {
    await setRelayState('OFF')
    expect(rpiWrite).toBeCalledTimes(3)
    expect(rpiWrite).toBeCalledWith(21, GPIO.DIR_HIGH)
    expect(rpiWrite).toBeCalledWith(16, GPIO.DIR_HIGH)
    expect(rpiWrite).toBeCalledWith(26, GPIO.DIR_HIGH)
  })

  it ('sets the appropriate relays for fan on', async () => {
    await toggleFan(true)
    expect(rpiWrite).toBeCalledTimes(1)
    expect(rpiWrite).toBeCalledWith(17, GPIO.DIR_LOW)
  })

  it ('sets the appropriate relays for fan on', async () => {
    await toggleFan(false)
    expect(rpiWrite).toBeCalledTimes(1)
    expect(rpiWrite).toBeCalledWith(17, GPIO.DIR_HIGH)
  })
})

