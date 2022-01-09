import { dirname } from 'path'
import { fileURLToPath } from 'url'

import pProps from 'p-props'
import { readPackageUp } from 'read-pkg-up'

import { PluginError } from '../../error/main.js'
import { spawnProcess } from '../../utils/spawn.js'

// Add runtime versions for this runner, returned as `versions` from
// `runner.launch()`. This is an object where:
//  - the key is runtime name (e.g. 'Node')
//  - the value is its version (e.g. '12.0.0').
//    Runners should try to omit the leading 'v', for consistency.
//    The value can either be a string (direct value) or an array of strings
//    (command to retrieve the version).
// Reported by the `--showSystem` configuration property.
// Meant to show information about runtime versions, modes (e.g. type of shell)
// and configuration.
export const addSystemVersions = async function (rawResult, { cwd }) {
  const versions = await getSystemVersions(rawResult.combinations, cwd)
  return { ...rawResult, systems: [{ ...rawResult.systems[0], versions }] }
}

const getSystemVersions = async function (combinations, cwd) {
  const [versions, spydVersion] = await Promise.all([
    getRunnersVersions(combinations, cwd),
    getSpydVersion(),
  ])
  return Object.assign({}, ...versions, { Spyd: spydVersion })
}

const getRunnersVersions = async function (combinations, cwd) {
  const runners = combinations.map(getRunner)
  const ids = [...new Set(runners.map(getRunnerId))]
  return await Promise.all(ids.map((id) => getRunnerVersions(id, runners, cwd)))
}

const getRunner = function ({ dimensions: { runner } }) {
  return runner
}

const getRunnerVersions = async function (id, runners, cwd) {
  const { versions, spawnOptions } = runners.find(
    (runner) => getRunnerId(runner) === id,
  )
  return await pProps(versions, (version) =>
    getRunnerVersion({ version, id, spawnOptions, cwd }),
  )
}

const getRunnerId = function ({ id }) {
  return id
}

const getRunnerVersion = async function ({ version, id, spawnOptions, cwd }) {
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

// TODO: use static JSON imports once those are possible
const getSpydVersion = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const {
    packageJson: { version },
  } = await readPackageUp({ cwd, normalize: false })
  return version
}
