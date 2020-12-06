// Durations that are too close to repeatCost can be measured as 0.
// The same happens with measureCost when the repeat loop has not been used,
export const getMinDuration = function ({ repeat, measureCost, repeatCost }) {
  return (measureCost - repeatCost) / repeat + repeatCost
}

export const applyMinDuration = function ({ duration, name, minDuration }) {
  if (shouldUseMinDuration({ duration, name, minDuration })) {
    return { duration: minDuration, prefix: '<' }
  }

  return { duration, prefix: '' }
}

const shouldUseMinDuration = function ({ duration, name, minDuration }) {
  return duration === 0 && minDuration !== 0 && !NO_MIN_DURATION_STATS.has(name)
}

const NO_MIN_DURATION_STATS = new Set(['measureCost', 'repeatCost', 'loadCost'])
