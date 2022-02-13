import { read, SensorType } from 'node-dht-sensor';
import { readFileSync, opendir, existsSync } from 'fs'
import 'dotenv/config'
import { SensorData, SensorReading } from '../types/types'

/** Environment variables **/
const mocksensors = process.env.MOCK_SENSORS

const HWSENSORPREFIX='/sys/bus/w1/devices/';


//TODO: move to json
// Array of sensors based on their location in the Gaia complex
const sensorArray = [
    {
        name: "Chamber",
        location: "11",
        type: "DHT11",
        uuid: "Do these have one?"
    },
    {
        name: "Internal",
        location: "21",
        type: "DHT11",
        uuid: "Do these have one?"
    },
    {
        name: "Cauldron",
        location: "1",
        type: "DS18B20",
        uuid: "alpha"
    },
    {
        name: "Canister",
        location: "1",
        type: "DS18B20",
        uuid: "bravo"
    },
    {
        name: "Radiator",
        location: "1",
        type: "DS18B20",
        uuid: "charlie"
    }
]

/**
 * Return temperature reading from a given 1-Wire sensor
 * 1-Wire sensors require the uuid of the sensor device
 * 
 * @param sensor uuid of the sensor
 * @returns a SensorReading of data from the device
 */
const ds18b20Temp = async (sensor: string): Promise<SensorReading> => {
  const ret: SensorReading = { temperature: '0', humidity: '0', error: null }
  const hwmonDir = `${HWSENSORPREFIX}/${sensor}/hwmon`
  opendir(hwmonDir, async (err, dir) => {
    if (err) {
      ret.error = Error(`Failed to open dir ${err}`)
      return
    }
    
    for await (const dirent of dir) {
      if (existsSync(`${hwmonDir}/${dirent.name}/temp1_input`)) {
        ret.temperature = (parseFloat(readFileSync(`${hwmonDir}/${dirent.name}/temp1_input`, 'utf-8'))/1000.0).toString();
      }
    }
    ret.error = Error(`Unable to locate sensor by uuid ${sensor}`)
  })  
  return ret
}

/**
 * Read a DHT11 or 22 temperature and humidity sensor
 * 
 * @param type either 11 or 22
 * @param sensor sensor location, e.g. pin 21
 * @returns a SensorReading of data from the device
 */
const dhtxxTemp = async (type: number, sensor: string): Promise<SensorReading> => {
  if (![11,22].includes(type)) throw Error(`Invalid sensor type ${type}: 11 or 22`)
  let ret: SensorReading = { temperature: '0', humidity: '0', error: null }
  read(type as SensorType, parseInt(sensor), (err, temperature: number, humidity: number) => {
    if (err) {
      ret.error = Error(`Failed to read from sensor on pin ${sensor}: ${err.message}`)
      return
    }
    ret.temperature = temperature.toString()
    ret.humidity = humidity.toString()
  })
  return ret
}

/**
 * Read the available sensors and return the data in an array.
 * The DHT11 and 22 sensors will return a humidity, whereas DS18B20 will
 * only provide a temperature (thus defaulting to 100)
 * 
 * @returns array of sensor data
 */
const readSensors = async (): Promise<Array<SensorData>> => {
  const now = Date.now().valueOf()
  let sensorData: SensorData[] = []  
  if (mocksensors) {
        // Pretend to read from all sensors
    (await getMockData()).forEach(async (d) => {
        sensorData.push(d)
    })
  } else {
    sensorArray.forEach(async (sensorRead) => {
      let response: SensorReading
        if(sensorRead.type === 'DHT11' || sensorRead.type === 'DHT22') {
          response = await dhtxxTemp(sensorRead.type === 'DHT11' ? 11 : 22, sensorRead.location)
        } else if(sensorRead.type === 'DS18B20') {
          response = await ds18b20Temp(sensorRead.uuid)
        } else {
          throw Error(`Unknown sensor type ${sensorRead.type}`)
        }
      
        if (!response.error) {
          sensorData.push({ name: sensorRead.name, location: sensorRead.location, type: sensorRead.type, temperature: response.temperature, humidity: response.humidity, timestamp: now })
        }
    })
  }
  return sensorData
}

// Mock for testing
const getMockData = async (): Promise<Array<SensorData>> => {
    let sensorData: SensorData[] = []
    const now = Date.now()
    sensorArray.forEach(sensorRead => {
        // Pretend to read from all sensors
        if (sensorRead.type == 'DHT11' || sensorRead.type === 'DHT22') {
            const response = { temperature: Math.floor(Math.random() * (30 - 20 + 1) + 20), humidity: Math.floor(Math.random() * (60 - 50 + 1) + 50)}
            sensorData.push({ name: sensorRead.name, location: sensorRead.location, type: sensorRead.type, temperature: response.temperature.toString(), humidity: response.humidity.toString(), timestamp: now })
        } else if (sensorRead.type == 'DS18B20') {
            const response = { temperature: Math.floor(Math.random() * (30 - 20 + 1) + 20) }
            sensorData.push({ name: sensorRead.name, location: sensorRead.location, type: sensorRead.type, temperature: response.temperature.toString(), humidity: '100', timestamp: now })
        } else {
            console.log(`Unknown sensor type: ${sensorRead.type}`)
        }
    })
    return sensorData
}

export { readSensors, dhtxxTemp, ds18b20Temp }