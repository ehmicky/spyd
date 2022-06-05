import { modernErrors } from '../../../error/modern.js'

const { InputError, DefinitionError, KeywordError, CoreError, onError } =
  modernErrors(['InputError', 'DefinitionError', 'KeywordError', 'CoreError'])

export {
  // Invalid `inputs`
  InputError,
  // Invalid `rules` or `options`
  DefinitionError,
  // Bug in a keyword|plugin
  KeywordError,
  // Bug in the library itself
  CoreError,
  // Top-level error handler
  onError,
}
