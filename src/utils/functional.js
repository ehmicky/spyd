// A normalizing function transforms a value by returning.
// It can return `undefined` to leave the value as is.
export const runNormalizer = function (normalizer, value, ...args) {
  const newValue = normalizer(value, ...args)
  return newValue === undefined ? value : newValue
}
