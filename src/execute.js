import { getMedian, getBiases } from './temp.js'

export const execute = function(duration) {
  const { nowBias, loopBias, minTime } = getBiases(duration)
  const time = getMedian(func, duration, nowBias, loopBias, minTime)
  return time
}

const func = Math.random
