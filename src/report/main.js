import { callReportFunc } from './call.js'
import { getContents } from './content.js'
import { insertContent } from './insert.js'
import { printContent } from './print.js'

// Report results
export const report = async function (result, { reporters, titles }) {
  await Promise.all(
    reporters.map(({ report: reportFunc, config: reporterConfig }) =>
      useReporter({ reportFunc, reporterConfig, result, titles }),
    ),
  )
}

// Perform each reporter.
const useReporter = async function ({
  reportFunc,
  reporterConfig,
  result,
  titles,
}) {
  const content = await callReportFunc({
    reportFunc,
    result,
    reporterConfig,
    titles,
  })

  if (!hasContent(content)) {
    return
  }

  const { nonInteractiveContent, interactiveContent } = getContents(
    content,
    reporterConfig,
  )
  await Promise.all([
    printContent(reporterConfig, nonInteractiveContent, interactiveContent),
    insertContent(reporterConfig, nonInteractiveContent),
  ])
}

// A reporter can choose not to return anything, in which case `output` and
// `insert` are not used.
const hasContent = function (content) {
  return typeof content === 'string' && content.trim() !== ''
}
