import { UserError, PluginError, wrapError } from '../../error/main.js'
import { computeRunnerVersions } from '../../top/system/versions/compute.js'

// Select the runners and retrieve their related spawn options using
// `runner.launch()`
export const loadRunner = async function (
  { id, config, launch },
  cwd,
  commonVersions,
) {
  const {
    spawn,
    spawnOptions = {},
    versions,
  } = await launchRunner({ id, config, launch })
  const versionsA = await computeRunnerVersions({
    commonVersions,
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
  return error instanceof UserError
    ? wrapError(error, `In runner '${id}':`, UserError)
    : wrapError(error, `In runner '${id}', internal error:`, PluginError)
}
