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
  configProp: { name: configPropName, ...configProp },
  selectProp: {
    name: selectPropName,
    default: defaultValue = [],
    ...selectProp
  },
  sharedProps,
}) {
  return [
    ...getDummyDefinitions(sharedProps),
    {
      name: selectPropName,
      default: defaultValue,
      transform: normalizeOptionalArray,
      ...selectProp,
    },
    {
      name: `${selectPropName}.*`,
      validate: validateDefinedString,
    },
    {
      name: configPropName,
      default: {},
      validate: validateObject,
      ...configProp,
    },
    {
      name: `${configPropName}.*`,
      default: {},
      validate: validateObject,
    },
    {
      name: `${configPropName}.*.*`,
      validate: validateJson,
    },
  ]
}
