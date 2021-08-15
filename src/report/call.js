import omit from 'omit.js'

import { showResultTitles } from '../title/show.js'

import { cleanResult } from './clean.js'
import { handleContent } from './handle.js'
import { getPaddedScreenWidth, getPaddedScreenHeight } from './tty.js'

// Call all `reporter.report()`.
// It can be async, including during results preview.
export const getContents = async function (result, { reporters, titles }) {
  const contents = await Promise.all(
    reporters.map((reporter) => getReporterContents(result, titles, reporter)),
  )
  const contentsA = contents.filter(hasContent)
  const contentsB = contentsA.map(handleContent)
  return contentsB
}

// Some of this is currently applied only to `result`, not `result.history[*]`
// Since `report()` might have side effects such as making a HTTP call, we make
// sure it is called exactly once.
const getReporterContents = async function (
  result,
  titles,
  {
    report: reportFunc,
    config: reporterConfig,
    config: { output, colors },
    startData,
  },
) {
  const reportResult = getReportResult(result, titles, reporterConfig)
  const reportFuncProps = omit.default(reporterConfig, CORE_REPORT_PROPS)
  const content = await reportFunc(reportResult, reportFuncProps, startData)
  return { content, output, colors }
}

// Normalize the `result` passed to `reporter.report()`
const getReportResult = function (
  result,
  titles,
  { showSystem, showMetadata, showTitles, showPrecision, showDiff },
) {
  const resultA = showResultTitles(result, titles, showTitles)
  const resultB = cleanResult({
    result: resultA,
    showSystem,
    showMetadata,
    showPrecision,
    showDiff,
  })
  const resultC = addSizeInfo(resultB)
  return resultC
}

// Add size-related information
const addSizeInfo = function (result) {
  const screenWidth = getPaddedScreenWidth()
  const screenHeight = getPaddedScreenHeight()
  return { ...result, screenWidth, screenHeight }
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

// A reporter can choose not to return anything, in which case `output` is not
// used.
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
