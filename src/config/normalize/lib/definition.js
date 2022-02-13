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
    required = false,
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

// `definition.example` only needs to be defined once per `definition.name`,
// defaulting to the first value from other definitions
const addDefaultExample = function (example, name, definitions) {
  if (example !== undefined) {
    return example
  }

  const definitionA = definitions.find(
    (definition) =>
      definition.name === name && definition.example !== undefined,
  )
  return definitionA === undefined ? undefined : definitionA.example
}
