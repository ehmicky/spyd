import { parseEscapedChar } from '../tokens/escape.js'
import { getStringTokenType } from '../tokens/main.js'
import {
  ESCAPE,
  SEPARATOR,
  ANY,
  MINUS,
  REGEXP_DELIM,
} from '../tokens/special.js'

import { normalizePath } from './normalize.js'
import { isQueryString } from './validate.js'

// Parse a query string into an array of tokens.
// Also validate and normalize it.
// This is inspired by JSON paths and JSON pointers.
// Syntax:
//  - Dots are used for object properties, e.g. `one.two`
//  - Dots are also used for array elements, e.g. `one.5`
//  - Negatives indices can be used to get elements at the end, e.g. `one.-2`
//     - Including -0 which can be used to append elements, e.g. `one.-0`
//  - This can be used deeply, e.g. `one.two.5`
//  - Wildcards are used with both objects and arrays to recurse over their
//    children, e.g. `one.*`
//  - Regular expressions can used with objects to select property with matching
//    names, e.g. `one./^(two|three)$/i`
//  - Empty keys are supported, e.g. `one.` for `{ one: { "": value } }`
//    or `one..two` for `{ one: { "": { two: value } } }`
//  - A leading dot can be optionally used, e.g. `.one`. It is ignored.
//  - An empty string matches the root value
//  - Backslashes can escape special characters: . * \ /
// Tokens are an array of one of:
//  - Object property name string
//  - Array index as a positive|negative integer
//  - RegExp instances
//  - Wildcard: { type: "any" }
//     - We use objects instead of strings or symbols as both are valid as
//       object properties which creates a risk for injections
// We allow passing an array of tokens instead of a query string which:
//  - Removes the need for escaping
//  - Is sometimes more convenient
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
      addEscapedChar(state, query)
    } else if (char === SEPARATOR || state.index === query.length) {
      addToken(state)
    } else {
      addChar(state, char)
    }
  }

  return state.path
}

const getInitialState = function (query) {
  const index = query[0] === SEPARATOR ? 1 : 0
  return {
    path: [],
    chars: '',
    index,
    hasAny: false,
    hasMinus: false,
    hasRegExp: false,
  }
}

const addEscapedChar = function (state, query) {
  state.index += 1
  state.chars += parseEscapedChar(query[state.index])
}

const addToken = function (state) {
  const tokenType = getStringTokenType(state)
  const token = tokenType.parse(state.chars)
  // eslint-disable-next-line fp/no-mutating-methods
  state.path.push(token)

  state.hasAny = false
  state.hasMinus = false
  state.hasRegExp = false
  state.chars = ''
}

// eslint-disable-next-line complexity
const addChar = function (state, char) {
  if (state.chars.length === 0) {
    state.hasAny = state.hasAny || char === ANY
    state.hasMinus = state.hasMinus || char === MINUS
    state.hasRegExp = state.hasRegExp || char === REGEXP_DELIM
  }

  state.chars += char
}
