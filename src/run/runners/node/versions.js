import nvexeca from 'nvexeca'
import readPkgUp from 'read-pkg-up'
import { satisfies } from 'semver'

import { UserError } from '../../../error/main.js'

// Normalize the node `versions` config
export const getNodeVersions = async function ({ versions }) {
  if (versions === undefined) {
    return
  }

  const versionsA = versions.split(SEPARATOR_REGEXP)

  const [versionsB, allowedVersions] = await Promise.all([
    getFullVersions(versionsA),
    getAllowedVersions(),
  ])

  validateVersions(versionsB, allowedVersions)

  return versionsB
}

const SEPARATOR_REGEXP = /\s*,\s*/u

// We retrieve the full Node versions for validation purpose and for `--info`,
// but not for the command id/title
// This both downloads Node.js binary and normalize its `version`.
// This also retrieves the `command` and `spawnOptions`.
const getFullVersions = async function (versions) {
  try {
    return await Promise.all(
      versions.map((version) =>
        nvexeca(version, 'node', { progress: true, dry: true }),
      ),
    )
  } catch (error) {
    throw new UserError(
      `In the configuration property 'run-node-versions': ${error.message}`,
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

// We validate the versions before starting measuring.
const validateVersions = function (versions, allowedVersions) {
  versions.forEach(({ versionRange, version }) => {
    validateVersion(versionRange, version, allowedVersions)
  })
}

const validateVersion = function (versionRange, version, allowedVersions) {
  if (!satisfies(version, allowedVersions)) {
    throw new UserError(
      `In the configuration property 'run-node-versions': version ${versionRange} must be ${allowedVersions}`,
    )
  }
}
