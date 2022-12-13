import { getMean } from '../../stats/sum.js'

// We try to make every sample last the same duration `targetSampleDuration`.
// We do it by keeping track of `timeDuration`, the duration per task function
// (including inside the `repeat` loop).
// However, this is difficult when the task has a high variance because we base
// our estimation on:
//  - The mean duration of the task, which might vary in the next sample
//  - The duration of the task in the previous sample, which might have been
//    very slow or fast.
// We soften the second problem by basing our estimation on multiple previous
// samples instead of a single one.
export const getTimeDuration = ({
  timeDurations,
  measureDuration,
  sampleTimes,
  calibrated,
}) => {
  const timeDuration = measureDuration / sampleTimes
  const timeDurationsA = getTimeDurations(timeDurations, calibrated)
  const timeDurationsB = [...timeDurationsA, timeDuration]
  const timeDurationMean = getMean(timeDurationsB)
  return { timeDurations: timeDurationsB, timeDurationMean }
}

// Retrieve previous `timeDurations`.
// We never keep uncalibrated ones.
const getTimeDurations = (timeDurations, calibrated) => {
  if (!calibrated) {
    return []
  }

  return timeDurations.length === TIME_DURATIONS_LENGTH
    ? timeDurations.slice(1)
    : timeDurations
}

// Max amount of `timeDurations` to keep.
// A lower value makes the sample duration of tasks with high variance vary more
// A higher value makes the sample duration more likely to be too slow or fast
// when the task duration becomes suddenly much faster or slower.
const TIME_DURATIONS_LENGTH = 3
