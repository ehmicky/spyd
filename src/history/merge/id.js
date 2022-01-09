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

// We only keep the last characters of the `result.id` in the filename.
// This is to keep filenames short since some systems impose a limit.
// We keep it high enough to prevent collisions though.
//  - 12 hexadecimal characters is 48 bits of entropy, which has a 50%
//    probability of collision after 2e7 results with the same `id`, which is
//    very unlikely
export const shortenId = function (id) {
  return id.slice(-ID_LENGTH)
}

const ID_LENGTH = 12

// Since several results can have the same `id`, we use a second `subId` to
// keep them unique.
// At the moment, this is not exposed to users and is only used to ensure
// history results filenames are unique even when their `id` and `timestamp`
// are the same (which is fairly unlikely).
export const createSubId = function () {
  const subId = uuidv4()
  return subId.slice(-SUBID_LENGTH)
}

// This must be low enough to keep filenames short, but high enough to prevent
// collisions
const SUBID_LENGTH = 12