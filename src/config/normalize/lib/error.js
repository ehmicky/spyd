import modernErrors from 'modern-errors'
import modernErrorsBugs from 'modern-errors-bugs'

import { bugs } from '../../../utils/package.js'

export const AnyError = modernErrors([modernErrorsBugs])

export const UnknownError = AnyError.subclass('UnknownError', { bugs })

// Invalid `inputs`
export const InputError = AnyError.subclass('InputError')

// Invalid `rules` or `options`
export const DefinitionError = AnyError.subclass('DefinitionError')

// Bug in a keyword|plugin
export const KeywordError = AnyError.subclass('KeywordError')
