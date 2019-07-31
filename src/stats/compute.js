import { sortNumbers } from '../utils.js'

import { getMedian, getMean, getVariance, getDeviation } from './methods.js'
import { getPercentiles } from './percentiles.js'
import { getHistogram } from './histogram.js'

export const getStats = function(results) {
  const times = results.flatMap(getTimes)
  const count = results.reduce(reduceCount, 0)
  const processes = results.length

  sortNumbers(times)

  const stats = computeStats(times, count, processes)
  return stats
}

const getTimes = function({ times }) {
  return times
}

const reduceCount = function(totalCount, { count }) {
  return totalCount + count
}

// eslint-disable-next-line max-statements
const computeStats = function(times, count, processes) {
  const loops = times.length
  const repeat = Math.round(count / loops)

  const [min] = times
  const max = times[times.length - 1]

  const median = getMedian(times)
  const percentiles = getPercentiles(times)
  const histogram = getHistogram(times)

  const mean = getMean(times)
  const variance = getVariance(times, mean)
  const deviation = getDeviation(variance)

  return {
    median,
    mean,
    min,
    max,
    deviation,
    variance,
    count,
    loops,
    repeat,
    processes,
    histogram,
    percentiles,
  }
}
