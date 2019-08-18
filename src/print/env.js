import { omit } from '../utils/main.js'

// We merge two collection of similar `envs`:
//  - after merging with previous benchmarks of same group, to retrieve their
//    options and systems
//  - after grouping iterations, to retrieve their speed and set iteration.rank
export const mergeEnvs = function(envs, envCollections) {
  const envsA = envCollections.map(envCollection =>
    mergeEnv(envs, envCollection),
  )
  const envsB = addSharedEnv(envsA)
  return envsB
}

const mergeEnv = function(envs, envCollection) {
  const env = envs.find(envA => envA.id === envCollection.id)
  return { ...envCollection, ...env }
}

// The first `env` is a collection of all properties shared by other `envs`.
// Its `id`, `title` and `mean` are `undefined`.
const addSharedEnv = function(envs) {
  const sharedProps = getSharedProps(envs)
  const sharedEnv = getSharedEnv(sharedProps, envs)
  const envsA = envs.map(env => omit(env, sharedProps))
  return [sharedEnv, ...envsA]
}

const getSharedProps = function([firstEnv, ...nextEnvs]) {
  const sharedProps = SHARED_PROPS.filter(propName =>
    isSharedProp(firstEnv, nextEnvs, propName),
  )
  return [...SAME_PROPS, ...sharedProps]
}

// Can optionally be the same across envs
const SHARED_PROPS = ['cpu', 'memory', 'os']
// Validated to always be the same across envs, so it's always shared.
const SAME_PROPS = ['opts']

const isSharedProp = function(firstEnv, nextEnvs, propName) {
  return nextEnvs.every(nextEnv => nextEnv[propName] === firstEnv[propName])
}

const getSharedEnv = function(sharedProps, [firstEnv]) {
  const props = sharedProps.map(sharedProp => [
    sharedProp,
    firstEnv[sharedProp],
  ])
  return Object.fromEntries(props)
}
