import { findIndexReverse } from '../../utils/find.js'

import { findByGitRef } from './git.js'

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
// We use the most recent result because this is what users most likely want.
const findByCommit = async function (results, commit) {
  const index = findIndexReverse(results, ({ system: { git = {} } }) =>
    git.commit.startsWith(commit),
  )

  if (index !== -1) {
    return index
  }

  return await findByGitRef(results, commit)
}

export const commitFormat = {
  type: 'commit',
  message: 'commit hash',
  parse: parseCommit,
  find: findByCommit,
}
