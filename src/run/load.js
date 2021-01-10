import { UserError, PluginError } from '../error/main.js'

// Select the runners for the current tasks files, and retrieve their
// related commands using `runner.launch()`
export const loadRunners = async function (tasks, runners) {
  const runnersA = runners.filter(({ id }) => runnerHasTasks(id, tasks))
  return await Promise.all(runnersA.map(loadRunner))
}

// `runner` already includes only `tasks.*`.
// We have already validated that:
//  - globbing patterns match at least one file except when using an empty array
//  - empty arrays were not used on all `tasks.*`
// So the following is only required when empty arrays were used only one some
// of `tasks.*`
const runnerHasTasks = function (id, tasks) {
  return tasks.some(({ runnerId }) => runnerId === id)
}

const loadRunner = async function ({
  id: runnerId,
  title: runnerTitle,
  repeat: runnerRepeats,
  config: runnerConfig,
  launch,
}) {
  const {
    spawn: runnerSpawn,
    spawnOptions: runnerSpawnOptions = {},
    versions: runnerVersions = {},
  } = await launchRunner({ runnerId, runnerConfig, launch })
  return {
    runnerId,
    runnerTitle,
    runnerRepeats,
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
