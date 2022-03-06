// All special characters
export const ESCAPE = '\\'
export const SEPARATOR = '.'
export const ANY = '*'
export const MINUS = '-'
export const REGEXP_DELIM = '/'
export const SPECIAL_CHARS = new Set([
  ESCAPE,
  SEPARATOR,
  ANY,
  MINUS,
  REGEXP_DELIM,
])

// Escape special characters
export const escapeSpecialChars = function (string) {
  return string.replace(SPECIAL_CHARS_REGEXP, '\\$&')
}

const SPECIAL_CHARS_REGEXP = /[\\.*]|^[/-]/gu
