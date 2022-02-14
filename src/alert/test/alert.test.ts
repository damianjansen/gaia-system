import { alert } from '../lib/alert'

describe('Alert tests', () => {

  it('writes a message to the alert', async () => {
    await alert('Internal Humidity Warning')
    //expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
  })
})

