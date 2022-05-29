export const name = 'rename'

export const hasInput = true

// Apply `rename[(value, opts)]` which transforms the property's name.
// This can be used for aliasing and deprecation.
export const main = function (definition) {
  return { rename: definition }
}
