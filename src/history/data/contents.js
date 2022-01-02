import { UserError } from '../../error/main.js'

// Parse the contents of a rawResult
export const parseRawResult = function (contents) {
  try {
    return JSON.parse(contents)
  } catch (error) {
    throw new UserError(`History files is invalid JSON: ${error.message}`)
  }
}

// Serialize the contents of a rawResult
export const serializeRawResult = function (rawResult) {
  const contents = JSON.stringify(rawResult, undefined, 2)
  return `${contents}\n`
}
