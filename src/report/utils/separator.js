import { separatorColor } from './colors.js'

// Separator between columns
// Works with all terminals
const COLUMN_SEPARATOR_SIGN = '\u2502'
const COLUMN_PADDING_WIDTH = 1
const COLUMN_PADDING = ' '.repeat(COLUMN_PADDING_WIDTH)
const COLUMN_SEPARATOR = `${COLUMN_PADDING}${COLUMN_SEPARATOR_SIGN}${COLUMN_PADDING}`
export const COLUMN_SEPARATOR_WIDTH = COLUMN_SEPARATOR.length
export const COLUMN_SEPARATOR_COLORED = separatorColor(COLUMN_SEPARATOR)

// Separator between stats
// Works on most terminals
const STATS_SEPARATOR_SIGN = ' \u2012 '
const STATS_PADDING_WIDTH = 1
const STATS_PADDING = ' '.repeat(STATS_PADDING_WIDTH)
export const STATS_SEPARATOR = `${STATS_PADDING}${STATS_SEPARATOR_SIGN}${STATS_PADDING}`
export const STATS_SEPARATOR_COLORED = separatorColor(STATS_SEPARATOR)
