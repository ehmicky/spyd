import pReduce from 'p-reduce'

import { cleanObject } from '../../../utils/clean.js'

import { addCwd } from './cwd.js'
import { applyDefinition } from './definition.js'
import { DEFAULT_PREFIX } from './prefix.js'
import { list } from './prop_path/get.js'
import { parse } from './prop_path/parse.js'
import { set, remove } from './prop_path/set.js'

// Normalize configuration shape and do custom validation.
// An array of definition objects is passed.
// Each definition object applies validation and normalization on a specific
// configuration property.
// Users specify the operations order using the array order, as opposed to the
// library guessing the best order as this is simpler and more flexible. This:
//  - Allows going from child to parent or vice versa
//  - Removes the need to guess the order nor await other definitions
//  - Removes the possibility of cycles
//  - Makes it clear to users what the order is
// TODO: abstract this function to its own library
export const normalizeConfigProps = async function (
  config,
  definitions,
  { context = {}, loose = false, cwd, prefix = DEFAULT_PREFIX } = {},
) {
  try {
    const configB = await pReduce(
      definitions,
      (configA, definition) =>
        applyDefinitionDeep({
          config: configA,
          definition,
          context,
          cwd,
          prefix,
        }),
      config,
    )
    return cleanObject(configB)
  } catch (error) {
    handleError(error, loose)
    return error
  }
}

const applyDefinitionDeep = async function ({
  config,
  definition,
  definition: { name: query },
  context,
  cwd,
  prefix,
}) {
  const props = Object.entries(list(config, query))
  return await pReduce(
    props,
    (configA, [name, value]) =>
      applyPropDefinition({
        config: configA,
        value,
        name,
        definition,
        context,
        cwd,
        prefix,
      }),
    config,
  )
}

const applyPropDefinition = async function ({
  config,
  value,
  name,
  definition,
  definition: { example },
  context,
  cwd,
  prefix,
}) {
  const opts = await getOpts({ name, config, context, cwd, prefix, example })
  const { value: newValue, name: newName = name } = await applyDefinition(
    definition,
    value,
    opts,
  )
  const configA = name === newName ? config : remove(config, name)
  return newValue === undefined
    ? remove(configA, newName)
    : set(configA, newName, newValue)
}

// Retrieve `opts` passed to most methods
const getOpts = async function ({
  name,
  config,
  context,
  cwd,
  prefix,
  example,
}) {
  const path = parse(name)
  const opts = { name, path, config, context, prefix, example }
  const optsA = await addCwd({ cwd, opts })
  return optsA
}

// When in `loose` mode, user errors are returned instead of being thrown.
// System errors are always propagated.
const handleError = function (error, loose) {
  if (!loose || !error.validation) {
    throw error
  }
}
