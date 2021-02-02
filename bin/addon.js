#!/usr/bin/env node
const { serveHTTP } = require('stremio-addon-sdk');

const {addon, startIndexing} = require('..')

serveHTTP(addon.getInterface(), {port: process.env.PORT || 1222 })

startIndexing('./localFiles')
