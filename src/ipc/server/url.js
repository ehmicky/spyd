import { v4 as uuidv4 } from 'uuid'

import { PluginError } from '../../error/main.js'

export const createClientId = function () {
  return uuidv4()
}

// Each runner gets a different endpoint, using a UUID
export const findCombinationByUrl = function (req, combinations) {
  const tokens = SERVER_URL_REGEXP.exec(req.url)

  if (tokens === null) {
    throw new PluginError(`Invalid URL: ${req.url}`)
  }

  const combination = combinations.find(
    ({ clientId }) => clientId === tokens[1],
  )

  if (combination === undefined) {
    throw new PluginError(`Invalid ID in URL: ${req.url}`)
  }

  return combination
}

const SERVER_URL_REGEXP = /^\/rpc\/([\da-f-]+)$/iu

export const getServerUrl = function (origin, clientId) {
  return `${origin}/rpc/${clientId}`
}
