/* eslint-disable max-lines */
import { dirname } from 'path'

import { UserError } from '../../error/main.js'
import { findValues } from '../../utils/recurse.js'
import { addBases, getBasePath } from '../cwd.js'
import { deepMerge, isRecurseObject } from '../merge.js'
import { get, has, set } from '../normalize/lib/wild_wild_path/main.js'
import { serializePath } from '../normalize/lib/wild_wild_path_parser/main.js'

import { loadConfigContents } from './contents.js'
import { normalizeConfigProp } from './normalize.js'

// Load the main configuration file `spyd.*` and any parents.
// The configuration file is optional, so this can return an empty array.
// This allows benchmarking on-the-fly in a terminal without having to create a
// configuration file.
// The `config` property can optionally be an array.
//  - This allow merging a shared configuration with a non-shared one
//  - It can be an empty array. This is useful to remove the default value for
//    the `config` top-level flag programmatically.
// Configuration files can use shared configuration using the `config` property
// inside another configure file.
// This can be used to share both:
//  - Configs: repository-wide, machine-wide or organization-wide
//  - Benchmarks (config + tasks + dependencies) measuring either:
//     - A library performance (for its consumers)
//     - The machine performance
// Sharing benchmarks can be used to:
//  - Make benchmarks trustable by allowing users to:
//     - Reproduce results
//     - Check if results would change by tweaking the configuration or tasks
//  - Measure the same benchmark but on another machine or software
//  - Measure the same benchmark between competing libraries. For example, a
//    competing implementation could re-use the parent benchmark and add a task
//    file for its own implementation.
// Using shared configurations can be done both:
//  - As a one-off time, e.g. `npx`
//  - As a persisted installation, e.g. `npm install`
// This works with both the CLI and programmatic usage.
// The design encourages users:
//  - To separate the benchmark package from the library package
//     - So that the library package does not include any benchmarking code or
//       dependencies
//  - While still allowing running benchmark while developing library
//     - A monorepo setup could sometimes help with this
// The design encourages publishers to build as much as possible:
//  - As opposed to consumer during installation
//     - No arbitrary command execution for consumers, for security
//  - Except when not possible, e.g. binary compilation
// The intended workflow to share benchmarks is:
//  - Publisher:
//     - Publishes: config file, tasks files, dependencies
//        - Using any available resolver, e.g. npm
//        - The main exported file must be the config file
//           - On npm, this is the "main" file
//              - This can be "spyd.yml", since we use `import.meta.resolve()`,
//                not `import`
//     - Should specify peer pependencies requirements:
//        - For both `spyd` and runners used by config
//        - It should do so by using package manager-specific features to
//          require consumers to install specific version ranges of those
//           - With npm: `peerDependencies`
//           - With others without a similar concept: only document the
//             requirements in config's documentation
//        - Version ranges should be `>=minimumVersion` (not `^minimumVersion`)
//          to avoid having to re-define them all the time
//     - Should take into account that `cwd` is consumer-defined:
//        - Git repository is consumer's
//        - `cwd` in tasks file is consumer-defined
//        - Tasks must be defined in config file, not use the default lookup
//  - Consumer:
//     - Installs package manager (e.g. npm)
//     - Installs `spyd`
//     - Installs package
//        - This should also install package's dependencies
//     - With npm, this translates as either:
//        - npx --package=spyd-config-{name} spyd ...
//        - npm install -D spyd-config-{name};
//          spyd --config=spyd-config-{name}; (or add to config file)
//          spyd ...
// The package is resolved to a file path:
//  - This uses resolver-specific logic
// Publishing using containers might be allowed in the future but only when no
// other choices because:
//  - This requires more setup for publisher
//  - This does not use consumer's OS configuration
//  - There is a higher risk that the setup works for publishers but not
//    consumers, if publishers run benchmark not in the container
//  - For most containers (e.g. docker):
//     - This only runs on Linux
//     - The consumer might need to set some flags, e.g. for networking
export const loadConfig = async function (
  { config: configOpt, ...configContents },
  base,
) {
  const configWithBases = addBases(configContents, base)
  const [parentConfigInfos, configWithBasesA] = await Promise.all([
    getParentConfigInfos(configOpt, base),
    replaceReferences(configWithBases, base),
  ])
  const configWithBasesB = deepMerge([
    ...parentConfigInfos.map(getConfigWithBases),
    configWithBasesA,
  ])
  const bases = parentConfigInfos.map(getBase)
  return { configWithBases: configWithBasesB, bases }
}

