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
  const locationDefinitions = getLocationDefinitions(locationType, pluginProp)
  const { [pluginProp]: location, ...pluginConfigA } =
    await safeNormalizeConfig(pluginConfig, locationDefinitions, {
      context: { locationType, builtins, modulePrefix },
      cwd,
      prefix: `${name}.`,
      UserErrorType: ConsumerError,
      SystemErrorType: CoreError,
    })
  return { pluginConfig: pluginConfigA, location }
}

const getLocationDefinitions = function (locationType, pluginProp) {
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
    validateFileUrlScheme(location)
  },
  async transform(location) {
    const path = fileURLToPath(location)
    await validateFileExists(path)
    await validateRegularFile(path)
    return path
  },
}

const validateFileUrlScheme = function (location) {
  if (location.protocol !== 'file:') {
    throw new Error('must use "file:" as a URL protocol.')
  }
}

const normalizeInlineLocation = {
  validate: validateObjectOrString,
}

const normalizeBuiltinLocation = {}

const normalizePathLocation = {
  path: true,
  async validate(location) {
    await validateFileExists(location)
    await validateRegularFile(location)
  },
}

const normalizeModuleLocation = {
  validate(value, { context: { modulePrefix } }) {
    validateDefinedString(value)
    validateHasModulePrefix(modulePrefix)
  },
  transform: resolveModuleLocation,
}

const validateHasModulePrefix = function (modulePrefix) {
  if (modulePrefix === undefined) {
    throw new Error('must start with . or / when it is a file path.')
  }
}

const NORMALIZE_LOCATIONS = {
  fileUrl: normalizeFileUrlLocation,
  inline: normalizeInlineLocation,
  builtin: normalizeBuiltinLocation,
  path: normalizePathLocation,
  module: normalizeModuleLocation,
}
