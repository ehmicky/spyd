import { normalizeConfig } from '../../normalize/main.js'
import {
  normalizeOptionalArray,
  normalizeObjectOrString,
} from '../../normalize/transform.js'
import {
  validateObjectOrString,
  validateJson,
} from '../../normalize/validate/complex.js'
import { validateDefinedString } from '../../normalize/validate/simple.js'

import { isModuleId, isPathId, resolveModuleId } from './id.js'

// Normalize the main property, i.e. the list of `pluginsConfigs`
export const normalizeList = async function ({
  pluginConfigs,
  pluginType: { name, list, builtins, modulePrefix },
  context,
  cwd,
}) {
  const definitions = getListDefinitions(name, list)
  const { [name]: pluginConfigsA } = await normalizeConfig(
    { [name]: pluginConfigs },
    definitions,
    { context: { ...context, builtins, modulePrefix }, cwd },
  )
  return pluginConfigsA
}

const getListDefinitions = function (name, list) {
  return [
    { ...list, name, ...normalizeListProp },
    { name: `${name}.*`, ...normalizeItem },
    { name: `${name}.*.id`, ...normalizeItemId },
  ]
}

const normalizeListProp = {
  transform: normalizeOptionalArray,
}

const normalizeItem = {
  validate(value) {
    validateObjectOrString(value)
    validateJson(value)
  },
  transform(value) {
    return normalizeObjectOrString(value, 'id')
  },
}

const normalizeItemId = {
  required: true,
  path(id, { context: { builtins } }) {
    return isPathId(id, builtins)
  },
  validate: validateDefinedString,
  transform(id, { context: { builtins, modulePrefix }, cwd }) {
    return isModuleId(id, modulePrefix, builtins)
      ? resolveModuleId(id, modulePrefix, cwd)
      : id
  },
}
