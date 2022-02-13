import { normalizeConfig } from '../../normalize/main.js'
import {
  normalizeOptionalArray,
  normalizeObjectOrString,
} from '../../normalize/transform.js'
import {
  validateObjectOrString,
  validateJson,
} from '../../normalize/validate/complex.js'
import { validateDefinedString } from '../../normalize/validate/simple.js'

// Normalize the main property, i.e. the list of `pluginsConfigs`
export const normalizeList = async function ({
  pluginConfigs,
  pluginType: { name, list },
  context,
  cwd,
}) {
  const definitions = getListDefinitions(name, list)
  const { [name]: pluginConfigsA } = await normalizeConfig(
    { [name]: pluginConfigs },
    definitions,
    { context, cwd },
  )
  return pluginConfigsA
}

const getListDefinitions = function (name, list) {
  return [
    {
      ...list,
      name,
      transform: normalizeOptionalArray,
    },
    {
      name: `${name}.*`,
      validate(value) {
        validateObjectOrString(value)
        validateJson(value)
      },
      transform: normalizeObjectOrString.bind(undefined, 'id'),
    },
    {
      name: `${name}.*.id`,
      required: true,
      validate: validateDefinedString,
    },
  ]
}
