import omit from 'omit.js'

import { getFooter } from '../../system/footer.js'
import { FORMATS } from '../formats/list.js'
import { getPaddedScreenWidth, getPaddedScreenHeight } from '../tty.js'

import { cleanResult } from './clean.js'
import { showResultTitles } from './titles.js'

// Call all `reporter.report()`.
// It can be async, including during results preview.
// Some of this is currently applied only to `result`, not `result.history[*]`
// Since `report()` might have side effects such as making a HTTP call, we make
// sure it is called exactly once.
export const callReportFunc = async function ({
  result,
  titles,
  reporter,
  reporter: {
    format,
    config: reporterConfig,
    config: { output, colors },
    startData,
  },
}) {
  const resultA = getReportResult(result, titles, reporterConfig)
  const { result: resultB, footer } = addFooter(resultA, format)
  const reportFuncProps = omit.default(reporterConfig, CORE_REPORT_PROPS)
  const reporterArgs = [resultB, reportFuncProps, startData]
  const content = await FORMATS[format].report(reporter, reporterArgs)
  return { content, output, format, colors, footer }
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

// Compute the footer.
// Depending on format, it is either passed to the reporter or appended by us.
const addFooter = function ({ id, timestamp, systems, ...result }, format) {
  const footer = getFooter({ id, timestamp, systems })
  const resultA =
    FORMATS[format].footer === undefined ? { ...result, footer } : result
  return { result: resultA, footer }
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
