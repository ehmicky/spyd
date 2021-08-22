import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { readPackageUpAsync } from 'read-pkg-up'

import { PluginError } from '../error/main.js'
import { spawnProcess } from '../utils/spawn.js'

// Runtime versions for this runner, returned as `versions` from
// `runner.launch()`. This is an object where:
//  - the key is runtime name (e.g. 'Node')
//  - the value is its version (e.g. '12.0.0').
//    Runners should try to omit the leading 'v'.
//    The value can either be a string (direct value) or an array of strings
//    (command to retrieve the version).
// Reported by the `--showSystem` configuration property.
// Meant to show information about runtime versions, modes (e.g. type of shell)
// and configuration.
// `combinations` preserve the order of `tasks.*`, i.e. this is used as a
// priority order in the unlikely case two runners return the properties in
// `versions`.
export const getSystemVersions = async function (combinations, cwd) {
  const [runnersVersions, spydVersion] = await Promise.all([
    getRunnersVersions(combinations, cwd),
    getSpydVersion(),
  ])
  return Object.assign({}, ...runnersVersions, { Spyd: spydVersion })
}

// TODO: use static JSON imports once those are possible
const getSpydVersion = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const {
    packageJson: { version },
  } = await readPackageUpAsync({ cwd, normalize: false })
  return version
}

const getRunnersVersions = async function (combinations, cwd) {
  const runnerIds = [...new Set(combinations.map(getRunnerId))]
  return await Promise.all(
    runnerIds.map((runnerId) => getRunnerVersions(runnerId, combinations, cwd)),
  )
}

const getRunnerId = function ({ runnerId }) {
  return runnerId
}

const getRunnerVersions = async function (runnerId, combinations, cwd) {
  const { runnerVersions, runnerSpawnOptions } = combinations.find(
    (combination) => combination.runnerId === runnerId,
  )
  const runnerVersionsA = await Promise.all(
    Object.entries(runnerVersions).map(([name, version]) =>
      getRunnerVersion({ name, version, runnerId, runnerSpawnOptions, cwd }),
    ),
  )
  return Object.assign({}, ...runnerVersionsA)
}

const getRunnerVersion = async function ({
  name,
  version,
  runnerId,
  runnerSpawnOptions,
  cwd,
}) {
  if (typeof version === 'string') {
    return { [name]: version }
  }

  try {
    const { stdout } = await spawnProcess(
      version,
      { ...runnerSpawnOptions, stdin: 'ignore' },
      cwd,
    )
    return { [name]: stdout }
  } catch (error) {
    throw new PluginError(
      `Could not start runner "${runnerId}"
Retrieving runner versions failed: ${version.join(' ')}
${error.message}`,
    )
  }
}
