//'use strict'
import 'dotenv/config'
import { readSensors } from '../sensors/lib/sensors'
import { setRelayState, toggleFan } from '../relay/lib/relay'
import { writeToInflux, writeToLog } from '../recorder/lib/recorder'
import { SensorData } from '../sensors/types/types'

const debugmode = process.env.DEBUGMODE

/**
 * Read sensors, pass this data to the actioner and write it to influx
 */
const gaiaLoop = async() => {
    const sensorData: SensorData[] = await readSensors()
    setAction(sensorData)
    await writeToInflux(sensorData).then(() => {
        writeToLog("[INFO]: Wrote to influx")
    }).catch((reason) => {
        writeToLog(`[ERROR]: ${reason}`)
    })
}

/**
 * Given a set of data, make "decisions" on active cooling components.
 * If the temperature is high set the mode to high, or if too low, set to
 * low or turn off.
 * Turn the fan off if the ambient air is warmer than the radiator loop.
 * 
 * @param data sensor data array
 */
const setAction = (data: SensorData[]) => {
    const cauldron = data.find(d => d.name === 'Cauldron')
    const loop = data.find(d => d.name === 'Radiator')
    const ambient = data.find(d => d.name === 'Ambient')

    
    const coolerTemp = parseInt(cauldron.temperature)
    if (coolerTemp < 5) {
        setRelayState('OFF')
    } else if (coolerTemp < 10) {
        setRelayState('LOW')
    } else if (coolerTemp < 15) {
        setRelayState('MID')
    } else {
        setRelayState('HIGH')
    }

    toggleFan(ambient < loop)
}

// Enable Gaia
setInterval(gaiaLoop, 5000);
