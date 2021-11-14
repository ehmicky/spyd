import { getQuantile } from '../quantile.js'
import { getMean } from '../sum.js'
import { getVariance } from '../variance.js'

import { getEnvDev, CLUSTER_FACTOR } from './main.js'
import { getSamples } from './samples.js'

const sortNumbers = function (numA, numB) {
  return numA - numB
}

const realStdevA = 10
const realMeanA = 100
const realStdevB = 40
const realMeanB = 200
// eslint-disable-next-line no-magic-numbers
const realLength = 2 ** 12
const samplesCount = 1e3

const realPeriods = new Set([])
const maxRealPeriodBase = Math.log(realLength) / Math.log(CLUSTER_FACTOR)
const envDevsAccuracies = []
const envDevsRstdevs = []

// eslint-disable-next-line fp/no-loops
for (
  // eslint-disable-next-line fp/no-let
  let realPeriodBase = 0;
  realPeriodBase < maxRealPeriodBase;
  // eslint-disable-next-line fp/no-mutation
  realPeriodBase += 1
) {
  const halfRealPeriod =
    (CLUSTER_FACTOR ** (realPeriodBase + 1) -
      CLUSTER_FACTOR ** realPeriodBase) /
    2
  const addedRealPeriods = [0, halfRealPeriod]

  // eslint-disable-next-line fp/no-loops, max-depth
  for (const addedRealPeriod of addedRealPeriods) {
    const realPeriod = Math.round(
      CLUSTER_FACTOR ** realPeriodBase + addedRealPeriod,
    )

    // eslint-disable-next-line max-depth
    if (realPeriods.has(realPeriod)) {
      // eslint-disable-next-line no-continue
      continue
    }

    realPeriods.add(realPeriod)

    const envDevsProps = Array.from({ length: samplesCount }, () => {
      const samples = getSamples(
        realLength,
        realPeriod,
        realStdevA,
        realMeanA,
        realStdevB,
        realMeanB,
      )
      return getEnvDev(samples)
    })
    const envDevs = envDevsProps.map(({ envDev }) => envDev)
    const allGroups = envDevsProps.map(({ groups }) =>
      // eslint-disable-next-line max-nested-callbacks
      groups.map(({ varianceRatio }) => Math.sqrt(varianceRatio)),
    )
    const groupMedians = Array.from(
      { length: allGroups[0].length },
      (_, index) => {
        // eslint-disable-next-line max-nested-callbacks
        const indexGroups = allGroups.map((groups) => groups[index])
        const groupMedian = getQuantile(
          // eslint-disable-next-line fp/no-mutating-methods
          [...indexGroups].sort(sortNumbers),
          // eslint-disable-next-line no-magic-numbers
          0.5,
          {},
        )
        return groupMedian
      },
    )
    const realEnvDev = Math.max(...groupMedians)
    const envDevsMean = getMean(envDevs)
    const envDevsMedian = getQuantile(
      // eslint-disable-next-line fp/no-mutating-methods
      [...envDevs].sort(sortNumbers),
      // eslint-disable-next-line no-magic-numbers
      0.5,
      {},
    )
    const envDevsRstdev =
      Math.sqrt(getVariance(envDevs, { mean: envDevsMean })) / envDevsMedian
    const envDevsAccuracy = envDevsMedian / realEnvDev
    // eslint-disable-next-line fp/no-mutating-methods
    envDevsAccuracies.push(envDevsAccuracy)
    // eslint-disable-next-line fp/no-mutating-methods
    envDevsRstdevs.push(envDevsRstdev)
  }
}

// eslint-disable-next-line no-restricted-globals, no-console
console.log(`${[...realPeriods]
  // eslint-disable-next-line no-magic-numbers
  .map((float) => String(float).padStart(5))
  .join(' ')}
${
  // eslint-disable-next-line no-magic-numbers
  envDevsAccuracies.map((float) => float.toFixed(2).padStart(5)).join(' ')
}
${
  // eslint-disable-next-line no-magic-numbers
  envDevsRstdevs.map((float) => float.toFixed(2).padStart(5)).join(' ')
}`)
