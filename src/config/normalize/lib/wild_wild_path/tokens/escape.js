import { SEPARATOR } from './special.js'

// Escaping character
export const ESCAPE = '\\'

// Special characters to escape
export const SPECIAL_CHARS = new Set([ESCAPE, SEPARATOR])

// Escape special characters
export const escapeSpecialChars = function (string) {
  return string.replace(SPECIAL_CHARS_REGEXP, `${ESCAPE}$&`)
}

const SPECIAL_CHARS_REGEXP = /[\\.]/gu
