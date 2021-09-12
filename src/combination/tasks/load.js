import { UserError, PluginError } from '../../error/main.js'

// Select the runners and retrieve their related spawn options using
// `runner.launch()`
export const loadRunner = async function ({
  id,
  config: runnerConfig,
  launch,
}) {
  const {
    spawn,
    spawnOptions = {},
    versions: runnerVersions,
  } = await launchRunner({ id, runnerConfig, launch })
  return { id, spawn, spawnOptions, runnerVersions, runnerConfig }
}

// Fire `runner.launch()`
const launchRunner = async function ({ id, runnerConfig, launch }) {
  try {
    return await launch(runnerConfig)
  } catch (error) {
    throw getLaunchError(error, id)
  }
}

const getLaunchError = function (error, id) {
  if (error instanceof UserError) {
    return new UserError(`In runner '${id}': ${error.message}`)
  }

  return new PluginError(`In runner '${id}', internal error: ${error.stack}`)
}
