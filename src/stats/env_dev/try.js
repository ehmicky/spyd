import { getQuantile } from '../quantile.js'
import { getVariance } from '../stdev.js'
import { getMean } from '../sum.js'

import { getEnvDev, CLUSTER_FACTOR } from './main.js'
import { getSamples } from './samples.js'

const sortNumbers = function (a, b) {
  return a - b
}

const realStdevA = 10
const realMeanA = 100
const realStdevB = 40
const realMeanB = 200
const realLength = 2 ** 12
const samplesCount = 1e3
const realMean = realMeanA * realMeanB

const realPeriods = new Set([])
const maxRealPeriodBase = Math.log(realLength) / Math.log(CLUSTER_FACTOR)
const meanRatiosAccuracies = []
const meanRatiosRstdevs = []

for (
  let realPeriodBase = 0;
  realPeriodBase < maxRealPeriodBase;
  realPeriodBase += 1
) {
  const halfRealPeriod =
    (CLUSTER_FACTOR ** (realPeriodBase + 1) -
      CLUSTER_FACTOR ** realPeriodBase) /
    2
  const addedRealPeriods = [0, halfRealPeriod]

  for (const addedRealPeriod of addedRealPeriods) {
    const realPeriod = Math.round(
      CLUSTER_FACTOR ** realPeriodBase + addedRealPeriod,
    )

    if (realPeriods.has(realPeriod)) {
      continue
    }

    realPeriods.add(realPeriod)
    // const realPeriod = 2 ** 6

    const meanRatiosProps = Array.from({ length: samplesCount }, () => {
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
    const meanRatios = meanRatiosProps.map(
      ({ meanStdevRatio }) => meanStdevRatio,
    )
    const allGroups = meanRatiosProps.map(({ groups }) =>
      groups.map(({ varianceRatio }) => Math.sqrt(varianceRatio)),
    )
    const groupMedians = Array.from(
      { length: allGroups[0].length },
      (_, index) => {
        const indexGroups = allGroups.map((groups) => groups[index])
        const groupMedian = getQuantile(
          [...indexGroups].sort(sortNumbers),
          0.5,
          {},
        )
        return groupMedian
      },
    )
    const realMeanRatio = Math.max(...groupMedians)
    const meanRatiosMean = getMean(meanRatios)
    const meanRatiosP01 = getQuantile(
      [...meanRatios].sort(sortNumbers),
      0.001,
      {},
    )
    const meanRatiosP1 = getQuantile(
      [...meanRatios].sort(sortNumbers),
      0.01,
      {},
    )
    const meanRatiosP5 = getQuantile(
      [...meanRatios].sort(sortNumbers),
      0.05,
      {},
    )
    const meanRatiosMedian = getQuantile(
      [...meanRatios].sort(sortNumbers),
      0.5,
      {},
    )
    const meanRatiosP95 = getQuantile(
      [...meanRatios].sort(sortNumbers),
      0.95,
      {},
    )
    const meanRatiosP99 = getQuantile(
      [...meanRatios].sort(sortNumbers),
      0.99,
      {},
    )
    const meanRatiosP999 = getQuantile(
      [...meanRatios].sort(sortNumbers),
      0.999,
      {},
    )
    const meanRatiosStdev = Math.sqrt(
      getVariance(meanRatios, { mean: meanRatiosMean }),
    )
    const meanRatiosRstdev =
      Math.sqrt(getVariance(meanRatios, { mean: meanRatiosMean })) /
      meanRatiosMedian
    const meanRatiosAccuracy = meanRatiosMedian / realMeanRatio
    meanRatiosAccuracies.push(meanRatiosAccuracy)
    meanRatiosRstdevs.push(meanRatiosRstdev)
    //
    // console.log([
    // realPeriod,
    // ...[
    //     meanRatiosAccuracy,
    //     meanRatiosRstdev,
    //     meanRatiosP01,
    //     meanRatiosP1,
    //     meanRatiosP5,
    //     meanRatiosP95,
    //     meanRatiosP99,
    //     meanRatiosP999,
    //     meanRatiosStdev,
    //     meanRatiosMean,
    //     meanRatiosMedian,
    //     realMeanRatio,
    // ].map(float => float.toFixed(2))
    // ].map(value => String(value).padStart(5)).join(' '))
    //
  }
}

console.log(`${[...realPeriods]
  .map((float) => String(float).padStart(5))
  .join(' ')}
${meanRatiosAccuracies.map((float) => float.toFixed(2).padStart(5)).join(' ')}
${meanRatiosRstdevs.map((float) => float.toFixed(2).padStart(5)).join(' ')}`)
