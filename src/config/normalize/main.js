import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'

import { normalizeInputs } from './lib/main.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (
  config,
  rules,
  { UserErrorType = UserError, prefix = PREFIX, ...opts },
) {
  const { inputs, error } = await normalizeInputs(config, rules, {
    ...opts,
    prefix,
    soft: true,
  })

  if (error) {
    throw wrapError(error, '', UserErrorType)
  }

  return inputs
}

export const PREFIX = 'Configuration property'
