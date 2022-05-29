import filterObj from 'filter-obj'
import { normalizeQuery } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

// Validate and normalize rules.
// All methods and properties that use queries can use either the string or the
// path syntax.
export const normalizeRules = function (rules, all) {
  const rulesA = mergeRulesAll(rules, all)
  return rulesA.map(normalizeRule)
}

const mergeRulesAll = function (rules, all) {
  if (all === undefined) {
    return rules
  }

  const allA = filterObj(all, isDefined)
  return rules.map((rule) => ({ ...allA, ...rule }))
}

const isDefined = function (key, value) {
  return value !== undefined
}

const normalizeRule = function (rule) {
  return { ...rule, name: normalizeName(rule.name) }
}

const normalizeName = function (name) {
  try {
    return normalizeQuery(name)
  } catch (error) {
    throw wrapError(error, 'Invalid "name":')
  }
}
