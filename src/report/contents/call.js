import omit from 'omit.js'

import { handleFooter } from '../../system/handle.js'
import { FORMATS } from '../formats/list.js'
import { getPaddedScreenWidth, getPaddedScreenHeight } from '../tty.js'

import { omitResultProps } from './omit.js'
import { addResultTitles } from './titles.js'

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
  const { result: resultA, footer } = getReportResult({
    result,
    titles,
    reporter,
  })
  const reportFuncProps = omit.default(reporterConfig, CORE_REPORT_PROPS)
  const reporterArgs = [resultA, reportFuncProps, startData]
  const content = await FORMATS[format].report(reporter, reporterArgs)
  return { content, result: resultA, output, format, colors, footer }
}

// Normalize the `result` passed to `reporter.report()`
// Also used for the programmatic result
export const getReportResult = function ({
  result,
  titles,
  reporter: {
    format,
    debugStats,
    config: { showSystem, showMetadata, showTitles, showPrecision, showDiff },
  },
}) {
  const { result: resultA, footer } = handleFooter({
    result,
    titles,
    showTitles,
    showMetadata,
    showSystem,
    format,
  })
  const resultB = addResultTitles(resultA, titles, showTitles)
  const resultC = omitResultProps(resultB, {
    showPrecision,
    showDiff,
    debugStats,
  })
  const resultD = addSizeInfo(resultC)
  return { result: resultD, footer }
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
