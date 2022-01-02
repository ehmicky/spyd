import { validate as isUuid } from 'uuid'

// Deltas can be the `rawResult.id`
const parseId = function (delta) {
  if (!isUuid(delta)) {
    return
  }

  return delta
}

const findById = function (metadataGroups, id) {
  return metadataGroups.findIndex((metadata) => metadataHasId(metadata, id))
}

const metadataHasId = function (metadata, id) {
  return metadata.some((metadatum) => metadatum.id === id)
}

export const idFormat = {
  type: 'id',
  message: 'id',
  parse: parseId,
  find: findById,
}
