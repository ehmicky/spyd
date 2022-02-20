import { normalizeOptionalArray } from '../../normalize/transform.js'

import { CoreError, ConsumerError } from './error.js'
import { safeNormalizeConfig } from './normalize.js'

// Normalize a list of `pluginConfigs`
export const normalizeList = async function (
  pluginConfigs,
  { name, context, cwd },
) {
  return await safeNormalizeConfig(pluginConfigs, LIST_DEFINITIONS, {
    context,
    cwd,
    prefix: `${name}.`,
    UserErrorType: ConsumerError,
    SystemErrorType: CoreError,
  })
}

const LIST_DEFINITIONS = [
  { name: '', required: true, transform: normalizeOptionalArray },
]
