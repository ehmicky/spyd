import isPlainObj from 'is-plain-obj'

// For queries which use * combined with other characters, e.g. `a.b*c`
export const getComplexEntries = function (value, path, token) {
  if (!isPlainObj(value)) {
    return []
  }

  return Object.entries(value)
    .filter(([childKey]) => matchesToken(childKey, token))
    .map(([childKey, childValue]) => ({
      value: childValue,
      path: [...path, childKey],
    }))
}

// Use imperative code for performance
/* eslint-disable complexity, max-depth, fp/no-loops, fp/no-let, max-params,
   fp/no-mutation */
const matchesToken = function (
  childKey,
  token,
  childKeyIndex = 0,
  tokenIndex = 0,
) {
  if (tokenIndex === token.length) {
    return childKeyIndex === childKey.length
  }

  const part = token[tokenIndex]

  if (typeof part === 'string') {
    return (
      startsWith(childKey, part, childKeyIndex) &&
      matchesToken(childKey, token, childKeyIndex + part.length, tokenIndex + 1)
    )
  }

  for (let index = childKeyIndex; index <= childKey.length; index += 1) {
    if (matchesToken(childKey, token, index, tokenIndex + 1)) {
      return true
    }
  }

  return false
}

const startsWith = function (string, prefix, startIndex) {
  let index = startIndex

  for (const character of prefix) {
    if (string[index] !== character) {
      return false
    }

    index += 1
  }

  return true
}
/* eslint-enable complexity, max-depth, fp/no-loops, fp/no-let, max-params,
   fp/no-mutation */
