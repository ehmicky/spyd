import { callReportFunc } from './call.js'
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

  await Promise.all([
    printContent(content, reporterConfig),
    insertContent(content, reporterConfig),
  ])
}
