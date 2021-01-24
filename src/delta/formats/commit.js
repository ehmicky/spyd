// Deltas can be git commits
const parseCommit = function (delta) {
  if (typeof delta !== 'string' || !GIT_COMMIT_REGEXP.test(delta)) {
    return
  }

  return delta
}

// Git commit hash at least 8 characters long
const GIT_COMMIT_REGEXP = /^[\da-f]{8,}$/iu

// If several results match, we use the most recent once
const findByCommit = function (results, commit) {
  return results.findIndex(({ system: { git = {} } }) =>
    git.commit.startsWith(commit),
  )
}

export const commitFormat = {
  type: 'commit',
  message: 'commit hash',
  parse: parseCommit,
  find: findByCommit,
}
