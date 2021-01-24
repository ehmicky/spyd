import nvexeca from 'nvexeca'
import readPkgUp from 'read-pkg-up'
import { satisfies } from 'semver'

import { UserError } from '../../../error/main.js'

// Normalize the node `version` config
export const getNodeVersion = async function ({ version }) {
  if (version === undefined) {
    return
  }

  const [versionInfo, allowedVersions] = await Promise.all([
    getFullVersion(version),
    getAllowedVersions(),
  ])
  validateVersion(versionInfo, allowedVersions)
  return versionInfo
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
      `In the configuration property 'runnerNode.version': ${error.message}`,
    )
  }
}

// We can only allow Node versions that are valid with the runner's code
const getAllowedVersions = async function () {
  const {
    packageJson: {
      engines: { node: allowedVersions },
    },
  } = await readPkgUp({ cwd: __dirname })
  return allowedVersions
}

// We validate the version before starting measuring.
const validateVersion = function ({ versionRange, version }, allowedVersions) {
  if (!satisfies(version, allowedVersions)) {
    throw new UserError(
      `In the configuration property 'runnerNode.version': version ${versionRange} must be ${allowedVersions}`,
    )
  }
}
