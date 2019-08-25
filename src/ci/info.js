import envCi from 'env-ci'
import moize from 'moize'

// Retrieve information related to git and to CI environment
const mGetCiInfo = function(cwd) {
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
  } = envCi({ cwd })
  const git = { commit, branch, tag, prNumber: pr, prBranch }
  const ci = { provider: name, buildNumber, buildUrl }
  const job = { jobNumber, jobUrl }
  return { git, ci, job }
}

export const getCiInfo = moize(mGetCiInfo)
