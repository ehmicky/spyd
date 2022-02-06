import { validateUserId } from '../../combination/ids/validate.js'
import { PluginError } from '../../error/main.js'

// We allow plugin identifiers to be prefixed with an arbitrary string.
//  - This allows using the same plugin twice but with different configs.
//  - This is especially useful for using the same reporter but with different
//    `output`
// This does not apply to plugins which do not create combinations
// (e.g. runners) because those should use variations instead.
// Since the list of plugin module names is unknown, users must indicate using
// this by the usage of a delimiter character.
export const getModuleId = function (id, multiple, name) {
  const [moduleId, customId] = splitId(id, multiple)
  validateModuleId(moduleId, name)
  validateCustomId(customId, name)
  return moduleId
}

const splitId = function (id, multiple) {
  if (!multiple) {
    return [id]
  }

  const delimiterIndex = id.indexOf(CUSTOM_ID_DELIMITER)

  if (delimiterIndex === -1) {
    return [id]
  }

  const moduleId = id.slice(0, delimiterIndex)
  const customId = id.slice(delimiterIndex + 1)
  return [moduleId, customId]
}

const CUSTOM_ID_DELIMITER = '_'

const validateModuleId = function (moduleId, name) {
  if (!MODULE_ID_REGEXP.test(moduleId)) {
    throw new PluginError(`The identifier of the ${name} "${moduleId}" is invalid.
It should only contain lowercase letters and digits.`)
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
const MODULE_ID_REGEXP = /^[a-z][a-z\d]*$/u

const validateCustomId = function (customId, name) {
  if (customId !== undefined) {
    validateUserId({
      id: customId,
      messageName: `${name} identifier suffix`,
    })
  }
}
