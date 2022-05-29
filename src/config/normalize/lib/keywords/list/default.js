export const name = 'default'
// eslint-disable-next-line unicorn/no-null
export const undefinedInput = null

// Apply `default[(opts)]` which assigns a default value
export const main = function (definition) {
  return { input: definition }
}
