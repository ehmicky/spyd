import omitLib from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { listEntries, normalizeEntry } from './entries/main.js'
import { maybeParse } from './parsing/parse.js'
import { setNewChildValue } from './set.js'

// Delete one or multiple properties in `target` using a query string
export const omit = function (target, queryOrPath) {
  return exclude(target, queryOrPath, () => true)
}

// Same but using a function returning the value to set
export const exclude = function (target, queryOrPath, condition) {
  const path = maybeParse(queryOrPath)
  const entries = listEntries(target, path)
  return entries
    .map(normalizeEntry)
    .reduce(
      (targetA, entry) => excludeEntry(targetA, 0, { entry, condition }),
      target,
    )
}

const excludeEntry = function (
  value,
  index,
  { entry, entry: { path, query }, condition },
) {
  const key = path[index]
  const childValue = value[key]

  if (childValue === undefined) {
    return value
  }

  const newIndex = index + 1

  if (newIndex === path.length) {
    return condition({ value: childValue, path, query })
      ? removeValue(value, key)
      : value
  }

  const newChildValue = excludeEntry(childValue, newIndex, { entry, condition })
  return setNewChildValue(value, key, newChildValue)
}

const removeValue = function (value, key) {
  if (!Array.isArray(value, key)) {
    return omitLib.default(value, [key])
  }

  const newArray = setArray(value, key)
  return newArray.every(isUndefined) ? [] : newArray
}

const isUndefined = function (item) {
  return item === undefined
}
