import { callReportFunc, getProgrammaticResult } from './call.js'
import { handleContent } from './handle.js'
import { joinByOutput } from './join.js'

// Retrieve reporter's contents by calling all `reporter.report()` then
// normalizing their return value and grouping it by `output`.
export const getContents = async function (result, { reporters, titles }) {
  const programmaticResult = await getProgrammaticResult(result, titles)
  const contents = await Promise.all(
    reporters.map((reporter) => callReportFunc({ result, titles, reporter })),
  )
  const contentsA = contents.filter(hasContent).map(handleContent)
  const contentsB = joinByOutput(contentsA)
  return { programmaticResult, contents: contentsB }
}

// A reporter can choose not to return anything
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
