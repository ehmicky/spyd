import { normalizeOptionalArray } from '../../normalize/transform.js'

import { CoreError, UserError, ConsumerError } from './error.js'
import { getListItemsDefinitions } from './item.js'
import { safeNormalizeConfig } from './normalize.js'

// Normalize the main property, i.e. the list of `pluginsConfigs`
export const normalizeList = async function ({
  pluginType: {
    list,
    default: defaultValue,
    name,
    builtins,
    pluginProp,
    modulePrefix,
  },
  pluginConfigs = defaultValue,
  context,
  cwd,
}) {
  const isArray = Array.isArray(pluginConfigs)
  const pluginConfigsA = await safeNormalizeConfig(
    pluginConfigs,
    getListDefinitions(list),
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

const getListDefinitions = function (list) {
  return [
    { name: '', transform: normalizeOptionalArray },
    { ...list, name: '' },
  ]
}
