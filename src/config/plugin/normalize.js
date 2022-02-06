import { PluginError } from '../../error/main.js'
import { isParent } from '../normalize/lib/prop_path/parse.js'
import { normalizeConfig } from '../normalize/main.js'

// Validate a plugin has the correct shape and normalize it
export const normalizePlugin = async function (plugin, shape, sharedPropNames) {
  return await normalizeConfig(plugin, [...COMMON_SHAPE, ...shape], {
    context: { sharedPropNames },
    ErrorType: PluginError,
  })
}

const configPropName = {
  name: 'config.*.name',
  validate(name, { context: { sharedPropNames } }) {
    if (isSharedProp(name, sharedPropNames)) {
      throw new Error(
        `must not redefine core configuration property "${name}".`,
      )
    }
  },
}

const isSharedProp = function (name, sharedPropNames) {
  return (
    sharedPropNames.includes(name) ||
    sharedPropNames.some((sharedPropName) => isParent(name, sharedPropName))
  )
}

// Definitions shared by all plugins
const COMMON_SHAPE = [configPropName]