const getParentConfigInfos = async function (configOpt, base) {
  const configPaths = await normalizeConfigProp(configOpt, base)
  return await Promise.all(configPaths.map(getParentConfigInfo))
}

const getParentConfigInfo = async function (configPath) {
  const base = dirname(configPath)
  const configContents = await loadConfigContents(configPath)
  const configContentsA = addDefaultConfig(configContents)
  const { configWithBases } = await loadConfig(configContentsA, base)
  return { configWithBases, base }
}

// The default `config` is only applied to the top-level CLI flag.
// Therefore, we default it to an empty array when set from a config file.
const addDefaultConfig = function ({
  config: configOpt = [],
  ...configContents
}) {
  return { ...configContents, config: configOpt }
}

const getConfigWithBases = function ({ configWithBases }) {
  return configWithBases
}

const getBase = function ({ base }) {
  return base
}

// Specific properties of a parent configuration can be merged to by using a
// string `{config}##{propertyPath}`:
//  - `config` has the same syntax as the `config` property
//  - `propertyPath` is a dot-delimited path
// The string is replaced by the reference's value.
// A common use case is to append a parent configuration's array instead of
// overridding it, for example:
//  - Adding tasks to a shared configuration, to compare them
//  - Changing a reporter's pluginConfig while keeping other reporters
const replaceReferences = async function (configWithBases, base) {
  const references = findValues(configWithBases, isReference, isRecurseObject)
  const referencesA = await Promise.all(
    references.map((reference) => resolveReference(reference, base)),
  )
  return referencesA.reduce(replaceReference, configWithBases)
}

const isReference = function (value) {
  return (
    typeof value === 'string' &&
    value.includes(REFERENCE_SEPARATOR) &&
    !value.startsWith(REFERENCE_SEPARATOR)
  )
}

const resolveReference = async function ({ path, value }, base) {
  const [configOpt, referenceName] = value.split(REFERENCE_SEPARATOR)
  const [{ configWithBases, base: parentBase }] = await getParentConfigInfos(
    configOpt,
    base,
  )
  validateReferencePath({ configWithBases, referenceName, configOpt, path })
  const newValue = get(configWithBases, referenceName)
  return { path, parentBase, newValue }
}

const REFERENCE_SEPARATOR = '##'

const validateReferencePath = function ({
  configWithBases,
  referenceName,
  configOpt,
  path,
}) {
  if (has(configWithBases, referenceName)) {
    return
  }

  const name = serializePath(path)
  throw new UserError(
    `Configuration property "${name}" must be valid: "${referenceName}" property does not exist in "${configOpt}"`,
  )
}

// When the new value is an array and the parent is also an array, those are
// flattened. This allows:
//  - Both array spreads and individual array updates
//  - Parent configurations to switch from using the array and non-array
//    syntaxes of polymorphic properties without breaking child configurations
const replaceReference = function (
  configWithBases,
  { path, parentBase, newValue },
) {
  return isArrayReference(newValue, path)
    ? replaceSpreadReference({ path, parentBase, newValue, configWithBases })
    : replaceFlatReference({ path, parentBase, newValue, configWithBases })
}

const isArrayReference = function (newValue, path) {
  return Array.isArray(newValue) && Number.isInteger(path[path.length - 1])
}

const replaceSpreadReference = function ({
  path,
  parentBase,
  newValue,
  configWithBases,
}) {
  const lastKey = path[path.length - 1]

  const newPath = path.slice(0, -1)
  const configWithBasesA = spreadArray({
    newPath,
    newValue,
    configWithBases,
    lastKey,
  })

  const newBasePath = getBasePath(path).slice(0, -1)
  const newBaseValue = newValue.map(() => parentBase)
  const configWithBasesB = spreadArray({
    newPath: newBasePath,
    newValue: newBaseValue,
    configWithBases: configWithBasesA,
    lastKey,
  })
  return configWithBasesB
}

const spreadArray = function ({ newPath, newValue, configWithBases, lastKey }) {
  const currentParentValue = get(configWithBases, newPath)
  const newParentValue = [
    ...currentParentValue.slice(0, lastKey),
    ...newValue,
    ...currentParentValue.slice(lastKey + 1),
  ]
  return set(configWithBases, newPath, newParentValue)
}

const replaceFlatReference = function ({
  path,
  parentBase,
  newValue,
  configWithBases,
}) {
  const configWithBasesA = set(configWithBases, path, newValue)
  const configWithBasesB = set(configWithBasesA, getBasePath(path), parentBase)
  return configWithBasesB
}
/* eslint-enable max-lines */
