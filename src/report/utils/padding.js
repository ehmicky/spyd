import stringWidth from 'string-width'

// Like `string.padStart()` but takes into account ANSI sequences
export const padStart = function (string, length) {
  const padding = ' '.repeat(Math.max(0, length - stringWidth(string)))
  return `${padding}${string}`
}
