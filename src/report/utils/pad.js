import { getStringWidth } from './string_width.js'

// Pad string. Unlike `string.pad*()`, this works with ANSI sequences.
export const padString = function (string, width) {
  const paddingWidth = width - getStringWidth(string)
  const padding = ' '.repeat(paddingWidth)
  return `${padding}${string}`
}
