import { UserError, PluginError } from '../../error/main.js'

// Select the runners and retrieve their related spawn options using
// `runner.launch()`
export const loadRunner = async function ({ id, config, launch }) {
  const {
    spawn,
    spawnOptions = {},
    versions,
  } = await launchRunner({ id, config, launch })
  return { id, spawn, spawnOptions, versions, config }
}

// Fire `runner.launch()`
const launchRunner = async function ({ id, config, launch }) {
  try {
    return await launch(config)
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
