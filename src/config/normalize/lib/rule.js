import { normalizeQuery, serializeQuery } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

// Validate and normalize rules.
// All methods and properties that use queries can use either the string or the
// path syntax.
export const normalizeRules = function (rules, all) {
  return rules.map((rule) => normalizeRule(rule, all))
}

const normalizeRule = function ({ name, ...rule }, all) {
  const namePath = getNamePath(name)
  const nameQuery = serializeQuery(namePath)
  return { example: rule.default, ...all, ...rule, nameQuery, namePath }
}

const getNamePath = function (name) {
  try {
    return normalizeQuery(name)
  } catch (error) {
    throw wrapError(error, 'Invalid "name":')
  }
}
