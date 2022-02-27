import { fileURLToPath } from 'url'

import { validateObjectOrString } from '../../normalize/validate/complex.js'
import {
  validateFileExists,
  validateRegularFile,
} from '../../normalize/validate/fs.js'
import { validateDefinedString } from '../../normalize/validate/simple.js'

import { CoreError, ConsumerError } from './error.js'
import { resolveModuleLocation } from './module.js'
import { safeNormalizeConfig } from './normalize.js'

// Normalize `pluginConfig[pluginProp]`
export const normalizeLocation = async function (
  pluginConfig,
  locationType,
  { name, cwd, pluginProp, builtins, modulePrefix },
) {
  const locationRules = getLocationRules(locationType, pluginProp)
  const { [pluginProp]: location, ...pluginConfigA } =
    await safeNormalizeConfig(pluginConfig, locationRules, {
      context: { locationType, builtins, modulePrefix },
      cwd,
      parent: name,
      UserErrorType: ConsumerError,
      SystemErrorType: CoreError,
    })
  return { pluginConfig: pluginConfigA, location }
}

const getLocationRules = function (locationType, pluginProp) {
  return [
    { name: pluginProp, ...normalizeLocationProp },
    { name: pluginProp, ...NORMALIZE_LOCATIONS[locationType] },
  ]
}

export const getExampleLocation = function (value, { context: { builtins } }) {
  const builtinNames = Object.keys(builtins)
  return builtinNames.length !== 0 && builtinNames[0].trim() !== ''
    ? builtinNames[0]
    : undefined
}

const normalizeLocationProp = {
  required: true,
  example: getExampleLocation,
}

// URL instances are always absolute, so `cwd` resolution is not needed
const normalizeFileUrlLocation = {
  validate(location) {
    if (location.protocol !== 'file:') {
      throw new Error('must use "file:" as a URL protocol.')
    }
  },
  async transform(location) {
    const path = fileURLToPath(location)
    await validateFileExists(path)
    await validateRegularFile(path)
    return path
  },
}

const normalizeInlineLocation = {
  validate: validateObjectOrString,
}

const normalizeBuiltinLocation = {}

const normalizePathLocation = {
  path: true,
  validate: [validateFileExists, validateRegularFile],
}

const validateHasModulePrefix = function (
  value,
  { context: { modulePrefix } },
) {
  if (modulePrefix === undefined) {
    throw new Error('must start with . or / when it is a file path.')
  }
}

const normalizeModuleLocation = {
  validate: [validateDefinedString, validateHasModulePrefix],
  transform: resolveModuleLocation,
}

const NORMALIZE_LOCATIONS = {
  fileUrl: normalizeFileUrlLocation,
  inline: normalizeInlineLocation,
  builtin: normalizeBuiltinLocation,
  path: normalizePathLocation,
  module: normalizeModuleLocation,
}
