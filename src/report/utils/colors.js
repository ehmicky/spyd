import colorConvert from 'color-convert'
import colorsOption from 'colors-option'

const chalk = colorsOption()
const { redBright, level } = chalk

const hslToChalk = (hue, saturation, lightness) => {
  const [red, green, blue] = colorConvert.hsl.rgb([hue, saturation, lightness])
  return chalk.rgb(red, green, blue)
}

// Main color
const MAIN_HUE = 175
const MAIN_SATURATION = 75
const MAIN_LIGHTNESS = 55
const mainColor = hslToChalk(MAIN_HUE, MAIN_SATURATION, MAIN_LIGHTNESS)

// Gray shade.
// Bright enough to be accessible
const GRAY_LIGHTNESS = 55
const grayColor = hslToChalk(0, 0, GRAY_LIGHTNESS)

export const titleColor = mainColor.bold
export const subtitleColor = mainColor
export const fieldColor = grayColor.italic
export const goodColor = mainColor
export const goodHighlightColor = mainColor.bold
export const badColor = redBright
export const badHighlightColor = redBright.bold
export const separatorColor = grayColor
export const noteColor = grayColor
export const suffixColor = grayColor

// Gradient that works with 1, 4, 8 and 24-bit colors
export const graphGradientColor = (percentage) => {
  const percentageA = level < 3 ? 0 : percentage
  const lightness = MAX_GRAPH_LIGHTNESS - percentageA * MAX_GRAPH_SHADE
  return hslToChalk(MAIN_HUE, MAIN_SATURATION, lightness)
}

// Choosen to work well in 4, 8 and 24-bit colors
const MAX_GRAPH_LIGHTNESS = MAIN_LIGHTNESS
const MAX_GRAPH_DARKNESS = 20
const MAX_GRAPH_SHADE = MAX_GRAPH_LIGHTNESS - MAX_GRAPH_DARKNESS
