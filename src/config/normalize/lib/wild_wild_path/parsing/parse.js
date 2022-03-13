import { normalizeQueryArrays, isQueryString } from './normalize.js'
import { parseQueryString } from './query.js'

// Parse a query string into an array of tokens.
// Also validate and normalize it.
// This is inspired by JSON paths.
// There are two formats:
//  - Query string
//     - Tokens are dot-separated
//     - Unions are space-separated
//     - This is more convenient wherever a string is better, including in CLI
//       flags, in URLs, in files, etc.
//     - \ must escape the following characters: . \ space
//     - If a token is meant as a property name but could be interpreted as a
//       different type, it must be start with \
//     - A leading dot can be optionally used, e.g. `.one`. It is ignored.
//     - An empty string targets nothing.
//     - A lone dot targets the root.
//     - Property names that are empty strings can be specified, e.g. `..a..b.`
//       parses as `["", "a", "", "b", ""]`
//  - Array[s] of tokens
//     - Tokens are elements of the inner arrays
//     - Unions use optional outer arrays
//     - An empty outer array targets nothing.
//     - An empty inner array targets the root.
//     - This does not need any escaping, making it better with dynamic input
//     - This is faster as it does not perform any parsing
// Each object property is matched by a token among the following types:
//  - Property name
//     - String format: "propName"
//     - Array format: "propName"
//     - Empty keys are supported with empty strings
//  - Array index
//     - String format: "1"
//     - Array format: 1
//     - We distinguish between property names and array indices that are
//       integers
//     - Negatives indices can be used to get elements at the end, e.g. -2
//        - Including -0 which can be used to append elements
//  - Array slices
//     - String format: "0:2"
//     - Array format: { type: "slice", from: 0, end: 2 }
//     - Matches multiple indices of an array
//     - Negatives indices like the array indices format
//     - `from` is included, `to` is excluded (like `Array.slice()`)
//     - `from` defaults to 0 and `to` to -0
//  - Wildcard
//     - String format: "*"
//     - Array format: { type: "any" }
//        - We use objects instead of strings or symbols as both are valid as
//          object properties which creates a risk for injections
//     - Matches any object property or array item
//  - Regular expression
//     - String format: "/regexp/" or "/regexp/flags"
//     - Array format: RegExp instance
//     - Matches any object property with a matching name
//     - ^ and $ must be used if the RegExp needs to match from the beginning
//       or until the end
// Symbols are always ignored:
//  - Both in the query string|array and in the target value
//  - This is because symbols cannot be serialized in a query string
//     - This would remove the guarantee that both string|array syntaxes are
//       equivalent and interchangeable
//     - We do not use `symbol.description` as this should not be used for
//       identity purpose
// Exceptions are thrown on syntax errors:
//  - I.e. query or path syntax errors, or wrong arguments
//  - But queries matching nothing do not throw: instead they return nothing
export const parse = function (query) {
  return isQueryString(query)
    ? safeParseQueryString(query)
    : normalizeQueryArrays(query)
}

const safeParseQueryString = function (queryString) {
  try {
    return parseQueryString(queryString)
  } catch (error) {
    throw new Error(`Invalid query "${queryString}": ${error.message}`)
  }
}
