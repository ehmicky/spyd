import got from 'got'

// Perform a HTTP request
export const fetchUrl = async function({
  method,
  url,
  searchParams,
  body: json = undefined,
  noResponse,
}) {
  const responseType = noResponse
    ? {}
    : { responseType: 'json', resolveBodyOnly: true }

  try {
    return await got({ url, method, searchParams, json, ...responseType })
  } catch (error) {
    throw new Error(`HTTP store error on ${method} ${url}: ${error.message}`)
  }
}
