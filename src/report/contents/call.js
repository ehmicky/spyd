import omit from 'omit.js'

import { FORMATS } from '../formats/list.js'

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
