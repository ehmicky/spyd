import { setArray } from '../../../utils/set.js'

import { listEntries } from './entries.js'
import { parse } from './parse.js'

// Set a value to one or multiple properties in `target` using a query string
export const set = function (target, query, setValue) {
  const tokens = parse(query)
  const entries = listEntries(target, tokens)
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
  const newChildValue = setProp(value[key], index + 1, { path, setValue })
  return typeof key === 'string'
    ? { ...value, [key]: newChildValue }
    : setArray(value, key, newChildValue)
}
