export const name = 'warn'
export const hasInput = true

// Apply `warn[(input, info)]` which can return a string to print as warning
export const main = function (definition) {
  return { warning: definition }
}
