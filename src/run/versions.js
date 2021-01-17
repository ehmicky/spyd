import { PluginError } from '../error/main.js'
import { spawnProcess } from '../process/spawn.js'

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
export const getRunnerVersions = async function ({
  versions,
  runnerId,
  runnerSpawnOptions,
  cwd,
}) {
  const runnerVersions = await Promise.all(
    Object.entries(versions).map(([name, version]) =>
      getRunnerVersion({ name, version, runnerId, runnerSpawnOptions, cwd }),
    ),
  )
  return Object.assign({}, ...runnerVersions)
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
