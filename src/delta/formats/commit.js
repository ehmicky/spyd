import { findIndexReverse } from '../../utils/find.js'

import { findByGitRef } from './git.js'

// Deltas can be git commits
const parseCommit = function (delta) {
  if (typeof delta !== 'string' || !GIT_COMMIT_REGEXP.test(delta)) {
    return
  }

  return delta
}

// Git commit hash at least 7 characters long
const GIT_COMMIT_REGEXP = /^[\da-f]{7,}$/iu

// If several results match, we use the most recent once
// We use the most recent result because this is what users most likely want.
// When none is found in `result.systems`, we try to use `git` instead.
const findByCommit = async function (results, commit, cwd) {
  const index = findIndexReverse(results, ({ systems: [{ git = {} }] }) =>
    git.commit.startsWith(commit),
  )

  if (index !== -1) {
    return index
  }

  return await findByGitRef(results, commit, cwd)
}

export const commitFormat = {
  type: 'commit',
  message: 'commit hash',
  parse: parseCommit,
  find: findByCommit,
}
