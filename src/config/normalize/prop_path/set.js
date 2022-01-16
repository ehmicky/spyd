import { setArray } from '../../../utils/set.js'

import { listEntries } from './entries.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, query, setValue) {
  const entries = listEntries(target, query)
  return entries.reduce(
    (targetA, { path }) => setResult(targetA, path, setValue),
    target,
  )
}

const setResult = function (value, [{ key, missing }, ...path], setValue) {
  if (typeof key === 'string') {
    const setValueA =
      path.length === 0
        ? setValue
        : setResult(missing ? {} : value[key], path, setValue)
    return { ...value, [key]: setValueA }
  }

  const valueA = missing ? [value] : value
  const setValueB =
    path.length === 0 ? setValue : setResult(valueA[key], path, setValue)
  return setArray(valueA, key, setValueB)
}
