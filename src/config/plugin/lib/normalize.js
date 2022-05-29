import { wrapError } from '../../../error/wrap.js'
import { normalizeInputs } from '../../normalize/lib/main.js'

import { CoreError } from './error.js'

// Call `normalizeConfig` while assigning the right error types
export const safeNormalizeConfig = async function (config, rules, opts) {
  try {
    const { inputs } = await normalizeInputs(config, rules, opts)
    return inputs
  } catch (error) {
    throw wrapError(error, '', getErrorType(error, opts))
  }
}

const getErrorType = function (error, { InputErrorType, DefinitionErrorType }) {
  if (error.name === 'InputError') {
    return InputErrorType
  }

  return error.name === 'DefinitionError' ? DefinitionErrorType : CoreError
}
