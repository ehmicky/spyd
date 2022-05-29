export const name = 'warn'

export const input = true

// Apply `warn[(value, opts)]` which can return a string to print as warning
export const main = function (definition) {
  return { warning: definition }
}
