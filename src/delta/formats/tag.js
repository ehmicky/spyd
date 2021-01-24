import { findIndexReverse } from '../../utils/find.js'

import { findByGitRef } from './git.js'

// Deltas can be git tags or branches.
const parseTag = function (delta) {
  if (typeof delta !== 'string') {
    return
  }

  return delta
}

// If several results match, we use the most recent once
// We use the most recent result because this is what users most likely want.
// When none is found in `result.systems`, we try to use `git` instead.
const findByTag = async function (results, tagOrBranch, cwd) {
  const index = findIndexReverse(
    results,
    ({ systems: [{ git: { tag, branch } = {} }] }) =>
      tag === tagOrBranch || branch === tagOrBranch,
  )

  if (index !== -1) {
    return index
  }

  return await findByGitRef(results, tagOrBranch, cwd)
}

export const tagFormat = {
  type: 'tag',
  message: 'git tag or branch',
  parse: parseTag,
  find: findByTag,
}
