import normalizeNodeVersion from 'normalize-node-version'
import { rcompare } from 'semver'

// Normalize the node `versions` option
export const getNodeVersions = async function({ versions }) {
  if (versions === undefined) {
    return
  }

  const versionsA = versions.split(WHITESPACE_REGEXP)

  const versionString = await getVersionString(versionsA)
  return { versions: versionsA, versionString }
}

const WHITESPACE_REGEXP = /\s+/u

// Versions shown in `--system` are normalized.
// We also validate the versions before starting the benchmarks.
const getVersionString = async function(versions) {
  const versionsA = await Promise.all(versions.map(normalizeVersion))
  // eslint-disable-next-line fp/no-mutating-methods
  const versionString = versionsA.sort(rcompare).join(' ')
  return versionString
}

const normalizeVersion = async function(version) {
  try {
    return await normalizeNodeVersion(version)
  } catch (error) {
    // eslint-disable-next-line fp/no-mutation
    error.message = `In option 'run.node.versions': ${error.message}`
    throw error
  }
}
