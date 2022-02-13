import { normalizeOptionalArray } from '../../normalize/transform.js'

import { CoreError, UserError, ConsumerError } from './error.js'
import { getListItemsDefinitions } from './item.js'
import { safeNormalizeConfig } from './normalize.js'

// Normalize the main property, i.e. the list of `pluginsConfigs`
export const normalizeList = async function ({
  pluginConfigs,
  pluginType: { list, name, builtins, pluginProp, modulePrefix },
  context,
  cwd,
}) {
  const pluginConfigsA =
    pluginConfigs === undefined
      ? undefined
      : normalizeOptionalArray(pluginConfigs)
  const pluginConfigsB = await safeNormalizeConfig(
    pluginConfigsA,
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
    pluginConfigsB,
    getListItemsDefinitions(pluginProp),
    {
      context: { builtins, pluginProp, modulePrefix },
      cwd,
      prefix: `${name}.`,
      UserErrorType: ConsumerError,
      SystemErrorType: CoreError,
    },
  )
}

const getListDefinitions = function (list) {
  return [{ ...list, name: '' }]
}
