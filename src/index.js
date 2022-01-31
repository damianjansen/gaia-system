//'use strict'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import pkg from 'node-dht-sensor';
const { read: _read } = pkg;
import 'fs'
import 'dotenv/config'
import express from 'express'

/** Environment variables **/
const url = process.env.INFLUX_URL
const token = process.env.INFLUX_TOKEN
const org = process.env.INFLUX_ORG
const bucket = process.env.INFLUX_BUCKET
const mocksensors = true
const mockinflux = false
const debugmode = false
const HWSENSORPREFIX='/sys/bus/w1/devices/';

const influxDB = new InfluxDB({ url, token })
const writeApi = influxDB.getWriteApi(org, bucket, 's')

const writeToInflux = async (sensors) => {
    if (typeof sensors != 'object') throw Error(`Sensor data not an object (${typeof sensors})`)
    if (sensors.length == 0) throw Error(`Sensor data is empty`)
    let points = []
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
        writeApi.flush().then(() => { console.log('Wrote to server') }).catch((reason) => { console.log(`Error saving data to InfluxDB! ${reason}`)})
    }
}

//move to json
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

// Return temperature reading from a given 1-Wire sensor
const ds18b20Temp = async (sensor) => {
    const dir = await fs.promises.opendir(`${HWSENSORPREFIX}/${sensor}/hwmon`);
    for await (const dirent of dir) {
      if (dirent.name.slice(0, 5)=='hwmon') {
        let temp = parseFloat(await fs.promises.readFile(`${HWSENSORPREFIX}/${sensor}/hwmon/${dirent.name}/temp1_input`))/1000.0;
        return temp.toString()
      }
    }
    return `Unable to locate sensor by uuid ${sensor}`
}
  
const readSensors = async () => {
  const now = Date.now().valueOf()
  let sensorData = []  
  if (mocksensors) {
        // Pretend to read from all sensors
    (await getMockData()).forEach(function(d) {
        sensorData.push(d)
    })
  } else {
    sensorArray.forEach(sensorRead => {
        if (sensorRead.type == 'DHT11') {
            const pin = parseInt(sensorRead.location)
            _read(11, pin, function(err, temperature, humidity) {
                if (!err) {
                    sensorData.push({ name: sensorRead.name, location: pin, type: sensorRead.type, temperature: temperature, humidity: humidity, timestamp: now })
                } else {
                    console.log(`Failed to read from sensor ${sensorRead.name} on pin ${pin}: ${err.message}`)
                }
            })
           
        } else if (sensorRead.type == 'DS18B20') {
            ds18b20Temp(sensorRead.uuid, function(temperature) {
                const temp = parseFloat(temperature)
                if (temp) {
                    sensorData.push({ name: sensorRead.name, location: sensorRead.location, type: sensorRead.type, temperature: response.temperature, humidity: 100, timestamp: now })
                } else {
                    console.log(`Failed to read from sensor ${sensorRead.name} on pin ${sensorRead.location}: ${temp}`)
                }
            })
            
        } else {
            console.log(`Unknown sensor type ${sensorRead.type}`)
        }
    })
  }
  //console.log(sensorData)
  return sensorData
}

const gaiaLoop = async() => {
    const sensorData = await readSensors()
    await writeToInflux(sensorData).then(() => {
        console.log("Wrote to influx")
    }).catch((reason) => {
        console.log(`Write to error log ${reason}`)
    })
}

setInterval(gaiaLoop, 1000);

process.on('SIGINT', function() {
    writeApi.close().then(() => {
        console.log('WRITER CLOSED')
    process.exit();
  })
})

const getMockData = async () => {
    let sensorData = []
    const now = Date.now()
    sensorArray.forEach(sensorRead => {
        // Pretend to read from all sensors
        if (sensorRead.type == 'DHT11') {
            const response = { temperature: Math.floor(Math.random() * (30 - 20 + 1) + 20), humidity: Math.floor(Math.random() * (60 - 50 + 1) + 50)}
            sensorData.push({ name: sensorRead.name, location: sensorRead.location, type: sensorRead.type, temperature: response.temperature, humidity: response.humidity, timestamp: now })
        } else if (sensorRead.type == 'DS18B20') {
            const response = { temperature: Math.floor(Math.random() * (30 - 20 + 1) + 20) }
            sensorData.push({ name: sensorRead.name, location: sensorRead.location, type: sensorRead.type, temperature: response.temperature, humidity: 100, timestamp: now })
        } else {
            console.log(`Unknown sensor type: ${sensorRead.type}`)
        }
    })
    return sensorData
}