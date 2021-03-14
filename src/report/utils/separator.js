import { separatorColor } from './colors.js'

// Separators between columns
// Works on CP437 too
const SEPARATOR_SIGN = '\u2502'
export const COLUMN_SEPARATOR = separatorColor(` ${SEPARATOR_SIGN} `)
