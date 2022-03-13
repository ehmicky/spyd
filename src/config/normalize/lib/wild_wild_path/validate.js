// Class instances are not clonable. Therefore, they require `mutate`.
export const validateClasses = function (classes, mutate) {
  if (classes && !mutate) {
    throw new Error(
      'The "mutate" option must be true when the "classes" option is true.',
    )
  }
}

// Without classes, there are no inherited properties
export const validateInherited = function ({ classes, inherited }) {
  if (inherited && !classes) {
    throw new Error(
      'The "classes" option must be true when the "inherited" option is true.',
    )
  }
}

// `roots` and `leaves` do opposite things, so are incompatible
export const validateLeaves = function ({ roots, leaves }) {
  if (roots && leaves) {
    throw new Error(
      'The "roots" and "leaves" options must not be true at the same time.',
    )
  }
}
