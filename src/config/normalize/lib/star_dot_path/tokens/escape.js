import { ESCAPE, SEPARATOR, ANY, MINUS, REGEXP_DELIM } from './special.js'

// Parse an escaped character in a query string
export const parseEscapedChar = function (escapedChar) {
  validateEscape(escapedChar)
  return escapedChar
}

const validateEscape = function (escapedChar) {
  if (!SPECIAL_CHARS.has(escapedChar)) {
    throw new Error(
      `character "${ESCAPE}" must only be followed by ${SEPARATOR} ${ANY} ${MINUS} ${REGEXP_DELIM} or ${ESCAPE}`,
    )
  }
}

const SPECIAL_CHARS = new Set([ESCAPE, SEPARATOR, ANY, MINUS, REGEXP_DELIM])

// Escape special characters
export const escapeSpecialChars = function (string) {
  return string.replace(SPECIAL_CHARS_REGEXP, '\\$&')
}

const SPECIAL_CHARS_REGEXP = /[\\.*]|^[/-]/gu
