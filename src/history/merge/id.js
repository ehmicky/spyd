import { inspect } from 'util'

import { v4 as uuidv4, validate as isUuid } from 'uuid'

import { UserError } from '../../error/main.js'

// Validate `merge` property
export const normalizeMerge = function (value, name) {
  if (!isValidId(value) && value !== LAST_ID) {
    throw new UserError(
      `'${name}' must be "${LAST_ID}" or a UUID: ${inspect(value)}`,
    )
  }
}

// Validate `result.id`.
// "last" is not persisted since it is normalized first.
export const isValidId = function (value) {
  return isUuid(value)
}

// `merge` can be "last", which refers to the previous result's id.
// If there are no previous results, a new UUIDv4 is generated.
export const normalizeId = function (targetResult, history) {
  if (targetResult.id !== LAST_ID) {
    return targetResult
  }

  const id =
    history.length === 0 ? getDefaultId() : history[history.length - 1].id
  return { ...targetResult, id }
}

const LAST_ID = 'last'

export const getDefaultId = function () {
  return uuidv4()
}
