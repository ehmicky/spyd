import { DefinitionError } from '../error.js'

import { CORE_PROPS_SET, validateRuleKey } from './props.js'

// Validate that a `definitions` object has only allowed properties
export const validateRuleProps = ({
  definitions,
  ruleProps,
  message,
  sync,
}) => {
  // `definitions` is a plain object, i.e. does not have inherited properties
  // eslint-disable-next-line fp/no-loops, guard-for-in
  for (const ruleProp in definitions) {
    validateRuleProp({ ruleProp, ruleProps, message, definitions, sync })
  }
}

const validateRuleProp = ({
  ruleProp,
  ruleProps,
  message,
  definitions,
  sync,
}) => {
  validateRuleKey({ ruleProp, ruleProps, message, definitions })
  validateRuleSync({ ruleProp, message, definitions, sync })
}

// If in sync mode, definition functions should not be async.
// However, we cannot know this for sure since:
//  - Functions might return `Promise` instead of using `async`/`await`
//  - Functions might be transpiled
// I.e. this is more of a failsafe check.
// We do not use `util.types.isAsyncFunction()` to make it work client-side.
const validateRuleSync = ({ ruleProp, message, definitions, sync }) => {
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

const isAsyncFunction = (definition) =>
  typeof definition === 'function' &&
  definition.constructor.name === 'AsyncFunction'
