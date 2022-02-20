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
import { isModuleId, isPathId, isInlineId, resolveModuleId } from './id.js'
import { safeNormalizeConfig } from './normalize.js'

// Normalize a single `pluginConfig`
export const normalizeItem = async function (
  pluginConfig,
  { name, builtins, pluginProp, modulePrefix, cwd },
) {
  const itemDefinitions = getListItemsDefinitions(pluginProp, builtins)
  return await safeNormalizeConfig(pluginConfig, itemDefinitions, {
    context: { builtins, pluginProp, modulePrefix },
    cwd,
    prefix: `${name}.`,
    UserErrorType: ConsumerError,
    SystemErrorType: CoreError,
  })
}

const getListItemsDefinitions = function (pluginProp, builtins) {
  const exampleId = getExampleId(builtins)
  return [
    { ...normalizeItemTop, example: exampleId },
    normalizeItemModuleId,
    { ...normalizeItemId, name: pluginProp, example: exampleId },
  ]
}

const getExampleId = function (builtins) {
  const builtinIds = Object.keys(builtins)
  return builtinIds.length !== 0 && builtinIds[0].trim() !== ''
    ? builtinIds[0]
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

const normalizeItemModuleId = {
  name: 'moduleId',
  compute({ context: { builtins, modulePrefix }, config: { id } }) {
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
