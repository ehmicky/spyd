import { normalizeObjectOrString } from '../../normalize/transform.js'
import {
  validateObjectOrString,
  validateJson,
} from '../../normalize/validate/complex.js'

import { CoreError, ConsumerError } from './error.js'
import { getExampleLocation } from './location_normalize.js'
import { safeNormalizeConfig } from './normalize.js'

// Validate that `pluginConfig` exists and is a plain object, or turn it into
// one if it uses the string shortcut syntax.
export const normalizePluginConfigTop = async function (
  pluginConfig,
  { name, cwd, pluginProp, builtins },
) {
  return await safeNormalizeConfig(pluginConfig, [normalizeTop], {
    context: { pluginProp, builtins },
    cwd,
    parent: name,
    UserErrorType: ConsumerError,
    SystemErrorType: CoreError,
  })
}

const normalizeTop = {
  name: '',
  required: true,
  validate(value) {
    validateObjectOrString(value)
    validateJson(value)
  },
  example: getExampleLocation,
  transform(value, { context: { pluginProp } }) {
    return normalizeObjectOrString(value, pluginProp)
  },
}
