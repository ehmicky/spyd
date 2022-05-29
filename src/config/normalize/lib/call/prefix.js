import { wrapError } from '../../../../error/wrap.js'

// The `prefix` is the name of the type of property to show in error
// message and warnings such as "Option".
export const addInputPrefix = function (error, prefix, originalName) {
  return wrapError(error, `${prefix} "${originalName}"`)
}

export const addDefinitionPrefix = function ({
  error,
  prefix,
  originalName,
  keyword,
  isValidation,
}) {
  const suffix = isValidation ? 'definition' : 'must have a valid definition:\n'
  return wrapError(
    error,
    `${prefix} "${originalName}"'s keyword "${keyword}" ${suffix}`,
  )
}

export const addKeywordPrefix = function ({
  error,
  prefix,
  originalName,
  keyword,
}) {
  return wrapError(
    error,
    `${prefix} "${originalName}"'s keyword "${keyword}" bug:`,
  )
}
