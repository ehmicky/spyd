import { inspect } from 'node:util'

import { DefinitionError } from '../../error.js'
import { BUILTIN_KEYWORDS } from '../list/main.js'

import { normalizeAsyncMethods } from './async.js'
import { validateKeywords } from './validate.js'

// Normalize and validate `options.keywords`
export const normalizeKeywords = function (keywords, sync) {
  return addCustomKeywords(keywords).map((keyword) =>
    normalizeKeyword(keyword, sync),
  )
}

const addCustomKeywords = function (keywords) {
  if (keywords === undefined) {
    return BUILTIN_KEYWORDS
  }

  if (!Array.isArray(keywords)) {
    throw new DefinitionError(
      `Option "keywords" must be an array: ${inspect(keywords)}`,
    )
  }

  validateKeywords(keywords)
  return [...BUILTIN_KEYWORDS, ...keywords]
}

const normalizeKeyword = function (keyword, sync) {
  const keywordA = normalizeAsyncMethods(keyword, sync)
  return { ...DEFAULT_VALUES, ...keywordA }
}

const DEFAULT_VALUES = {
  hasInput: false,
  undefinedInput: false,
  undefinedDefinition: false,
}
