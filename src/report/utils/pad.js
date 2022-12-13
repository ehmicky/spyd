import stringWidth from 'string-width'

// Pad string. Unlike `string.pad*()`, this works with ANSI sequences.
export const padString = (string, width) => {
  const paddingWidth = width - stringWidth(string)
  const padding = ' '.repeat(paddingWidth)
  return `${padding}${string}`
}
