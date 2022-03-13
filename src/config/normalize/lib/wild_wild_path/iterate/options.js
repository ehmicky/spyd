// Assign default values to options and validate them
export const getOpts = function ({
  childFirst = false,
  sort = false,
  classes = false,
  inherited = false,
} = {}) {
  const opts = { childFirst, sort, classes, inherited }
  validateOpts(opts)
  return opts
}

// Without classes, there are no inherited properties
const validateOpts = function ({ classes, inherited }) {
  if (inherited && !classes) {
    throw new Error(
      'The "classes" option must be true when the "inherited" option is true.',
    )
  }
}
