import { appendArray } from '../../stats/append.js'
import { mergeSort } from '../../stats/merge.js'
import { getMean } from '../../stats/sum.js'

import { getMaxMeasuresLeft } from './max_measures.js'
import { normalizeSampleMeasures } from './normalize.js'
import { handleRepeat } from './repeat.js'

// Returns initial `sampleState`
export const getInitialSampleState = function () {
  return {
    measures: [],
    unsortedMeasures: [],
    allSamples: 0,
    repeat: 1,
    calibrated: false,
    timeDurations: [],
  }
}

// Update sampleState because on the return value from the last sample
export const getSampleState = function (
  { measures, unsortedMeasures, allSamples, repeat, calibrated, timeDurations },
  { measures: sampleMeasures },
  { minLoopDuration, measureDuration, targetSampleDuration },
) {
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
  const { measures: measuresA, unsortedMeasures: unsortedMeasuresA } =
    addSampleMeasures({
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
const addSampleMeasures = function ({
  measures,
  unsortedMeasures,
  sampleSortedMeasures,
  sampleUnsortedMeasures,
  calibrated,
}) {
  if (!calibrated) {
    return { measures, unsortedMeasures }
  }

  mergeSort(measures, sampleSortedMeasures)
  appendArray(unsortedMeasures, sampleUnsortedMeasures)
  return { measures, unsortedMeasures }
}

const getTimeDuration = function ({
  timeDurations,
  measureDuration,
  sampleTimes,
  calibrated,
}) {
  const timeDuration = measureDuration / sampleTimes
  const timeDurationsA = getTimeDurations(timeDurations, calibrated)
  const timeDurationsB = [...timeDurationsA, timeDuration]
  const timeDurationMean = getMean(timeDurationsB)
  return { timeDurations: timeDurationsB, timeDurationMean }
}

const getTimeDurations = function (timeDurations, calibrated) {
  if (!calibrated) {
    return []
  }

  return timeDurations.length === MEASURE_DURATIONS_MAX
    ? timeDurations.slice(1)
    : timeDurations
}

const MEASURE_DURATIONS_MAX = 3

// `maxLoops` is the number of `repeat` loops the sample should measure.
// Each sample needs to perform a specific amount of measures (`maxLoops`).
// We do this instead of passing a maximum duration instead because:
//   - It is easier to implement for runner.
//   - It is faster, since it does not require computing a timestamp, which
//     allows running more loops in very fast tasks.
//   - It can be used to prevent memory crash in runners.
// The `maxLoops` is computed so the sample lasts a specific duration. We use a
// hardcoded duration because:
//   - It should be as high as possible. Since the upper limit is based on
//     user-perceived duration (preview refresh rate, duration to stop, etc.),
//     we do not need machine-friendly automated durations.
//   - It ensures each sample has roughly the same duration.
//      - This is because some runtime optimization applies as a new sample is
//        run. We do not want this runtime to spread differently between samples
//        due to different durations.
// We use the same target duration whether calibrated or not
//   - This ensures the calibration samples are measured in the same settings
//     as the others. Otherwise, the first samples after calibration might be
//     different from the others, removing the benefits of calibration.
// Since `maxLoops` aims to last a specific duration, we need the last
// `measureDuration` to estimate it.
//   - If the `repeat` changes, we need to take it into account as well, which
//     is especially important during calibration.
// Higher value of `targetSampleDuration` leads to:
//   - Less frequent previews
//   - Longer to wait for combinations to stop when user requests it.
//       - The sample duration should always be less than the abort delay.
//   - Higher minimum duration for any combination
//   - More unnecessary measures once the `precision` threshold has been reached
//   - Longer time to calibrate
// Lower value of `targetSampleDuration` leads to:
//   - Higher `stats.stdev` and `stats.max`. This is because new samples have
//     a small cold start. This is especially true for fast|low-complexity tasks
//   - Less duration measuring as opposed to IPC, runner internal logic, stats
//     computation and preview reporting
//   - Due to the above point, the real sample duration is less close to the
//     target.
// The value does not impact `stats.mean` much though.
const getMaxLoops = function ({
  newRepeat,
  measures,
  timeDurationMean,
  targetSampleDuration,
}) {
  return Math.min(
    Math.ceil(targetSampleDuration / (timeDurationMean * newRepeat)),
    getMaxMeasuresLeft(measures),
  )
}
