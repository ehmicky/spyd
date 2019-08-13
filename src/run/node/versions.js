import normalizeNodeVersion from 'normalize-node-version'
import { rcompare, satisfies } from 'semver'
import readPkgUp from 'read-pkg-up'

// Normalize the node `versions` option
export const getNodeVersions = async function({ versions }) {
  if (versions === undefined) {
    return
  }

  const versionsA = versions.split(WHITESPACE_REGEXP)

  const [normalizedVersions, allowedVersions] = await Promise.all([
    normalizeVersions(versionsA),
    getAllowedVersions(),
  ])

  validateVersions(normalizedVersions, allowedVersions)

  const versionString = getVersionString(normalizedVersions)

  return { versions: versionsA, versionString }
}

const WHITESPACE_REGEXP = /\s+/u

// We normalize the Node versions for validation purpose and for `--system`,
// but not for the command id/title
const normalizeVersions = async function(versions) {
  const normalizedVersions = await Promise.all(versions.map(normalizeVersion))
  return normalizedVersions
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

// We can only allow Node versions that are valid with the runner's code
const getAllowedVersions = async function() {
  const {
    package: {
      engines: { node: allowedVersions },
    },
  } = await readPkgUp({ cwd: __dirname })
  return allowedVersions
}

// We validate the versions before starting the benchmarks.
const validateVersions = function(normalizedVersions, allowedVersions) {
  normalizedVersions.forEach(version =>
    validateVersion(version, allowedVersions),
  )
}

const validateVersion = function(version, allowedVersions) {
  if (!satisfies(version, allowedVersions)) {
    throw new Error(
      `In option 'run.node.versions': version ${version} must be ${allowedVersions}`,
    )
  }
}

// Versions shown in `--system` are normalized.
const getVersionString = function(normalizedVersions) {
  // eslint-disable-next-line fp/no-mutating-methods
  return normalizedVersions.sort(rcompare).join(' ')
}
