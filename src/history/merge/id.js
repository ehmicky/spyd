import { randomUUID } from 'node:crypto'

import { validate as isUuid } from 'uuid'

// Validate `result.id`.
// "last" is not persisted since it is normalized first.
export const isValidId = (value) => isUuid(value)

// `id` can be "last", which refers to the previous result's id.
// If there are no previous results, a new UUIDv4 is generated.
export const normalizeId = (newResult, history) => {
  if (newResult.id !== LAST_ID) {
    return newResult
  }

  const id =
    history.length === 0 ? getDefaultId() : history[history.length - 1].id
  return { ...newResult, id }
}

export const LAST_ID = 'last'

export const getDefaultId = () => randomUUID()

// We only keep the first characters of the `result.id` in the filename.
// This is to keep filenames short since some systems impose a limit.
// We keep it high enough to prevent collisions though.
//  - 12 hexadecimal characters is 48 bits of entropy, which has a 50%
//    probability of collision after 2e7 results
export const shortenId = (id) => getUuidFirstChars(id, ID_LENGTH)

const ID_LENGTH = 12

// Since several results can have the same `id`, we use a second `subId` to
// keep them unique.
// At the moment, this is not exposed to users and is only used to ensure
// history results filenames are unique even when their `id` and `timestamp`
// are the same (which is fairly unlikely).
export const createSubId = () => getUuidFirstChars(randomUUID(), SUBID_LENGTH)

// This must be low enough to keep filenames short, but high enough to prevent
// collisions
const SUBID_LENGTH = 12

const getUuidFirstChars = (uuid, length) =>
  stripUuidDashes(uuid).slice(0, length)

// Dashes are stripped from UUID to keep filenames short
export const stripUuidDashes = (uuid) => uuid.replaceAll(DASH, '')

const DASH = '-'
