// Escaping character
export const ESCAPE = '\\'

// Paths separator.
// We squash multiple ones in a row.
// But we do not trim spaces at the start or end to allow root paths.
export const PATH_SEPARATOR = ' '
export const PATH_SEPARATOR_NAME = 'a space'

// Tokens separator
export const TOKEN_SEPARATOR = '.'

// Special characters to escape
export const SPECIAL_CHARS = new Set([ESCAPE, TOKEN_SEPARATOR, PATH_SEPARATOR])

// Escape special characters
export const escapeSpecialChars = function (string) {
  return string.replace(SPECIAL_CHARS_REGEXP, `${ESCAPE}$&`)
}

const SPECIAL_CHARS_REGEXP = /[\\. ]/gu
