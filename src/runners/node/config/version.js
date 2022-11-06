import { version as currentNodeVersion } from 'node:process'

import semver from 'semver'

import { normalizeNumberString } from '../../../config/normalize/transform.js'
import { nodeVersion } from '../../../utils/package.js'
import { AnyError } from '../../common/error.js'

// Normalize and validate the Node.js version.
// We can only allow Node versions that are valid with the runner's code.
const transformVersion = async function (version) {
  const versionInfo = await normalizeVersion(version)

  if (!semver.satisfies(versionInfo.version, nodeVersion)) {
    throw new Error(`must be ${nodeVersion}`)
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
  } catch (cause) {
    throw new AnyError('must be a valid Node.js version:\n', { cause })
  }
}

export const versionRule = {
  name: 'version',
  schema: {
    type: ['string', 'number'],
    minLength: 1,
    errorMessage: {
      type: 'must be a version string',
      minLength: 'must not be an empty string',
    },
  },
  transform: transformVersion,
  example: currentNodeVersion.slice(1),
}
