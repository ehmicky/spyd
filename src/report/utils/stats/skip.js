// Statistics are not shown if:
//  - undefined (e.g. `diff` with no previous benchmark)
//  - deviation if not enough samples
export const shouldSkipStat = function ({ stat, name, loops }) {
  return (
    stat === undefined ||
    (name === 'deviation' && shouldSkipDeviation(stat, loops))
  )
}

const shouldSkipDeviation = function (stat, loops) {
  return stat === 0 || loops < MIN_LOOPS
}

const MIN_LOOPS = 10
