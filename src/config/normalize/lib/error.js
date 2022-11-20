import ModernError from 'modern-errors'
import modernErrorsBugs from 'modern-errors-bugs'
import modernErrorsSwitch from 'modern-errors-switch'

import { bugs } from '../../../utils/package.js'

export const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsBugs, modernErrorsSwitch],
})

/* jscpd:ignore-start */
export const UnknownError = BaseError.subclass('UnknownError', { bugs })
/* jscpd:ignore-end */

// Invalid `inputs`
export const InputError = BaseError.subclass('InputError')

// Invalid `rules` or `options`
export const DefinitionError = BaseError.subclass('DefinitionError')

// Bug in a keyword|plugin
export const KeywordError = BaseError.subclass('KeywordError')
