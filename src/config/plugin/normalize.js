import { PluginError } from '../../error/main.js'
import { isParent } from '../normalize/lib/prop_path/parse.js'
import { normalizeConfig } from '../normalize/main.js'

// Validate a plugin has the correct shape and normalize it
export const normalizePlugin = async function (
  plugin,
  shape,
  topConfigPropNames,
) {
  return await normalizeConfig(plugin, [...COMMON_SHAPE, ...shape], {
    context: { topConfigPropNames },
    ErrorType: PluginError,
  })
}

const configPropName = {
  name: 'config.*.name',
  validate(name, { context: { topConfigPropNames } }) {
    if (isTopConfigProp(name, topConfigPropNames)) {
      throw new Error(
        `must not redefine core configuration property "${name}".`,
      )
    }
  },
}

const isTopConfigProp = function (name, topConfigPropNames) {
  return (
    topConfigPropNames.includes(name) ||
    topConfigPropNames.some((topConfigPropName) =>
      isParent(name, topConfigPropName),
    )
  )
}

// Definitions shared by all plugins
const COMMON_SHAPE = [configPropName]
