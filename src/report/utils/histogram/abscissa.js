import stringWidth from 'string-width'

// Retrieve the abscissa. This displays the low, median and high statistics.
export const getAbscissa = function ({
  lowPretty,
  highPretty,
  width,
  medianIndex,
  medianPretty,
}) {
  const lowPrettyWidth = stringWidth(lowPretty)
  const medianPrettyWidth = stringWidth(medianPretty)
  const highPrettyWidth = stringWidth(highPretty)

  if (
    medianIndex < lowPrettyWidth + MEDIAN_PADDING ||
    medianIndex > width - highPrettyWidth - medianPrettyWidth - MEDIAN_PADDING
  ) {
    return getStackedAbscissa({
      lowPretty,
      highPretty,
      width,
      medianIndex,
      medianPretty,
      lowPrettyWidth,
      medianPrettyWidth,
      highPrettyWidth,
    })
  }

  return getUnstackedAbscissa({
    lowPretty,
    highPretty,
    width,
    medianIndex,
    medianPretty,
    lowPrettyWidth,
    medianPrettyWidth,
    highPrettyWidth,
  })
}

// Minimum amount of spaces between the median and the low|high
const MEDIAN_PADDING = 1

// When the median is too close to the low|high and should be shown below it
const getStackedAbscissa = function ({
  lowPretty,
  highPretty,
  width,
  medianIndex,
  medianPretty,
  lowPrettyWidth,
  medianPrettyWidth,
  highPrettyWidth,
}) {
  const spacesWidth = width - lowPrettyWidth - highPrettyWidth
  const leftSpacesWidth = Math.min(medianIndex, width - medianPrettyWidth)
  const rightSpacesWidth = width - leftSpacesWidth - medianPrettyWidth
  const spaces = ' '.repeat(spacesWidth)
  const leftSpaces = ' '.repeat(leftSpacesWidth)
  const rightSpaces = ' '.repeat(rightSpacesWidth)
  return `${lowPretty}${spaces}${highPretty}
${leftSpaces}${medianPretty}${rightSpaces}`
}

const getUnstackedAbscissa = function ({
  lowPretty,
  highPretty,
  width,
  medianIndex,
  medianPretty,
  lowPrettyWidth,
  medianPrettyWidth,
  highPrettyWidth,
}) {
  const leftSpacesWidth = medianIndex - lowPrettyWidth
  const rightSpacesWidth =
    width -
    leftSpacesWidth -
    lowPrettyWidth -
    medianPrettyWidth -
    highPrettyWidth
  const leftSpaces = ' '.repeat(leftSpacesWidth)
  const rightSpaces = ' '.repeat(rightSpacesWidth)
  return `${lowPretty}${leftSpaces}${medianPretty}${rightSpaces}${highPretty}`
}
