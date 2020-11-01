import envCi from 'env-ci'
import moize from 'moize'

// Retrieve information related to git and to CI environment
export const getCiInfo = function (cwd) {
  const {
    commit,
    branch,
    name,
    build: buildNumber,
    buildUrl,
    job: jobNumber,
    jobUrl,
    tag,
    pr,
    prBranch,
  } = getEnvCi(cwd)
  const git = { commit, branch, tag, prNumber: pr, prBranch }
  const ci = { provider: name, buildNumber, buildUrl }
  const job = { jobNumber, jobUrl }
  return { git, ci, job }
}

const mGetEnvCi = function (cwd) {
  return envCi({ cwd })
}

export const getEnvCi = moize(mGetEnvCi, { maxSize: 1e3 })
