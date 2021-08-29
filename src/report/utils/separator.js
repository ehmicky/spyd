import { separatorColor } from './colors.js'

// Separator between first column and others
const NAME_SEPARATOR_SIGN = ''
const NAME_PADDING_WIDTH = 2
const NAME_PADDING = ' '.repeat(NAME_PADDING_WIDTH)
export const NAME_SEPARATOR = `${NAME_SEPARATOR_SIGN}${NAME_PADDING}`
export const NAME_SEPARATOR_COLORED = NAME_SEPARATOR

// Separator between columns
// Works on all terminals
const COLUMN_SEPARATOR_SIGN = '\u2502'
const COLUMN_PADDING_WIDTH = 1
const COLUMN_PADDING = ' '.repeat(COLUMN_PADDING_WIDTH)
export const COLUMN_SEPARATOR = `${COLUMN_PADDING}${COLUMN_SEPARATOR_SIGN}${COLUMN_PADDING}`
export const COLUMN_SEPARATOR_COLORED = separatorColor(COLUMN_SEPARATOR)

// Separator between stats
// Works on most terminals
const STATS_SEPARATOR_SIGN = '\u2012'
const STATS_PADDING_WIDTH = 1
const STATS_PADDING = ' '.repeat(STATS_PADDING_WIDTH)
const STATS_SEPARATOR = `${STATS_PADDING}${STATS_SEPARATOR_SIGN}${STATS_PADDING}`
export const STATS_SEPARATOR_COLORED = separatorColor(STATS_SEPARATOR)
