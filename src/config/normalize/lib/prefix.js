import { wrapError } from '../../../error/wrap.js'

// The `prefix` option is the name of the type of property to show in error
// message and warnings such as "Option".
// Add the `prefix`
export const addPrefix = function (error, opts) {
  const prefix = getPrefix(opts)
  const prefixA = error.validation ? prefix : `${prefix}: `
  return wrapError(error, prefixA)
}

export const getPrefix = function ({ prefix, funcOpts: { originalName } }) {
  return `${prefix} "${originalName}"`
}

export const DEFAULT_PREFIX = 'Option'
