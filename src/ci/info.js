import envCi from 'env-ci'
import moize from 'moize'
import uuidv4 from 'uuid/v4.js'

// Retrieve information related to git and to CI environment
export const getCiInfo = function(cwd) {
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
    slug,
  } = getEnvCi(cwd)
  const git = { commit, branch, tag, prNumber: pr, prBranch }
  const ci = { provider: name, buildNumber, buildUrl }
  const job = { jobNumber, jobUrl }
  return { git, ci, job, slug }
}

// By default `group` is the current CI build. If not in CI, it is a UUIDv4.
export const getDefaultGroup = function({ cwd }) {
  const { service, build: buildNumber, slug } = getEnvCi(cwd)

  if (service === undefined || buildNumber === undefined) {
    return uuidv4()
  }

  const slugA = slug === undefined ? undefined : slug.replace('/', '-')
  return [slugA, service, buildNumber].filter(Boolean).join('-')
}

const mGetEnvCi = function(cwd) {
  return envCi({ cwd })
}

const getEnvCi = moize(mGetEnvCi)
