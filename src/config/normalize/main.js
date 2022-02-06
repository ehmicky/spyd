import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'

import { normalizeConfigProps } from './lib/main.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (
  config,
  definitions,
  { context = {}, prefix, SystemErrorType, UserErrorType = UserError, cwd },
) {
  try {
    return await normalizeConfigProps(config, definitions, {
      context,
      prefix,
      cwd,
    })
  } catch (error) {
    throw handleConfigError(error, SystemErrorType, UserErrorType)
  }
}

// Distinguish user validation errors from system errors
const handleConfigError = function (error, SystemErrorType, UserErrorType) {
  if (error.validation) {
    return wrapError(error, '', UserErrorType)
  }

  return SystemErrorType === undefined
    ? error
    : wrapError(error, '', SystemErrorType)
}
