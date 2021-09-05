// Like `string.padStart()` but centered
export const padCenter = function (string, paddingLength) {
  if (string.length >= paddingLength) {
    return string
  }

  const startPaddingLength = Math.floor((paddingLength + string.length) / 2)
  return string.padStart(startPaddingLength).padEnd(paddingLength)
}
