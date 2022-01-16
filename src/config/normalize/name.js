import isPlainObj from 'is-plain-obj'

import { setArray } from '../../utils/set.js'

// Parse a configuration property path string into an array of tokens.
// Dots are used for object properties, e.g. `one.two`
// Brackets are used for array elements, e.g. `one[5]`
// Dots and brackets can be used deeply, e.g. `one.two[5]`
// Wildcards are used with both objects and arrays to recurse over their
// children, e.g. `one.*` or `one[*]`.
// Unless question marks are appended to dots and brackets, the parent objects
// or arrays will be validated as such and created if undefined.
// Can start with an optional dot.
// TODO: allow special characters (like dots), if escaped with backslash
// TODO: do not recurse over `__proto__`, `prototype` or `constructor`
const parsePropPath = function (propPathStr) {
  const normPropPathStr = prependDot(propPathStr)
  const results = [...normPropPathStr.matchAll(PROP_NAME_REGEXP)]
  validatePropName(results, propPathStr, normPropPathStr)
  const propPath = results.map(normalizeProp)
  return propPath
}

const prependDot = function (propPathStr) {
  const [firstChar] = propPathStr
  return firstChar !== '.' && firstChar !== '['
    ? `.${propPathStr}`
    : propPathStr
}

const PROP_NAME_REGEXP =
  /(?<loose>\?)?((\.(?<propName>([^.?[\]*\d][^.?[\]*]*|(?<propNameAny>\*))))|(\[(?<propIndex>([\d]+|(?<propIndexAny>\*)))\]))/guy

// TODO: add more error messages for common mistakes
const validatePropName = function (results, propPathStr, normPropPathStr) {
  const matchedPath = results.map(getMatch).join('')

  if (matchedPath !== normPropPathStr) {
    throw new Error(
      `Syntax error in path "${propPathStr}" (starting at index ${matchedPath.length})`,
    )
  }
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

export const getEntries = function (object, propPathStr) {
  const propResults = getPropResults(object, propPathStr)
  return propResults.map(getEntry)
}

const getEntry = function ({ value, path }) {
  const key = getKey({ path })
  return { key, value }
}

export const getValues = function (object, propPathStr) {
  const propResults = getPropResults(object, propPathStr)
  return propResults.map(getValue)
}

const getValue = function ({ value }) {
  return value
}

export const getKeys = function (object, propPathStr) {
  const propResults = getPropResults(object, propPathStr)
  return propResults.map(getKey)
}

const getKey = function ({ path }) {
  return path.map(getPathName).reduce(serializePathName, '')
}

const getPathName = function ({ name }) {
  return name
}

const serializePathName = function (names, name) {
  if (typeof name !== 'string') {
    return `${names}[${name}]`
  }

  return names === '' ? `${names}${name}` : `${names}.${name}`
}

export const set = function (object, propPathStr, setValue) {
  const propResults = getPropResults(object, propPathStr)
  return propResults.reduce(
    (objectA, { path }) => setResult(objectA, path, setValue),
    object,
  )
}

const setResult = function (value, [{ name, missing }, ...path], setValue) {
  if (typeof name === 'string') {
    const setValueA =
      path.length === 0
        ? setValue
        : setResult(missing ? {} : value[name], path, setValue)
    return { ...value, [name]: setValueA }
  }

  const valueA = missing ? [value] : value
  const setValueB =
    path.length === 0 ? setValue : setResult(valueA[name], path, setValue)
  return setArray(valueA, name, setValueB)
}

const getPropResults = function (value, propPathStr) {
  const propPath = parsePropPath(propPathStr)
  return propPath.reduce(getValuesByProp, [{ value, path: [] }])
}

const getValuesByProp = function (results, propElem) {
  return results.flatMap((result) => getValueByProp(result, propElem))
}

const getValueByProp = function (
  { value, path },
  { name, isArray, isAny, isStrict },
) {
  if (isArray) {
    const missing = !Array.isArray(value)

    if (missing) {
      if (isStrict) {
        if (isAny || name === 0) {
          return [{ value, path: [...path, { name: 0, missing }] }]
        }

        return [{ value: undefined, path: [...path, { name, missing }] }]
      }

      return []
    }

    if (isAny) {
      return value.map((childValue, index) => ({
        value: childValue,
        path: [...path, { name: index, missing }],
      }))
    }

    return [{ value: value[name], path: [...path, { name, missing }] }]
  }

  const missing = !isPlainObj(value)

  if (missing) {
    if (isStrict) {
      return [{ value: undefined, path: [...path, { name, missing }] }]
    }

    return []
  }

  if (isAny) {
    return Object.entries(value).map(([childName, childValue]) => ({
      value: childValue,
      path: [...path, { name: childName, missing }],
    }))
  }

  return [{ value: value[name], path: [...path, { name, missing }] }]
}
