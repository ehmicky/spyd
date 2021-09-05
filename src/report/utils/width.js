import { getCombinationPaddedName } from './name.js'

// Compute the width of each column for reporters which show the following ones
// for each combination:
//  - Title
//  - Min
//  - Main content
//  - Max
// This is used for example by the `histogram` and `boxplot` reporters.
// Using shared logic ensures those reporters are aligned when shown together.
export const getColWidths = function ({
  combinations,
  minWidths,
  maxWidths,
  mini,
  screenWidth,
}) {
  const titlesWidth = getCombinationPaddedName(combinations[0]).length
  const minBlockWidth = getMinMaxBlockWidth(combinations, mini, minWidths)
  const maxBlockWidth = getMinMaxBlockWidth(combinations, mini, maxWidths)
  const contentWidth = Math.max(
    screenWidth - titlesWidth - minBlockWidth - maxBlockWidth,
    1,
  )
  return { titlesWidth, minBlockWidth, contentWidth }
}

const getMinMaxBlockWidth = function (combinations, mini, widths) {
  return mini ? 0 : Math.max(...widths)
}
