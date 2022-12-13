import { isValidId, stripUuidDashes } from '../../merge/id.js'

// Deltas can be the `rawResult.id`
const parseId = (delta) => {
  if (!isValidId(delta)) {
    return
  }

  return delta
}

// Some stores shorten `id` and only keep the last 12 characters.
const findById = (metadataGroups, id) => {
  const idA = stripUuidDashes(id)
  return metadataGroups.findIndex(([firstMetadatum]) =>
    idA.startsWith(firstMetadatum.id),
  )
}

export const idFormat = {
  type: 'id',
  message: 'id',
  parse: parseId,
  find: findById,
}
