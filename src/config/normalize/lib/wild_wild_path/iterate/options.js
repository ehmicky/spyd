import { validateInherited, validateLeaves } from '../validate.js'

// Add default values and validate options for `iterate()`
export const getOptions = function ({
  childFirst = false,
  roots = false,
  leaves = false,
  sort = false,
  missing = false,
  classes = false,
  inherited = false,
} = {}) {
  const opts = {
    childFirst: childFirst || leaves,
    roots,
    leaves,
    sort,
    missing,
    classes,
    inherited,
  }
  validateInherited(opts)
  validateLeaves(opts)
  return opts
}
