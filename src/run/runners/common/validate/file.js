import { isPlainObject } from '../../../../utils/main.js'

// Validate that the benchmark file has correct shape
export const validateBenchmarkFile = function(entries, validators) {
  if (!isPlainObject(entries)) {
    throw new TypeError(`Benchmark file must be a top-level object`)
  }

  if (entries.tasks === undefined) {
    throw new TypeError(`Missing property 'tasks'`)
  }

  Object.entries(entries).forEach(([name, entry]) =>
    validateEntry(name, entry, validators),
  )
}

const validateEntry = function(name, entry, validators) {
  const validator = validators[name]

  if (validator === undefined) {
    throw new TypeError(`Unknown property '${name}'`)
  }

  validator(entry)
}
