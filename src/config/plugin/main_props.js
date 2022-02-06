import { normalizeUserConfig } from '../normalize/main.js'
import { normalizeOptionalArray } from '../normalize/transform.js'
import { validateObject, validateJson } from '../normalize/validate/complex.js'
import { validateDefinedString } from '../normalize/validate/simple.js'

import { addPluginTypeDefault } from './default.js'
import { PLUGIN_TYPES_ARRAY } from './types.js'

// Ensure selection and configuration properties are not marked as unknown
export const getPluginsProps = function () {
  return PLUGIN_TYPES_ARRAY.map(addPluginTypeDefault).flatMap(getPluginProps)
}

const getPluginProps = function ({ configProp, selectProp }) {
  return [configProp.name, selectProp.name]
}

// Normalize both `selectProp` and `configProp`.
export const normalizeMainProps = async function ({
  config,
  pluginType,
  context,
  configInfos,
}) {
  const definitions = getMainPropsDefinitions(pluginType)
  return await normalizeUserConfig({
    config,
    definitions,
    opts: { context },
    configInfos,
  })
}

const getMainPropsDefinitions = function ({ configProp, selectProp }) {
  return [
    {
      transform: normalizeOptionalArray,
      ...selectProp,
    },
    {
      name: `${selectProp.name}.*`,
      validate: validateDefinedString,
    },
    {
      validate: validateObject,
      ...configProp,
    },
    {
      name: `${configProp.name}.*`,
      default: {},
      validate: validateObject,
    },
    {
      name: `${configProp.name}.*.*`,
      validate: validateJson,
    },
  ]
}
