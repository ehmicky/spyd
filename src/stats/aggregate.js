import { sortNumbers } from './sort.js'

export const aggregateMeasures = function (processMeasures) {
  const measures = aggregateProcessMeasures(processMeasures)
  sortNumbers(measures)
  return measures
}

// We do not use `[].concat(...processMeasures)` because it creates a stack
// overflow if `processMeasures.length` is too large (~1e5 on my machine)
const aggregateProcessMeasures = function (processMeasures) {
  return processMeasures.flatMap(getChildMeasures)
}

const getChildMeasures = function (childMeasures) {
  return childMeasures
}
