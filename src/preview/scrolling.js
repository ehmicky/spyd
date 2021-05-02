// When content is taller than the terminal height, allow user to scroll with
// up/down. We do this by keeping tracking of `scrollTop` and truncating the
// content to print on the terminal.
export const applyScrolling = function (
  previewContent,
  scrollTop,
  screenHeight,
) {
  if (screenHeight === 0) {
    return ''
  }

  const newlineIndexes = getNewlineIndexes(previewContent)
  const contentHeight = newlineIndexes.length

  if (contentHeight <= screenHeight) {
    return previewContent
  }

  const topIndex = Math.min(scrollTop, contentHeight - screenHeight)
  const bottomIndex = topIndex + screenHeight - 1
  return previewContent.slice(
    topIndex === 0 ? 0 : newlineIndexes[topIndex - 1] + 1,
    newlineIndexes[bottomIndex] + 1,
  )
}

// Uses imperative code for performance
const getNewlineIndexes = function (previewContent) {
  const newlineIndexes = []

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let, unicorn/no-for-loop
  for (let index = 0; index < previewContent.length; index += 1) {
    // eslint-disable-next-line max-depth
    if (previewContent[index] === '\n') {
      // eslint-disable-next-line fp/no-mutating-methods
      newlineIndexes.push(index)
    }
  }

  return newlineIndexes
}
