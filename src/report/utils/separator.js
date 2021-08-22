import { separatorColor } from './colors.js'

// Separator between columns
// Works with all terminals
const SEPARATOR_SIGN = '\u2502'
export const PADDING_WIDTH = 1
const PADDING = ' '.repeat(PADDING_WIDTH)
const PADDED_SEPARATOR = `${PADDING}${SEPARATOR_SIGN}${PADDING}`
export const SEPARATOR_WIDTH = PADDED_SEPARATOR.length
export const COLUMN_SEPARATOR = separatorColor(PADDED_SEPARATOR)

// Separator between stats
// Works on most terminals
const STATS_SEPARATOR_SIGN = ' \u2012 '
const STATS_PADDING_WIDTH = 1
const STATS_PADDING = ' '.repeat(STATS_PADDING_WIDTH)
const STATS_SEPARATOR_PADDED = `${STATS_PADDING}${STATS_SEPARATOR_SIGN}${STATS_PADDING}`
export const STATS_SEPARATOR = STATS_SEPARATOR_PADDED
