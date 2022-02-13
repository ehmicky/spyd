import {
  validateObject,
  validateObjectOrString,
  validateJson,
} from '../../normalize/validate/complex.js'
import {
  validateFileExists,
  validateRegularFile,
} from '../../normalize/validate/fs.js'
import { validateDefinedString } from '../../normalize/validate/simple.js'

import { isModuleId, isPathId, isInlineId, resolveModuleId } from './id.js'

// Retrieve normalization definition for `plugins[*]` strings or objects
export const getListItemsDefinitions = function (
  pluginProp,
  defaultValue,
  builtins,
) {
  const exampleId = getExampleId(defaultValue, builtins)
  return [
    { name: '*', example: exampleId, ...normalizeItem },
    { name: '*.moduleId', ...normalizeItemModuleId },
    { name: `*.${pluginProp}`, example: exampleId, ...normalizeItemId },
  ]
}

const getExampleId = function (defaultValue, builtins) {
  return getFirstItem(defaultValue) || getFirstItem(Object.keys(builtins))
}

const getFirstItem = function (stringArray) {
  return stringArray !== undefined &&
    stringArray.length !== 0 &&
    stringArray[0].trim() !== ''
    ? stringArray[0]
    : undefined
}

const normalizeItem = {
  validate(value) {
    validateObject(value)
    validateJson(value)
  },
}

const normalizeItemModuleId = {
  compute({
    context: { builtins, modulePrefix },
    path: [index],
    config: {
      [index]: { id },
    },
  }) {
    return isModuleId(id, modulePrefix, builtins) ? id : undefined
  },
}

const normalizeItemId = {
  required: true,
  path(id, { context: { builtins } }) {
    return isPathId(id, builtins)
  },
  async validate(id, { context: { builtins } }) {
    if (isInlineId(id)) {
      validateObjectOrString(id)
      return
    }

    validateDefinedString(id)

    if (isPathId(id, builtins)) {
      await validateFileExists(id)
      await validateRegularFile(id)
    }
  },
  transform(id, { context: { builtins, modulePrefix }, cwd }) {
    return isModuleId(id, modulePrefix, builtins)
      ? resolveModuleId({ id, modulePrefix, builtins, cwd })
      : id
  },
}
