import { groupBy } from '../utils/group.js'

import { callReportFunc } from './call.js'
import { handleContent } from './handle.js'
import { joinContents } from './join.js'

// Retrieve reporter's contents by calling all `reporter.report()` then
// normalizing their return value and grouping it by `output`.
export const getContents = async function (result, { reporters, titles }) {
  const contents = await Promise.all(
    reporters.map((reporter) => callReportFunc({ result, titles, reporter })),
  )
  const contentsA = contents.filter(hasContent).map(handleContent)
  const contentsB = Object.values(groupBy(contentsA, 'output')).map(
    joinContents,
  )
  return contentsB
}

// A reporter can choose not to return anything
const hasContent = function ({ content }) {
  return typeof content === 'string' && content.trim() !== ''
}
