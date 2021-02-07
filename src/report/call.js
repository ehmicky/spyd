import omit from 'omit.js'

import { showResultTitles } from '../title/show.js'

import { cleanResult } from './clean.js'
import { isTtyOutput } from './tty.js'

// Call `reporter.report()`.
// It can be async, including during results preview.
export const callReportFunc = async function ({
  reportFunc,
  result,
  startData,
  reporterConfig,
  reporterConfig: {
    showSystem,
    showMetadata,
    output,
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
  const content = await reportFunc(resultB, reportFuncProps, startData)
  return { content, output, colors }
}

// Differences are mostly useful during interaction.
// In results persisted in files, they are mostly confusing.
const getDefaultShowDiff = function (output) {
  return output === undefined && isTtyOutput()
}

// We handle some reporterConfig properties in core, and do not pass those to
// reporters.
const CORE_REPORT_PROPS = [
  'output',
  'colors',
  'showTitles',
  'showSystem',
  'showMetadata',
  'showDiff',
]
