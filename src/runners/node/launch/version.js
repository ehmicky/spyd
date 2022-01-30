import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { readPackageUp } from 'read-pkg-up'
import semver from 'semver'

import { UserError } from '../../../error/main.js'
import { wrapError } from '../../../error/wrap.js'

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
  // Lazy loading for performance reasons
  const { default: nvexeca } = await import('nvexeca')

  try {
    return await nvexeca(version, 'node', { progress: true, dry: true })
  } catch (error) {
    throw wrapError(
      error,
      `Configuration property "runnerConfig.node.version":`,
      UserError,
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
  } = await readPackageUp({ cwd })
  return allowedVersions
}

// We validate the version before starting measuring.
const validateVersion = function ({ versionRange, version }, allowedVersions) {
  if (!semver.satisfies(version, allowedVersions)) {
    throw new UserError(
      `Configuration property "runnerConfig.node.version":
Version ${versionRange} is invalid: it must be ${allowedVersions}`,
    )
  }
}
