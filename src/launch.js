import { argv } from 'process'

import { getMedian, getBiases } from './temp.js'

const maxDuration = Number(argv[2])

const { nowBias, loopBias, minTime } = getBiases(maxDuration)

const func = Math.random

const time = getMedian(func, maxDuration, nowBias, loopBias, minTime)
console.log(time)
