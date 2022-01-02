import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { readPackageUp } from 'read-pkg-up'

import { PluginError } from '../error/main.js'
import { spawnProcess } from '../utils/spawn.js'

// Add runtime versions for this runner, returned as `versions` from
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
// priority order in the unlikely case two runners return the same properties in
// `versions`.
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

// TODO: use static JSON imports once those are possible
const getSpydVersion = async function () {
  const cwd = dirname(fileURLToPath(import.meta.url))
  const {
    packageJson: { version },
  } = await readPackageUp({ cwd, normalize: false })
  return version
}

const getRunnersVersions = async function (combinations, cwd) {
  const ids = [...new Set(combinations.map(getRunnerId))]
  return await Promise.all(
    ids.map((id) => getRunnerVersions(id, combinations, cwd)),
  )
}

const getRunnerId = function ({
  dimensions: {
    runner: { id },
  },
}) {
  return id
}

const getRunnerVersions = async function (id, combinations, cwd) {
  const {
    dimensions: {
      runner: { versions, spawnOptions },
    },
  } = combinations.find(
    (combination) => combination.dimensions.runner.id === id,
  )
  const versionsA = await Promise.all(
    Object.entries(versions).map(([name, version]) =>
      getRunnerVersion({ name, version, id, spawnOptions, cwd }),
    ),
  )
  return Object.assign({}, ...versionsA)
}

const getRunnerVersion = async function ({
  name,
  version,
  id,
  spawnOptions,
  cwd,
}) {
  if (typeof version === 'string') {
    return { [name]: version }
  }

  try {
    const { stdout } = await spawnProcess(
      version,
      { ...spawnOptions, stdin: 'ignore' },
      cwd,
    )
    return { [name]: stdout }
  } catch (error) {
    throw new PluginError(
      `Could not start runner "${id}"
Retrieving runner versions failed: ${version.join(' ')}
${error.message}`,
    )
  }
}
