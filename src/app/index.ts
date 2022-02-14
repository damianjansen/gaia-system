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
    const maxAcceptableHumidityChamber = 90
    const maxAcceptableHumidityInternal = 50
    const cauldron = data.find(d => d.name === 'Cauldron')
    const radiator = data.find(d => d.name === 'Radiator')
    const ambient = data.find(d => d.name === 'Ambient')
    const chamber = data.find(d => d.name === 'Chamber')
    const machine = data.find(d => d.name === 'Internal')

    //console.log(JSON.stringify(data))

    if(!cauldron || !radiator || !ambient) {
        writeToLog(`[ERROR]: Failed to locate temperature: ${JSON.stringify(data)}`)
        return
    } 
    
    const coolerTemp = parseInt(cauldron.temperature)
    if (isNaN(parseInt(ambient.temperature)) || isNaN(parseInt(radiator.temperature)) || isNaN(coolerTemp)) {
        writeToLog(`[ERROR]: Failed to read temperature: ${JSON.stringify(data)}`)
    }
    if (coolerTemp < 5) {
        setRelayState('OFF')
    } else if (coolerTemp < 10) {
        setRelayState('LOW')
    } else if (coolerTemp < 15) {
        setRelayState('MID')
    } else {
        setRelayState('HIGH')
    }

    toggleFan(parseInt(ambient.temperature) < parseInt(radiator.temperature))
    if(!machine || !chamber) {
        writeToLog(`[ERROR]: Failed to locate humidity: ${JSON.stringify(data)}`)
        return
    }
    if (parseInt(machine.humidity) > maxAcceptableHumidityInternal) {
        //alert
    }
    if (parseInt(chamber.humidity) > maxAcceptableHumidityChamber) {
        //alert
    }
}

// Enable Gaia
setInterval(gaiaLoop, 5000);
