import isPlainObj from 'is-plain-obj'

import { parsePropPath } from './parse.js'

export const getPropResults = function (value, propPathStr) {
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
