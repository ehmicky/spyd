import { inspect } from 'util'

import { BUILTIN_KEYWORDS } from '../list/main.js'

import { validateKeywords } from './validate.js'

// Normalize and validate `options.keywords`
export const normalizeKeywords = function (keywords) {
  return addCustomKeywords(keywords).map(normalizeKeyword)
}

const addCustomKeywords = function (keywords) {
  if (keywords === undefined) {
    return BUILTIN_KEYWORDS
  }

  if (!Array.isArray(keywords)) {
    throw new TypeError(
      `Option "keywords" must be an array: ${inspect(keywords)}`,
    )
  }

  validateKeywords(keywords)
  return [...BUILTIN_KEYWORDS, ...keywords]
}

const normalizeKeyword = function (keyword) {
  return { ...DEFAULT_VALUES, ...keyword }
}

const DEFAULT_VALUES = {
  hasInput: false,
  undefinedInput: false,
  undefinedDefinition: false,
}
