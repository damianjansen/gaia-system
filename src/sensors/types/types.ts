
export type SensorData = {
  name: string,
  location: string,
  type: string,
  temperature: string,
  humidity: string,
  timestamp: number
}

export type SensorReading = {
  temperature: string,
  humidity: string,
  error: Error | null
}