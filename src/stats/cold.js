import { getMean } from './sum.js'

export const getCold = function (
  array,
  { mean = getMean(array), filter, length = array.filter(filter).length },
) {
  const minIndex = Math.floor(COLD_MIN_PERCENTAGE * (length - 1))
  const maxIndex = Math.floor(COLD_MAX_PERCENTAGE * (length - 1))
  const { closestMean } = getClosestMean(array, {
    mean,
    minIndex,
    maxIndex,
    filter,
  })
  const cold = Math.abs(mean - closestMean) / mean
  return cold
}

const COLD_MIN_PERCENTAGE = 0.2
const COLD_MAX_PERCENTAGE = 0.5

/* eslint-disable max-statements, complexity, fp/no-let, fp/no-loops,
   fp/no-mutation, max-depth, no-continue */
const getClosestMean = function (array, { mean, minIndex, maxIndex, filter }) {
  let closestMeanIndex = -1
  let closestMean = 0
  let closestMeanDiff = Number.POSITIVE_INFINITY
  let sum = 0
  let index = -1
  let filteredIndex = 0

  while (filteredIndex <= maxIndex) {
    index += 1
    const value = array[index]

    if (!filter(value)) {
      continue
    }

    filteredIndex += 1
    sum += value

    if (filteredIndex <= minIndex) {
      continue
    }

    const incrementalMean = sum / filteredIndex
    const meanDiff = Math.abs(mean - incrementalMean)

    if (closestMeanDiff > meanDiff) {
      closestMeanDiff = meanDiff
      closestMeanIndex = index
      closestMean = incrementalMean
    }
  }

  return { closestMeanIndex, closestMean }
}
/* eslint-enable max-statements, complexity, fp/no-let, fp/no-loops,
   fp/no-mutation, max-depth, no-continue */
