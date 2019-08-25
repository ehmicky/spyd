import fetch from 'cross-fetch'

// Perform a HTTP request
export const fetchUrl = async function(method, url, body) {
  const bodyA = serializeBody(body)

  try {
    const response = await fetch(url, { method, body: bodyA })
    const { content, error } = await getTextResponse(response)

    checkResponse(response, error)

    const contentA = getJsonResponse(content, method)
    return contentA
  } catch (error) {
    throw new Error(`HTTP store error on ${method} ${url}: ${error.message}`)
  }
}

const serializeBody = function(body) {
  if (body === undefined) {
    return
  }

  return JSON.stringify(body, null, 2)
}

const getTextResponse = async function(response) {
  try {
    const content = await response.text()
    return { content }
  } catch (error) {
    return { error: error.stack }
  }
}

const checkResponse = function({ ok, status }, error) {
  if (ok && error === undefined) {
    return
  }

  const message = [`(status ${status})`, error].filter(Boolean).join('\n')
  throw new Error(message)
}

const getJsonResponse = function(content, method) {
  if (NO_RESPONSE_METHODS.includes(method)) {
    return
  }

  try {
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`invalid JSON response`)
  }
}

const NO_RESPONSE_METHODS = ['post', 'delete']
