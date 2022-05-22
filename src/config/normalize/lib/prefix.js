import { callUserFunc } from './call.js'

// The `prefix` option is the name of the type of property to show in error
// message such as "Option".
export const getPrefix = async function (prefix, opts) {
  const prefixA = await callUserFunc(prefix, opts)
  return prefixA === undefined ? DEFAULT_PREFIX : String(prefixA).trim()
}

// Used only when `prefix()` itself throws
export const DEFAULT_PREFIX = 'Option'
