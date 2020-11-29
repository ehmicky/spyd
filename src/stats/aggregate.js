import { getSum, getMax } from './methods.js'
import { OUTLIERS_THRESHOLD } from './outliers.js'
import { sortNumbers } from './sort.js'

// The slowest measures are due to external factors:
//   - OS or runtime background periodic processes (such as garbage collection)
//   - The first measures of a specific task in a given process are slow because
//     the runtimes did not optimize it yet
export const aggregateMeasures = function (processMeasures) {
  const measures = aggregateProcessMeasures(processMeasures)
  sortNumbers(measures)
  const times = getTimes(processMeasures, measures)
  const processes = processMeasures.length
  return { measures, times, processes }
}

// We do not use `[].concat(...processMeasures)` because it creates a stack
// overflow if `processMeasures.length` is too large (~1e5 on my machine)
const aggregateProcessMeasures = function (processMeasures) {
  return processMeasures.flatMap(getChildMeasures)
}

const getChildMeasures = function ({ childMeasures }) {
  return childMeasures
}

// Retrieve the number of measures the task was measured, including inside a
// repeated loop. Takes into account the fact that some measures were removed
// as outliers.
const getTimes = function (processMeasures, measures) {
  const max = getMax(measures, OUTLIERS_THRESHOLD)
  const processTimes = processMeasures.map(({ childMeasures, repeat }) =>
    getProcessTimes({ childMeasures, repeat, max }),
  )
  return getSum(processTimes, 1)
}

const getProcessTimes = function ({ childMeasures, repeat, max }) {
  return childMeasures.filter((time) => time <= max).length * repeat
}
