// Serialize `git` information for CLI reporters.
export const serializeGit = function ({ commit, tag, branch }) {
  return commit === undefined && tag === undefined
    ? undefined
    : `${getHash(commit, tag)}${getBranch(branch)}`
}

const getHash = function (commit, tag) {
  return tag === undefined ? commit.slice(0, COMMIT_SIZE) : tag
}

const COMMIT_SIZE = 8

export const serializePr = function ({ prNumber, prBranch }) {
  return prNumber === undefined
    ? undefined
    : `#${prNumber}${getBranch(prBranch)}`
}

const getBranch = function (branch) {
  return branch === undefined ? '' : ` (${branch})`
}
