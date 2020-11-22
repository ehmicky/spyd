import { UserError } from '../error/main.js'

// Ensure identifiers exist in at least some benchmarks/combinations
export const validateTargets = function (targets, rawBenchmarks) {
  targets.forEach(({ idName, name, ids }) => {
    validateTarget({ idName, name, ids, rawBenchmarks })
  })
}

const validateTarget = function ({ idName, name, ids, rawBenchmarks }) {
  ids.forEach(({ id }) => {
    validateId({ idName, name, id, rawBenchmarks })
  })
}

const validateId = function ({ idName, name, id, rawBenchmarks }) {
  const isValid = rawBenchmarks.some(({ combinations }) =>
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
