import { ESCAPE, SEPARATOR, SPECIAL_CHARS } from '../tokens/escape.js'
import { getStringTokenType } from '../tokens/main.js'

import { normalizePath } from './normalize.js'
import { isQueryString } from './validate.js'

// Parse a query string into an array of tokens.
// Also validate and normalize it.
// This is inspired by JSON paths.
// There are two formats:
//  - "Query": a dot-separated string
//     - This is more convenient wherever a string is better, including in CLI
//       flags, in URLs, in files, etc.
//     - \ must escape the following characters: . \
//     - If a token is meant as a property name but could be interpreted as a
//       different type, it must be start with \
//     - A leading dot can be optionally used, e.g. `.one`. It is ignored.
//  - "Tokens": an array of values of diverse types
//     - This is sometimes convenient
//     - This does not need any escaping, making it better with dynamic input
//     - This is faster as it does not perform any parsing
// Each object property is matched by a token among the following types:
//  - Property name
//     - Query format: "propName"
//     - Tokens format: "propName"
//     - Empty keys are supported with empty strings
//  - Array index
//     - Query format: "1"
//     - Tokens format: 1
//     - We distinguish between property names and array indices that are
//       integers
//     - Negatives indices can be used to get elements at the end, e.g. -2
//        - Including -0 which can be used to append elements
//  - Array slices
//     - Query format: "0:2"
//     - Tokens format: { type: "slice", from: 0, end: 2 }
//     - Matches multiple indices of an array
//     - Negatives indices like the array indices format
//     - `from` is included, `to` is excluded (like `Array.slice()`)
//     - `from` defaults to 0 and `to` to -0
//  - Wildcard
//     - Query format: "*"
//     - Tokens format: { type: "any" }
//        - We use objects instead of strings or symbols as both are valid as
//          object properties which creates a risk for injections
//     - Matches any object property or array item
//  - Regular expression
//     - Query format: "/regexp/" or "/regexp/flags"
//     - Tokens format: RegExp instance
//     - Matches any object property with a matching name
//     - ^ and $ must be used if the RegExp needs to match from the beginning
//       or until the end
// An empty string (query format) or array (tokens format) matches the root.
// Symbols are always ignored
//  - Both in the query string|path and in the target value
//  - This is because symbols cannot be serialized in a query string
//     - This would remove the guarantee that both query and path syntaxes are
//       equivalent and interchangeable
//     - We do not use `symbol.description` as this should not be used for
//       identity purpose
// Exceptions are thrown on syntax errors:
//  - I.e. query or path syntax errors, or wrong arguments
//  - But queries matching nothing do not throw: instead they return nothing
export const parse = function (queryOrPath) {
  const path = isQueryString(queryOrPath)
    ? safeParseQuery(queryOrPath)
    : queryOrPath
  return normalizePath(path)
}

const safeParseQuery = function (query) {
  if (query === '') {
    return []
  }

  try {
    return parseQuery(query)
  } catch (error) {
    throw new Error(`Invalid query "${query}": ${error.message}`)
  }
}

// Use imperative logic for performance
// eslint-disable-next-line complexity
const parseQuery = function (query) {
  const state = getInitialState(query)

  // eslint-disable-next-line fp/no-loops
  for (; state.index <= query.length; state.index += 1) {
    const char = query[state.index]

    // eslint-disable-next-line max-depth
    if (char === ESCAPE) {
      parseEscape(state, query)
    } else if (char === SEPARATOR || state.index === query.length) {
      addToken(state)
    } else {
      state.chars += char
    }
  }

  return state.path
}

const getInitialState = function (query) {
  const index = query[0] === SEPARATOR ? 1 : 0
  const state = { path: [], index }
  resetState(state)
  return state
}

const parseEscape = function (state, query) {
  const nextChar = query[state.index + 1]

  if (SPECIAL_CHARS.has(nextChar)) {
    state.index += 1
    state.chars += nextChar
    return
  }

  if (state.chars.length !== 0) {
    throw new Error(
      `character "${ESCAPE}" must either be at the start of a token, or be followed by ${SEPARATOR} or ${ESCAPE}`,
    )
  }

  state.isProp = true
}

const addToken = function (state) {
  const tokenType = getStringTokenType(state.chars, state.isProp)
  const token = tokenType.parse(state.chars)
  // eslint-disable-next-line fp/no-mutating-methods
  state.path.push(token)
  resetState(state)
}

const resetState = function (state) {
  state.isProp = false
  state.chars = ''
}
