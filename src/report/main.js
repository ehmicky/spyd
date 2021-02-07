import { endPreview } from '../preview/start_end.js'

import { callReportFunc } from './call.js'
import { printContents, computeTtyContents } from './print.js'
import { endReporters } from './start_end.js'

// Report final results
export const report = async function (
  result,
  { reporters, titles, quiet = false },
) {
  const contents = await getContents(result, { reporters, titles })
  await endReporters(reporters)
  await endPreview(quiet)
  await printContents(contents)
}

// Report preview results
export const reportPreview = async function (result, { reporters, titles }) {
  const contents = await getContents(result, { reporters, titles })
  const previewReport = computeTtyContents(contents)
  return previewReport
}

const getContents = async function (result, { reporters, titles }) {
  const contents = await Promise.all(
    reporters.map(({ report: reportFunc, config: reporterConfig, startData }) =>
      callReportFunc({ reportFunc, reporterConfig, startData, result, titles }),
    ),
  )
  const contentsA = contents.filter(hasContent)
  return contentsA
}

// A reporter can choose not to return anything, in which case `output` is not
// used.
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
