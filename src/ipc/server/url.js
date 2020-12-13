import { v4 as uuidv4 } from 'uuid'

import { PluginError } from '../../error/main.js'

// Each combination gets its own unique `id`
export const createCombinationId = function () {
  return uuidv4()
}

// Each combination gets a different endpoint using its `id`
export const getServerUrl = function (origin, id) {
  return `${origin}/rpc/${id}`
}

// When a request is made, we find the matching combination
export const findCombinationByUrl = function (req, combinations) {
  const tokens = SERVER_URL_REGEXP.exec(req.url)

  if (tokens === null) {
    throw new PluginError(`Invalid URL: ${req.url}`)
  }

  const combination = combinations.find(({ id }) => id === tokens[1])

  if (combination === undefined) {
    throw new PluginError(`Invalid ID in URL: ${req.url}`)
  }

  return combination
}

const SERVER_URL_REGEXP = /^\/rpc\/([\da-f-]+)$/iu
