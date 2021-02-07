import { endPreview } from '../preview/start_end.js'

import { callReportFunc } from './call.js'
import { printContents, printTtyContent, computeTtyContents } from './print.js'
import { endReporters } from './start_end.js'

// Report final results in `bench` command
export const reportBench = async function (
  result,
  { reporters, titles, quiet },
) {
  const contents = await endReport(result, { reporters, titles })
  await endPreview(quiet)
  await printContents(contents)
}

// Report preview results in `bench` command
export const reportPreview = async function (result, { reporters, titles }) {
  const contents = await getContents(result, { reporters, titles })
  const previewReport = computeTtyContents(contents)
  return previewReport
}

// Report final results in `show` command
export const reportShow = async function (result, { reporters, titles }) {
  const contents = await endReport(result, { reporters, titles })
  await printContents(contents)
}

// Report final results in `remove` command
export const reportRemove = async function (result, { reporters, titles }) {
  const contents = await endReport(result, { reporters, titles })
  await printTtyContent(contents)
}

const endReport = async function (result, { reporters, titles }) {
  const contents = await getContents(result, { reporters, titles })
  await endReporters(reporters)
  return contents
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
