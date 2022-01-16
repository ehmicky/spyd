// Parse a configuration property path string into an array of tokens.
// Dots are used for object properties, e.g. `one.two`
// Brackets are used for array elements, e.g. `one[5]`
// Dots and brackets can be used deeply, e.g. `one.two[5]`
// Wildcards are used with both objects and arrays to recurse over their
// children, e.g. `one.*` or `one[*]`.
// Unless question marks are appended to dots and brackets, the parent objects
// or arrays will be validated as such and created if undefined.
export const parsePropPath = function (propPathStr) {
  const results = [...`.${propPathStr}`.matchAll(PROP_NAME_REGEXP)]
  validatePropName(results, propPathStr)
  const propPath = results.map(normalizeProp)
  return propPath
}

const PROP_NAME_REGEXP =
  /(?<loose>\?)?((\.(?<propName>([^.?[\]*\d][^.?[\]*]*|(?<propNameAny>\*))))|(\[(?<propIndex>([\d]+|(?<propIndexAny>\*)))\]))/guy

// TODO: add more error messages for common mistakes
const validatePropName = function (results, propPathStr) {
  const matchedPath = results.map(getMatch).join('').slice(1)

  if (matchedPath === propPathStr) {
    return
  }

  throw new Error(
    `Syntax error in path "${propPathStr}" (starting at index ${matchedPath.length})`,
  )
}

const getMatch = function ([match]) {
  return match
}

const normalizeProp = function ({
  groups: { propName, propNameAny, propIndex, propIndexAny, loose },
}) {
  const name = getName(propName, propIndex)
  const isArray = propIndex !== undefined
  const isAny = propNameAny !== undefined || propIndexAny !== undefined
  const looseBool = loose !== undefined
  return { name, isArray, isAny, loose: looseBool }
}

const getName = function (propName, propIndex) {
  if (propName !== undefined) {
    return propName
  }

  return propIndex === '*' ? propIndex : Number(propIndex)
}
