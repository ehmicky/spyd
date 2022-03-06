// All special characters
export const ESCAPE = '\\'
export const SEPARATOR = '.'
export const ANY = '*'
export const SPECIAL_CHARS = new Set([ESCAPE, SEPARATOR, ANY])
// Tokens for special characters
export const ANY_TOKEN = Symbol.for('*')
// Matches any special characters
export const SPECIAL_CHARS_REGEXP = /[\\.*]/gu
