import { createRequire } from 'module'

import { modernErrors } from '../../../error/modern/main.js'

// TODO: replace with JSON imports after dropping support for Node <16.14.0
const {
  bugs: { url: bugsUrl },
} = createRequire(import.meta.url)('../../../../../package.json')

const { InputError, DefinitionError, KeywordError, onError } = modernErrors(
  ['InputError', 'DefinitionError', 'KeywordError'],
  { bugsUrl },
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
