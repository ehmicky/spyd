import { setArray } from '../../../utils/set.js'

import { listEntries } from './entries.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, query, setValue) {
  const entries = listEntries(target, query)
  return entries.reduce(
    (targetA, { path }) => setProp(targetA, path, setValue),
    target,
  )
}

const setProp = function (value, [{ key, missing }, ...path], setValue) {
  return typeof key === 'string'
    ? setObjectProp({ value, key, missing, path, setValue })
    : setArrayItem({ value, key, missing, path, setValue })
}

const setObjectProp = function ({ value, key, missing, path, setValue }) {
  const newValue =
    path.length === 0
      ? setValue
      : setProp(missing ? {} : value[key], path, setValue)
  return { ...value, [key]: newValue }
}

const setArrayItem = function ({ value, key, missing, path, setValue }) {
  const valueA = missing ? [value] : value
  const newValue =
    path.length === 0 ? setValue : setProp(valueA[key], path, setValue)
  return setArray(valueA, key, newValue)
}
