import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'

import { normalizeConfigProps } from './lib/main.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (
  config,
  rules,
  { UserErrorType = UserError, ...opts },
) {
  try {
    const { value } = await normalizeConfigProps(config, rules, {
      prefix: PREFIX,
      ...opts,
    })
    return value
  } catch (error) {
    throw handleConfigError(error, UserErrorType)
  }
}

export const PREFIX = 'Configuration property'

// Distinguish user validation errors from system errors
const handleConfigError = function (error, UserErrorType) {
  return error.validation ? wrapError(error, '', UserErrorType) : error
}
