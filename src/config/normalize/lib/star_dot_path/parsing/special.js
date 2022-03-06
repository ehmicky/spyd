// All special characters
export const ESCAPE = '\\'
export const SEPARATOR = '.'
export const ANY = '*'
export const MINUS = '-'
export const SPECIAL_CHARS = new Set([ESCAPE, SEPARATOR, ANY, MINUS])
// Special characters which should always be escaped
export const SPECIAL_CHARS_REGEXP = /[\\.*]|^-/gu
