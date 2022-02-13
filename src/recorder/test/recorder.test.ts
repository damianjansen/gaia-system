import { writeToLog } from '../lib/recorder'
jest.mock('@influxdata/influxdb-client')


describe('Relay tests', () => {

  // Not ready yet
  it.skip('writes a message to the log file', async () => {
    await writeToLog('[TEST] Message')
    //expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
  })
})

