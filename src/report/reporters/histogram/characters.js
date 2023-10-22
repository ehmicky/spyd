import isUnicodeSupported from 'is-unicode-supported'

const canDisplayUnicode = isUnicodeSupported()

// Characters displaying an increasing percentage visually
export const HISTOGRAM_CHARS = canDisplayUnicode
  ? [
      ' ',
      '\u2581',
      '\u2582',
      '\u2583',
      '\u2584',
      '\u2585',
      '\u2586',
      '\u2587',
      '\u2588',
    ]
  : [' ', '\u2584', '\u2588']
// Characters displaying 0% and 100% visually
export const [EMPTY_HISTOGRAM_CHAR] = HISTOGRAM_CHARS
export const FULL_HISTOGRAM_CHAR = HISTOGRAM_CHARS.at(-1)

// To compensate from the lack of characters on Windows, we increase the number
// of characters shown per column
export const EXTRA_HEIGHT = canDisplayUnicode ? 1 : 3

// Characters to display the horizontal separator, including its ticks
// Works with all terminals
export const TICK_LEFT = '\u250C'
export const TICK_MIDDLE = '\u252C'
export const TICK_RIGHT = '\u2510'
export const HORIZONTAL_LINE = '\u2500'
