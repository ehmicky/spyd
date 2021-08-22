import omit from 'omit.js'

import { FORMATS } from '../formats/list.js'

import { omitResultProps } from './omit.js'
import { addResultTitles } from './titles.js'

// Call all `reporter.report()`.
// It can be async, including during results preview.
// Some of this is currently applied only to `result`, not `result.history[*]`
// Since `report()` might have side effects such as making a HTTP call, we make
// sure it is called exactly once.
export const callReportFunc = async function ({
  reporter,
  reporter: {
    result,
    format,
    debugStats,
    footerParams,
    footerString,
    startData,
    config: reporterConfig,
    config: { output, colors, showTitles, showPrecision, showDiff },
  },
  titles,
}) {
  const resultA = getReportResult({
    result,
    titles,
    debugStats,
    footerParams,
    showTitles,
    showPrecision,
    showDiff,
  })
  const reportFuncProps = omit.default(reporterConfig, CORE_REPORT_PROPS)
  const reporterArgs = [resultA, reportFuncProps, startData]
  const content = await FORMATS[format].report(reporter, reporterArgs)
  return { content, result: resultA, output, format, colors, footerString }
}

// Normalize the `result` passed to `reporter.report()`
const getReportResult = function ({
  result,
  titles,
  debugStats,
  footerParams,
  showTitles,
  showPrecision,
  showDiff,
}) {
  const resultB = addResultTitles(result, titles, showTitles)
  const resultC = omitResultProps(resultB, {
    showPrecision,
    showDiff,
    debugStats,
  })
  const resultD = { ...resultC, ...footerParams }
  return resultD
}

// We handle some reporterConfig properties in core, and do not pass those to
// reporters.
const CORE_REPORT_PROPS = [
  'output',
  'colors',
  'showTitles',
  'showSystem',
  'showMetadata',
  'showPrecision',
  'showDiff',
]
