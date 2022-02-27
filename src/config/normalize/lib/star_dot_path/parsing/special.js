// All special characters
export const ESCAPE = '\\'
export const SEPARATOR = '.'
export const ANY = '*'
// Tokens for special characters
export const ANY_TOKEN = Symbol.for('*')
// Matches any special characters
export const SPECIAL_CHARS_REGEXP = /[\\.*]/gu
