import { UserError, PluginError } from '../error/main.js'

// Select the runners for the current tasks files, and retrieve their
// related commands using `runner.launch()`
export const loadRunners = async function (run) {
  return await Promise.all(run.map(loadRunner))
}

const loadRunner = async function ({
  id: runnerId,
  title: runnerTitle,
  repeat: runnerRepeats,
  extensions,
  launch,
  config: runConfig,
}) {
  const {
    spawn: runnerSpawn,
    spawnOptions: runnerSpawnOptions = {},
    versions: runnerVersions = {},
  } = await launchRunner({ runnerId, runConfig, launch })
  return {
    runnerId,
    runnerTitle,
    runnerRepeats,
    runnerSpawn,
    runnerSpawnOptions,
    runnerVersions,
    extensions,
  }
}

// Fire `runner.launch()`
const launchRunner = async function ({ runnerId, runConfig, launch }) {
  try {
    return await launch(runConfig)
  } catch (error) {
    handleCommandsError(error, runnerId)
  }
}

const handleCommandsError = function (error, runnerId) {
  if (error instanceof UserError) {
    throw new UserError(`In runner '${runnerId}': ${error.message}`)
  }

  throw new PluginError(
    `In runner '${runnerId}', internal error: ${error.stack}`,
  )
}
