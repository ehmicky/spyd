import { PluginError } from '../error/main.js'

// When a request is made, we find the matching combination
export const findCombinationByUrl = function (req, combinations) {
  const tokens = SERVER_URL_REGEXP.exec(req.url)

  if (tokens === null) {
    return { error: new PluginError(`Invalid URL: ${req.url}`) }
  }

  const combination = combinations.find(({ id }) => id === tokens[1])

  if (combination === undefined) {
    return { error: new PluginError(`Invalid ID in URL: ${req.url}`) }
  }

  return { serverChannel: combination.serverChannel }
}

const SERVER_URL_REGEXP = /^\/rpc\/([\da-f-]+)$/iu

// Each combination gets a different endpoint using its `id`
export const getServerUrl = function (origin, id) {
  return `${origin}/rpc/${id}`
}
