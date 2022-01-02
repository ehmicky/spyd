import { validate as isUuid } from 'uuid'

// Deltas can be the `rawResult.id`
const parseId = function (delta) {
  if (!isUuid(delta)) {
    return
  }

  return delta
}

const findById = function (metadata, id) {
  return metadata.findIndex((metadatum) => metadatum.id === id)
}

export const idFormat = {
  type: 'id',
  message: 'id',
  parse: parseId,
  find: findById,
}
