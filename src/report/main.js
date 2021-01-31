import { callReportFunc } from './call.js'
import { insertContents } from './insert.js'
import { printContents, getPreviewReport } from './print.js'

// Report final results
export const report = async function (result, { reporters, titles }) {
  const contents = await getContents(result, { reporters, titles })
  await Promise.all([printContents(contents), insertContents(contents)])
}

// Report preview results
export const reportPreview = async function (result, { reporters, titles }) {
  const contents = await getContents(result, { reporters, titles })
  const previewReport = getPreviewReport(contents)
  return previewReport
}

const getContents = async function (result, { reporters, titles }) {
  const contents = await Promise.all(
    reporters.map(({ report: reportFunc, config: reporterConfig }) =>
      callReportFunc({ reportFunc, reporterConfig, result, titles }),
    ),
  )
  const contentsA = contents.filter(hasContent)
  return contentsA
}

// A reporter can choose not to return anything, in which case `output` and
// `insert` are not used.
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
