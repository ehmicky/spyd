export const getParams = function () {
  // eslint-disable-next-line no-magic-numbers
  const maxDuration = Math.round(Math.random() * 1e2)
  return { maxDuration }
}
