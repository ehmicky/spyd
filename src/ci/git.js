import { blue } from 'chalk'

// Serialize `git` information for CLI reporters.
export const prettifyGit = function(git) {
  if (isEmpty(git)) {
    return ''
  }

  const header = blue.bold('Git:')
  const commitPretty = prettifyCommit(git)
  const prPretty = prettifyPr(git)
  const body = [commitPretty, prPretty].filter(Boolean).join('\n')
  return `${header}\n${body}`
}

const isEmpty = function(git) {
  return Object.values(git).every(isUndefined)
}

const isUndefined = function(value) {
  return value === undefined
}

const prettifyCommit = function({ commit, tag, branch }) {
  if (commit === undefined) {
    return
  }

  const field = blue.bold('  Commit: ')
  const hash = getHash(commit, tag)
  const branchA = getBranch(branch)
  return `${field}${hash}${branchA}`
}

const getHash = function(commit, tag) {
  if (tag !== undefined) {
    return tag
  }

  return commit.slice(0, COMMIT_SIZE)
}

const COMMIT_SIZE = 8

const prettifyPr = function({ prNumber, prBranch }) {
  if (prNumber === undefined) {
    return ''
  }

  const field = blue.bold('  PR: ')
  const prBranchA = getBranch(prBranch)
  return `${field}#${prNumber}${prBranchA}`
}

const getBranch = function(branch) {
  if (branch === undefined) {
    return ''
  }

  return ` (${branch})`
}
