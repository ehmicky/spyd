export const name = 'compute'
export const undefinedInput = true
export const undefinedDefinition = true

// Apply `compute[(info)]` which sets an input from the system, instead of the
// user
export const main = function (definition) {
  return { input: definition }
}
