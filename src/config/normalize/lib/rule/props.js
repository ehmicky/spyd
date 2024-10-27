import { inspect } from 'node:util'

import { DefinitionError } from '../error.js'

// Retrieve the list of possible rule properties
export const getRuleProps = (keywords) =>
  new Set([...CORE_PROPS, ...keywords.map(getKeywordName)])

const getKeywordName = ({ name }) => name

// Rule properties that are not keywords
const CORE_PROPS = ['name']
export const CORE_PROPS_SET = new Set(CORE_PROPS)

export const validateRuleKey = ({
  ruleProp,
  ruleProps,
  message,
  definitions,
}) => {
  if (ruleProps.has(ruleProp)) {
    return
  }

  const rulePropsA = [...ruleProps].sort().join(', ')
  throw new DefinitionError(
    `${message}'s "${ruleProp}" property must be valid: ${inspect(definitions)}
It must be one of the following values instead:
${rulePropsA}
Did you misspell "${ruleProp}"?
If "${ruleProp}" is not misspelled, its keyword must be passed to the "keywords" option.`,
  )
}
