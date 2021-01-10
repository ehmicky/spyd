import { checkLimits } from '../limit/error.js'
import { addPrevious } from '../normalize/previous.js'

import { callReportFunc } from './call.js'
import { handleReportConfig } from './config.js'
import { getContents } from './content.js'
import { insertContent } from './insert.js'
import { printContent } from './print.js'

// Report results
export const report = async function (
  result,
  results,
  {
    report: reporters,
    output,
    insert,
    limits,
    colors,
    info,
    context,
    link,
    diff,
  },
) {
  const resultA = addPrevious(results, result, { limits, diff })

  await Promise.all(
    reporters.map(({ report: reportFunc, config: reportConfig }) =>
      useReporter({
        reportFunc,
        reportConfig,
        result: resultA,
        output,
        insert,
        colors,
        info,
        context,
        link,
      }),
    ),
  )

  checkLimits(resultA)

  return resultA
}

// Perform each reporter
const useReporter = async function ({
  reportFunc,
  reportConfig,
  result,
  output,
  insert,
  colors,
  info,
  context,
  link,
}) {
  const reportConfigA = handleReportConfig({
    reportConfig,
    output,
    insert,
    colors,
    info,
    context,
    link,
  })

  const content = await callReportFunc({
    reportFunc,
    result,
    reportConfig: reportConfigA,
  })

  if (!hasContent(content)) {
    return
  }

  const { nonInteractiveContent, interactiveContent } = getContents({
    content,
    reportConfig: reportConfigA,
  })
  await Promise.all([
    printContent({ nonInteractiveContent, interactiveContent, output }),
    insertContent(nonInteractiveContent, insert),
  ])
}

// A reporter can choose not to return anything, in which case `output` and
// `insert` are not used.
const hasContent = function (content) {
  return typeof content === 'string' && content.trim() !== ''
}
