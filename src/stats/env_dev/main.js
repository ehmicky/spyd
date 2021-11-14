/* eslint-disable max-lines */
import { getChiSquaredValue } from '../critical_values/chi_squared.js'
import { getMean, getSum } from '../sum.js'
import { getVariance } from '../variance.js'

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

// Retrieve the number of groups to compute.
// Groups are divided into clusters of elements.
// Each group has `CLUSTER_FACTOR` more elements per cluster than the previous
// one.
const getGroupsCount = function (length) {
  return Math.floor(
    Math.log(length / MIN_GROUP_SIZE) / Math.log(CLUSTER_FACTOR),
  )
}

// Retrieve the `clusterSize`, i.e. number of elements per cluster, of each
// group.
const getClusterSizes = function (groupsCount) {
  return Array.from({ length: groupsCount }, getClusterSize)
}

const getClusterSize = function (_, index) {
  return CLUSTER_FACTOR ** (index + 1)
}

// Minimum `groupSize`
// A higher value lowers accuracy:
//  - The result `envDev` will be lower than the real value
//  - This is because more `array` elements are required to reach the "optimal"
//    size.
//  - This means multiplying this constant by `n` requires running the benchmark
//    `n` times longer to get the same `envDev`
// A lower value lowers precision:
//  - This is because groups with a lower groupSize are less precise
//  - This is especially visible in preview mode, especially when a new group
//    is added
//     - This is because the last group are less precise.
//     - Also, new groups generally have higher `varianceRatio` if the "optimal"
//       size has not been reached yet, so each new group will make `envDev`
//       increase until it reaches its optimal value.
// In general, `envDev` tends to be generally too low, so we favor accuracy over
// precision.
// However, this does mean `envDev` tends to vary quite a lot between different
// `array`.
const MIN_GROUP_SIZE = 2

// Each group has `CLUSTER_FACTOR` more elements per cluster than the previous
// one.
// A lower value:
//  - Is slower to compute
//     - Using `CLUSTER_FACTOR ** n` divides the time complexity by `sqrt(n)`
//  - Leads to an overall slightly worse accuracy
// A higher value:
//  - Leads to much poorer accuracy and precision when the "optimal" size is
//    close to the `array.length`
//     - Specifically when that "optimal" size is higher than
//       `array.length` / (CLUSTER_FACTOR ** 2)
// We must also ensure that `CLUSTER_FACTOR ** MAX_ARGUMENTS >= MAX_SAMPLES`
//  - MAX_ARGUMENTS is the maximum number of arguments to Math.max(): 123182
//  - MAX_SAMPLES is the maximum number of array elements: 123182
//  - Otherwise, `Math.max(...groups)` would crash
// Using an integer >= 2 allows several implementation performance optimizations
export const CLUSTER_FACTOR = 2

// For each group, slice `array` into several clusters containing exactly
// `clusterSize` elements. Each group has a specific `clusterSize`.
// Then, sum the elements of each cluster and compute the variance of all
// clusters within each group.
const computeGroups = function ({
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
// The final `clusterSize` is a performance optimization so that the actual last
// group can assign `parentGroup.sum` without checking if it is `undefined`.
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
  let invalidMax = Math.floor(collLength * SIGNIFICANCE_LEVEL_INV)

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

// Significance level when computing the confidence interval of each group's
// variance.
// A lower value decrease precision and accuracy.
// A higher value decreases accuracy when the "optimal" size is close to
// `array.length`
const SIGNIFICANCE_LEVEL = 0.95
const SIGNIFICANCE_LEVEL_INV = 1 - SIGNIFICANCE_LEVEL
const SIGNIFICANCE_LEVEL_MIN = (1 - SIGNIFICANCE_LEVEL) / 2
const SIGNIFICANCE_LEVEL_MAX = 1 - SIGNIFICANCE_LEVEL_MIN
/* eslint-enable max-lines */
