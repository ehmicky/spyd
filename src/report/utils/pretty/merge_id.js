import { addPrefix } from '../prefix.js'

// Serialize `git` information for CLI reporters.
export const prettifyMergeId = function (mergeId) {
  if (mergeId === undefined) {
    return
  }

  const body = addPrefix('Id', mergeId)
  return body
}
