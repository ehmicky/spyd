import { setArray } from '../../../utils/set.js'

import { getPropResults } from './results.js'

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
