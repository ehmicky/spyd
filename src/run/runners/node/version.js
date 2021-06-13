import { dirname } from 'path'
import { fileURLToPath } from 'url'

import nvexeca from 'nvexeca'
import { readPackageUpAsync } from 'read-pkg-up'
import { satisfies } from 'semver'

import { UserError } from '../../../error/main.js'

// Normalize the node `version` config
export const getNodeVersion = async function ({ version }) {
  if (version === undefined) {
    return
  }

  const versionA = normalizeVersion(version)
  const [versionInfo, allowedVersions] = await Promise.all([
    getFullVersion(versionA),
    getAllowedVersions(),
  ])
  validateVersion(versionInfo, allowedVersions)
  return versionInfo
}

// If `version` is `MAJOR` or `MAJOR.MINOR`, yargs will parse it as a number
const normalizeVersion = function (version) {
  return typeof version === 'number' ? String(version) : version
}

// We retrieve the full Node version for validation purpose and for
// `--showSystem`, but not for the command id/title
// This both downloads Node.js binary and normalize its `version`.
// This also retrieves the `command` and `spawnOptions`.
const getFullVersion = async function (version) {
  try {
    return await nvexeca(version, 'node', { progress: true, dry: true })
  } catch (error) {
    throw new UserError(
      `In the configuration property "runnerNode.version"\n${error.message}`,
    )
  }
}

// We can only allow Node versions that are valid with the runner's code
const getAllowedVersions = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))

  const {
    packageJson: {
      engines: { node: allowedVersions },
    },
  } = await readPackageUpAsync({ cwd })
  return allowedVersions
}

// We validate the version before starting measuring.
const validateVersion = function ({ versionRange, version }, allowedVersions) {
  if (!satisfies(version, allowedVersions)) {
    throw new UserError(
      `In the configuration property "runnerNode.version"
Version ${versionRange} is invalid: it must be ${allowedVersions}`,
    )
  }
}
