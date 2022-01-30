import { PluginError } from '../../error/main.js'
import { normalizeConfig } from '../normalize/main.js'

// Validate a plugin has the correct shape and normalize it
export const normalizePlugin = async function (plugin, mainDefinitions) {
  return await normalizeConfig(plugin, mainDefinitions, {
    ErrorType: PluginError,
  })
}
