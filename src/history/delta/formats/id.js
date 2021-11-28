import { validate as isUuid } from 'uuid'

// Deltas can be the `result.id`
const parseId = function (delta) {
  if (!isUuid(delta)) {
    return
  }

  return delta
}

const findById = function (rawResults, id) {
  return rawResults.findIndex((rawResult) => rawResult.id === id)
}

export const idFormat = {
  type: 'id',
  message: 'id',
  parse: parseId,
  find: findById,
}
