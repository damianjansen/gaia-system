# gaia-system
Personal project for tracking temps in a PC and pushing to Influxdb.<br>
Reads per second data and pushes immediately.

```
cp example.env .env # Update with target bucket
yarn
yarn install
yarn start
```

In the future I might make is a modular .ts project...