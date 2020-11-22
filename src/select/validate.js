import { UserError } from '../error/main.js'

// Ensure identifiers exist in at least some partialResults' combinations
export const validateTargets = function (targets, partialResults) {
  targets.forEach(({ idName, name, ids }) => {
    validateTarget({ idName, name, ids, partialResults })
  })
}

const validateTarget = function ({ idName, name, ids, partialResults }) {
  ids.forEach(({ id }) => {
    validateId({ idName, name, id, partialResults })
  })
}

const validateId = function ({ idName, name, id, partialResults }) {
  const isValid = partialResults.some(({ combinations }) =>
    hasId(id, idName, combinations),
  )

  if (!isValid) {
    throw new UserError(
      `Selected ${name} ${id} but that ${name} does not exist`,
    )
  }
}

const hasId = function (id, idName, combinations) {
  return combinations.some((combination) => combination[idName] === id)
}
