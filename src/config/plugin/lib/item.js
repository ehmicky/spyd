import { normalizeObjectOrString } from '../../normalize/transform.js'
import {
  validateObjectOrString,
  validateJson,
} from '../../normalize/validate/complex.js'
import {
  validateFileExists,
  validateRegularFile,
} from '../../normalize/validate/fs.js'
import { validateDefinedString } from '../../normalize/validate/simple.js'

import { CoreError, ConsumerError } from './error.js'
import {
  isModuleLocation,
  isPathLocation,
  isInlineLocation,
  resolveModuleLocation,
} from './location.js'
import { safeNormalizeConfig } from './normalize.js'

// Normalize a single `pluginConfig`
export const normalizeItem = async function (
  pluginConfig,
  { name, builtins, pluginProp, modulePrefix, cwd },
) {
  const itemDefinitions = getItemDefinition(pluginProp, builtins)
  return await safeNormalizeConfig(pluginConfig, itemDefinitions, {
    context: { builtins, pluginProp, modulePrefix },
    cwd,
    prefix: `${name}.`,
    UserErrorType: ConsumerError,
    SystemErrorType: CoreError,
  })
}

const getItemDefinition = function (pluginProp, builtins) {
  const exampleLocation = getExampleLocation(builtins)
  return [
    { ...normalizeItemTop, example: exampleLocation },
    normalizeItemModuleLoc,
    { ...normalizeItemLocation, name: pluginProp, example: exampleLocation },
  ]
}

const getExampleLocation = function (builtins) {
  const builtinNames = Object.keys(builtins)
  return builtinNames.length !== 0 && builtinNames[0].trim() !== ''
    ? builtinNames[0]
    : undefined
}

const normalizeItemTop = {
  name: '',
  required: true,
  validate(value) {
    validateObjectOrString(value)
    validateJson(value)
  },
  transform(value, { context: { pluginProp } }) {
    return normalizeObjectOrString(value, pluginProp)
  },
}

const normalizeItemModuleLoc = {
  name: 'moduleLocation',
  compute({
    context: { builtins, modulePrefix, pluginProp },
    config: { [pluginProp]: location },
  }) {
    return isModuleLocation(location, modulePrefix, builtins)
      ? location
      : undefined
  },
}

const normalizeItemLocation = {
  required: true,
  path(location, { context: { builtins } }) {
    return isPathLocation(location, builtins)
  },
  async validate(location, { context: { builtins } }) {
    if (isInlineLocation(location)) {
      validateObjectOrString(location)
      return
    }

    validateDefinedString(location)

    if (isPathLocation(location, builtins)) {
      await validateFileExists(location)
      await validateRegularFile(location)
    }
  },
  transform(location, { context: { builtins, modulePrefix }, cwd }) {
    return isModuleLocation(location, modulePrefix, builtins)
      ? resolveModuleLocation({ location, modulePrefix, builtins, cwd })
      : location
  },
}
