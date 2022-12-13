import { separatorColor } from './colors.js'

// Separator between combination title (first column) and rest
const TITLE_SEPARATOR_SIGN = ''
const TITLE_PADDING_WIDTH = 2
const TITLE_PADDING = ' '.repeat(TITLE_PADDING_WIDTH)
export const TITLE_SEPARATOR = `${TITLE_SEPARATOR_SIGN}${TITLE_PADDING}`
export const TITLE_SEPARATOR_COLORED = TITLE_SEPARATOR

// Separator between stats
// Works on most terminals
const STATS_SEPARATOR_SIGN = '\u2012'
const STATS_PADDING_WIDTH = 1
const STATS_PADDING = ' '.repeat(STATS_PADDING_WIDTH)
const STATS_SEPARATOR = `${STATS_PADDING}${STATS_SEPARATOR_SIGN}${STATS_PADDING}`
export const STATS_SEPARATOR_COLORED = separatorColor(STATS_SEPARATOR)

// Separator between columns
// Works on all terminals
export const getColSeparator = (mini) => (mini ? MCOL_SEPARATOR : COL_SEPARATOR)

export const getColSeparatorColored = (mini) =>
  mini ? MCOL_SEPARATOR_COLORED : COL_SEPARATOR_COLORED

const COL_SEPARATOR_SIGN = '\u2502'
const COL_PADDING_WIDTH = 1
const COL_PADDING = ' '.repeat(COL_PADDING_WIDTH)
const COL_SEPARATOR = `${COL_PADDING}${COL_SEPARATOR_SIGN}${COL_PADDING}`
const COL_SEPARATOR_COLORED = separatorColor(COL_SEPARATOR)
const MCOL_SEPARATOR = COL_PADDING
const MCOL_SEPARATOR_COLORED = separatorColor(MCOL_SEPARATOR)
