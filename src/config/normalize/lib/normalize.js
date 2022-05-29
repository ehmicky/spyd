import { inspect } from 'util'

import isPlainObj from 'is-plain-obj'
import { normalizeQuery } from 'wild-wild-parser'

import { wrapError } from '../../../error/wrap.js'

import { DefinitionError } from './error.js'
import { validateRuleProps } from './rule.js'

// Validate and normalize rules.
// All methods and properties that use queries can use either the string or the
// path syntax.
export const normalizeRules = function ({ rules, all, ruleProps, sync }) {
  validateRules(rules)
  return rules.map((rule) => normalizeRule({ rule, all, ruleProps, sync }))
}

const validateRules = function (rules) {
  if (!Array.isArray(rules)) {
    throw new DefinitionError(`Rules must be an array: ${inspect(rules)}`)
  }
}

const normalizeRule = function ({ rule, all, ruleProps, sync }) {
  if (!isPlainObj(rule)) {
    throw new DefinitionError(`Rule must be a plain object: ${inspect(rule)}`)
  }

  validateRuleProps({ definitions: rule, ruleProps, message: 'Rule', sync })
  const ruleA = all === undefined ? rule : { ...all, ...rule }
  return { ...ruleA, name: normalizeName(ruleA) }
}

const normalizeName = function (rule) {
  if (rule.name === undefined) {
    throw new DefinitionError(
      `Rule must have a "name" property: ${inspect(rule)}`,
    )
  }

  try {
    return normalizeQuery(rule.name)
  } catch (error) {
    throw wrapError(error, 'Invalid "name":', DefinitionError)
  }
}
