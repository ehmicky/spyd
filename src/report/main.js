import { callReportFunc } from './call.js'
import { insertContents } from './insert.js'
import { printContents } from './print.js'

// Report results
export const report = async function (result, { reporters, titles }) {
  const contents = await Promise.all(
    reporters.map(({ report: reportFunc, config: reporterConfig }) =>
      callReportFunc({ reportFunc, reporterConfig, result, titles }),
    ),
  )
  const contentsA = contents.filter(hasContent)

  await Promise.all([printContents(contentsA), insertContents(contentsA)])
}

// A reporter can choose not to return anything, in which case `output` and
// `insert` are not used.
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
