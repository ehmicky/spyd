import omit from 'omit.js'

// Some combination properties can be toggled using `showPrecision` and
// `showDiff`.
// We use one boolean configuration property for each instead of a single array
// configuration property because it makes it easier to enable/disable each
// property both in CLI flags and in `reporterConfig.{reporterId}.*` properties.
export const omitCombinationsProps = function (
  result,
  { showPrecision, showDiff, debugStats },
) {
  const combinations = result.combinations.map((combination) =>
    omitCombinationProps(combination, { showDiff, showPrecision, debugStats }),
  )
  return { ...result, combinations }
}

const omitCombinationProps = function (
  combination,
  { showPrecision, showDiff, debugStats },
) {
  const stats = omitMeanProps(combination.stats, showPrecision)
  const statsA = maybeOmit(stats, showPrecision, PRECISION_STATS_PROPS)
  const statsB = maybeOmit(statsA, showDiff, DIFF_STAT_PROPS)
  const statsC = maybeOmit(statsB, debugStats, DEBUG_STATS_PROPS)
  return { ...combination, stats: statsC }
}

// When `showPrecision` is `true`, we show `meanMin|meanMax` instead of `mean`.
// However, we fall back to `mean` when those are not available due to not
// enough measures.
const omitMeanProps = function (
  { mean, meanMin, meanMax, ...stats },
  showPrecision,
) {
  if (showPrecision && meanMin !== undefined) {
    return { ...stats, meanMin, meanMax }
  }

  return mean === undefined ? stats : { ...stats, mean }
}

const PRECISION_STATS_PROPS = ['moe', 'rmoe', 'outliersMin', 'outliersMax']
const DIFF_STAT_PROPS = ['diff', 'diffPrecise']

// Some stats are too advanced for most reporters and are only meant for
// debugging. Reporters must explicitly set `debugStats: true` to use those.
// This is undocumented.
const DEBUG_STATS_PROPS = [
  // Mean is the main statistic which should be used for averages since it is:
  //  - Consistent with the other statistics which are based on it such as stdev
  //  - Consistent with the other reporters
  //  - Used to sort combinations
  'median',
  // `meanMin|meanMax` is better than those statistics since they make it easy
  // for users to visualize:
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
  'outliersMin',
  'outliersMax',
  'samples',
  'loops',
  'repeat',
  'envDev',
  'cold',
  'minLoopDuration',
  'runDuration',
]

const maybeOmit = function (obj, showProp, propNames) {
  return showProp ? obj : omit.default(obj, propNames)
}
