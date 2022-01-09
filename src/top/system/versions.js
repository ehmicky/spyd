import { dirname } from 'path'
import { fileURLToPath } from 'url'

import mapObj from 'map-obj'
import pProps from 'p-props'
import { readPackageUp } from 'read-pkg-up'

import { PluginError } from '../../error/main.js'
import { groupBy } from '../../utils/group.js'
import { spawnProcess } from '../../utils/spawn.js'

// Retrieve runtime versions common to all runners
export const getCommonVersions = async function () {
  return await getSpydVersion()
}

// Store the `spyd` version on each result
// TODO: use static JSON imports once those are possible
const getSpydVersion = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const {
    packageJson: { version },
  } = await readPackageUp({ cwd, normalize: false })
  return { Spyd: version }
}

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
export const computeRunnerVersions = async function ({
  commonVersions,
  versions,
  id,
  spawnOptions,
  cwd,
}) {
  const dedupedVersions = mapObj(versions, dedupeVersion)
  const dedupedVersionsA = await pProps(dedupedVersions, (version) =>
    computeRunnerVersion({ version, id, spawnOptions, cwd }),
  )
  const versionsA = mapObj(versions, (name, version) => [
    name,
    dedupedVersionsA[serializeVersion(version)],
  ])
  return { ...versionsA, ...commonVersions }
}

// If two versions have the same command array, dedupe it so it is performed
// only once, for performance and consistency
const dedupeVersion = function (name, version) {
  return [serializeVersion(version), version]
}

const serializeVersion = function (version) {
  return Array.isArray(version) ? version.join(' ') : version
}

const computeRunnerVersion = async function ({
  version,
  id,
  spawnOptions,
  cwd,
}) {
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
  } catch (error) {
    throw new PluginError(
      `Could not start runner "${id}"
Retrieving runner versions failed: ${version.join(' ')}
${error.message}`,
    )
  }
}

// Merge `result.combinations[*].dimensions.runner.versions` into
// `result.systems[*].versions`.
export const mergeSystemVersions = function (rawResult) {
  const versions = getSystemVersions(rawResult)
  return { ...rawResult, systems: [{ ...rawResult.systems[0], versions }] }
}

const getSystemVersions = function ({ combinations }) {
  const runners = combinations.map(getRunner)
  const versionsArray = Object.values(groupBy(runners, 'id')).map(
    getRunnerVersions,
  )
  return Object.assign({}, ...versionsArray)
}

const getRunner = function ({ dimensions: { runner } }) {
  return runner
}

const getRunnerVersions = function ([{ versions }]) {
  return versions
}
