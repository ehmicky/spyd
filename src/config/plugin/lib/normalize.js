import { wrapError } from '../../../error/wrap.js'
import { normalizeConfigProps } from '../../normalize/lib/main.js'

// Call `normalizeConfig` while assigning the right error types
export const safeNormalizeConfig = async function (
  config,
  rules,
  { UserErrorType, SystemErrorType, ...opts },
) {
  try {
    return await normalizeConfigProps(config, rules, {
      ...opts,
      prefix: PREFIX,
    })
  } catch (error) {
    const ErrorType = error.validation ? UserErrorType : SystemErrorType
    throw wrapError(error, '', ErrorType)
  }
}

const PREFIX = 'Configuration property'
