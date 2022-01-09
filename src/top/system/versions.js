import { dirname } from 'path'
import { fileURLToPath } from 'url'

import pProps from 'p-props'
import { readPackageUp } from 'read-pkg-up'

import { PluginError } from '../../error/main.js'
import { groupBy } from '../../utils/group.js'
import { spawnProcess } from '../../utils/spawn.js'

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
  versions,
  id,
  spawnOptions,
  cwd,
}) {
  return await pProps(versions, (version) =>
    computeRunnerVersion({ version, id, spawnOptions, cwd }),
  )
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

// Merge `result.combinations[*].dimensions.runner.versions` into a single
// `result.systems[0].versions`.
export const addSystemVersions = async function (rawResult) {
  const versions = await getSystemVersions(rawResult)
  return { ...rawResult, systems: [{ ...rawResult.systems[0], versions }] }
}

const getSystemVersions = async function ({ combinations }) {
  const versions = getRunnersVersions(combinations)
  const spydVersion = await getSpydVersion()
  return Object.assign({}, ...versions, { Spyd: spydVersion })
}

const getRunnersVersions = function (combinations) {
  const runners = combinations.map(getRunner)
  return Object.values(groupBy(runners, 'id')).map(getRunnerVersions)
}

const getRunner = function ({ dimensions: { runner } }) {
  return runner
}

const getRunnerVersions = function ([{ versions }]) {
  return versions
}

// TODO: use static JSON imports once those are possible
const getSpydVersion = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const {
    packageJson: { version },
  } = await readPackageUp({ cwd, normalize: false })
  return version
}
