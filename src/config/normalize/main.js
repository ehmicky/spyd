import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'
import { normalizeConfigSelectors } from '../select/normalize.js'

import { normalizeConfigProps } from './lib/main.js'

// Normalize the configuration and allow properties to use config selectors
export const normalizeVariableConfig = async function (
  config,
  definitions,
  opts,
) {
  const variableDefinitions = definitions.flatMap(normalizeConfigSelectors)
  return await normalizeConfig(config, variableDefinitions, opts)
}

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (
  config,
  definitions,
  { context = {}, prefix, ErrorType = UserError },
) {
  try {
    return await normalizeConfigProps(config, definitions, { context, prefix })
  } catch (error) {
    throw handleConfigError(error, ErrorType)
  }
}

// Distinguish user validation errors from system errors
const handleConfigError = function (error, ErrorType) {
  return error.validation ? wrapError(error, '', ErrorType) : error
}
