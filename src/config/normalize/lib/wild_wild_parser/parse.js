import {
  ESCAPE,
  ARRAY_SEPARATOR,
  ARRAY_SEPARATOR_NAME,
  TOKEN_SEPARATOR,
  SPECIAL_CHARS,
} from './tokens/escape.js'
import { getStringTokenType } from './tokens/main.js'
import { normalizeArraysPath } from './validate/path.js'
import { validateEmptyQuery, validateQueryString } from './validate/string.js'
import { throwQueryError } from './validate/throw.js'

// Parse a query string into an array of tokens.
// Also validate and normalize it.
export const parsePath = function (pathString) {
  const queryArrays = parseQuery(pathString)
  return normalizeArraysPath(queryArrays, pathString)
}

// Same as `parsePath()` but for any query
export const parseQuery = function (queryString) {
  validateQueryString(queryString)
  const queryArrays = parseQueryString(queryString)
  validateEmptyQuery(queryArrays, queryString)
  return queryArrays
}

// Use imperative logic for performance
// eslint-disable-next-line complexity
const parseQueryString = function (queryString) {
  const state = getInitialState()

  // eslint-disable-next-line fp/no-loops
  for (; state.index <= queryString.length; state.index += 1) {
    const char = queryString[state.index]

    // eslint-disable-next-line max-depth
    if (char === ESCAPE) {
      parseEscape(state, queryString)
    } else if (char === TOKEN_SEPARATOR) {
      addToken(state)
    } else if (char === ARRAY_SEPARATOR || state.index === queryString.length) {
      addQueryArray(state)
    } else {
      state.chars += char
    }
  }

  return state.arrays
}

const getInitialState = function () {
  const state = { arrays: [], index: 0 }
  resetQueryArrayState(state)
  resetTokenState(state)
  return state
}

const parseEscape = function (state, queryString) {
  const nextChar = queryString[state.index + 1]

  if (SPECIAL_CHARS.has(nextChar)) {
    state.index += 1
    state.chars += nextChar
    return
  }

  if (state.chars.length !== 0) {
    throwQueryError(
      queryString,
      `Character "${ESCAPE}" must either be at the start of a token, or be followed by ${ARRAY_SEPARATOR_NAME} or ${TOKEN_SEPARATOR} or ${ESCAPE}`,
    )
  }

  state.isProp = true
}

const addQueryArray = function (state) {
  if (hasNoQueryArray(state)) {
    return
  }

  if (!hasOnlyDots(state)) {
    addToken(state)
  }

  // eslint-disable-next-line fp/no-mutating-methods
  state.arrays.push(state.array)
  resetQueryArrayState(state)
}

// When the query is an empty string or when two spaces are consecutive
const hasNoQueryArray = function (state) {
  return (
    state.firstToken && state.chars.length === 0 && state.array.length === 0
  )
}

const resetQueryArrayState = function (state) {
  state.array = []
  state.firstToken = true
  state.onlyDots = true
}

const addToken = function (state) {
  if (handleLeadingDot(state)) {
    return
  }

  state.onlyDots = hasOnlyDots(state)
  const tokenType = getStringTokenType(state.chars, state.isProp)
  const token = tokenType.normalize(tokenType.parse(state.chars))
  // eslint-disable-next-line fp/no-mutating-methods
  state.array.push(token)
  resetTokenState(state)
}

// In principle, the root query should be an empty string.
// But we use a lone dot instead because:
//  - It distinguishes it from an absence of query
//  - It allows parsing it in the middle of a space-separated list (as opposed
//    to an empty string)
// However, we create ambiguities for queries with only dots (including a
// lone dot), where the last dot should not create an additional token.
const hasOnlyDots = function (state) {
  return state.onlyDots && state.chars.length === 0
}

// We ignore leading dots, because they are used to represent the root.
// We do not require them for simplicity.
const handleLeadingDot = function (state) {
  if (!state.firstToken) {
    return false
  }

  state.firstToken = false
  return state.chars.length === 0
}

const resetTokenState = function (state) {
  state.isProp = false
  state.chars = ''
}
