import { validateInput } from './validate.js'
import { getVersion } from './versions.js'
import { runNode } from './run.js'

// Forwards `args` to another node instance of a specific `versionRange`
export const nve = async function(versionRange, args = []) {
  validateInput(versionRange, args)

  const versionA = await getVersion(versionRange)
  const { exitCode, signal } = await runNode(versionA, args)
  return { exitCode, signal }
}
