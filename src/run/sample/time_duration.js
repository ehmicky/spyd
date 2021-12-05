import { getMean } from '../../stats/sum.js'

export const getTimeDuration = function ({
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

  return timeDurations.length === TIME_DURATIONS_LENGTH
    ? timeDurations.slice(1)
    : timeDurations
}

const TIME_DURATIONS_LENGTH = 3
