import { dirname } from 'path'
import { version as currentNodeVersion } from 'process'
import { fileURLToPath } from 'url'

import { readPackageUp } from 'read-pkg-up'
import semver from 'semver'

import { normalizeNumberString } from '../../../config/normalize/transform.js'
import { validateNumberString } from '../../../config/normalize/validate/simple.js'
import { wrapError } from '../../../error/wrap.js'

// Normalize and validate the Node.js version
const transformVersion = async function (version) {
  const [versionInfo, allowedVersions] = await Promise.all([
    normalizeVersion(version),
    getAllowedVersions(),
  ])

  if (!semver.satisfies(versionInfo.version, allowedVersions)) {
    throw new Error(`must be ${allowedVersions}`)
  }

  return versionInfo.version
}

// Resolve the Node.js version to a full version.
// This also:
//  - Downloads the Node.js binary
//  - Exposes running it as a `command` with `spawnOptions`
const normalizeVersion = async function (version) {
  const versionA = normalizeNumberString(version)
  // Lazy loading for performance reasons
  const { default: nvexeca } = await import('nvexeca')

  try {
    return await nvexeca(versionA, 'node', { progress: true, dry: true })
  } catch (error) {
    throw wrapError(error, 'must be a valid Node.js version:')
  }
}

// We can only allow Node versions that are valid with the runner's code
const getAllowedVersions = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const { packageJson } = await readPackageUp({ cwd })
  return packageJson.engines.node
}

export const versionRule = {
  name: 'version',
  validate: validateNumberString,
  transform: transformVersion,
  example: currentNodeVersion.slice(1),
}
