import { PluginError } from '../../error/main.js'
import { isParent } from '../normalize/lib/prop_path/parse.js'
import { normalizeConfig } from '../normalize/main.js'

// Validate a plugin has the correct shape and normalize it
export const normalizePlugin = async function (plugin, shape, topPropNames) {
  return await normalizeConfig(plugin, [...COMMON_SHAPE, ...shape], {
    context: { topPropNames },
    UserErrorType: PluginError,
  })
}

const configPropName = {
  name: 'config.*.name',
  validate(name, { context: { topPropNames } }) {
    if (isTopProp(name, topPropNames)) {
      throw new Error(
        `must not redefine core configuration property "${name}".`,
      )
    }
  },
}

const isTopProp = function (name, topPropNames) {
  return (
    topPropNames.includes(name) ||
    topPropNames.some((topPropName) => isParent(name, topPropName))
  )
}

// Definitions shared by all plugins
const COMMON_SHAPE = [configPropName]
