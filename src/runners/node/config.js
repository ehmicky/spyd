import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { readPackageUp } from 'read-pkg-up'
import semver from 'semver'

import { normalizeNumberString } from '../../config/normalize/transform.js'
import { validateNumberString } from '../../config/normalize/validate.js'
import { wrapError } from '../../error/wrap.js'

// Validate the Node.js version
// We apply `transformVersion` twice (during `validate` and `transform`) so that
// error messages show the non-transformed value, and because `nvexeca()` return
// value is memoized.
export const validateVersion = async function (version) {
  const [allowedVersions, { version: versionA }] = await Promise.all([
    getAllowedVersions(),
    transformVersion(version),
  ])

  if (!semver.satisfies(versionA, allowedVersions)) {
    throw new Error(`must be ${allowedVersions}`)
  }
}

// We can only allow Node versions that are valid with the runner's code
const getAllowedVersions = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const { packageJson } = await readPackageUp({ cwd })
  return packageJson.engines.node
}

// Resolve the Node.js version to a full version.
// This also:
//  - Downloads the Node.js binary
//  - Exposes running it as a `command` with `spawnOptions`
export const transformVersion = async function (version) {
  // Lazy loading for performance reasons
  const { default: nvexeca } = await import('nvexeca')

  try {
    return await nvexeca(version, 'node', { progress: true, dry: true })
  } catch (error) {
    throw wrapError(error, 'must be a valid Node.js version:')
  }
}

export const config = [
  {
    name: 'version',
    validate: validateNumberString,
    transform: normalizeNumberString,
  },
  {
    name: 'version',
    validate: validateVersion,
    transform: transformVersion,
  },
]
