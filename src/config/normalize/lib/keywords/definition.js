import { callDefinition, callNormalize } from '../call/main.js'

// The property name is defined by `name`.
// `aliases` can be defined to either:
//   - Augment the behavior of another keyword
//   - Rename a keyword
export const getDefinition = function (rule, keyword, aliases) {
  const definition = rule[keyword]

  if (definition !== undefined || aliases === undefined) {
    return definition
  }

  const aliasA = aliases.find((alias) => rule[alias] !== undefined)
  return aliasA === undefined ? undefined : rule[aliasA]
}

// Call definition when it is a function
export const callDefinitionFunc = async function ({
  definition,
  input,
  info,
  hasInput,
  test,
  keyword,
  exampleDefinition,
}) {
  return typeof definition === 'function'
    ? await callDefinition({
        definition,
        input,
        info,
        hasInput,
        test,
        keyword,
        exampleDefinition,
      })
    : definition
}

// Apply `keyword.normalize(definition)`
export const normalizeDefinition = async function ({
  definition,
  normalize,
  info,
  keyword,
  exampleDefinition,
}) {
  return normalize === undefined
    ? definition
    : await callNormalize({
        normalize,
        definition,
        info,
        keyword,
        exampleDefinition,
      })
}
