import { callReportFunc, getReportResult } from './call.js'
import { handleContent } from './handle.js'
import { joinByOutput } from './join.js'

// Retrieve reporter's contents by calling all `reporter.report()` then
// normalizing their return value and grouping it by `output`.
export const getContents = async function (result, { reporters, titles }) {
  const { result: programmaticResult } = getReportResult({
    result,
    titles,
    reporter: PROGRAMMATIC_REPORTER,
  })
  const contents = await Promise.all(
    reporters.map((reporter) => callReportFunc({ result, titles, reporter })),
  )
  const contentsA = contents.filter(hasContent).map(handleContent)
  const contentsB = joinByOutput(contentsA)
  return { programmaticResult, contents: contentsB }
}

// The `run`, `show` and `remove` commands return the result programmatically.
// We return the same value that is passed to reporters since:
//  - It has all the information users might need
//  - This avoids documenting two separate objects
// However, there are a few differences:
//  - We apply specific some reporter configuration:
//     - to make sure all properties are available
//     - not to couple the programmatic result with a specific reporter
//  - We do not apply properties:
//     - Very specific to reporting such as `footer`
//     - Mostly internals such as debug stats
// We purposely avoid returning the reporter's `content` programmatically
//  - The `content` is fit for reporting only, not programmatic usage
//  - It can still be accessed by outputting it a specific file then read that
//    file separately
const PROGRAMMATIC_REPORTER = {
  format: 'external',
  // eslint-disable-next-line no-empty-function
  reportExternal() {},
  debugStats: false,
  config: {
    showSystem: true,
    showMetadata: true,
    showTitles: true,
    showPrecision: true,
    showDiff: true,
  },
}

// A reporter can choose not to return anything
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
