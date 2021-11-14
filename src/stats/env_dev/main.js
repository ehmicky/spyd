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

  const meanRatio = computeMeanRatio(groups)
  const envDev = Math.sqrt(meanRatio)
  return { envDev, groups }
}

const returnTrue = function () {
  return true
}

const getGroupsCount = function (length) {
  return Math.floor(
    Math.log(length / MIN_GROUP_SIZE) / Math.log(CLUSTER_FACTOR),
  )
}

const getClusterSizes = function (groupsCount) {
  return Array.from({ length: groupsCount }, getClusterSize)
}

const getClusterSize = function (_, index) {
  return CLUSTER_FACTOR ** (index + 1)
}

// Minimum `groupSize`
// A higher value lowers accuracy:
//  - The result `envDev` will be lower than the real value
//  - This is because more `array` elements are required to reach the `period`
//    with the highest `varianceRatio`
//  - This means multiplying this constant by `n` requires running the benchmark
//    `n` times longer to get the same `envDev`
// A lower value lowers precision:
//  - This is because groups with a lower groupSize are less precise
//  - This is especially visible in preview mode, especially when a new group
//    is added
//     - This is because the last group are less precise.
//     - Also, new groups generally have higher `varianceRatio` if the `period`
//       has not reached yet, so each new group will make `envDev` increase
//       until it reaches its optimal value.
// In our case, `envDev` is already generally too low, so we favor accuracy over
// precision.
// However, this does mean `envDev` tends to vary quite a lot between runs.
const MIN_GROUP_SIZE = 2
// A lower value:
//  - Is slower to compute
//     - Using `CLUSTER_FACTOR ** n` divides the time complexity by `sqrt(n)`
//  - Leads to an overall slightly worse accuracy
// A higher value:
//  - Leads to much poorer accuracy and precision when the `period` is close to
//    the `array.length`
//     - Specifically when `period` > `array.length` / (CLUSTER_FACTOR ** 2)
// We must also ensure that CLUSTER_FACTOR ** MAX_ARGUMENTS >= MAX_SAMPLES
//  - MAX_ARGUMENTS is the maximum number of arguments to Math.max(): 123182
//  - MAX_SAMPLES is the maximum number of array elements: 123182
//  - Otherwise, `Math.max(...groups)` would crash
// Using an integer >= 2 allows several implementation performance optimizations
export const CLUSTER_FACTOR = 2

const computeGroups = function ({
  array,
  clusterSizes,
  mean,
  variance,
  filter,
}) {
  const groups = getInitGroups(clusterSizes, mean)
  const length = iterateOnGroups({ groups, array, filter })
  const filteredGroupsCount = getGroupsCount(length)
  return groups
    .slice(0, filteredGroupsCount)
    .map((group) => getFinalGroup(group, length, variance))
}

// The final `clusterSize` is a performance optimization so that the actual last
// group can assign `parentGroup.sum` without checking if it is `undefined`.
const getInitGroups = function (clusterSizes, mean) {
  const clusterSizesA = [...clusterSizes, 0]
  return clusterSizesA.map((clusterSize) => getInitGroup(clusterSize, mean))
}

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

// `varianceRatio` follows a chi-squared distribution with `groupSize - 1`
// degrees of freedom
//   - `varianceMin|varianceMax` confidence interval is computed accordingly
// We purposely use variances and not standard deviations:
//   - Standard deviation estimation has a slight bias when the size is low
//     See https://en.wikipedia.org/wiki/Unbiased_estimation_of_standard_deviation
//   - This would be important here since bigger groups would be more likely to
//     be selected
// However, we return the final ratio as a standard deviation:
//   - Since it is easier to relate to for humans
//   - Even though it has a slight bias if the group sizes were low because:
//      - The bias is:
//         - Smaller when multiple groups have been selected
//         - Smaller when selected groups have a higher size
//         - Small even in none of the above applies
//      - Correcting the bias for standard deviations would create a bias for
//        variances
//         - Instead, consumers can correct this bias themselves, if needed
//           (which is most likely not the case)
//      - This is simpler implementation-wise
// `varianceRatio` is:
//  - accurate for any `groupSize`, i.e. its average value is correct
//  - imprecise with lower `groupSize`, i.e. its confidence interval is wider
// We take the imprecision into account, so that groups of low `groupSize` are
// not picked more often than they should.
const getFinalGroup = function (
  { clusterSize, deviationSum },
  length,
  variance,
) {
  const groupSize = Math.floor(length / clusterSize)
  const groupVariance = deviationSum / (groupSize - 1)
  const expectedVariance = variance * clusterSize
  const varianceRatio = groupVariance / expectedVariance
  const varianceMin =
    groupVariance * getChiSquaredValue(groupSize, SIGNIFICANCE_LEVEL_MIN)
  const varianceRatioMin = varianceMin / expectedVariance
  const varianceMax =
    groupVariance * getChiSquaredValue(groupSize, SIGNIFICANCE_LEVEL_MAX)
  const varianceRatioMax = varianceMax / expectedVariance
  return { varianceRatioMin, varianceRatio, varianceRatioMax }
}

