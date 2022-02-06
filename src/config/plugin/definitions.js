import { getDummyDefinitions } from '../normalize/dummy.js'
import { normalizeOptionalArray } from '../normalize/transform.js'
import { validateObject, validateJson } from '../normalize/validate/complex.js'
import { validateDefinedString } from '../normalize/validate/simple.js'

import { PLUGIN_TYPES_ARRAY } from './types.js'

// Retrieve the definition for plugins, both the selection property
// (like `reporter`) and the configuration one (like `reporterConfig`).
// This enforces consistency across plugins for selection and configuration.
export const getPluginsDefinitions = function () {
  return PLUGIN_TYPES_ARRAY.flatMap(getPluginDefinitions)
}

const getPluginDefinitions = function ({
  configProp,
  selectProp: { default: defaultValue = [], ...selectProp },
  sharedProps,
}) {
  return [
    ...getDummyDefinitions(sharedProps),
    {
      default: defaultValue,
      transform: normalizeOptionalArray,
      ...selectProp,
    },
    {
      name: `${selectProp.name}.*`,
      validate: validateDefinedString,
    },
    {
      default: {},
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
