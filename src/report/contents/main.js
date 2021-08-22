import omit from 'omit.js'

import { FORMATS } from '../formats/list.js'
import { addResultTitles } from '../titles.js'

import { handleContent } from './handle.js'
import { joinByOutput } from './join.js'

// Retrieve reporter's contents by calling all `reporter.report()` then
// normalizing their return value and grouping it by `output`.
export const getContents = async function ({ reporters, titles }) {
  return await Promise.all(
    reporters.map((reporter) => callReportFunc({ reporter, titles })),
  )
}

// Call all `reporter.report()`.
// It can be async, including during results preview.
// Some of this is currently applied only to `result`, not `result.history[*]`
// Since `report()` might have side effects such as making a HTTP call, we make
// sure it is called exactly once.
const callReportFunc = async function ({
  reporter,
  reporter: {
    result,
    format,
    footerString,
    startData,
    config: reporterConfig,
    config: { output, colors, showTitles },
  },
  titles,
}) {
  const resultA = addResultTitles(result, titles, showTitles)
  const reportFuncProps = omit.default(reporterConfig, CORE_REPORT_PROPS)
  const reporterArgs = [resultA, reportFuncProps, startData]
  const content = await FORMATS[format].report(reporter, reporterArgs)
  return { content, result: resultA, output, format, colors, footerString }
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

export const finalizeContents = function (contents) {
  const contentsA = contents.filter(hasContent).map(handleContent)
  const contentsB = joinByOutput(contentsA)
  return contentsB
}

// A reporter can choose not to return anything
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