// The `varianceRatio` tends to increase with lower `groupSize`
//   - It eventually somewhat stabilizes after reaching a maximum value
//   - That maximum value is the one we want to return
//   - The `groupSize` which tends to give it is "optimal"
// However, the population's "optimal" `groupSize` might differ from the
// sample's
//   - i.e. it must be estimated with both accuracy and precision
// Groups with `groupSize`:
//   - Higher than the "optimal" one have lower `varianceRatio`
//      - i.e. should be avoided as they would return inaccurate results
//      - Therefore, we use a collection of groups with the highest
//        `varianceRatio`s
//   - Lower than the "optimal" one are less precise
//      - i.e. should be avoided as they would make the return value less
//        precise as well
//      - Therefore, we only use the group with the maximum `groupSize` in that
//        collection
//      - In particular, we do not use an average of several of likely "optimal"
//        groups
// Since `array` are an estimate of the population, so is each group's
// variance
//   - Each group's variance's estimation follows a chi-squared distribution
//   - Therefore, the sample's group with the maximum `varianceRatio` might be
//     due to the imprecision of that group's variance
// We correct this by finding a collection of contiguous groups with maximum
// `varianceRatio` instead
//   - Each group in the collection must have roughly the same `variationRatio`,
//     after taking their precision into account
//      - We compute the collection's mean `variationRatio` and ensure it is
//        within each group's confidence interval
//   - We allow a small percentage of groups to not fit, based on the confidence
//     interval
//      - This ensures changing the CLUSTER_FACTOR does not change the result
//        too much
//      - However, we require each end of the collection of groups to fit,
//        since having wrong ends does not make sense
// We try to find the largest collection with contiguous groups:
//   - We look for contiguous groups with the same `varianceRatio` as the
//     maximum `varianceRatio`
//   - We only look for contiguous groups with higher `groupSize`s
//      - Because groups with lower `groupSize` do not improve accuracy nor
//        precision
const computeMeanRatio = function (groups) {
  const varianceRatios = groups.map(getGroupVarianceRatio)
  const maxVarianceRatio = Math.max(...varianceRatios)
  const maxIndex = varianceRatios.indexOf(maxVarianceRatio)
  const varianceRatioMean = getVarianceRatioMean(
    groups,
    varianceRatios,
    maxIndex,
  )
  return Math.max(varianceRatioMean, MIN_ENV_DEV)
}

const getGroupVarianceRatio = function ({ varianceRatio }) {
  return varianceRatio
}

const getVarianceRatioMean = function (groups, varianceRatios, maxIndex) {
  const startIndex = 0
  // eslint-disable-next-line fp/no-let
  let varianceRatioSum = getSum(varianceRatios, startIndex, maxIndex)

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let minIndex = startIndex; minIndex < maxIndex; minIndex += 1) {
    const collLength = maxIndex + 1 - minIndex
    const varianceRatioMean = varianceRatioSum / collLength

    if (isValidColl(groups, varianceRatioMean, maxIndex, minIndex)) {
      return varianceRatioMean
    }

    // eslint-disable-next-line fp/no-mutation
    varianceRatioSum -= varianceRatios[minIndex]
  }

  return groups[maxIndex].varianceRatio
}

const isValidColl = function (groups, varianceRatioMean, maxIndex, minIndex) {
  return (
    isValidGroup(groups[maxIndex], varianceRatioMean) &&
    isValidGroup(groups[minIndex], varianceRatioMean) &&
    isValidMidGroups(groups, varianceRatioMean, maxIndex, minIndex)
  )
}

const isValidMidGroups = function (
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
    if (!isValidGroup(groups[collIndex], varianceRatioMean)) {
      invalidMax -= 1
    }

    if (invalidMax === -1) {
      return false
    }
  }

  return true
}

const isValidGroup = function (
  { varianceRatioMin, varianceRatioMax },
  varianceRatioMean,
) {
  return (
    varianceRatioMean >= varianceRatioMin &&
    varianceRatioMean <= varianceRatioMax
  )
}

// All varianceRatios might be <1 if either:
//   - The number of elements is smaller than CLUSTER_FACTOR * MIN_GROUP_SIZE,
//     i.e. no groups can be used
//   - When the distribution measures are fully independent from each other
//   - In some rare cases with odd distributions
// In those cases, we default to returning 1
const MIN_ENV_DEV = 1

// Significance level when computing the confidence interval of each group's
// variance.
// A lower value decrease precision and accuracy.
// A higher value decreases accuracy when `period` is close to `array.length`
const SIGNIFICANCE_LEVEL = 0.95
const SIGNIFICANCE_LEVEL_INV = 1 - SIGNIFICANCE_LEVEL
const SIGNIFICANCE_LEVEL_MIN = (1 - SIGNIFICANCE_LEVEL) / 2
const SIGNIFICANCE_LEVEL_MAX = 1 - SIGNIFICANCE_LEVEL_MIN
/* eslint-enable max-lines */
