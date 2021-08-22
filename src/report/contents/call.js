import omit from 'omit.js'

import { handleFooter } from '../../system/handle.js'
import { FORMATS } from '../formats/list.js'
import { getPaddedScreenWidth, getPaddedScreenHeight } from '../tty.js'

import { omitResultProps } from './omit.js'
import { addResultTitles } from './titles.js'

// The `run`, `show` and `remove` commands return the result programmatically.
// We return the same value that is passed to reporters since:
//  - It has all the information users might need
//  - This avoids documenting two separate objects
// However, there are a few differences:
//  - We apply specific some reporter configuration:
//     - to make sure all properties are available
//     - not to couple the programmatic result with a specific reporter
//  - We do not apply properties:
//     - Very specific to reporting such as `footer`
//     - Mostly internals such as debug stats
// We purposely avoid returning the reporter's `content` programmatically
//  - The `content` is fit for reporting only, not programmatic usage
//  - It can still be accessed by outputting it a specific file then read that
//    file separately
export const getProgrammaticResult = async function (result, titles) {
  return await callReportFunc({
    result,
    titles,
    reporter: PROGRAMMATIC_REPORTER,
  })
}

const PROGRAMMATIC_REPORTER = {
  format: 'external',
  // eslint-disable-next-line no-empty-function
  reportExternal() {},
  debugStats: false,
  config: {
    showSystem: true,
    showMetadata: true,
    showTitles: true,
    showPrecision: true,
    showDiff: true,
  },
}

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
const getReportResult = function ({
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
