import { format } from 'url'

import { UserError } from '../../../error/main.js'

// The `store.http.url` configuration properties specify the base URL
export const getUrl = function ({ url }) {
  if (typeof url !== 'string') {
    throw new UserError(
      `The 'store.http.url' configuration property must be a string, not ${url}`,
    )
  }

  const urlA = new URL(url)
  const urlB = format(urlA)
  return urlB
}
