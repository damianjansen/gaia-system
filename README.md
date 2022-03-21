# Gaia
Personal project for tracking temps in a PC and pushing to Influxdb.<br>
Reads 5 second data and pushes immediately, then triggers relay updates based on conditions.<br>

```
cp example.env .env # Update with target bucket details and IFTTT key/event
yarn
yarn install
yarn start
```

