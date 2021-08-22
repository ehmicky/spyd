import omit from 'omit.js'

// Omit some result properties unless some reporterConfig properties are
// passed. Those all start with `show*`. We use one boolean configuration
// property for each instead of a single array configuration property because it
// makes it easier to enable/disable each property both in CLI flags and in
// `reporterConfig.{reporterId}.*` properties.
export const omitResultProps = function (
  { systems, combinations, ...result },
  { showMetadata, showSystem, showPrecision, showDiff, debugStats },
) {
  const resultA = maybeOmit(result, showMetadata, TOP_METADATA_PROPS)
  const systemsA = systems.map((system) =>
    omitSystemProps(system, showMetadata, showSystem),
  )
  const combinationsA = combinations.map((combination) =>
    omitCombinationProps(combination, { showDiff, showPrecision, debugStats }),
  )
  return { ...resultA, systems: systemsA, combinations: combinationsA }
}

const omitSystemProps = function (system, showMetadata, showSystem) {
  const systemA = maybeOmit(system, showMetadata, METADATA_SYSTEM_PROPS)
  const systemB = maybeOmit(systemA, showSystem, SYSTEM_PROPS)
  return systemB
}

const omitCombinationProps = function (
  { stats, ...combination },
  { showDiff, showPrecision, debugStats },
) {
  const statsA = maybeOmit(stats, showDiff, DIFF_STATS_PROPS)
  const statsB = maybeOmit(statsA, showPrecision, PRECISION_STATS_PROPS)
  const statsC = maybeOmit(statsB, !showPrecision, NO_PRECISION_STATS_PROPS)
  const statsD = maybeOmit(statsC, debugStats, DEBUG_STATS_PROPS)
  return { ...combination, stats: statsD }
}

const maybeOmit = function (obj, showProp, propNames) {
  if (showProp) {
    return obj
  }

  return omit.default(obj, propNames)
}

const TOP_METADATA_PROPS = ['id', 'timestamp']
const METADATA_SYSTEM_PROPS = ['git', 'ci']
const SYSTEM_PROPS = ['machine', 'versions']
const DIFF_STATS_PROPS = ['diff', 'diffPrecise']
const PRECISION_STATS_PROPS = ['moe', 'rmoe', 'medianMin', 'medianMax']
const NO_PRECISION_STATS_PROPS = ['median']

// Some stats are too advanced for most reporters and are only meant for
// debugging. Reporters must explicitly set `debugStats: true` to use those.
// This is undocumented.
//
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
