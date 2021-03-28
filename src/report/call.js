import omit from 'omit.js'

import { showResultTitles } from '../title/show.js'

import { cleanResult } from './clean.js'
import { isTtyOutput } from './tty.js'

// Call all `reporter.report()`.
// It can be async, including during results preview.
export const getContents = async function (result, { reporters, titles }) {
  const contents = await Promise.all(
    reporters.map(({ report: reportFunc, config: reporterConfig, startData }) =>
      getReporterContents({
        reportFunc,
        reporterConfig,
        startData,
        result,
        titles,
      }),
    ),
  )
  const contentsA = contents.filter(hasContent)
  return contentsA
}

const getReporterContents = async function ({
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
    showPrecision,
    showDiff = getDefaultShowDiff(output),
  },
  titles,
}) {
  const resultA = showResultTitles(result, titles, showTitles)
  const resultB = cleanResult({
    result: resultA,
    showSystem,
    showMetadata,
    showPrecision,
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
  'showPrecision',
  'showDiff',
]

// A reporter can choose not to return anything, in which case `output` is not
// used.
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
