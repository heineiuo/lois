import express from 'express'
import http from 'http'
import { homedir, cpus } from 'os'
import cluster from 'cluster'
import path from 'path'
import dotenv from 'dotenv'
import mkdirp from 'mkdirp'
import fs from 'fs'
import { match, when } from 'match-when'
import defaults from 'lodash/defaults'
import './auto-env'
import { requestListener } from './main'

const {
  DATA_DIR, NODE_ENV, ARANGO_HOST, ARANGO_USER, ARANGO_PORT, 
  ARANGO_PASSWORD, ARANGO_DATABASE, PORT,
} = process.env

console.log(`Current data directory: ${DATA_DIR}`)
console.log(`Current NODE_ENV: ${NODE_ENV}`)


if (NODE_ENV === 'development') {
  http.createServer(requestListener).listen(PORT, () => console.log(`dev ${process.pid} listening on port ${PORT}`))

} else if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)
  Array.from({ length: cpus().length }, (v, k) => {
    cluster.fork(process.env)
  })
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`)
  })
} else {
  // app.listen(PORT, () => console.log(`Worker ${process.pid} is listening on port ${PORT}`))
}

