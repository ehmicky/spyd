// Normalize a path of tokens
export const normalizePath = function (path) {
  return path.map(normalizeNode)
}

// Nodes can be both arrays and not arrays (if they have a single element) but
// we encourage the latter since it is simpler
const normalizeNode = function (node) {
  const nodeA = node.length === 1 ? node[0] : node

  if (!Array.isArray(nodeA)) {
    return parseIndex(nodeA)
  }

  nodeA.forEach(validateComplexToken)
  return nodeA
}

// Indices can be both strings and numbers, but we encourage numbers since they
// are more useful and match how they are usually represented in JavaScript
const parseIndex = function (token) {
  return typeof token === 'string' && POSITIVE_INTEGER_REGEXP.test(token)
    ? Number(token)
    : token
}

const POSITIVE_INTEGER_REGEXP = /^\d+$/u

const validateComplexToken = function (token) {
  if (typeof token === 'symbol') {
    throw new TypeError(`${String(token)} must not be in a nested array.`)
  }
}
