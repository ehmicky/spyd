import omit from 'omit.js'

import { showResultTitles } from '../title/show.js'

import { isTtyOutput } from './tty.js'

// Call `reporter.report()`.
// It can be async, including during results preview.
export const callReportFunc = async function ({
  reportFunc,
  result,
  reporterConfig,
  reporterConfig: {
    showSystem,
    showMetadata,
    output,
    insert,
    colors,
    showTitles,
    showDiff = getDefaultShowDiff(output),
  },
  titles,
}) {
  const resultA = showResultTitles(result, titles, showTitles)
  const resultB = cleanResult({
    result: resultA,
    showSystem,
    showMetadata,
    showDiff,
  })
  const reportFuncProps = omit(reporterConfig, CORE_REPORT_PROPS)
  const content = await reportFunc(resultB, reportFuncProps)
  return { content, output, insert, colors }
}

// Differences are mostly useful during interaction.
// In results persisted in files, they are mostly confusing.
const getDefaultShowDiff = function (output) {
  return output === undefined && isTtyOutput()
}

// Remove some result properties unless some reporterConfig properties are
// passed. Those all start with `show*`. We use one boolean configuration
// property for each instead of a single array configuration property because it
// makes it easier to enable/disable each property both in CLI flags and in
// `reporter{id}.*` properties.
const cleanResult = function ({
  result: { systems, combinations, ...result },
  showMetadata,
  showSystem,
  showDiff,
}) {
  const resultA = maybeOmit(result, showMetadata, TOP_METADATA_PROPS)
  const systemsA = systems.map((system) =>
    cleanSystem(system, showMetadata, showSystem),
  )
  const combinationsA = combinations.map((combination) =>
    cleanCombination(combination, showDiff),
  )
  return { ...resultA, systems: systemsA, combinations: combinationsA }
}

const cleanSystem = function (system, showMetadata, showSystem) {
  const systemA = maybeOmit(system, showMetadata, METADATA_SYSTEM_PROPS)
  const systemB = maybeOmit(systemA, showSystem, SYSTEM_PROPS)
  return systemB
}

const cleanCombination = function ({ stats, ...combination }, showDiff) {
  const statsA = maybeOmit(stats, showDiff, DIFF_STATS_PROPS)
  return { ...combination, stats: statsA }
}

const maybeOmit = function (obj, showProp, propNames) {
  if (showProp) {
    return obj
  }

  return omit(obj, propNames)
}

const TOP_METADATA_PROPS = ['id', 'timestamp']
const METADATA_SYSTEM_PROPS = ['git', 'ci']
const SYSTEM_PROPS = ['machine', 'versions']
const DIFF_STATS_PROPS = ['diff']

// We handle some reporterConfig properties in core, and do not pass those to
// reporters.
const CORE_REPORT_PROPS = [
  'output',
  'insert',
  'colors',
  'showTitles',
  'showSystem',
  'showMetadata',
  'showDiff',
]
