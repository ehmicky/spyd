// Serialize `git` information for CLI reporters.
export const prettifyGit = function (git) {
  if (git === undefined) {
    return
  }

  return {
    Git: {
      Commit: prettifyCommit(git),
      PR: prettifyPr(git),
    },
  }
}

const prettifyCommit = function ({ commit, tag, branch }) {
  if (commit === undefined) {
    return
  }

  const hash = getHash(commit, tag)
  const branchA = getBranch(branch)
  return `${hash}${branchA}`
}

const getHash = function (commit, tag) {
  if (tag !== undefined) {
    return tag
  }

  return commit.slice(0, COMMIT_SIZE)
}

const COMMIT_SIZE = 8

const prettifyPr = function ({ prNumber, prBranch }) {
  if (prNumber === undefined) {
    return
  }

  const prBranchA = getBranch(prBranch)
  return `#${prNumber}${prBranchA}`
}

const getBranch = function (branch) {
  if (branch === undefined) {
    return ''
  }

  return ` (${branch})`
}
