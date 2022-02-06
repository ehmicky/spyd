import { PluginError } from '../../error/main.js'
import { isParent } from '../normalize/lib/prop_path/parse.js'
import { normalizeConfig } from '../normalize/main.js'

// Validate a plugin has the correct shape and normalize it
export const normalizePlugin = async function (
  plugin,
  shape,
  sharedConfigPropNames,
) {
  return await normalizeConfig(plugin, [...COMMON_SHAPE, ...shape], {
    context: { sharedConfigPropNames },
    ErrorType: PluginError,
  })
}

const configPropName = {
  name: 'config.*.name',
  validate(name, { context: { sharedConfigPropNames } }) {
    if (isSharedConfigProp(name, sharedConfigPropNames)) {
      throw new Error(
        `must not redefine core configuration property "${name}".`,
      )
    }
  },
}

const isSharedConfigProp = function (name, sharedConfigPropNames) {
  return (
    sharedConfigPropNames.includes(name) ||
    sharedConfigPropNames.some((sharedConfigPropName) =>
      isParent(name, sharedConfigPropName),
    )
  )
}

// Definitions shared by all plugins
const COMMON_SHAPE = [configPropName]
