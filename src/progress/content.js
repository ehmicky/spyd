import { noteColor } from '../report/utils/colors.js'

// Retrieve progress content
export const getContent = function ({ percentage, time, description }) {
  const percentageStr = getPercentageStr(percentage)
  const descriptionStr = getDescription(description)
  return `  ${time}${percentageStr}${descriptionStr}`
}

const getPercentageStr = function (percentage) {
  if (percentage === undefined) {
    return ''
  }

  return `  ${noteColor(serializePercentage(percentage))}`
}

const serializePercentage = function (percentage) {
  const percentageInt = Math.floor(percentage * FLOAT_TO_PERCENTAGE)
  return `${percentageInt}%`.padStart(PERCENTAGE_WIDTH)
}

const FLOAT_TO_PERCENTAGE = 1e2
const PERCENTAGE_WIDTH = 4

const getDescription = function (description) {
  if (description === undefined) {
    return ''
  }

  return `\n\n  ${description}`
}
