//'use strict'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import 'dotenv/config'
import { SensorData } from '../../sensors/types/types';
import { writeFile } from 'fs'

/** Environment variables **/
const url = process.env.INFLUX_URL??''
const token = process.env.INFLUX_TOKEN??''
const org = process.env.INFLUX_ORG??''
const bucket = process.env.INFLUX_BUCKET??''
const mockinflux = process.env.MOCK_INFLUX == 'true'
const debugmode = process.env.DEBUGMODE == 'true'

const influxDB = new InfluxDB({ url, token })
const writeApi = influxDB.getWriteApi(org, bucket, 's')

/**
 * Write a series of sensor data to the Influx Cloud
 * @param sensors array of SensorData information
 */
const writeToInflux = async (sensors: Array<SensorData>) => {
    if (sensors.length == 0) {
        writeToLog(`[WARN]: Sensor data is empty`)
        return
    }
    let points: Point[] = []
    for (let i = 0; i < sensors.length; i++) {
        const sensorData = sensors[i]
        const temp = new Point('temperature')
        .tag('name', sensorData.name)
        .tag('type', sensorData.type)
        .tag('location', sensorData.location)
        .floatField('value', sensorData.temperature).timestamp('')
        points.push(temp)
        
        const humidity = new Point('humidity')
        .tag('name', sensorData.name)
        .tag('type', sensorData.type)
        .tag('location', sensorData.location)
        .floatField('value', sensorData.humidity).timestamp('')
        points.push(humidity)
    }
    if (debugmode) {
        console.log(points)
    }
    if (!mockinflux) {
        writeApi.writePoints(points)
        writeApi.flush().then(() => { writeToLog(`[INFO]: Wrote to InfluxDB ${points.length} points`) }).catch((reason) => { writeToLog(`[ERROR]: Error saving data to InfluxDB! ${reason}`)})
    }
}

/**
 * Write a message to the plaintext log file
 * @param message message to be written
 */
const writeToLog = async (message: string) => {
    writeFile('/tmp/gaia.log', `[${Date.now()}]${message}\r\n`, { encoding: 'utf-8', flag: 'a+' }, (err) => { if (err) console.log(err) })
}

/**
 * Close the Influx writer on exit
 */
process.on('SIGINT', function() {
    writeApi.close().then(() => {
        writeToLog('[INFO]: WRITER CLOSED')
    process.exit();
  })
})

export { writeToInflux, writeToLog }