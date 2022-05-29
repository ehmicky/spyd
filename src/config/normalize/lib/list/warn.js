export const name = 'warn'
export const hasInput = true

// Apply `warn[(input, opts)]` which can return a string to print as warning
export const main = function (definition) {
  return { warning: definition }
}
