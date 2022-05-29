import { inspect } from 'util'

import isPlainObj from 'is-plain-obj'
import { normalizeQuery } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

import { validateRuleProps } from './rule.js'

// Validate and normalize rules.
// All methods and properties that use queries can use either the string or the
// path syntax.
export const normalizeRules = function (rules, all, ruleProps) {
  validateRules(rules)
  return rules.map((rule) => normalizeRule(rule, all, ruleProps))
}

const validateRules = function (rules) {
  if (!Array.isArray(rules)) {
    throw new TypeError(`Rules must be an array: ${inspect(rules)}`)
  }
}

const normalizeRule = function (rule, all, ruleProps) {
  if (!isPlainObj(rule)) {
    throw new TypeError(`Rule must be a plain object: ${inspect(rule)}`)
  }

  validateRuleProps(rule, ruleProps, 'Rule')
  const ruleA = all === undefined ? rule : { ...all, ...rule }
  return { ...ruleA, name: normalizeName(ruleA) }
}

const normalizeName = function (rule) {
  if (rule.name === undefined) {
    throw new Error(`Rule must have a "name" property: ${inspect(rule)}`)
  }

  try {
    return normalizeQuery(rule.name)
  } catch (error) {
    throw wrapError(error, 'Invalid "name":')
  }
}
