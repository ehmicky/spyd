import { normalizeOptionalArray } from '../../normalize/transform.js'

import { UserError, ConsumerError } from './error.js'
import { safeNormalizeConfig } from './normalize.js'

// Normalize a list of `pluginConfigs`
export const normalizeList = async function (
  pluginConfigs,
  { list, name, context, cwd },
) {
  return await safeNormalizeConfig(pluginConfigs, getListDefinitions(list), {
    context,
    cwd,
    prefix: `${name}.`,
    UserErrorType: ConsumerError,
    SystemErrorType: UserError,
  })
}

const getListDefinitions = function (list) {
  return [
    { name: '', required: true, transform: normalizeOptionalArray },
    { ...list, name: '' },
  ]
}
