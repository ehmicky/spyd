// Statistics are now shown if:
//  - undefined (e.g. `diff` with no previous benchmark)
//  - deviation|variance if not enough samples
export const shouldSkipStat = function({ stat, name, loops }) {
  return (
    stat === undefined ||
    (DEVIATION_STATS.includes(name) && shouldSkipDeviation(stat, loops))
  )
}

const shouldSkipDeviation = function(stat, loops) {
  return stat === 0 || loops < MIN_LOOPS
}

const DEVIATION_STATS = ['deviation', 'variance']
const MIN_LOOPS = 10
