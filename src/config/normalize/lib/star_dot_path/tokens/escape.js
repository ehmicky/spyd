import { ESCAPE, SEPARATOR, ANY, MINUS, REGEXP_DELIM } from './special.js'

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
