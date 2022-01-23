import { UserError } from '../../../error/main.js'
import { then } from '../../../utils/then.js'

// Definition methods can call `get('query')` to retrieve the normalized value
// of another property.
export const retrieveGet = function (getProp) {
  return boundGet.bind(undefined, getProp)
}

// This function is a wrapper around the `get()` function returned by `runDag()`
const boundGet = function (getProp, query) {
  try {
    const value = getProp(query)
    return then(value, (valueA) => unwrapValue(valueA, query))
  } catch (error) {
    handleGetUserError(error.message)
    throw error
  }
}

// When the query has a wildcard, `get()` returns an object with multiple values
// Otherwise, it returns the only value as is.
const unwrapValue = function (value, query) {
  return query in value ? value[query] : value
}

const handleGetUserError = function (message) {
  if (message.includes('Invalid name')) {
    throw new UserError(message)
  }
}
