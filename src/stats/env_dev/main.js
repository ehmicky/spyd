import { getMean } from '../sum.js'
import { getVariance } from '../variance.js'

import { computeGroups } from './groups.js'
import { getOptimalVarianceRatio } from './optimal.js'
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

  const optimalVarianceRatio = getOptimalVarianceRatio(groups)
  const envDev = computeEnvDev(optimalVarianceRatio)
  return { envDev, groups }
}

const returnTrue = function () {
  return true
}

const computeEnvDev = function (optimalVarianceRatio) {
  const envDevSquared = Math.max(optimalVarianceRatio, MIN_ENV_DEV)
  return Math.sqrt(envDevSquared)
}

// Minimum value, returned when:
//  - The number of elements is smaller than CLUSTER_FACTOR * MIN_GROUP_SIZE,
//    i.e. no groups can be used
//  - All varianceRatios are very low due to either:
//     - The `array` elements being fully independent from each other
//     - Some odd distribution, in some rare cases
const MIN_ENV_DEV = 1
