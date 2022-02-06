import { getDummyDefinitions } from '../normalize/dummy.js'
import { amongCommands } from '../normalize/pick.js'
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
  selectProp,
  configProp,
  commands,
  selectShape: { default: defaultValue = [], ...selectShape },
  sharedConfig,
}) {
  const pick = amongCommands(commands)
  return [
    ...getDummyDefinitions(sharedConfig),
    {
      name: selectProp,
      pick,
      default: defaultValue,
      transform: normalizeOptionalArray,
      ...selectShape,
    },
    {
      name: `${selectProp}.*`,
      pick,
      validate: validateDefinedString,
    },
    {
      name: configProp,
      pick,
      default: {},
      validate: validateObject,
    },
    {
      name: `${configProp}.*`,
      pick,
      default: {},
      validate: validateObject,
    },
    {
      name: `${configProp}.*.*`,
      pick,
      validate: validateJson,
    },
  ]
}
