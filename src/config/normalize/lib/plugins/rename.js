export const name = 'rename'

export const input = true

// Apply `rename[(value, opts)]` which transforms the property's name.
// This can be used for aliasing and deprecation.
// TODO: This is only applied if the destination value is `undefined`.
// Like this, if both an old alias and a new one are specified, the new one
// has priority.
export const main = function (rename) {
  return { rename }
}
