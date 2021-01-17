import { cleanObject } from '../utils/clean.js'

import { callReportFunc } from './call.js'
import { getContents } from './content.js'
import { insertContent } from './insert.js'
import { printContent } from './print.js'

// Report results
export const report = async function (
  result,
  { reporters, output, insert, colors, showDiff, showSystem, showMetadata },
) {
  await Promise.all(
    reporters.map(({ report: reportFunc, config: reporterConfig }) =>
      useReporter({
        reportFunc,
        reporterConfig,
        result,
        output,
        insert,
        colors,
        showDiff,
        showSystem,
        showMetadata,
      }),
    ),
  )
}

// Perform each reporter.
// `output`, `insert`, `colors`, `showDiff`, `showSystem`, `showMetadata`
// can be set either for specific reporter (--reporter{id}.output) or for
// all (--output).
const useReporter = async function ({
  reportFunc,
  reporterConfig,
  result,
  output,
  insert,
  colors,
  showDiff,
  showSystem,
  showMetadata,
}) {
  const reporterConfigA = cleanObject({
    output,
    insert,
    colors,
    showDiff,
    showSystem,
    showMetadata,
    ...reporterConfig,
  })

  const content = await callReportFunc({
    reportFunc,
    result,
    reporterConfig: reporterConfigA,
  })

  if (!hasContent(content)) {
    return
  }

  const { nonInteractiveContent, interactiveContent } = getContents(
    content,
    reporterConfigA,
  )
  await Promise.all([
    printContent(reporterConfigA, nonInteractiveContent, interactiveContent),
    insertContent(reporterConfigA, nonInteractiveContent),
  ])
}

// A reporter can choose not to return anything, in which case `output` and
// `insert` are not used.
const hasContent = function (content) {
  return typeof content === 'string' && content.trim() !== ''
}
