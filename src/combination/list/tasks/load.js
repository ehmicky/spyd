import { UserError, PluginError } from '../../../error/main.js'

// Select the runners and retrieve their related spawn options using
// `runner.launch()`
export const loadRunners = async function (runners) {
  return await Promise.all(runners.map(loadRunner))
}

const loadRunner = async function ({
  id: runnerId,
  config: runnerConfig,
  launch,
}) {
  const {
    spawn: runnerSpawn,
    spawnOptions: runnerSpawnOptions = {},
    versions: runnerVersions,
  } = await launchRunner({ runnerId, runnerConfig, launch })
  return {
    runnerId,
    runnerSpawn,
    runnerSpawnOptions,
    runnerVersions,
    runnerConfig,
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
