import { throwValidationError } from './validate.js'

// Parse `select|limit` user-friendly format (array of strings) to a
// code-friendlier format (objects).
// Syntax:
//  - Most tokens are ids, except "and" or "not" which cannot be used as ids
//  - Spaces between ids are meant as "or"
//  - "and" can be used between groups of space-separated ids in order to
//    intersect them
//     - Those groups can be empty, e.g. "and id", "id and" or "one and and two"
//        - This is useful when the string is dynamically generated.
//        - This results in empty groups of ids which are intersected, i.e. the
//          selector never matches.
//     - Users need to explicitly separate intersection groups using "and".
//       We do not try to guess those based on the id's dimensions because:
//        - Knowing those dimensions requires loading all results, which we do
//          not do for performance reasons.
//        - Making intersections implicit might be confusing for users.
//  - "not" can be prepend to the whole selector in order to exclude instead of
//    include.
export const parseSelectors = function (rawSelectors, propName) {
  return rawSelectors.map((rawSelector) => parseSelector(rawSelector, propName))
}

const parseSelector = function (rawSelector, propName) {
  const tokens = tokenizeSelector(rawSelector)
  const { intersect, negation } = parseTokens(tokens, rawSelector, propName)
  return { intersect, negation }
}

// Tokenize a selector string in an array of token strings
const tokenizeSelector = function (rawSelector) {
  return rawSelector.trim().split(TOKEN_DELIMITER_REGEX).filter(Boolean)
}

const TOKEN_DELIMITER_REGEX = /\s+/gu

// Parse token strings into an object format
const parseTokens = function (tokens, rawSelector, propName) {
  const { intersect, negation } = tokens.reduce(
    (memo, token, index) =>
      parseToken(memo, { token, index, rawSelector, propName }),
    { intersect: [[]], negation: false },
  )
  return { intersect, negation }
}

const parseToken = function (
  { intersect, negation },
  { token, index, rawSelector, propName },
) {
  if (token === NEGATION_TOKEN) {
    validateNegation(index, rawSelector, propName)
    return { intersect, negation: true }
  }

  if (token === INTERSECT_TOKEN) {
    return { intersect: [...intersect, []], negation }
  }

  return {
    intersect: [
      ...intersect.slice(0, -1),
      [...intersect[intersect.length - 1], token],
    ],
    negation,
  }
}

// "not" is only meaningful at the beginning of the selector.
// However, we explicitly forbid it elsewhere to avoid confusion, in case users
// think it can be prepended to any id instead. This provides with a clearer
// error message.
const validateNegation = function (index, rawSelector, propName) {
  if (index !== 0) {
    throwValidationError(
      `"${NEGATION_TOKEN}" can only be used at the start.`,
      [rawSelector],
      propName,
    )
  }
}

// We use a word instead of:
//  - Exclamation mark or tilde because they need to be escaped in shells.
//  - Dash because they are used in identifiers (which would make it confusing)
//    and in CLI flags.
const NEGATION_TOKEN = 'not'
// We use a word instead of && & + because:
//  - They need to be escaped in shells.
//  - This is consistent with "not"
const INTERSECT_TOKEN = 'and'
