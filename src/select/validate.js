// Ensure identifiers exist in at least some benchmarks/iterations
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
  const isValid = rawBenchmarks.some(({ iterations }) =>
    hasId(id, idName, iterations),
  )

  if (!isValid) {
    throw new Error(`Selected ${name} ${id} but that ${name} does not exist`)
  }
}

const hasId = function (id, idName, iterations) {
  return iterations.some((iteration) => iteration[idName] === id)
}
