const fs=require('fs');
 
const HWSENSORPREFIX='/sys/bus/w1/devices/';
 
async function getSensors() {
  let sensors=[];
  const dir = await fs.promises.opendir(`${HWSENSORPREFIX}`);
  for await (const dirent of dir) {
    if (dirent.name.slice(0,3)=='28-') {
        sensors.push(dirent.name);
    }
  }
  return sensors;
}

console.log(await(getSensors()))
