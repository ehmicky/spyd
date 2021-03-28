import { separatorColor } from './colors.js'

// Separators between columns
// Works on CP850
const SEPARATOR_SIGN = '\u2502'
export const COLUMN_SEPARATOR = separatorColor(` ${SEPARATOR_SIGN} `)
