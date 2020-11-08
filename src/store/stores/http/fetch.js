import got from 'got'

import { UserError } from '../../../error/main.js'

// Perform a HTTP request
export const fetchUrl = async function ({
  method,
  url,
  searchParams,
  body: json,
  noResponse,
}) {
  const responseType = noResponse
    ? {}
    : { responseType: 'json', resolveBodyOnly: true }

  try {
    return await got({ url, method, searchParams, json, ...responseType })
  } catch (error) {
    throw new UserError(
      `HTTP store error on ${method} ${url}: ${error.message}`,
    )
  }
}
