import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'

import { normalizeConfigProps } from './lib/main.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (
  config,
  rules,
  { UserErrorType = UserError, prefix = PREFIX, ...opts },
) {
  const { value, error } = await normalizeConfigProps(config, rules, {
    ...opts,
    prefix,
    soft: true,
  })

  if (error) {
    throw wrapError(error, '', UserErrorType)
  }

  return value
}

export const PREFIX = 'Configuration property'
