import { wrapError } from '../../../error/wrap.js'

// The `prefix` is the name of the type of property to show in error
// message and warnings such as "Option".
export const addPrefix = function (error, info) {
  const prefix = getPrefix(info)
  const prefixA = error.validation ? prefix : `${prefix}: `
  return wrapError(error, prefixA)
}

export const getPrefix = function ({ prefix, originalName }) {
  return `${prefix} "${originalName}"`
}
