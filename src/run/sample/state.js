import { appendArray } from '../../stats/append.js'
import { mergeSort } from '../../stats/merge.js'

import { getMaxLoops } from './max_loops.js'
import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'
import { getTimeDuration } from './time_duration.js'

// Returns initial `sampleState`
export const getInitialSampleState = () => ({
  measures: [],
  unsortedMeasures: [],
  allSamples: 0,
  repeat: 1,
  calibrated: false,
  timeDurations: [],
  coldLoopsTarget: 0,
})

// Update sampleState because on the return value from the last sample
export const getSampleState = (
  { measures, unsortedMeasures, allSamples, repeat, calibrated, timeDurations },
  { measures: sampleMeasures },
  { minLoopDuration, measureDuration, targetSampleDuration },
) => {
  const {
    sampleSortedMeasures,
    sampleUnsortedMeasures,
    sampleMedian,
    sampleLoops,
    sampleTimes,
  } = normalizeSampleMeasures(sampleMeasures, repeat)
  const { newRepeat, calibrated: calibratedA } = handleRepeat({
    repeat,
    sampleMedian,
    minLoopDuration,
    allSamples,
    calibrated,
  })
  const [measuresA, unsortedMeasuresA] = addSampleMeasures({
    measures,
    unsortedMeasures,
    sampleSortedMeasures,
    sampleUnsortedMeasures,
    calibrated,
  })
  const { timeDurations: timeDurationsA, timeDurationMean } = getTimeDuration({
    timeDurations,
    measureDuration,
    sampleTimes,
    calibrated: calibratedA,
  })
  const maxLoops = getMaxLoops({
    newRepeat,
    measures: measuresA,
    timeDurationMean,
    targetSampleDuration,
  })
  return {
    measures: measuresA,
    unsortedMeasures: unsortedMeasuresA,
    allSamples: allSamples + 1,
    sampleLoops,
    sampleTimes,
    repeat: newRepeat,
    maxLoops,
    calibrated: calibratedA,
    timeDurations: timeDurationsA,
  }
}

// Appends `sampleSortedMeasures` to `measures`.
// Sort them incrementally to the final `measures` big array, as opposed to
// sorting `measures` directly, which would be much slower.
// Also appends `sampleUnsortedMeasures` to `unsortedMeasures` but without
// sorting.
const addSampleMeasures = ({
  measures,
  unsortedMeasures,
  sampleSortedMeasures,
  sampleUnsortedMeasures,
  calibrated,
}) => {
  if (!calibrated) {
    return [measures, unsortedMeasures]
  }

  mergeSort(measures, sampleSortedMeasures)
  appendArray(unsortedMeasures, sampleUnsortedMeasures)
  return [measures, unsortedMeasures]
}
