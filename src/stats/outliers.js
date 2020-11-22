import { getSum } from './methods.js'
import { sortNumbers } from './sort.js'

// The slowest times are due to external factors:
//   - OS or runtime background periodic processes (such as garbage collection)
//   - The first runs of a specific task in a given process are slow because
//     the runtimes did not optimize it yet
//   - The first processes have not reached the final stabilized `repeat` and
//     `maxDuration`, making them usually slower
export const removeOutliers = function (results) {
  const resultsA = removeOutlierProcesses(results)
  const { times, outliersMax } = removeOutlierTimes(resultsA)
  const count = getCount(resultsA, outliersMax)
  const processes = resultsA.length
  return { times, count, processes }
}

// Remove initial `repeat` callibration
const removeOutlierProcesses = function (results) {
  const repeatCallbrationIndex = results.findIndex(isRepeatCallibration)

  if (repeatCallbrationIndex === -1) {
    return results
  }

  return results.slice(repeatCallbrationIndex + 1)
}

const isRepeatCallibration = function ({ repeat }, index, results) {
  return (
    repeat === 1 &&
    index !== results.length - 1 &&
    results[index + 1].repeat !== 1
  )
}

const removeOutlierTimes = function (results) {
  const times = aggregateTimes(results)
  sortNumbers(times)

  const outliersLimit = Math.ceil(times.length * (1 - OUTLIERS_THRESHOLD))
  const outliersMax = times[outliersLimit]
  const timesA = times.slice(0, outliersLimit)
  return { times: timesA, outliersMax }
}

// We do not use `[].concat(...results)` because it creates a stack overflow if
// `results.length` is too large (~1e5 on my machine)
const aggregateTimes = function (results) {
  return results.flatMap(getChildTimes)
}

const getChildTimes = function ({ childTimes }) {
  return childTimes
}

// How many outliers to remove.
// A lower value removes fewer outliers, which increases variance.
// A higher value removes more times, which decreases accuracy.
const OUTLIERS_THRESHOLD = 0.15

// Retrieve the number of times the task was run, including inside a repeated
// loop. Takes into account the fact that some `times` were removed as outliers.
const getCount = function (results, outliersMax) {
  const resultCounts = results.map(({ childTimes, repeat }) =>
    getResultCount({ childTimes, repeat, outliersMax }),
  )
  return getSum(resultCounts)
}

const getResultCount = function ({ childTimes, repeat, outliersMax }) {
  return childTimes.filter((time) => time < outliersMax).length * repeat
}
