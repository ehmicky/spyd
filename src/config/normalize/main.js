import { UserError } from '../../error/main.js'

import { normalizeInputs } from './lib/main.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async (config, rules, opts) => {
  const { inputs, error } = await normalizeInputs(config, rules, {
    ...opts,
    all: { ...opts.all, prefix: PREFIX },
    soft: true,
  })

  if (error) {
    throw new UserError('', { cause: error })
  }

  return inputs
}

export const PREFIX = 'Configuration property'
