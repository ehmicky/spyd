import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'

import { normalizeConfigProps } from './lib/main.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (
  config,
  definitions,
  { UserErrorType = UserError, ...opts },
) {
  try {
    return await normalizeConfigProps(config, definitions, opts)
  } catch (error) {
    throw handleConfigError(error, UserErrorType)
  }
}

// Distinguish user validation errors from system errors
const handleConfigError = function (error, UserErrorType) {
  return error.validation ? wrapError(error, '', UserErrorType) : error
}
