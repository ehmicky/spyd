export const name = 'pick'
export const hasInput = true
export const undefinedInput = true

// Apply `pick[(input, opts)]` which omits the current input if `false` is
// returned. It also skips the current rule.
// For example, this is useful when several commands share some properties but
// not all.
export const main = function (definition) {
  return definition ? undefined : { skip: true, input: undefined }
}
