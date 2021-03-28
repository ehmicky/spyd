import { separatorColor } from './colors.js'

// Separators between columns
// Works with all terminals
const SEPARATOR_SIGN = '\u2502'
export const COLUMN_SEPARATOR = separatorColor(` ${SEPARATOR_SIGN} `)
