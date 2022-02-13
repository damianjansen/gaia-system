
import { setup, setMode, write, MODE_BCM, DIR_OUT } from 'rpi-gpio'
import { writeToLog } from '../../recorder/lib/recorder'

const relay1 = 21
const relay2 = 16
const relay3 = 26
const relay4 = 17

const states = ['HIGH', 'MID', 'LOW', 'OFF']
const relayOn = false
const relayOff = true

setMode(MODE_BCM)
setup(relay1, DIR_OUT)
setup(relay2, DIR_OUT)
setup(relay3, DIR_OUT)
setup(relay4, DIR_OUT)

/**
 * Allow power through the relay
 * @param relay pin number of the relay
 */
const allow = async (relay: number) => {
  write(relay, relayOn, (err) => {
    writeToLog(err ? `[ERROR]: FAILED TO WRITE ON RELAY ${relay}` : `[INFO]: WRITE ON RELAY ${relay}`)
  })
}

/**
 * Deny power through the relay
 * @param relay pin number of the relay
 */
const deny = async (relay: number) => {
  write(relay, relayOff, (err) => {
    writeToLog(err ? `[ERROR]: FAILED TO WRITE OFF RELAY ${relay}` : `[INFO]: WRITE OFF RELAY ${relay}`)
  })
}

/**
 * Set the power states (or number of closed circuits) for the relay.
 * @param state one of HIGH, MID, LOW or OFF
 */
const setRelayState = async (state: string) => {
  if (!states.includes(state)) {
    throw Error(`Invalid state ${state}: (${states})`)
  }
  switch(state) {
    case('HIGH'): {
      await allow(relay1)
      await allow(relay2)
      await allow(relay3)
      writeToLog('[INFO]: Set relay state HIGH')
      break
    }
    case('MID'): {
      await allow(relay1)
      await allow(relay2)
      await deny(relay3)
      writeToLog('[INFO]: Set relay state MID')
      break
    }
    case('LOW'): {
      await allow(relay1)
      await deny(relay2)
      await deny(relay3)
      writeToLog('[INFO]: Set relay state LOW')
      break
    }
    case('OFF'): {
      await deny(relay1)
      await deny(relay2)
      await deny(relay3)
      writeToLog('[INFO]: Set relay state OFF')
      break
    }

    default: {
      throw Error('INVALID STATE FOR RELAY')
    }
  }
}

/**
 * Turns the radiator fan on and off
 * @param toggle true = on, false = off
 */
const toggleFan = async (toggle: boolean) => {
  if (toggle) {
    allow(relay4)
  } else {
    deny(relay4)
  }
}


export { setRelayState, toggleFan, relay1, relay2, relay3, relay4 }