export const name = 'default'
export const undefinedInput = true

export const test = function (input) {
  return input === undefined
}

// Apply `default[(opts)]` which assigns a default value
export const main = function (definition) {
  return { input: definition }
}
