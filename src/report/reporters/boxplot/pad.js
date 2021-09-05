// Surround stats with padding
export const addStatPadding = function (string) {
  return `${STAT_PADDING}${string}${STAT_PADDING}`
}

const STAT_PADDING_WIDTH = 1
const STAT_PADDING = ' '.repeat(STAT_PADDING_WIDTH)
