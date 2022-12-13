import {
  UnknownError,
  InputError,
  DefinitionError,
} from '../../normalize/lib/error.js'
import { normalizeInputs } from '../../normalize/lib/main.js'

import { BaseError } from './error.js'

// Call `normalizeConfig` while assigning the right error classes
export const safeNormalizeConfig = async (
  config,
  rules,
  { InputErrorClass, DefinitionErrorClass, ...opts },
) => {
  try {
    const { inputs } = await normalizeInputs(config, rules, opts)
    return inputs
  } catch (error) {
    throw BaseError.switch(error)
      .case(InputError, InputErrorClass)
      .case(DefinitionError, DefinitionErrorClass)
      .default(UnknownError)
  }
}
