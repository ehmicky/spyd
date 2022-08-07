import { getChiSquaredValue } from '../critical_values/chi_squared.js'

import { getGroupsCount } from './size.js'

// For each group, slice `array` into several clusters containing exactly
// `clusterSize` elements. Each group has a specific `clusterSize`.
// Then, sum the elements of each cluster and compute the variance of all
// clusters within each group.
export const computeGroups = function ({
  array,
  clusterSizes,
  mean,
  variance,
  filter,
}) {
  const groups = getInitGroups(clusterSizes, mean)
  const filteredLength = iterateOnGroups({ groups, array, filter })
  const filteredGroupsCount = getGroupsCount(filteredLength)
  return groups
    .slice(0, filteredGroupsCount)
    .map((group) => getFinalGroup(group, filteredLength, variance))
}

// Initialize `groups`.
// The final `clusterSize` 0 is a performance optimization so that the actual
// last group can assign `parentGroup.sum` without checking if it is
// `undefined`.
const getInitGroups = function (clusterSizes, mean) {
  const clusterSizesA = [...clusterSizes, 0]
  return clusterSizesA.map((clusterSize) => getInitGroup(clusterSize, mean))
}

// `groupMean` is the mean of all clusters of this group
const getInitGroup = function (clusterSize, mean) {
  const groupMean = mean * clusterSize
  return { clusterSize, groupMean, sum: 0, deviationSum: 0 }
}

// This is optimized for performance, which explains the imperative code.
// This is also optimized for memory, avoiding creating intermediary arrays.
/* eslint-disable fp/no-mutation, fp/no-let, fp/no-loops, no-param-reassign,
   max-depth, no-continue */
// eslint-disable-next-line max-statements
const iterateOnGroups = function ({
  groups,
  groups: [firstGroup],
  array,
  array: { length },
  filter,
}) {
  let valueIndex = 0

  for (let index = 0; index < length; index += 1) {
    const value = array[index]

    if (!filter(value)) {
      continue
    }

    firstGroup.sum += value
    valueIndex += 1

    for (
      let groupIndex = 0, parentGroup = firstGroup;
      valueIndex % parentGroup.clusterSize === 0;
      groupIndex += 1
    ) {
      const group = parentGroup
      parentGroup = groups[groupIndex + 1]
      parentGroup.sum += group.sum
      group.deviationSum += (group.sum - group.groupMean) ** 2
      group.sum = 0
    }
  }

  return valueIndex
}
/* eslint-enable fp/no-mutation, fp/no-let, fp/no-loops, no-param-reassign,
   max-depth, no-continue */

// Compute the `varianceRatio` of each group.
//  - This is the ratio between what the clusters variance:
//     - Actually is (`groupVariance`)
//     - And should be (`expectedVariance`), if the `array` elements were fully
//       independent from each other
//  - In other words, this computes the amount of dependence of `array` elements
//    with each other.
// We purposely use variances and not standard deviations:
//  - Standard deviation estimation has a slight bias when the size is low.
//    See https://en.wikipedia.org/wiki/Unbiased_estimation_of_standard_deviation
//  - This would be important here since bigger groups would be more likely to
//    be selected
// However, we return the final ratio as a standard deviation:
//  - Since it is easier to relate to for humans
//  - Even though it has a slight bias if the group sizes were low because:
//     - The bias is:
//        - Smaller when multiple groups have been selected
//        - Smaller when selected groups have a higher size
//        - Small even in none of the above applies
//     - Correcting the bias for standard deviations would create a bias for
//       variances
//        - Instead, consumers can correct this bias themselves, if needed
//          (which is most likely not the case)
//     - This is simpler implementation-wise
const getFinalGroup = function (
  { clusterSize, deviationSum },
  filteredLength,
  variance,
) {
  const groupSize = Math.floor(filteredLength / clusterSize)
  const groupVariance = deviationSum / (groupSize - 1)
  const expectedVariance = variance * clusterSize
  const varianceRatio = groupVariance / expectedVariance
  const { varianceRatioMin, varianceRatioMax } = getConfidenceInterval(
    groupSize,
    groupVariance,
    expectedVariance,
  )
  return { varianceRatioMin, varianceRatio, varianceRatioMax }
}

// `varianceRatio` does not have any accuracy bias, for any `groupSize`
//  - i.e. its average value is correct
// However, it is imprecise:
//  - We compute the confidence interval `varianceRatioMin|Max`
//  - Groups with a lower `groupSize` are less precise.
//     - We take this into account, so that groups of low `groupSize` are not
//       picked more often than they should.
//  - This follows a chi-squared distribution with `groupSize - 1` degrees of
//    freedom
const getConfidenceInterval = function (
  groupSize,
  groupVariance,
  expectedVariance,
) {
  const varianceMin =
    groupVariance * getChiSquaredValue(groupSize, SIGNIFICANCE_LEVEL_MIN)
  const varianceRatioMin = varianceMin / expectedVariance
  const varianceMax =
    groupVariance * getChiSquaredValue(groupSize, SIGNIFICANCE_LEVEL_MAX)
  const varianceRatioMax = varianceMax / expectedVariance
  return { varianceRatioMin, varianceRatioMax }
}

// Significance level when computing the confidence interval of each group's
// variance.
// A lower value decreases precision and accuracy.
// A higher value decreases accuracy when the "optimal" size is close to
// `array.length`
export const SIGNIFICANCE_LEVEL = 0.95
const SIGNIFICANCE_LEVEL_MIN = (1 - SIGNIFICANCE_LEVEL) / 2
const SIGNIFICANCE_LEVEL_MAX = 1 - SIGNIFICANCE_LEVEL_MIN
