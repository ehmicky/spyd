import { stderr } from 'process'

import isInteractive from 'is-interactive'
import omit from 'omit.js'

// Call `reporter.report()`
export const callReportFunc = async function ({
  reportFunc,
  result,
  reporterConfig,
  reporterConfig: {
    showSystem,
    showMetadata,
    output,
    showDiff = getDefaultShowDiff(output),
  },
}) {
  const reportFuncResult = cleanResult({
    result,
    showSystem,
    showMetadata,
    showDiff,
  })
  const reportFuncProps = omit(reporterConfig, CORE_REPORT_PROPS)
  const content = await reportFunc(reportFuncResult, reportFuncProps)
  return content
}

// Differences are mostly useful during interaction.
// In results persisted in files, they are mostly confusing.
const getDefaultShowDiff = function (output) {
  return output === '-' && isInteractive(stderr)
}

// Remove some result properties unless some reporterConfig properties are
// passed. Those all start with `show*`. We use one boolean configuration
// property for each instead of a single array configuration property because it
// makes it easier to enable/disable each property both in CLI flags and in
// `reporter{id}.*` properties.
const cleanResult = function ({
  result: { combinations, ...result },
  showSystem,
  showMetadata,
  showDiff,
}) {
  const omittedProps = [
    ...(showSystem ? [] : SYSTEM_PROPS),
    ...(showMetadata ? [] : METADATA_PROPS),
  ]
  const resultA = omit(result, omittedProps)
  const combinationsA = combinations.map((combination) =>
    cleanCombination(combination, showDiff),
  )
  return { ...resultA, combinations: combinationsA }
}

const SYSTEM_PROPS = ['systems']
const METADATA_PROPS = ['id', 'timestamp']

const cleanCombination = function ({ stats, ...combination }, showDiff) {
  const omittedStatsProps = showDiff ? [] : DIFF_STATS_PROPS
  const statsA = omit(stats, omittedStatsProps)
  return { ...combination, stats: statsA }
}

const DIFF_STATS_PROPS = ['diff']

// We handle some reporterConfig properties in core, and do not pass those to
// reporters.
const CORE_REPORT_PROPS = [
  'output',
  'insert',
  'colors',
  'showSystem',
  'showMetadata',
  'showDiff',
]
