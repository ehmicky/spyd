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

import { isModuleId, isPathId, isInlineId, resolveModuleId } from './id.js'

// Retrieve normalization definition for `plugins[*]` strings or objects
export const getListItemsDefinitions = function (pluginProp) {
  return [
    { name: '*', ...normalizeItem },
    { name: '*.moduleId', ...normalizeItemModuleId },
    { name: `*.${pluginProp}`, ...normalizeItemId },
  ]
}

const normalizeItem = {
  validate(value) {
    validateObjectOrString(value)
    validateJson(value)
  },
  transform(value, { context: { pluginProp } }) {
    return normalizeObjectOrString(value, pluginProp)
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
