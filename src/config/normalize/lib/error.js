import { modernErrors } from '../../../error/modern/main.js'
import { packageJson } from '../../../utils/package.js'

const { InputError, DefinitionError, KeywordError, onError } = modernErrors(
  ['InputError', 'DefinitionError', 'KeywordError'],
  { bugsUrl: packageJson.bugs.url },
)

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
