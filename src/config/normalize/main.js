import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'

import { normalizeConfigProps } from './lib/main.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (
  config,
  definitions,
  { context, ErrorType = UserError },
) {
  try {
    return await normalizeConfigProps(config, definitions, { context })
  } catch (error) {
    throw handleConfigError(error, ErrorType)
  }
}

// Distinguish user validation errors from system errors
const handleConfigError = function (error, ErrorType) {
  return error.validation ? wrapError(error, '', ErrorType) : error
}
