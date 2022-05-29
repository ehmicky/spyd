import { wrapError } from '../../../error/wrap.js'
import { normalizeInputs } from '../../normalize/lib/main.js'

// Call `normalizeConfig` while assigning the right error types
export const safeNormalizeConfig = async function (
  config,
  rules,
  { UserErrorType, ...opts },
) {
  const { inputs, error } = await callNormalizeConfig(config, rules, opts)

  if (error) {
    throw wrapError(error, '', UserErrorType)
  }

  return inputs
}

const callNormalizeConfig = async function (
  config,
  rules,
  { SystemErrorType, prefix, ...opts },
) {
  try {
    return await normalizeInputs(config, rules, {
      ...opts,
      all: prefix === undefined ? {} : { prefix },
      soft: true,
    })
  } catch (error) {
    throw wrapError(error, '', SystemErrorType)
  }
}
