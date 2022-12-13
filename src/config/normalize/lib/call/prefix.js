import { BaseError } from '../error.js'

// The `prefix` is the name of the type of property to show in error
// message and warnings such as "Option".
export const addInputPrefix = (error, prefix, originalName) =>
  new BaseError(`${prefix} "${originalName}":`, { cause: error })

export const addDefinitionPrefix = ({
  error,
  prefix,
  originalName,
  keyword,
  isValidation,
}) => {
  const suffix = isValidation ? 'definition:' : 'must have a valid definition.'
  return new BaseError(
    `${prefix} "${originalName}"'s keyword "${keyword}" ${suffix}`,
    { cause: error },
  )
}

export const addKeywordPrefix = ({ error, prefix, originalName, keyword }) =>
  new BaseError(`${prefix} "${originalName}"'s keyword "${keyword}" bug.`, {
    cause: error,
  })
