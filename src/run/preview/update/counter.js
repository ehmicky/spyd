import { noteColor, titleColor } from '../../../report/utils/colors.js'

// Retrieve row with combination name and counter
export const getCounterRow = function ({
  index,
  total,
  combinationName,
  description,
  leftWidth,
}) {
  const counter = getCounter(index, total).padEnd(leftWidth)
  const descriptionA = getDescription(description, combinationName)
  return `${counter}${titleColor(combinationName)}${descriptionA}\n`
}

// The `counter` is between `durationLeft` and `progressBar` so that there is
// no empty space when `durationLeft` is unknown.
export const getCounter = function (index, total) {
  return `(${index + 1}/${total})`
}

const getDescription = function (description, combinationName) {
  if (description === '') {
    return ''
  }

  const descriptionA =
    combinationName === '' ? description : `  (${description})`
  return noteColor(descriptionA)
}
