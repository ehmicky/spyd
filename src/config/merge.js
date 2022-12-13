import declarativeMerge from 'declarative-merge'
import isPlainObj from 'is-plain-obj'
import { test as isUpdatesObject } from 'set-array'

// Deeply merge several objects.
// Used to merge:
//  - shared `config`
//  - `spyd.*` with CLI flags
//  - top-level `config` with plugin-specific one
// Arrays can be merged using updates objects.
//  - A common use case is to append a parent configuration's array instead of
//    overriding it, for example:
//     - Adding tasks to a shared configuration, to compare them
//     - Changing a reporter's pluginConfig while keeping other reporters
// Objects are merged deeply, but can change this using a `_merge` property
// set to "deep|shallow|set|delete".
// When merging configuration files:
//  - If `config` is an array, we ensure each item is merged to the previous one
//    in order
//  - If there is no parent `config`, we merge to an empty object to ensure that
//    `_merge` properties and array updates objects are resolved
// Plugin-specific configurations are merged to the top-level shared
// configuration using the same logic
//  - However, `_merge` properties and array updates objects cannot be used
//    since it would be ambiguous to know whether the target is the top-level
//    shared configuration or a parent `config`
//  - We prevent this by resolving those properties when the configuration is
//    first loaded, by merging it to an empty object
// Deep merging also allows CLI flags:
//  - To be deep, e.g. `--a.b.c=true`
//  - To set non-existing properties, even if deep
//  - To set arrays of objects, e.g. `--0.a.1.b=true`
export const deepMerge = ([firstObject, ...objects]) =>
  objects.reduce(deepMergePair, firstObject)

export const deepMergePair = (firstObject, secondObject) =>
  declarativeMerge(firstObject, secondObject)

// This is the value for `declarative-merge`.
// We expose it so other pieces of logic which need to work alongside the
// merging logic can mimic it.
export const isRecurseObject = (value) => isPlainObj(value)

// This is the value for `declarative-merge`.
export const isArrayUpdatesObject = (value) =>
  isUpdatesObject(value) && Object.keys(value).length !== 0

export const isMergeProp = (key) => key === MERGE_PROP

const MERGE_PROP = '_merge'
