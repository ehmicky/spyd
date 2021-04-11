import { getStats } from '../stats/get.js'
import { mergeSort } from '../stats/merge.js'

import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Returns initial `sampleState`
export const getInitialSampleState = function () {
  return {
    measures: [],
    allSamples: 0,
    repeat: 1,
    calibrated: false,
    totalDuration: 0,
  }
}

// Update sampleState because on the return value from the last sample
export const getSampleState = function ({
  stats,
  sampleState,
  sampleState: { measures, allSamples, repeat, calibrated },
  returnValue: { measures: sampleMeasures },
  minLoopDuration,
}) {
  if (sampleMeasures === undefined) {
    return {}
  }

  const {
    sampleMeasures: sampleMeasuresA,
    sampleMedian,
    sampleLoops,
  } = normalizeSampleMeasures(sampleMeasures, repeat)

  const { newRepeat, calibrated: calibratedA } = handleRepeat({
    repeat,
    sampleMedian,
    minLoopDuration,
    allSamples,
    calibrated,
  })
  const { measures: measuresA, hasNewMeasures } = addSampleMeasures(
    measures,
    sampleMeasuresA,
    calibratedA,
  )
  const sampleStateA = {
    ...sampleState,
    measures: measuresA,
    allSamples: allSamples + 1,
    sampleLoops,
    repeat: newRepeat,
    repeatLast: repeat,
    calibrated: calibratedA,
  }
  const statsA = addStats({
    stats,
    measures: measuresA,
    sampleLoops,
    repeat,
    minLoopDuration,
    hasNewMeasures,
  })
  return { stats: statsA, sampleState: sampleStateA }
}

const addSampleMeasures = function (measures, sampleMeasures, calibrated) {
  const hasNewMeasures = calibrated

  if (!hasNewMeasures) {
    return { measures, hasNewMeasures }
  }

  mergeSort(measures, sampleMeasures)
  return { measures, hasNewMeasures }
}

const addStats = function ({
  stats,
  measures,
  sampleLoops,
  repeat,
  minLoopDuration,
  hasNewMeasures,
}) {
  if (!hasNewMeasures) {
    return stats
  }

  return getStats({ stats, measures, sampleLoops, repeat, minLoopDuration })
}
