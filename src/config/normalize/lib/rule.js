import { inspect } from 'util'

import { DefinitionError } from './error.js'

// Retrieve the list of possible rule properties
export const getRuleProps = function (keywords) {
  return new Set([...CORE_PROPS, ...keywords.map(getKeywordName)])
}

const getKeywordName = function ({ name }) {
  return name
}

// Rule properties that are not keywords
const CORE_PROPS = ['name']
export const CORE_PROPS_SET = new Set(CORE_PROPS)

// Validate that a `definitions` object has only allowed properties
export const validateRuleProps = function (definitions, ruleProps, message) {
  // `definitions` is a plain object, i.e. does not have inherited properties
  // eslint-disable-next-line fp/no-loops, guard-for-in
  for (const ruleProp in definitions) {
    validateRuleProp({ ruleProp, ruleProps, message, definitions })
  }
}

const validateRuleProp = function ({
  ruleProp,
  ruleProps,
  message,
  definitions,
}) {
  if (ruleProps.has(ruleProp)) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  const rulePropsA = [...ruleProps].sort().join(', ')
  throw new DefinitionError(
    `${message}'s "${ruleProp}" property must be valid: ${inspect(definitions)}
It must be one of the following values instead:
${rulePropsA}
Did you misspell "${ruleProp}"?
If "${ruleProp}" is not misspelled, its keyword must be passed to the "keywords" option.`,
  )
}
