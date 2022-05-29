import { inspect } from 'util'

import { DefinitionError } from './error.js'

// Retrieve the list of possible rule properties
export const getRuleProps = function (keywords) {
  return new Set([...CORE_PROPS, ...keywords.map(getKeywordName)])
}

const getKeywordName = function ({ name }) {
  return name
}

// Validate that a `definitions` object has only allowed properties
export const validateRuleProps = function ({
  definitions,
  ruleProps,
  message,
  sync,
}) {
  // `definitions` is a plain object, i.e. does not have inherited properties
  // eslint-disable-next-line fp/no-loops, guard-for-in
  for (const ruleProp in definitions) {
    validateRuleProp({ ruleProp, ruleProps, message, definitions, sync })
  }
}

const validateRuleProp = function ({
  ruleProp,
  ruleProps,
  message,
  definitions,
  sync,
}) {
  validateRuleKey({ ruleProp, ruleProps, message, definitions })
  validateRuleSync({ ruleProp, message, definitions, sync })
}

const validateRuleKey = function ({
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

// If in sync mode, definition functions should not be async.
// However, we cannot know this for sure since:
//  - Functions might return `Promise` instead of using `async`/`await`
//  - Functions might be transpiled
// I.e. this is more of a failsafe check.
// We do not use `util.types.isAsyncFunction()` to make it work client-side.
const validateRuleSync = function ({ ruleProp, message, definitions, sync }) {
  if (
    sync &&
    isAsyncFunction(definitions[ruleProp]) &&
    !CORE_PROPS_SET.has(ruleProp)
  ) {
    throw new DefinitionError(
      `${message}'s "${ruleProp}" property must not be async unless the "async" option is true.`,
    )
  }
}

const isAsyncFunction = function (definition) {
  return (
    typeof definition === 'function' &&
    definition.constructor.name === 'AsyncFunction'
  )
}

// Rule properties that are not keywords
const CORE_PROPS = ['name']
export const CORE_PROPS_SET = new Set(CORE_PROPS)
