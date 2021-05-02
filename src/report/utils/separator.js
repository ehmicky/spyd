import { separatorColor } from './colors.js'

// Separators between columns
// Works with all terminals
const SEPARATOR_SIGN = '\u2502'
export const PADDED_SEPARATOR = ` ${SEPARATOR_SIGN} `
export const COLUMN_SEPARATOR = separatorColor(PADDED_SEPARATOR)
