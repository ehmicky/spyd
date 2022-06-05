// The `prefix` is the name of the type of property to show in error
// message and warnings such as "Option".
export const addInputPrefix = function (error, prefix, originalName) {
  return new Error(`${prefix} "${originalName}":`, { cause: error })
}

export const addDefinitionPrefix = function ({
  error,
  prefix,
  originalName,
  keyword,
  isValidation,
}) {
  const suffix = isValidation ? 'definition:' : 'must have a valid definition.'
  return new Error(
    `${prefix} "${originalName}"'s keyword "${keyword}" ${suffix}`,
    { cause: error },
  )
}

export const addKeywordPrefix = function ({
  error,
  prefix,
  originalName,
  keyword,
}) {
  return new Error(`${prefix} "${originalName}"'s keyword "${keyword}" bug.`, {
    cause: error,
  })
}
