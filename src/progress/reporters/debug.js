import { noteColor } from '../../report/utils/colors.js'

// Progress reporter only meant for debugging
const update = function ({ percentage, duration, description }) {
  const percentageStr = serializePercentage(percentage)
  const content = `  ${duration}  ${noteColor(percentageStr)}`
  return description === undefined ? content : `${content}\n\n  ${description}`
}

const serializePercentage = function (percentage) {
  const percentageInt = Math.floor(percentage * FLOAT_TO_PERCENTAGE)
  return `${percentageInt}%`.padStart(PERCENTAGE_WIDTH)
}

const FLOAT_TO_PERCENTAGE = 1e2
const PERCENTAGE_WIDTH = 4

export const debug = { update }
