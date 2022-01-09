import { isValidId } from '../../merge/id.js'

// Deltas can be the `rawResult.id`
const parseId = function (delta) {
  if (!isValidId(delta)) {
    return
  }

  return delta
}

const findById = function (metadataGroups, id) {
  return metadataGroups.findIndex(
    ([firstMetadatum]) => firstMetadatum.id === id,
  )
}

export const idFormat = {
  type: 'id',
  message: 'id',
  parse: parseId,
  find: findById,
}
