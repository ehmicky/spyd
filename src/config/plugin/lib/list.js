import { normalizeConfig } from '../../normalize/main.js'
import {
  normalizeOptionalArray,
  normalizeObjectOrString,
} from '../../normalize/transform.js'
import {
  validateObjectOrString,
  validateJson,
} from '../../normalize/validate/complex.js'
import {
  validateFileExists,
  validateRegularFile,
} from '../../normalize/validate/fs.js'
import { validateDefinedString } from '../../normalize/validate/simple.js'

import { isModuleId, isPathId, isInlineId, resolveModuleId } from './id.js'

// Normalize the main property, i.e. the list of `pluginsConfigs`
export const normalizeList = async function ({
  pluginConfigs,
  pluginType: { name, list, builtins, pluginProp, modulePrefix },
  context,
  cwd,
}) {
  const definitions = getListDefinitions(name, list, pluginProp)
  const { [name]: pluginConfigsA } = await normalizeConfig(
    { [name]: pluginConfigs },
    definitions,
    { context: { ...context, builtins, pluginProp, modulePrefix }, cwd },
  )
  return pluginConfigsA
}

const getListDefinitions = function (name, list, pluginProp) {
  return [
    { ...list, name, ...normalizeListProp },
    { name: `${name}.*`, ...normalizeItem },
    { name: `${name}.*.${pluginProp}`, ...normalizeItemId },
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
  transform(value, { context: { pluginProp } }) {
    return normalizeObjectOrString(value, pluginProp)
  },
}

const normalizeItemId = {
  required: true,
  path(id, { context: { builtins } }) {
    return isPathId(id, builtins)
  },
  async validate(id, { context: { builtins, pluginProp } }) {
    if (isInlineId(id)) {
      validateObjectOrString(id, pluginProp)
      return
    }

    validateDefinedString(id)

    if (isPathId(id, builtins)) {
      await validateFileExists(id)
      await validateRegularFile(id)
    }
  },
  transform(id, { context: { builtins, modulePrefix }, cwd }) {
    return isModuleId(id, modulePrefix, builtins)
      ? resolveModuleId({ id, modulePrefix, builtins, cwd })
      : id
  },
}
