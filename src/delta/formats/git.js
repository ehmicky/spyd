// Deltas can be git commits
export const parseCommit = function (delta) {
  if (!GIT_COMMIT_REGEXP.test(delta)) {
    return
  }

  return delta
}

// Git commit hash at least 8 characters long
const GIT_COMMIT_REGEXP = /^[\da-f]{8,}$/iu

export const findByCommit = function (results, commit) {
  return results.find(({ system: { git = {} } }) =>
    git.commit.startsWith(commit),
  )
}
