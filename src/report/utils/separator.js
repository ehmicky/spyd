import { separatorColor } from './colors.js'

// Separators between columns
// Works with all terminals
const SEPARATOR_SIGN = '\u2502'
export const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)
const PADDED_SEPARATOR = `${PADDING}${SEPARATOR_SIGN}${PADDING}`
export const SEPARATOR_WIDTH = PADDED_SEPARATOR.length
export const COLUMN_SEPARATOR = separatorColor(PADDED_SEPARATOR)
