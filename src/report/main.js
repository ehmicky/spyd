import { endPreview } from '../preview/start_end.js'

import { callReportFunc } from './call.js'
import { printContents, printTtyContent, computeTtyContents } from './print.js'
import { endReporters } from './start_end.js'

// Report final results in `bench` command.
// This waits for `reporter.report()` and `reporter.end()` to complete before
// clearing the preview, in case those are slow.
export const reportBench = async function (
  result,
  { reporters, titles, quiet },
) {
  const contents = await endReport(result, { reporters, titles })
  await endPreview(quiet)
  await printContents(contents)
}

// Report preview results in `bench` command.
// The report output is not printed right away. Instead, it is printed by the
// preview refresh function at regular intervals.
export const reportPreview = async function (result, { reporters, titles }) {
  const contents = await getContents(result, { reporters, titles })
  const previewReport = computeTtyContents(contents)
  return previewReport
}

// Report final results in `show` command.
export const reportShow = async function (result, { reporters, titles }) {
  const contents = await endReport(result, { reporters, titles })
  await printContents(contents)
}

// Report final results in `remove` command.
// Reporting is shown so the user can be clear about which result was removed,
// and provide with confirmation. So we only need to print in the terminal,
// not output|insert files.
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
