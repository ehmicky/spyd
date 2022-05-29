import { inspect } from 'util'

import moize from 'moize'

import { DefinitionError } from '../../error.js'
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
    throw new DefinitionError(
      `Option "keywords" must be an array: ${inspect(keywords)}`,
    )
  }

  validateKeywords(keywords)
  return [...BUILTIN_KEYWORDS, ...keywords]
}

const normalizeKeyword = function (keyword) {
  return {
    ...DEFAULT_VALUES,
    ...keyword,
    normalize: memoizeNormalize(keyword.normalize),
  }
}

const DEFAULT_VALUES = {
  hasInput: false,
  undefinedInput: false,
  undefinedDefinition: false,
}

// `keyword.normalize()` must be a pure function, because it is memoized for
// performance reasons.
const memoizeNormalize = function (normalize) {
  return normalize === undefined ? normalize : moize(normalize, MOIZE_OPTS)
}

const MOIZE_OPTS = { isSerialized: true, maxSize: 1 }
