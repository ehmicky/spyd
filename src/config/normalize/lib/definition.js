import { get } from './prop_path/get.js'

// Validate and normalize definitions
export const normalizeDefinition = function (
  {
    name,
    pick,
    condition,
    default: defaultValue,
    compute,
    path = false,
    glob = false,
    required = defaultRequired,
    example,
    validate,
    transform,
    rename,
  },
  index,
  definitions,
) {
  const exampleA = addDefaultExample(example, name, definitions)
  return {
    name,
    pick,
    condition,
    default: defaultValue,
    compute,
    path,
    glob,
    required,
    example: exampleA,
    validate,
    transform,
    rename,
  }
}

// `required` defaults to `false` except for array items.
// This validates against sparse arrays by default, since they are usually
// unwanted.
const defaultRequired = function ({ path, config }) {
  return path.length !== 0 && Array.isArray(get(config, path.slice(0, -1)))
}

// `definition.example` only needs to be defined once per `definition.name`,
// defaulting to the first value from other definitions.
// It can also default to any `definition.default`.
const addDefaultExample = function (example, name, definitions) {
  if (example !== undefined) {
    return example
  }

  const definitionA = definitions.find(
    (definition) =>
      definition.name === name && definition.example !== undefined,
  )

  if (definitionA !== undefined) {
    return definitionA.example
  }

  const definitionB = definitions.find(
    (definition) =>
      definition.name === name && definition.default !== undefined,
  )
  return definitionB === undefined
    ? undefined
    : useDefaultAsExample(definitionB.default)
}

const useDefaultAsExample = function (defaultValue) {
  return typeof defaultValue === 'function'
    ? (value, opts) => defaultValue(opts)
    : defaultValue
}
