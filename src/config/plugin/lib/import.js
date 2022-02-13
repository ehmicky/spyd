import { createRequire } from 'module'
import { pathToFileURL } from 'url'

import { PluginError, UserError } from '../../../error/main.js'
import { wrapError } from '../../../error/wrap.js'
import { PLUGINS_IMPORT_BASE } from '../../normalize/cwd.js'

// Builtin modules are lazy loaded for performance reasons.
// The return value is shallow merged to make it a plain object instead of
// a dynamic `Module` instance.
export const importPlugin = async function ({
  id,
  propName,
  modulePrefix,
  builtins,
}) {
  validateId(id, propName)
  const plugin = await importPluginById({
    id,
    propName,
    modulePrefix,
    builtins,
  })
  return { ...plugin }
}

const validateId = function (id, propName) {
  if (!PLUGIN_ID_REGEXP.test(id)) {
    throw new PluginError(`The configuration property "${propName}.id" "${id}" is invalid.
It must only contain lowercase letters and digits.`)
  }
}

// We do not allow any delimiter characters such as . _ - nor uppercase letters
// because:
//  - the id is part of the npm package, which has strict validation rules
//  - we use dots in CLI flags for nested configuration properties
//  - we want to allow user-defined ids to use _ or -
//  - avoid mixing delimiters, so it's easier to remember for users
//  - consistent option name across spyd.yml, CLI flags, programmatic
// This does not apply to the optional user-defined prefix.
// This is purposely not applied to shared configs.
const PLUGIN_ID_REGEXP = /^[a-z][a-z\d]*$/u

const importPluginById = async function ({
  id,
  propName,
  modulePrefix,
  builtins,
}) {
  const builtin = builtins[id]

  if (builtin !== undefined) {
    return await builtin()
  }

  const moduleName = `${modulePrefix}${id}`
  const pluginPath = safeGetPluginPath(
    moduleName,
    propName,
    PLUGINS_IMPORT_BASE,
  )

  try {
    return await import(pathToFileURL(pluginPath))
  } catch (error) {
    throw wrapError(
      error,
      `Could not load "${propName}.id" "${id}"\n\n`,
      PluginError,
    )
  }
}

// Find the local file path of a plugin.
// We enforce a naming convention for all plugins.
// All plugins are Node modules.
// We do not allow npm @scope because:
//  - This is simpler for users
//  - This prevent the confusion (which could be malicious) created by the
//    ambiguity
// TODO: use import.meta.resolve() when available
const safeGetPluginPath = function (moduleName, propName, base) {
  try {
    return getPluginPath(moduleName, base)
  } catch (error) {
    throw wrapError(
      error,
      `The configuration property "${propName}.id"`,
      UserError,
    )
  }
}

export const getPluginPath = function (moduleName, base) {
  const { resolve } = createRequire(new URL(base, import.meta.url))

  try {
    return resolve(moduleName)
  } catch (error) {
    throw wrapError(
      error,
      `must be a valid package name: "${moduleName}".
This Node module was not found, please ensure it is installed.\n\n`,
    )
  }
}
