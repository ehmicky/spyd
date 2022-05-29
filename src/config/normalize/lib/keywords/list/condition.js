export const name = 'condition'
export const hasInput = true
export const undefinedInput = true

// Apply `condition[(input, opts)]` which skips the current rule if `false`
// is returned.
export const main = function (definition) {
  return definition ? undefined : { skip: true }
}
