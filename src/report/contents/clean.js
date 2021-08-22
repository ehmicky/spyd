import omit from 'omit.js'

// Remove some result properties unless some reporterConfig properties are
// passed. Those all start with `show*`. We use one boolean configuration
// property for each instead of a single array configuration property because it
// makes it easier to enable/disable each property both in CLI flags and in
// `reporterConfig.{reporterId}.*` properties.
export const cleanResult = function ({
  result: { systems, combinations, ...result },
  showMetadata,
  showSystem,
  showPrecision,
  showDiff,
}) {
  const resultA = maybeOmit(result, showMetadata, TOP_METADATA_PROPS)
  const systemsA = systems.map((system) =>
    cleanSystem(system, showMetadata, showSystem),
  )
  const combinationsA = combinations.map((combination) =>
    cleanCombination(combination, showDiff, showPrecision),
  )
  return { ...resultA, systems: systemsA, combinations: combinationsA }
}

const cleanSystem = function (system, showMetadata, showSystem) {
  const systemA = maybeOmit(system, showMetadata, METADATA_SYSTEM_PROPS)
  const systemB = maybeOmit(systemA, showSystem, SYSTEM_PROPS)
  return systemB
}

const cleanCombination = function (
  { stats, ...combination },
  showDiff,
  showPrecision,
) {
  const statsA = maybeOmit(stats, showDiff, DIFF_STATS_PROPS)
  const statsB = maybeOmit(statsA, showPrecision, PRECISION_STATS_PROPS)
  const statsC = maybeOmit(statsB, !showPrecision, NO_PRECISION_STATS_PROPS)
  return { ...combination, stats: statsC }
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
