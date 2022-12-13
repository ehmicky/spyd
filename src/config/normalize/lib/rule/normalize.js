import { inspect } from 'node:util'

import isPlainObj from 'is-plain-obj'
import { normalizeQuery } from 'wild-wild-parser'

import { DefinitionError } from '../error.js'

import { validateRuleProps } from './validate.js'

// Validate and normalize rule object.
// All methods and properties that use queries can use either the string or the
// path syntax.
export const normalizeRule = ({ rule, all, ruleProps, sync }) => {
  if (!isPlainObj(rule)) {
    throw new DefinitionError(`Rule must be a plain object: ${inspect(rule)}`)
  }

  validateRuleProps({ definitions: rule, ruleProps, message: 'Rule', sync })
  const ruleA = all === undefined ? rule : { ...all, ...rule }
  return { ...ruleA, name: normalizeName(ruleA) }
}

const normalizeName = (rule) => {
  if (rule.name === undefined) {
    throw new DefinitionError(
      `Rule must have a "name" property: ${inspect(rule)}`,
    )
  }

  try {
    return normalizeQuery(rule.name)
  } catch (cause) {
    throw new DefinitionError('Invalid "name":\n', { cause })
  }
}
