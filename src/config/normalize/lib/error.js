import modernErrors from 'modern-errors'

import { packageJson } from '../../../utils/package.js'

export const {
  // Invalid `inputs`
  InputError,
  // Invalid `rules` or `options`
  DefinitionError,
  // Bug in a keyword|plugin
  KeywordError,
  // Top-level error handler
  errorHandler,
} = modernErrors({ bugsUrl: packageJson.bugs.url })
