import isPlainObj from 'is-plain-obj'

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
  const isStrict = loose === undefined
  return { name, isArray, isAny, isStrict }
}

const getName = function (propName, propIndex) {
  if (propName !== undefined) {
    return propName
  }

  return propIndex === '*' ? propIndex : Number(propIndex)
}

export const getByPropPath = function (object, propPath) {
  return propPath.reduce(getValuesByProp, [{ value: object, path: [] }])
}

const getValuesByProp = function (results, propElem) {
  return results.flatMap((result) => getValueByProp(result, propElem))
}

const getValueByProp = function (
  { value, path },
  { name, isArray, isAny, isStrict },
) {
  if (isArray) {
    if (!Array.isArray(value)) {
      if (isStrict) {
        if (isAny || name === 0) {
          return [{ value, path: [...path, 0] }]
        }

        return [{ value: undefined, path: [...path, name] }]
      }

      return []
    }

    if (isAny) {
      return value.map((childValue, index) => ({
        value: childValue,
        path: [...path, index],
      }))
    }

    return [{ value: value[name], path: [...path, name] }]
  }

  if (!isPlainObj(value)) {
    if (isStrict) {
      return [{ value: undefined, path: [...path, name] }]
    }

    return []
  }

  if (isAny) {
    return Object.entries(value).map(([childName, childValue]) => ({
      value: childValue,
      path: [...path, childName],
    }))
  }

  return [{ value: value[name], path: [...path, name] }]
}
