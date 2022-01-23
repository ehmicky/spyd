import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'

// Parse the contents of a rawResult.
// Parsing/serializing rawResults is abstracted away from the main store logic,
// so that stores only need to deal with metadata objects and blob strings.
export const parseRawResult = function (rawResultStr) {
  try {
    return JSON.parse(rawResultStr)
  } catch (error) {
    throw wrapError(error, 'History files is invalid JSON:', UserError)
  }
}

// Serialize the contents of a rawResult
export const serializeRawResult = function (rawResult) {
  const rawResultStr = JSON.stringify(rawResult, undefined, 2)
  const rawResultStrA = flattenArray(rawResultStr)
  return `${rawResultStrA}\n`
}

// Some arrays like `histogram` and `quantiles` are big. `JSON.serialize()`
// put each item in a separate line. We put those in a single line instead.
//  - This makes it easier to view the file
//  - This creates simpler git diffs
//  - This creates better git stats when it comes to amount of lines changes
// We only do this for arrays of simple types.
const flattenArray = function (rawResultStr) {
  return rawResultStr.replace(SIMPLE_ARRAY_REGEXP, flattenArrayItems)
}

// Matches `[...]` but not `[{ ... }]` nor `[[...]]`
const SIMPLE_ARRAY_REGEXP = /(\[)([^[\]{]+)(\])/gmu

// eslint-disable-next-line max-params
const flattenArrayItems = function (_, start, match, end) {
  const matchA = match.replace(WHITESPACES_REGEXP, ' ')
  return `${start}${matchA}${end}`
}

const WHITESPACES_REGEXP = /\s+/gmu
