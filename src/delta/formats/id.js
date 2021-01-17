import { validate as isUuid } from 'uuid'

// Deltas can be the `result.id`
export const parseId = function (delta) {
  if (!isUuid(delta)) {
    return
  }

  return delta
}

export const findById = function (results, id) {
  return results.find((result) => result.id === id)
}
