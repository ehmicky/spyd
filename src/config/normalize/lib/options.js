import { inspect } from 'util'

import filterObj from 'filter-obj'
import isPlainObj from 'is-plain-obj'

import { normalizeKeywords } from './keywords/normalize/main.js'
import { getRuleProps, validateRuleProps } from './rule.js'

// Normalize `options`
export const normalizeOpts = function (options = {}) {
  if (!isPlainObj(options)) {
    throw new TypeError(`Options must be a plain object: ${inspect(options)}`)
  }

  const { soft = false, all, keywords } = options
  validateSoft(soft)
  const keywordsA = normalizeKeywords(keywords)
  const ruleProps = getRuleProps(keywordsA)
  const allA = normalizeAll(all, ruleProps)
  return { soft, all: allA, keywords: keywordsA, ruleProps }
}

const validateSoft = function (soft) {
  if (typeof soft !== 'boolean') {
    throw new TypeError(`Option "soft" must be a boolean: ${inspect(soft)}`)
  }
}

const normalizeAll = function (all, ruleProps) {
  if (all === undefined) {
    return
  }

  if (!isPlainObj(all)) {
    throw new TypeError(`Option "all" must be a plain object: ${inspect(all)}`)
  }

  const allA = filterObj(all, isDefined)
  validateRuleProps(allA, ruleProps, 'Option "all"')
  return allA
}

const isDefined = function (key, value) {
  return value !== undefined
}
