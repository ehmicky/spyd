import omit from 'omit.js'

import { showResultTitles } from '../title/show.js'

import { cleanResult } from './clean.js'
import { getPaddedScreenWidth, getPaddedScreenHeight } from './tty.js'
import { wrapRows } from './utils/wrap.js'

// Call all `reporter.report()`.
// It can be async, including during results preview.
export const getContents = async function (result, { reporters, titles }) {
  const contents = await Promise.all(
    reporters.map(getReporterContents.bind(undefined, result, titles)),
  )
  const contentsA = contents.filter(hasContent)
  return contentsA
}

// Some of this is currently applied only to `result`, not `result.history[*]`
const getReporterContents = async function (
  result,
  titles,
  {
    report: reportFunc,
    tty,
    config: reporterConfig,
    config: {
      showSystem,
      showMetadata,
      output,
      colors,
      showTitles,
      showPrecision,
      showDiff = tty,
    },
    startData,
  },
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
  const reportFuncProps = omit.default(reporterConfig, CORE_REPORT_PROPS)
  const content = await reportFunc(resultC, reportFuncProps, startData)
  const contentA = normalizeEmptyContent(content)
  const contentB = trimEnd(contentA)
  const contentC = wrapRows(contentB)
  return { content: contentC, output, colors }
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
const normalizeEmptyContent = function (content) {
  return typeof content === 'string' && content.trim() !== ''
    ? content
    : undefined
}

// Trim the end of each line to avoid wrapping-related visual bugs
const trimEnd = function (content) {
  if (content === undefined) {
    return
  }

  return content.split('\n').map(trimEndLine).join('\n')
}

const trimEndLine = function (line) {
  return line.trimEnd()
}

const hasContent = function ({ content }) {
  return content !== undefined
}
