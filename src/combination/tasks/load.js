import { UserError, PluginError } from '../../error/main.js'
import { computeRunnerVersions } from '../../top/system/versions.js'

// Select the runners and retrieve their related spawn options using
// `runner.launch()`
export const loadRunner = async function ({ id, config, launch }, cwd) {
  const {
    spawn,
    spawnOptions = {},
    versions,
  } = await launchRunner({ id, config, launch })
  const versionsA = await computeRunnerVersions({
    versions,
    id,
    spawnOptions,
    cwd,
  })
  return { id, spawn, spawnOptions, versions: versionsA, config }
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
