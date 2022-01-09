import mapObj from 'map-obj'
import pProps from 'p-props'

import { PluginError } from '../../../error/main.js'
import { spawnProcess } from '../../../utils/spawn.js'

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
// only once, for performance and consistency.
// This can happen when using runnerConfig variations.
// We do this separately for each runner since:
//  - Having the same command array + `spawnOptions` is quite unlikely
//  - The performance benefit is minimal, since it would reduce the
//    parallelization of retrieving task paths, which is much slower
//  - Runners have different `id` to report in the error message
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
