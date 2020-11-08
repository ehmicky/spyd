import { prettifyObject } from '../prefix.js'

// Serialize `git` information for CLI reporters.
export const prettifyMergeId = function (mergeId) {
  if (mergeId === undefined) {
    return
  }

  return prettifyObject({ Id: mergeId })
}
