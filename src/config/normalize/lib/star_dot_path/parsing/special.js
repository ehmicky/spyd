// All special characters
export const ESCAPE = '\\'
export const SEPARATOR = '.'
export const ANY = '*'
export const MINUS = '-'
export const SPECIAL_CHARS = new Set([ESCAPE, SEPARATOR, ANY, MINUS])
// Tokens for special characters
export const ANY_TOKEN = Symbol.for('*')
// Special characters which should always be escaped
export const SPECIAL_CHARS_REGEXP = /[\\.*]|^-/gu
