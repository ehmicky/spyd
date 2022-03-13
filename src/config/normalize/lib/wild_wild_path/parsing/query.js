import {
  ESCAPE,
  PATH_SEPARATOR,
  PATH_SEPARATOR_NAME,
  TOKEN_SEPARATOR,
  SPECIAL_CHARS,
} from '../tokens/escape.js'
import { getStringTokenType } from '../tokens/main.js'

// Use imperative logic for performance
// eslint-disable-next-line complexity
export const parseQuery = function (query) {
  const state = getInitialState()

  // eslint-disable-next-line fp/no-loops
  for (; state.index <= query.length; state.index += 1) {
    const char = query[state.index]

    // eslint-disable-next-line max-depth
    if (char === ESCAPE) {
      parseEscape(state, query)
    } else if (char === TOKEN_SEPARATOR) {
      addToken(state)
    } else if (char === PATH_SEPARATOR || state.index === query.length) {
      addPath(state)
    } else {
      state.chars += char
    }
  }

  return state.paths
}

const getInitialState = function () {
  const state = { paths: [], index: 0 }
  resetPathState(state)
  resetTokenState(state)
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
      `character "${ESCAPE}" must either be at the start of a token, or be followed by ${PATH_SEPARATOR_NAME} or ${TOKEN_SEPARATOR} or ${ESCAPE}`,
    )
  }

  state.isProp = true
}

const addPath = function (state) {
  if (hasNoPath(state)) {
    return
  }

  if (!hasOnlyDots(state)) {
    addToken(state)
  }

  // eslint-disable-next-line fp/no-mutating-methods
  state.paths.push(state.path)
  resetPathState(state)
}

// When the query is an empty string or when two spaces are consecutive
const hasNoPath = function (state) {
  return state.firstToken && state.chars.length === 0 && state.path.length === 0
}

const resetPathState = function (state) {
  state.path = []
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
  state.path.push(token)
  resetTokenState(state)
}

// In principle, the root query should be an empty string.
// But we use a lone dot instead because:
//  - It distinguishes it from an absence of query
//  - It allows parsing it in the middle of a space-separated list of queries
//    (as opposed to an empty string)
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
