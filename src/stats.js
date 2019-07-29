// eslint-disable-next-line max-statements
export const getStats = function(times, count) {
  sortNumbers(times)

  const { times: timesA, count: countA } = removeOutliers(times, count)

  const loops = timesA.length
  const repeat = Math.round(countA / loops)

  const median = getMedian(timesA)

  const [min] = timesA
  const max = timesA[timesA.length - 1]

  const mean = getMean(timesA)
  const variance = getVariance(timesA, mean)
  const deviation = getDeviation(variance)

  return {
    median,
    mean,
    min,
    max,
    deviation,
    variance,
    loops,
    count: countA,
    repeat,
    times,
  }
}

// Due to background processes (such as garbage collection) in JavaScript
// engines, the execution becomes periodically much slower for very short
// amounts of time. Those slow downs are due to the engine and not the function
// being measured, so we remove them.
// We do it by removing the slowest 15%.
const removeOutliers = function(times, count) {
  const outliersLimit = Math.ceil(times.length * (1 - OUTLIERS_THRESHOLD))
  const timesA = times.slice(0, outliersLimit)
  const countA = Math.ceil(count * (1 - OUTLIERS_THRESHOLD))
  return { times: timesA, count: countA }
}

const OUTLIERS_THRESHOLD = 0.15

// Retrieve median of a sorted array
export const getMedian = function(array) {
  if (array.length % 2 === 1) {
    return array[(array.length - 1) / 2]
  }

  return (array[array.length / 2 - 1] + array[array.length / 2]) / 2
}

const getDeviation = function(variance) {
  return Math.sqrt(variance)
}

const getMean = function(array) {
  return array.reduce(addNumbers) / array.length
}

const addNumbers = function(numA, numB) {
  return numA + numB
}

const getVariance = function(array, mean) {
  return getMean(array.map(num => (num - mean) ** 2))
}

export const sortNumbers = function(array) {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort(compareNumbers)
}

const compareNumbers = function(numA, numB) {
  return numA - numB
}

// We limit the max number of iterations because:
//  - the more iterations are run, the more JavaScript engines optimize it,
//    making code run faster and faster. This results in higher variance.
//    This is especially true for very fast functions.
//  - after many iterations have been run, the precision does not increase much
//    anymore. The extra `duration` should instead be spent launching more child
//    processes which are more effective at increasing precision.
//  - this avoids hitting the process maximum memory limit.
// This number if corrected by `OUTLITERS_THRESHOLD` so the final `loops` looks
// round after removing outliers.
const RAW_MAX_LOOPS = 1e5
export const MAX_LOOPS = Math.floor(RAW_MAX_LOOPS / (1 - OUTLIERS_THRESHOLD))
