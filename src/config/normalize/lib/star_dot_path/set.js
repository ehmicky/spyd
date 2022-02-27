import omit from 'omit.js'

import { setArray } from '../../../../utils/set.js'

import { listEntries } from './entries/main.js'
import { maybeParse } from './parsing/parse.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, queryOrPropNames, setValue) {
  const nodes = maybeParse(queryOrPropNames)
  const entries = listEntries(target, nodes)
  return entries.reduce(
    (targetA, { path }) => setProp(targetA, 0, { path, setValue }),
    target,
  )
}

const setProp = function (value, index, { path, setValue }) {
  if (index === path.length) {
    return setValue
  }

  const key = path[index]
  const childValue = value[key]
  const newIndex = index + 1
  const newChildValue = setProp(childValue, newIndex, { path, setValue })
  return setNewChildValue(value, key, newChildValue)
}

// Delete one or multiple properties in `target` using a query string
export const remove = function (target, queryOrPropNames) {
  const nodes = maybeParse(queryOrPropNames)
  const entries = listEntries(target, nodes)
  return entries.reduce(
    (targetA, { path }) => removeProp(targetA, 0, path),
    target,
  )
}

const removeProp = function (value, index, path) {
  const key = path[index]
  const childValue = value[key]

  if (childValue === undefined) {
    return value
  }

  const newIndex = index + 1

  if (newIndex === path.length) {
    return removeValue(value, key)
  }

  const newChildValue = removeProp(childValue, newIndex, path)
  return setNewChildValue(value, key, newChildValue)
}

const removeValue = function (value, key) {
  if (!Number.isInteger(key)) {
    return omit.default(value, [key])
  }

  const newArray = setArray(value, key)
  return newArray.every(isUndefined) ? [] : newArray
}

const isUndefined = function (item) {
  return item === undefined
}

const setNewChildValue = function (value, key, newChildValue) {
  if (value[key] === newChildValue) {
    return value
  }

  return Number.isInteger(key)
    ? setArray(value, key, newChildValue)
    : { ...value, [key]: newChildValue }
}
