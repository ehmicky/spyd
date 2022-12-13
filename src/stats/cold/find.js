// Compute the mean incrementally, measure by measure.
// Then retrieve the `incrementalMean` that is the closest to the total `mean`,
// within a specific range decided by `minIndex` and `maxIndex`.
// This must be performed on unsorted `measures`.
//  - Therefore, outliers are still present and must be removed using a `filter`
//  - This also requires using two indexes: filtered and not.
// `minIndex` is always <= `maxIndex`, i.e. a `closestMean` is always found.
// Time complexity is `O(n)`.
// Memory complexity is `O(1)` and very low by using a streaming logic.
// This is optimized for performance, which explains the usage of imperative
// programming patterns.
/* eslint-disable max-statements, complexity, fp/no-let, fp/no-loops,
   fp/no-mutation, max-depth, no-continue */
export const findClosestMean = (
  array,
  { mean, minIndex, maxIndex, filter },
) => {
  let sum = 0
  let filteredIndex = 0
  let closestMean = 0
  let closestMeanDiff = Number.POSITIVE_INFINITY

  for (const value of array) {
    if (!filter(value)) {
      continue
    }

    if (filteredIndex > maxIndex) {
      break
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
      closestMean = incrementalMean
    }
  }

  return closestMean
}

// Find the index of the first `incrementalMean` between `incrementalMeanMin`
// and `incrementalMax`.
export const findHotIndex = (
  array,
  { minIndex, filter, incrementalMeanMin, incrementalMeanMax },
) => {
  let sum = 0
  let filteredIndex = 0
  let incrementalMean = 0

  for (const value of array) {
    if (!filter(value)) {
      continue
    }

    filteredIndex += 1
    sum += value

    if (filteredIndex <= minIndex) {
      continue
    }

    incrementalMean = sum / filteredIndex

    if (
      incrementalMean >= incrementalMeanMin &&
      incrementalMean <= incrementalMeanMax
    ) {
      break
    }
  }

  return filteredIndex - 1
}
/* eslint-enable max-statements, complexity, fp/no-let, fp/no-loops,
   fp/no-mutation, max-depth, no-continue */
