/* eslint-disable max-lines */
import { getMean, getSum } from '../sum.js'
import { getVariance } from '../variance.js'

import { computeGroups, SIGNIFICANCE_LEVEL } from './groups.js'
import { getGroupsCount, getClusterSizes } from './size.js'

export const getEnvDev = function (
  array,
  {
    mean = getMean(array),
    variance = getVariance(array, { mean }),
    filter = returnTrue,
  } = {},
) {
  const groupsCount = getGroupsCount(array.length)

  if (groupsCount <= 0) {
    return { envDev: MIN_ENV_DEV, groups: [] }
  }

  const clusterSizes = getClusterSizes(groupsCount)
  const groups = computeGroups({
    array,
    clusterSizes,
    mean,
    variance,
    filter,
  })

  if (groups.length === 0) {
    return { envDev: MIN_ENV_DEV, groups: [] }
  }

  const envDev = computeEnvDev(groups)
  return { envDev, groups }
}

const returnTrue = function () {
  return true
}

// The `varianceRatio` tends to increase with lower `groupSize`
//   - It eventually somewhat stabilizes at a specific `groupSize`
//     (the "optimal" size) after reaching a maximum value
//   - That maximum value is the one we want to return
// However, the population's "optimal" size might differ from the sample's
//   - i.e. it must be estimated with both accuracy and precision
// We want to ignore groups with a `groupSize` either:
//   - Higher than the "optimal" one since they have lower `varianceRatio` and
//     would return inaccurate results
//   - Lower than the "optimal" one since they are less precise and would make
//     the return value less precise as well
//      - In particular, their lack of precision makes them more likely to
//        contain both very low and high `varianceRatios`
//      - Therefore, the sample's group with the maximum `varianceRatio` might
//        be due to the imprecision of that group
// We fix this by:
//   - Finding the group with the highest `varianceRatio`
//   - Finding any contiguous lower groups with roughly the same `varianceRatio`
//      - According to chi-squared distribution confidence intervals
//      - We do not look for contiguous higher groups since they do not improve
//        accuracy nor precision
//   - Taking their arithmetic mean
const computeEnvDev = function (groups) {
  const varianceRatios = groups.map(getGroupVarianceRatio)
  const maxVarianceRatio = Math.max(...varianceRatios)
  const maxIndex = varianceRatios.indexOf(maxVarianceRatio)
  const varianceRatioMean = getVarianceRatioMean(
    groups,
    varianceRatios,
    maxIndex,
  )
  const envDevSquared = Math.max(varianceRatioMean, MIN_ENV_DEV)
  return Math.sqrt(envDevSquared)
}

const getGroupVarianceRatio = function ({ varianceRatio }) {
  return varianceRatio
}

// Look for groups contiguous to the group at `maxIndex` with the same
// `varianceRatio`, according to confidence intervals, then take their mean.
// This uses imperative logic for performance reasons.
//  - This includes performing the mean incrementally
const getVarianceRatioMean = function (groups, varianceRatios, maxIndex) {
  const startIndex = 0
  // eslint-disable-next-line fp/no-let
  let varianceRatioSum = getSum(varianceRatios, startIndex, maxIndex)

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let minIndex = startIndex; minIndex < maxIndex; minIndex += 1) {
    const collLength = maxIndex + 1 - minIndex
    const varianceRatioMean = varianceRatioSum / collLength

    // eslint-disable-next-line max-depth
    if (areSimilarGroups(groups, varianceRatioMean, maxIndex, minIndex)) {
      return varianceRatioMean
    }

    // eslint-disable-next-line fp/no-mutation
    varianceRatioSum -= varianceRatios[minIndex]
  }

  return groups[maxIndex].varianceRatio
}

// Check whether the group has roughly the same `varianceRatio` as the other
// groups of the collection.
// We allow a small percentage of groups to not fit (`invalidMax`):
//  - This ensures changing the `CLUSTER_FACTOR` does not change the result too
//    much
//  - However, we require each end of the collection of groups to fit, since
//    having wrong ends does not make sense
// eslint-disable-next-line max-params
const areSimilarGroups = function (
  groups,
  varianceRatioMean,
  maxIndex,
  minIndex,
) {
  return (
    isSimilarGroup(groups[maxIndex], varianceRatioMean) &&
    isSimilarGroup(groups[minIndex], varianceRatioMean) &&
    areSimilarMidGroups(groups, varianceRatioMean, maxIndex, minIndex)
  )
}

// eslint-disable-next-line max-params
const areSimilarMidGroups = function (
  groups,
  varianceRatioMean,
  maxIndex,
  minIndex,
) {
  const collLength = maxIndex + 1 - minIndex
  // eslint-disable-next-line fp/no-let
  let invalidMax = Math.floor(collLength * (1 - SIGNIFICANCE_LEVEL))

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let collIndex = minIndex + 1; collIndex < maxIndex; collIndex += 1) {
    // eslint-disable-next-line max-depth
    if (!isSimilarGroup(groups[collIndex], varianceRatioMean)) {
      // eslint-disable-next-line fp/no-mutation
      invalidMax -= 1
    }

    // eslint-disable-next-line max-depth
    if (invalidMax === -1) {
      return false
    }
  }

  return true
}

// Check confidence interval of `varianceRatio` against a specific group
const isSimilarGroup = function (
  { varianceRatioMin, varianceRatioMax },
  varianceRatioMean,
) {
  return (
    varianceRatioMean >= varianceRatioMin &&
    varianceRatioMean <= varianceRatioMax
  )
}

// Minimum value, returned when:
//  - The number of elements is smaller than CLUSTER_FACTOR * MIN_GROUP_SIZE,
//    i.e. no groups can be used
//  - All varianceRatios are very low due to either:
//     - The `array` elements being fully independent from each other
//     - Some odd distribution, in some rare cases
const MIN_ENV_DEV = 1
/* eslint-enable max-lines */
