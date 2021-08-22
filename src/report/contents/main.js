import { callReportFunc } from './call.js'
import { handleContent } from './handle.js'
import { joinByOutput } from './join.js'

// Retrieve reporter's contents by calling all `reporter.report()` then
// normalizing their return value and grouping it by `output`.
export const getContents = async function ({ reporters, titles }) {
  return await Promise.all(
    reporters.map((reporter) => callReportFunc({ reporter, titles })),
  )
}

export const finalizeContents = function (contents) {
  const contentsA = contents.filter(hasContent).map(handleContent)
  const contentsB = joinByOutput(contentsA)
  return contentsB
}

// A reporter can choose not to return anything
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
