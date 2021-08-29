import omit from 'omit.js'

// Some combination properties can be toggled using `showPrecision` and
// `showDiff`.
// We use one boolean configuration property for each instead of a single array
// configuration property because it makes it easier to enable/disable each
// property both in CLI flags and in `reporterConfig.{reporterId}.*` properties.
export const omitCombinationsProps = function (
  { combinations, ...result },
  { showPrecision, showDiff, debugStats },
) {
  const combinationsA = combinations.map((combination) =>
    omitCombinationProps(combination, { showDiff, showPrecision, debugStats }),
  )
  return { ...result, combinations: combinationsA }
}

const omitCombinationProps = function (
  { stats, ...combination },
  { showPrecision, showDiff, debugStats },
) {
  const statsA = omitMedianProps(stats, showPrecision)
  const statsB = maybeOmit(statsA, showPrecision, PRECISION_STATS_PROPS)
  const statsC = maybeOmit(statsB, showDiff, DIFF_STAT_PROPS)
  const statsD = maybeOmit(statsC, debugStats, DEBUG_STATS_PROPS)
  return { ...combination, stats: statsD }
}

// When `showPrecision` is `true`, we show `medianMin|medianMax` instead of
// `median`. However, we fall back to `median` when those are not available due
// to either:
//  - `precision: 0`
//  - Not enough measures
// `median` might also be `undefined` when a combination has not been measured
// yet.
//  - This does not apply to `history.results`
// This means reporters should assume that:
//  - Either|both properties might be `undefined`
//  - This might differ for combinations of the same result
const omitMedianProps = function (
  { median, medianMin, medianMax, ...stats },
  showPrecision,
) {
  if (showPrecision && medianMin !== undefined) {
    return { ...stats, medianMin, medianMax }
  }

  return median === undefined ? stats : { ...stats, median }
}

const PRECISION_STATS_PROPS = ['moe', 'rmoe']
const DIFF_STAT_PROPS = ['diff', 'diffPrecise']

// Some stats are too advanced for most reporters and are only meant for
// debugging. Reporters must explicitly set `debugStats: true` to use those.
// This is undocumented.
const DEBUG_STATS_PROPS = [
  // Median is the main statistic which should be used for averages since it is:
  //  - More precise
  //  - Consistent with the other statistics which are based on it such as stdev
  //  - Consistent with the other reporters
  //  - Used to sort combinations
  'mean',
  // `medianMin|medianMax` is better than those statistics since they make it
  // easy for users to visualize:
  //  - The confidence interval
  //  - Whether two combinations confidence intervals overlap
  'rstdev',
  'moe',
  'rmoe',
  // `times`:
  //  - Is a bad indicator of precision, unlike `rmoe`
  //  - Might be confused as an indicator of speed since other tools report it
  //    like that
  'times',
  // Those statistics are internal to how we measure tasks
  'samples',
  'loops',
  'repeat',
  'minLoopDuration',
]

const maybeOmit = function (obj, showProp, propNames) {
  return showProp ? obj : omit.default(obj, propNames)
}
