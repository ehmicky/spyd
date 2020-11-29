import { checkLimits } from '../limit/error.js'
import { normalizeResult } from '../normalize/main.js'
import { addPrevious } from '../normalize/previous.js'

import { callReportFunc } from './call.js'
import { handleReportConfig } from './config.js'
import { getContents } from './content.js'
import { insertContent } from './insert.js'
import { printContent } from './print.js'

// Report results
export const report = async function (
  mergeId,
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
  const result = getResult(mergeId, results, { limits, diff })

  await Promise.all(
    reporters.map(({ report: reportFunc, config: reportConfig }) =>
      useReporter({
        reportFunc,
        reportConfig,
        result,
        output,
        insert,
        colors,
        info,
        context,
        link,
      }),
    ),
  )

  checkLimits(result)

  return result
}

const getResult = function (mergeId, results, { limits, diff }) {
  const resultsA = results.map(normalizeResult)

  const resultA = resultsA.find((result) => result.mergeId === mergeId)
  const resultB = addPrevious(resultsA, resultA, { limits, diff })
  return resultB
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
