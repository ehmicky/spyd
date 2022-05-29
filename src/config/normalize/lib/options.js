import { inspect } from 'util'

import filterObj from 'filter-obj'
import isPlainObj from 'is-plain-obj'

import { normalizeKeywords } from './keywords/normalize/main.js'

// Normalize `options`
export const normalizeOpts = function (options = {}) {
  if (!isPlainObj(options)) {
    throw new TypeError(`Options must be a plain object: ${inspect(options)}`)
  }

  const { soft = false, all, keywords } = options
  validateSoft(soft)
  const allA = normalizeAll(all)
  const keywordsA = normalizeKeywords(keywords)
  return { soft, all: allA, keywords: keywordsA }
}

const validateSoft = function (soft) {
  if (typeof soft !== 'boolean') {
    throw new TypeError(`Option "soft" must be a boolean: ${inspect(soft)}`)
  }
}

const normalizeAll = function (all) {
  if (all === undefined) {
    return
  }

  if (!isPlainObj(all)) {
    throw new TypeError(`Option "all" must be a plain object: ${inspect(all)}`)
  }

  return filterObj(all, isDefined)
}

const isDefined = function (key, value) {
  return value !== undefined
}
