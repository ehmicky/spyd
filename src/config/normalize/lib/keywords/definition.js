import { callFunc } from '../call.js'

// The property name is defined by `name`.
// `aliases` can be defined to either:
//   - Augment the behavior of another keyword
//   - Rename a keyword
export const getDefinition = function (rule, name, aliases) {
  const definition = rule[name]

  if (definition !== undefined || aliases === undefined) {
    return definition
  }

  const aliasA = aliases.find((alias) => rule[alias] !== undefined)
  return aliasA === undefined ? undefined : rule[aliasA]
}

// Apply `keyword.normalize()`
export const normalizeDefinition = async function (
  definition,
  normalize,
  info,
) {
  return normalize === undefined
    ? definition
    : await callFunc({
        func: () => normalize(definition),
        info,
        hasInput: false,
      })
}
