import { modernErrors } from '../../../error/modern.js'

const { InputError, DefinitionError, KeywordError, onError } = modernErrors([
  'InputError',
  'DefinitionError',
  'KeywordError',
])

export {
  // Invalid `inputs`
  InputError,
  // Invalid `rules` or `options`
  DefinitionError,
  // Bug in a keyword|plugin
  KeywordError,
  // Top-level error handler
  onError,
}
