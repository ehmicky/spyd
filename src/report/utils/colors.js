import colorsOption from 'colors-option'

const chalk = colorsOption()
const { gray, redBright, level } = chalk

// Main color
const MAIN_HUE = 175
const MAIN_SATURATION = 75
const MAIN_LIGHTNESS = 55
const mainColor = chalk.hsl(MAIN_HUE, MAIN_SATURATION, MAIN_LIGHTNESS)

export const titleColor = mainColor.bold
export const subtitleColor = mainColor
export const fieldColor = gray.italic
export const goodColor = mainColor
export const badColor = redBright
export const errorColor = redBright.inverse.bold
export const separatorColor = gray
export const noteColor = gray
export const suffixColor = gray

// Gradient that works with 1, 4, 8 and 24-bit colors
export const graphGradientColor = function (percentage) {
  const percentageA = level < 3 ? 0 : percentage
  const lightness = MAX_GRAPH_LIGHTNESS - percentageA * MAX_GRAPH_SHADE
  return chalk.hsl(MAIN_HUE, MAIN_SATURATION, lightness)
}

// Choosen to work well in 4, 8 and 24-bit colors
const MAX_GRAPH_LIGHTNESS = MAIN_LIGHTNESS
const MAX_GRAPH_DARKNESS = 20
const MAX_GRAPH_SHADE = MAX_GRAPH_LIGHTNESS - MAX_GRAPH_DARKNESS
