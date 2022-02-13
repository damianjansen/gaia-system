import { writeToLog } from '../lib/recorder'
// jest.mock("fs", () => ({
//   promises: {
//     writeFile: jest.fn(),
//     readFile: jest.fn(),
//   },
// }));

// const fs = require("fs");
jest.mock('@influxdata/influxdb-client')


describe('Relay tests', () => {

  beforeEach(() => {
  //  rpiWrite.mockClear()
  })
  it ('writes a message to the log file', async () => {
    await writeToLog('[TEST] Message')
    //expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
  })
})

