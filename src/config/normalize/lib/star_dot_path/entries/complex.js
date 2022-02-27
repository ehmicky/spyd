import isPlainObj from 'is-plain-obj'

// For queries which use * combined with other characters, e.g. `a.b*c`
export const getComplexEntries = function (value, path, node) {
  if (!isPlainObj(value)) {
    return []
  }

  return Object.entries(value)
    .filter(([childKey]) => matchesNode(childKey, node))
    .map(([childKey, childValue]) => ({
      value: childValue,
      path: [...path, childKey],
    }))
}

// Use imperative code for performance
/* eslint-disable complexity, max-depth, fp/no-loops, fp/no-let, max-params,
   fp/no-mutation */
const matchesNode = function (
  childKey,
  node,
  childKeyIndex = 0,
  nodeIndex = 0,
) {
  if (nodeIndex === node.length) {
    return childKeyIndex === childKey.length
  }

  const token = node[nodeIndex]

  if (typeof token === 'string') {
    return (
      startsWith(childKey, token, childKeyIndex) &&
      matchesNode(childKey, node, childKeyIndex + token.length, nodeIndex + 1)
    )
  }

  for (let index = childKeyIndex; index <= childKey.length; index += 1) {
    if (matchesNode(childKey, node, index, nodeIndex + 1)) {
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
