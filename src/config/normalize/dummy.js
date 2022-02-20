// Some configuration objects are normalized in several steps, with each step
// normalizing different configuration properties:
//  - `config`
//  - Not related to plugins
//  - Shared by all plugins
//  - Specific to a plugin
// To avoid each sets of properties to be marked as unknown, we need to add
// dummy definitions for them.
export const getDummyDefinitions = function (definitions) {
  return definitions.map(getDummyDefinition)
}

const getDummyDefinition = function ({ name }) {
  return { name }
}
