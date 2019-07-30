export const getResult = function(times, count) {
  sortNumbers(times)

  const result = removeOutliers(times, count)
  return result
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

export const getStats = function(results, processes) {
  const times = results.flatMap(getTimes)
  const count = results.reduce(reduceCount, 0)

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

// Retrieve median of a sorted array
export const getMedian = function(array) {
  if (array.length % 2 === 1) {
    return array[(array.length - 1) / 2]
  }

  return (array[array.length / 2 - 1] + array[array.length / 2]) / 2
}

// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the looping process and transformed to a bell shape, even if
// if was not one. This means `percentiles`, `histogram`, `variance` and
// `deviation` will have a different meaning: they visualize the measurements of
// the function not function itself).
const getPercentiles = function(array) {
  // eslint-disable-next-line no-magic-numbers
  return getQuantiles(array, 1e2)
}

const getQuantiles = function(array, length) {
  return Array.from({ length }, (value, index) =>
    getQuantile(array, length, index),
  )
}

const getQuantile = function(array, length, index) {
  const position = ((array.length - 1) * index) / (length - 1)

  if (Number.isInteger(position)) {
    return array[position]
  }

  return (
    array[Math.floor(position)] * (position - Math.floor(position)) +
    array[Math.ceil(position)] * (Math.ceil(position) - position)
  )
}

const getHistogram = function(array) {
  return getSpecificHistogram(array, HISTOGRAM_SIZE)
}

// Choose to be detailed when displayed on a normal computer screen size
const HISTOGRAM_SIZE = 1e3

const getSpecificHistogram = function(array, bucketsNumber) {
  const [min] = array
  const max = array[array.length - 1]
  const bucketSize = (max - min) / bucketsNumber

  const arrayLength = array.length
  const arrayCopy = array.slice()

  return Array.from({ length: bucketsNumber }, (value, index) =>
    getBucket(index, arrayCopy, arrayLength, min, bucketSize, bucketsNumber),
  )
}

const getBucket = function(
  index,
  array,
  arrayLength,
  min,
  bucketSize,
  bucketsNumber,
) {
  const low = min + bucketSize * index
  const high = low + bucketSize
  const bucketCount = getBucketCount(index, array, bucketsNumber, high)
  const frequency = bucketCount / arrayLength
  return { low, high, frequency }
}

const getBucketCount = function(index, array, bucketsNumber, high) {
  if (index === bucketsNumber - 1) {
    return array.length
  }

  const count = array.findIndex(number => number >= high)
  // Performance optimization so that `array.findIndex()` is twice faster
  // eslint-disable-next-line fp/no-mutating-methods
  array.splice(0, count)
  return count
}

const getDeviation = function(variance) {
  return Math.sqrt(variance)
}

const getMean = function(array) {
  return array.reduce(addNumbers, 0) / array.length
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
