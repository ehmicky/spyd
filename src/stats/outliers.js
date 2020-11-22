import { getSum } from './methods.js'
import { sortNumbers } from './sort.js'

// The slowest times are due to external factors:
//   - OS or runtime background periodic processes (such as garbage collection)
//   - The first measures of a specific task in a given process are slow because
//     the runtimes did not optimize it yet
//   - The first processes have not reached the final stabilized `repeat` and
//     `maxDuration`, making them usually slower
export const removeOutliers = function (processMeasures) {
  const processMeasuresA = removeOutlierProcesses(processMeasures)
  const { times, outliersMax } = removeOutlierTimes(processMeasuresA)
  const count = getCount(processMeasuresA, outliersMax)
  const processes = processMeasuresA.length
  return { times, count, processes }
}

// Remove initial `repeat` callibration
const removeOutlierProcesses = function (processMeasures) {
  const repeatCallbrationIndex = processMeasures.findIndex(isRepeatCallibration)

  if (repeatCallbrationIndex === -1) {
    return processMeasures
  }

  return processMeasures.slice(repeatCallbrationIndex + 1)
}

const isRepeatCallibration = function ({ repeat }, index, processMeasures) {
  return (
    repeat === 1 &&
    index !== processMeasures.length - 1 &&
    processMeasures[index + 1].repeat !== 1
  )
}

const removeOutlierTimes = function (processMeasures) {
  const times = aggregateTimes(processMeasures)
  sortNumbers(times)

  const outliersLimit = Math.ceil(times.length * (1 - OUTLIERS_THRESHOLD))
  const outliersMax = times[outliersLimit]
  const timesA = times.slice(0, outliersLimit)
  return { times: timesA, outliersMax }
}

// We do not use `[].concat(...processMeasures)` because it creates a stack
// overflow if `processMeasures.length` is too large (~1e5 on my machine)
const aggregateTimes = function (processMeasures) {
  return processMeasures.flatMap(getChildTimes)
}

const getChildTimes = function ({ childTimes }) {
  return childTimes
}

// How many outliers to remove.
// A lower value removes fewer outliers, which increases variance.
// A higher value removes more times, which decreases accuracy.
const OUTLIERS_THRESHOLD = 0.15

// Retrieve the number of times the task was measured, including inside a
// repeated loop. Takes into account the fact that some `times` were removed
// as outliers.
const getCount = function (processMeasures, outliersMax) {
  const processCounts = processMeasures.map(({ childTimes, repeat }) =>
    getProcessCount({ childTimes, repeat, outliersMax }),
  )
  return getSum(processCounts)
}

const getProcessCount = function ({ childTimes, repeat, outliersMax }) {
  return childTimes.filter((time) => time < outliersMax).length * repeat
}
