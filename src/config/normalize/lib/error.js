import { createErrorType } from '../../../error/create.js'

// Invalid `inputs`
export const InputError = createErrorType('InputError')
// Invalid `rules` or `options`
export const DefinitionError = createErrorType('DefinitionError')
// Bug in a keyword|plugin
export const KeywordError = createErrorType('KeywordError')
// Bug in the library itself
export const CoreError = createErrorType('CoreError')

// All error types, with first being default type
export const ErrorTypes = [CoreError, InputError, DefinitionError, KeywordError]
