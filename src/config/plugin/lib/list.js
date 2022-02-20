import { normalizeOptionalArray } from '../../normalize/transform.js'

import { CoreError, UserError, ConsumerError } from './error.js'
import { getListItemsDefinitions } from './item.js'
import { safeNormalizeConfig } from './normalize.js'

// Normalize the main property, i.e. the list of `pluginsConfigs`
export const normalizeList = async function (
  {
    list,
    default: defaultValue,
    name,
    multiple,
    builtins,
    pluginProp,
    modulePrefix,
    context,
    cwd,
  },
  pluginConfigs = defaultValue,
) {
  const isArray = Array.isArray(pluginConfigs)
  const pluginConfigsA = await safeNormalizeConfig(
    pluginConfigs,
    getListDefinitions(list, multiple),
    {
      context,
      cwd,
      prefix: `${name}.`,
      UserErrorType: ConsumerError,
      SystemErrorType: UserError,
    },
  )
  return await safeNormalizeConfig(
    pluginConfigsA,
    getListItemsDefinitions(pluginProp, defaultValue, builtins),
    {
      context: { builtins, pluginProp, modulePrefix, isArray, name },
      cwd,
      prefix: `${name}.`,
      UserErrorType: ConsumerError,
      SystemErrorType: CoreError,
    },
  )
}

const getListDefinitions = function (list, multiple) {
  return [
    {
      name: '',
      validate: validateMultiple.bind(undefined, multiple),
      transform: normalizeOptionalArray,
    },
    { ...list, name: '' },
  ]
}

const validateMultiple = function (multiple, value) {
  if (!multiple && Array.isArray(value)) {
    throw new Error('must not be an array.')
  }
}
