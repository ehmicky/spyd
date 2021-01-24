// Deltas can be git tags or branches.
const parseTag = function (delta) {
  if (typeof delta !== 'string') {
    return
  }

  return delta
}

// If several results match, we use the most recent once
const findByTag = function (results, tagOrBranch) {
  return results.findIndex(
    ({ system: { git: { tag, branch } = {} } }) =>
      tag === tagOrBranch || branch === tagOrBranch,
  )
}

export const tagFormat = {
  type: 'tag',
  message: 'git tag or branch',
  parse: parseTag,
  find: findByTag,
}
