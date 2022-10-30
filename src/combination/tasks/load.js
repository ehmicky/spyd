import { PluginError } from '../../error/main.js'
import { computeRunnerVersions } from '../../top/system/versions/compute.js'

// Select the runners and retrieve their related spawn options using
// `runner.launch()`
export const loadRunner = async function (
  { id, config, launch, bugs },
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
  return { id, spawn, spawnOptions, versions: versionsA, config, bugs }
}

// Fire `runner.launch()`.
// Errors are always considered plugin errors.
// User errors should be captured in `plugin.config` instead.
const launchRunner = async function ({ id, config, launch }) {
  try {
    return await launch(config)
  } catch (cause) {
    throw new PluginError(`Could not launch runner "${id}"`, { cause })
  }
}
