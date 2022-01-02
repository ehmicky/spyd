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
  const contentsA = flattenArray(contents)
  return `${contentsA}\n`
}

// Some arrays like `histogram` and `quantiles` are big. `JSON.serialize()`
// put each item in a separate line. We put those in a single line instead.
//  - This makes it easier to view the file
//  - This creates simpler git diffs
//  - This creates better git stats when it comes to amount of lines changes
// We only do this for arrays of simple types.
const flattenArray = function (content) {
  return content.replace(SIMPLE_ARRAY_REGEXP, flattenArrayItems)
}

// Matches `[...]` but not `[{ ... }]` nor `[[...]]`
const SIMPLE_ARRAY_REGEXP = /(\[)([^[\]{]+)(\])/gmu

// eslint-disable-next-line max-params
const flattenArrayItems = function (_, start, match, end) {
  const matchA = match.replace(WHITESPACES_REGEXP, ' ')
  return `${start}${matchA}${end}`
}

const WHITESPACES_REGEXP = /\s+/gmu
