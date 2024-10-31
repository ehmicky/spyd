import { getMean } from '../sum.js'
import { getVariance } from '../variance.js'

import { computeGroups } from './groups.js'
import { getOptimalVarianceRatio } from './optimal.js'
import { getClusterSizes, getGroupsCount } from './size.js'

// Margin of errors depend on the central limit theorem which requires each
// sample value to be independent from each other.
// However, it is common for array of measures not to be fully independent.
//  - In particular, for nearby measures to be more likely to have similar
//    values
// When this happens, aggregating nearby measures removes this dependency.
// This logic guesses the optimal aggregation size (`envDev`):
//  - High enough to make measures independent from each other
//  - But still as low as possible to keep the sample size high
// This works by grouping the `array` with different `envDev` and comparing the
// resulting variance with what it is expected to be, if the resulting array
// measures were fully independent.
// Consumers can use the result (`envDev`) by dividing it to `sqrt(loops)`
// before performing statistical computation that rely on measures independence
// such as margin of errors.
// This requires `array` to be at least as high as the optimal aggregation size:
//  - I.e. the `precision` configuration property should be high enough.
// The time complexity is `O(log n)` but very close to `O(n)`
// Measures dependency is common when benchmarking tasks.
//  - In principle, the duration of each task's measure is independent.
//  - However, that duration is multiplied by the environment it is running on,
//    both hardware and software
//     - This is stateful, i.e. dependent on time
//  - It is also multiplied by engine optimization
//     - I.e. running a task more tends to make it fast
//     - This is also dependent on time
// The statistical variation only applies to the duration of the task itself,
// not to the environment variation nor engine optimization
//  - I.e. computing the margin of errors without `envDev` is inaccurate
//  - Also, lowering the statistical margin of error does not reduce the
//    environment variation nor engine optimization in itself.
//  - However, a higher sample size does help by:
//     - Aggregating more different environment performance profiles together
//       into a single distribution.
//     - Making unoptimized measures be a smaller percentage of the whole array
// Due to each of those being roughly normal, the resulting distribution tends
// to be lognormal.
// The environment variation can have many causes:
//  - Small changes due to OS optimization and caching
//  - Bigger temporary slowdowns due to recurring OS background processes
//  - Temporary slowdowns due to other programs on the machine either:
//     - Left in background
//     - Interacted with by user while benchmark is running
// `envDev` is only a best effort. The environment variation is hard to measure
// precisely because:
//  - Its frequency is hard to predict: it does not follow clear patterns, and
//    is partially user-driven
//  - Its amplitude is variable: it alternates between periods of high and low
//    precision
//  - Its amplitude is unbounded: it can be arbitrarily high
//  - It continuously shifts
// The environment also depends on some global state which can arbitrarily
// change
//  - For example: OS upgrades, different machines, etc.
//  - This cannot be fixed with `envDev` but instead by:
//     - Using different `system` configuration property to signify environment
//       differences
//     - Keeping the machine load as constant as possible
//        - During the run, e.g. by not using other applications while waiting
//          for the benchmark to end
//        - Between runs, e.g. by using some CI or container
export const getEnvDev = (
  array,
  {
    mean = getMean(array),
    variance = getVariance(array, { mean }),
    filter = defaultFilter,
  } = {},
) => {
  const groupsCount = getGroupsCount(array.length)

  if (groupsCount <= 0 || variance === 0) {
    return MIN_ENV_DEV
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
    return MIN_ENV_DEV
  }

  const optimalVarianceRatio = getOptimalVarianceRatio(groups)
  const envDev = computeEnvDev(optimalVarianceRatio)
  return envDev
}

const defaultFilter = () => true

const computeEnvDev = (optimalVarianceRatio) => {
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
