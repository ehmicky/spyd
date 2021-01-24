import { UserError, PluginError } from '../error/main.js'
import { getSystemVersions } from '../system/versions.js'

// Select the runners and retrieve their related spawn options using
// `runner.launch()`
export const loadRunners = async function (runners, cwd) {
  const runnersA = await Promise.all(runners.map(loadRunner))
  const systemVersions = await getSystemVersions(runnersA, cwd)
  return { runners: runnersA, systemVersions }
}

const loadRunner = async function ({
  id: runnerId,
  config: runnerConfig,
  launch,
  extensions: runnerExtensions,
}) {
  const {
    spawn: runnerSpawn,
    spawnOptions: runnerSpawnOptions = {},
    versions: runnerVersions = {},
  } = await launchRunner({ runnerId, runnerConfig, launch })
  return {
    runnerId,
    runnerSpawn,
    runnerSpawnOptions,
    runnerVersions,
    runnerConfig,
    runnerExtensions,
  }
}

// Fire `runner.launch()`
const launchRunner = async function ({ runnerId, runnerConfig, launch }) {
  try {
    return await launch(runnerConfig)
  } catch (error) {
    throw getLaunchError(error, runnerId)
  }
}

const getLaunchError = function (error, runnerId) {
  if (error instanceof UserError) {
    return new UserError(`In runner '${runnerId}': ${error.message}`)
  }

  return new PluginError(
    `In runner '${runnerId}', internal error: ${error.stack}`,
  )
}
