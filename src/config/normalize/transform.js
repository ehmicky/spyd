// Many array configuration properties can optionally a single element, for
// simplicity providing it is the most common use case.
// We also allow duplicate values but remove them.
export const normalizeOptionalArray = function (value = []) {
  return Array.isArray(value) ? [...new Set(value)] : [value]
}

// Version strings are sometimes input as numbers (`major` or `major.minor`):
//  - Yargs coerce number-looking strings
//  - YAML requires quotes around numbers to interpret them as strings, which
//    some users might omit
export const normalizeNumberString = function (value) {
  return typeof value === 'number' ? String(value) : value
}
