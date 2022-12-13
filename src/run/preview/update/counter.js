import { noteColor } from '../../../report/utils/colors.js'

// Retrieve row with combination name and counter
export const getCounterRow = ({
  index,
  total,
  combinationNameColor,
  description,
  leftWidth,
}) => {
  const counter = getCounter(index, total).padEnd(leftWidth)
  const descriptionA = getDescription(description, combinationNameColor)
  return `${counter}${combinationNameColor}${descriptionA}\n`
}

// The `counter` is between `durationLeft` and `progressBar` so that there is
// no empty space when `durationLeft` is unknown.
export const getCounter = (index, total) => `(${index + 1}/${total})`

const getDescription = (description, combinationNameColor) => {
  if (description === '') {
    return ''
  }

  const descriptionA =
    combinationNameColor === '' ? description : `  (${description})`
  return noteColor(descriptionA)
}
