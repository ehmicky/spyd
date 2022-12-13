import { callDefinition, callNormalize } from '../call/main.js'

// The property name is defined by `name`.
// `aliases` can be defined to either:
//   - Augment the behavior of another keyword
//   - Rename a keyword
export const getDefinition = (rule, keyword, aliases) => {
  const definition = rule[keyword]

  if (definition !== undefined || aliases === undefined) {
    return definition
  }

  const aliasA = aliases.find((alias) => rule[alias] !== undefined)
  return aliasA === undefined ? undefined : rule[aliasA]
}

// Call definition when it is a function.
// Definition functions are considered async or not based on whether the user
// used the main async method or not
//  - We cannot know for sure whether a user-defined function is async, since it
//    might return a Promise
//  - Requiring user to declare sync|async would be poorer developer experience
//    and error-prone
export const callDefinitionFunc = async ({
  definition,
  input,
  info,
  hasInput,
  test,
  keyword,
  exampleDefinition,
  sync,
}) =>
  typeof definition === 'function'
    ? await callDefinition({
        definition,
        input,
        info,
        hasInput,
        test,
        keyword,
        exampleDefinition,
        sync,
      })
    : definition

// Apply `keyword.normalize(definition)`
export const normalizeDefinition = async ({
  definition,
  normalize,
  normalizeSync,
  info,
  keyword,
  exampleDefinition,
}) =>
  normalize === undefined
    ? definition
    : await callNormalize({
        normalize,
        normalizeSync,
        definition,
        info,
        keyword,
        exampleDefinition,
      })
