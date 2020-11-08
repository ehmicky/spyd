import { prettifyValue } from '../prettify_value.js'

// Serialize `git` information for CLI reporters.
export const prettifyMergeId = function (mergeId) {
  if (mergeId === undefined) {
    return
  }

  return prettifyValue({ Id: mergeId })
}
