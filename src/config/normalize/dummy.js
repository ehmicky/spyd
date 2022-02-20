// Some configuration objects are normalized in several steps, with each step
// normalizing different configuration properties:
//  - `config`
//  - Not related to plugins
//  - Shared by all plugins
//  - Specific to a plugin
// To avoid each sets of properties to be marked as unknown, we need to add
// dummy rules for them.
export const getDummyRules = function (rules) {
  return rules.map(getDummyRule)
}

const getDummyRule = function ({ name }) {
  return { name }
}
