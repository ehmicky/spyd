import { inspect } from 'util'

import { DefinitionError } from '../error.js'

// Parallel rules and nested rules do not make sense in sync mode
export const validateSerialRules = function (rules) {
  if (rules instanceof Set) {
    throw new DefinitionError(
      `Rules must not be a Set unless the "async" option is true: ${inspect(
        rules,
      )}`,
    )
  }

  if (!Array.isArray(rules)) {
    throw new DefinitionError(`Rules must be an array: ${inspect(rules)}`)
  }

  rules.forEach(validateSerialRule)
}

const validateSerialRule = function (rule) {
  if (Array.isArray(rule) || rule instanceof Set) {
    throw new DefinitionError(
      `Rules must not be nested unless the "async" option is true: ${inspect(
        rule,
      )}`,
    )
  }
}
