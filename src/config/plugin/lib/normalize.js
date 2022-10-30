import {
  UnknownError,
  InputError,
  DefinitionError,
} from '../../normalize/lib/error.js'
import { normalizeInputs } from '../../normalize/lib/main.js'

// Call `normalizeConfig` while assigning the right error classes
export const safeNormalizeConfig = async function (config, rules, opts) {
  try {
    const { inputs } = await normalizeInputs(config, rules, opts)
    return inputs
  } catch (error) {
    const ErrorClass = getErrorClass(error, opts)
    throw new ErrorClass('', { cause: error })
  }
}

const getErrorClass = function (
  error,
  { InputErrorType, DefinitionErrorType },
) {
  if (error instanceof InputError) {
    return InputErrorType
  }

  return error instanceof DefinitionError ? DefinitionErrorType : UnknownError
}
