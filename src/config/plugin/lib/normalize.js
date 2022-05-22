import { wrapError } from '../../../error/wrap.js'
import { normalizeConfigProps } from '../../normalize/lib/main.js'

// Call `normalizeConfig` while assigning the right error types
export const safeNormalizeConfig = async function (
  config,
  rules,
  { UserErrorType, ...opts },
) {
  const { value, error } = await callNormalizeConfig(config, rules, opts)

  if (error) {
    throw wrapError(error, '', UserErrorType)
  }

  return value
}

const callNormalizeConfig = async function (
  config,
  rules,
  { SystemErrorType, ...opts },
) {
  try {
    return await normalizeConfigProps(config, rules, { ...opts, soft: true })
  } catch (error) {
    throw wrapError(error, '', SystemErrorType)
  }
}
