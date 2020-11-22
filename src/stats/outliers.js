import { getSum } from './methods.js'
import { sortNumbers } from './sort.js'

// The slowest measures are due to external factors:
//   - OS or runtime background periodic processes (such as garbage collection)
//   - The first measures of a specific task in a given process are slow because
//     the runtimes did not optimize it yet
//   - The first processes have not reached the final stabilized `repeat` and
//     `maxDuration`, making them usually slower
export const removeOutliers = function (processMeasures) {
  const processMeasuresA = removeOutlierProcesses(processMeasures)
  const { measures, outliersMax } = removeOutlierMeasures(processMeasuresA)
  const count = getCount(processMeasuresA, outliersMax)
  const processes = processMeasuresA.length
  return { measures, count, processes }
}

// Remove initial `repeat` callibration
const removeOutlierProcesses = function (processMeasures) {
  const repeatCallbrationIndex = processMeasures.findIndex(isRepeatCallibration)

  if (repeatCallbrationIndex === -1) {
    return processMeasures
  }

  return processMeasures.slice(repeatCallbrationIndex + 1)
}

const isRepeatCallibration = function ({ repeat }, index, processMeasures) {
  return (
    repeat === 1 &&
    index !== processMeasures.length - 1 &&
    processMeasures[index + 1].repeat !== 1
  )
}

const removeOutlierMeasures = function (processMeasures) {
  const measures = aggregateMeasures(processMeasures)
  sortNumbers(measures)

  const outliersLimit = Math.ceil(measures.length * (1 - OUTLIERS_THRESHOLD))
  const outliersMax = measures[outliersLimit]
  const measuresA = measures.slice(0, outliersLimit)
  return { measures: measuresA, outliersMax }
}

// We do not use `[].concat(...processMeasures)` because it creates a stack
// overflow if `processMeasures.length` is too large (~1e5 on my machine)
const aggregateMeasures = function (processMeasures) {
  return processMeasures.flatMap(getChildMeasures)
}

const getChildMeasures = function ({ childMeasures }) {
  return childMeasures
}

// How many outliers to remove.
// A lower value removes fewer outliers, which increases variance.
// A higher value removes more measures, which decreases accuracy.
const OUTLIERS_THRESHOLD = 0.15

// Retrieve the number of measures the task was measured, including inside a
// repeated loop. Takes into account the fact that some measures were removed
// as outliers.
const getCount = function (processMeasures, outliersMax) {
  const processCounts = processMeasures.map(({ childMeasures, repeat }) =>
    getProcessCount({ childMeasures, repeat, outliersMax }),
  )
  return getSum(processCounts)
}

const getProcessCount = function ({ childMeasures, repeat, outliersMax }) {
  return childMeasures.filter((time) => time < outliersMax).length * repeat
}
