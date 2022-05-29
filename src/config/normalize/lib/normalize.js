import { normalizeQuery } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

// Validate and normalize rules.
// All methods and properties that use queries can use either the string or the
// path syntax.
export const normalizeRules = function (rules, all) {
  return rules.map((rule) => ({ ...all, ...rule })).map(normalizeRule)
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
