import { normalizeObjectOrString } from '../../normalize/transform.js'

import { ConsumerError } from './error.js'
import { getExampleLocation } from './location_normalize.js'
import { safeNormalizeConfig } from './normalize.js'

// Validate that `pluginConfig` exists and is a plain object, or turn it into
// one if it uses the string shortcut syntax.
export const normalizePluginConfigTop = async (
  pluginConfig,
  { name, cwd, pluginProp, builtins, prefix, keywords },
) => {
  const locationName =
    typeof pluginConfig === 'string' ? name : `${name}.${pluginProp}`
  const { [pluginProp]: originalLocation, ...pluginConfigA } =
    await safeNormalizeConfig(pluginConfig, topRules, {
      all: { cwd, prefix, parent: name, context: { pluginProp, builtins } },
      keywords,
      InputErrorClass: ConsumerError,
      DefinitionErrorClass: Error,
    })
  return { originalLocation, pluginConfig: pluginConfigA, locationName }
}

const topRules = [
  {
    name: '.',
    required: true,
    schema: {
      type: ['string', 'object'],
      errorMessage: 'must be a string or a plain object',
    },
    example: getExampleLocation,
    transform: (value, { context: { pluginProp } }) =>
      normalizeObjectOrString(value, pluginProp),
  },
]
