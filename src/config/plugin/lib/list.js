import { isAbsolute } from 'path'

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

// Normalize the main property, i.e. the list of `pluginsConfigs`
export const normalizeList = async function ({
  pluginConfigs,
  pluginType: { name, list },
  context,
  cwd,
}) {
  const definitions = getListDefinitions(name, list)
  const { [name]: pluginConfigsA } = await normalizeConfig(
    { [name]: pluginConfigs },
    definitions,
    { context, cwd },
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
  path(value) {
    return value.startsWith('.') || isAbsolute(value)
  },
  validate: validateDefinedString,
}
