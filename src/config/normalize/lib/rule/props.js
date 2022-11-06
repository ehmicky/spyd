import { inspect } from 'node:util'

import { DefinitionError } from '../error.js'

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

export const validateRuleKey = function ({
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
