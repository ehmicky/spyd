import pProps from 'p-props'

import { PluginError } from '../../../error/main.js'
import { mapKeys, mapValues } from '../../../utils/map.js'
import { spawnProcess } from '../../../utils/spawn.js'

import { VERSIONS_VALUE_SEPARATOR } from './merge.js'

// Get runtime versions for this runner, returned as `versions` from
// `runner.launch()`. This is an object where:
//  - the key is runtime name (e.g. 'Node')
//  - the value is its version (e.g. '12.0.0').
//    Runners should try to omit the leading 'v', for consistency.
//    The value can either be a string (direct value) or an array of strings
//    (command to retrieve the version).
// Reported by the `--showSystem` configuration property.
// Meant to show information about runtime versions, modes (e.g. type of shell)
// and configuration.
export const computeRunnerVersions = async ({
  commonVersions,
  versions,
  id,
  spawnOptions,
  cwd,
}) => {
  const dedupedVersions = mapValues(versions, keepOriginalName)
  const dedupedVersionsA = mapKeys(dedupedVersions, dedupeVersion)
  const dedupedVersionsB = await pProps(dedupedVersionsA, ({ name, version }) =>
    computeRunnerVersion({ name, version, id, spawnOptions, cwd }),
  )
  const versionsA = mapValues(
    versions,
    (version) => dedupedVersionsB[serializeVersion(version)],
  )
  return { ...versionsA, ...commonVersions }
}

// If two versions have the same command array, dedupe it so it is performed
// only once, for performance and consistency.
// This can happen when using runnerConfig variations.
// We do this separately for each runner since:
//  - Having the same command array + `spawnOptions` is quite unlikely
//  - The performance benefit is minimal, since it would reduce the
//    parallelization of retrieving task paths, which is much slower
//  - Runners have different `id` to report in the error message
const keepOriginalName = (version, name) => ({ version, name })

const dedupeVersion = (name, { version }) => serializeVersion(version)

const serializeVersion = (version) =>
  Array.isArray(version) ? version.join(' ') : version

const computeRunnerVersion = async ({
  name,
  version,
  id,
  spawnOptions,
  cwd,
}) => {
  const versionA = await getRunnerVersion({ version, id, spawnOptions, cwd })
  validateVersion({ version: versionA, name, id })
  return versionA
}

const getRunnerVersion = async ({ version, id, spawnOptions, cwd }) => {
  if (typeof version === 'string') {
    return version
  }

  try {
    const { stdout } = await spawnProcess(
      version,
      { ...spawnOptions, stdin: 'ignore' },
      cwd,
    )
    return stdout
  } catch (cause) {
    throw new PluginError(
      `Could not start runner "${id}".
Retrieving runner versions failed: ${version.join(' ')}`,
      { cause },
    )
  }
}

// When merging runners and results with different values of the same version
// property, we concatenate them. This becomes ambiguous if the version value
// contains the same separator.
const validateVersion = ({ version, name, id }) => {
  if (version.includes(VERSIONS_VALUE_SEPARATOR)) {
    throw new PluginError(
      `Could not start runner "${id}".
Computing runner's "${name}" version failed because it cannot contain "${VERSIONS_VALUE_SEPARATOR}": "${version}"`,
    )
  }
}
