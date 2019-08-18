// Statistics are now shown if:
//  - undefined (e.g. `diff` with no previous benchmark)
//  - deviation|variance and either:
//     - option `verbose` false
//     - not enough samples
export const shouldSkipStat = function({ stat, name, loops, verbose }) {
  return (
    stat === undefined ||
    (DEVIATION_STATS.includes(name) &&
      shouldSkipDeviation(stat, loops, verbose))
  )
}

const shouldSkipDeviation = function(stat, loops, verbose) {
  return stat === 0 || loops < MIN_LOOPS || !verbose
}

const DEVIATION_STATS = ['deviation', 'variance']
const MIN_LOOPS = 10
