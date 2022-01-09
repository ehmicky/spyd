import { isValidId } from '../../merge/id.js'

// Deltas can be the `rawResult.id`
const parseId = function (delta) {
  if (!isValidId(delta)) {
    return
  }

  return delta
}

// Some stores shorten `id` and only keep the last 12 characters.
const findById = function (metadataGroups, id) {
  return metadataGroups.findIndex(([firstMetadatum]) =>
    id.endsWith(firstMetadatum.id),
  )
}

export const idFormat = {
  type: 'id',
  message: 'id',
  parse: parseId,
  find: findById,
}
