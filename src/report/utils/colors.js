import colorsOption from 'colors-option'

const chalk = colorsOption()
const { cyanBright, gray, redBright, level } = chalk

export const titleColor = cyanBright.bold
export const subtitleColor = cyanBright
export const fieldColor = gray.italic
export const goodColor = cyanBright
export const badColor = redBright
export const errorColor = redBright.inverse.bold
export const separatorColor = gray
export const noteColor = gray
export const suffixColor = gray

// Gradient that works with 1, 4, 8 and 24-bit colors
export const graphGradientColor = function (percentage) {
  const percentageA = level < 3 ? LOW_LEVEL_PERCENTAGE : percentage
  const lightness = MAX_GRAPH_LIGHTNESS - percentageA * MAX_GRAPH_SHADE
  return chalk.hsl(GRAPH_HUE, GRAPH_SATURATION, lightness)
}

// Choosen to work well in 4, 8 and 24-bit colors
const GRAPH_HUE = 175
const GRAPH_SATURATION = 40
const MAX_GRAPH_LIGHTNESS = 65
const MAX_GRAPH_DARKNESS = 25
const MAX_GRAPH_SHADE = MAX_GRAPH_LIGHTNESS - MAX_GRAPH_DARKNESS
const LOW_LEVEL_PERCENTAGE = 0.5
