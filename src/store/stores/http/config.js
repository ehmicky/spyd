import { format } from 'url'

import { UserError } from '../../../error/main.js'

// The `store.http.url` and `store.http.name` options specify the base URL
export const getUrl = function ({ url, name }) {
  if (typeof url !== 'string') {
    throw new UserError(`'store.http.url' must be a string, not ${url}`)
  }

  if (typeof name !== 'string') {
    throw new UserError(`'store.http.name' must be a string, not ${name}`)
  }

  const urlA = normalizeUrl(url)
  const urlB = normalizeUrl(`${urlA}/${name}`)
  return urlB
}

// Validate and normalize URL
const normalizeUrl = function (url) {
  const urlA = new URL(url)
  const urlB = format(urlA)
  return urlB
}
