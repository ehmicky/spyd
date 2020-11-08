// Serialize `git` information for CLI reporters.
export const getMergeId = function (mergeId) {
  if (mergeId === undefined) {
    return
  }

  return { Id: mergeId }
}
