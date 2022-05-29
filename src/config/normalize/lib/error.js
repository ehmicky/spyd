import { createErrorType } from '../../../error/utils.js'

// Invalid `inputs`
export const InputError = createErrorType('InputError')
// Invalid `rules` or `options`
export const DefinitionError = createErrorType('DefinitionError')
// Bug in a keyword|plugin
export const KeywordError = createErrorType('KeywordError')
// Bug in the library itself
export const CoreError = createErrorType('CoreError')
