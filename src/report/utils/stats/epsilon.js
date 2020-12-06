// Durations that are too close to repeatCost can be measured as 0.
// The same happens with measureCost when the repeat loop has not been used,
export const getEpsilon = function ({ repeat, measureCost, repeatCost }) {
  return (measureCost - repeatCost) / repeat + repeatCost
}

export const applyEpsilon = function ({ duration, name, epsilon }) {
  if (shouldUseEpsilon({ duration, name, epsilon })) {
    return { duration: epsilon, prefix: '<' }
  }

  return { duration, prefix: '' }
}

const shouldUseEpsilon = function ({ duration, name, epsilon }) {
  return duration === 0 && epsilon !== 0 && !NO_MIN_DURATION_STATS.has(name)
}

const NO_MIN_DURATION_STATS = new Set(['measureCost', 'repeatCost', 'loadCost'])
