import envCi from 'env-ci'
import moize from 'moize'

// Retrieve information related to git and to CI environment
export const getCiInfo = function (cwd) {
  const { commit, branch, buildUrl, tag, pr: prNumber, prBranch } = getEnvCi(
    cwd,
  )
  return { commit, branch, tag, prNumber, prBranch, buildUrl }
}

const mGetEnvCi = function (cwd) {
  return envCi({ cwd })
}

export const getEnvCi = moize(mGetEnvCi, { maxSize: 1e3 })
