import { setArray } from '../../../utils/set.js'

import { listEntries } from './entries.js'
import { parse } from './parse.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, query, setValue) {
  const tokens = parse(query)
  const entries = listEntries(target, tokens)
  return entries.reduce(
    (targetA, { path }) => setProp(targetA, path, setValue),
    target,
  )
}

const setProp = function (value, path, setValue) {
  if (path.length === 0) {
    return setValue
  }

  const [{ key, missing }, ...pathA] = path
  return typeof key === 'string'
    ? setObjectProp({ value, key, missing, path: pathA, setValue })
    : setArrayItem({ value, key, missing, path: pathA, setValue })
}

const setObjectProp = function ({ value, key, missing, path, setValue }) {
  const childValue = missing ? {} : value[key]
  const newChildValue = setProp(childValue, path, setValue)
  return { ...value, [key]: newChildValue }
}

const setArrayItem = function ({ value, key, missing, path, setValue }) {
  const newValue = missing ? [value] : value
  const childValue = newValue[key]
  const newChildValue = setProp(childValue, path, setValue)
  return setArray(newValue, key, newChildValue)
}
