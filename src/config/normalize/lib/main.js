import pReduce from 'p-reduce'

import { cleanObject } from '../../../utils/clean.js'

import { applyDefinition } from './apply.js'
import { normalizeDefinition } from './definition.js'
import { handleError } from './loose.js'
import { getOpts } from './opts.js'
import { list } from './prop_path/get.js'
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
  { context = {}, loose = false, cwd, prefix, parents = '' } = {},
) {
  const definitionsA = definitions.map(normalizeDefinition)

  try {
    const configB = await pReduce(
      definitionsA,
      (configA, definition) =>
        applyDefinitionDeep({
          config: configA,
          definition,
          context,
          cwd,
          prefix,
          parents,
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
  parents,
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
        parents,
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
  parents,
}) {
  const opts = await getOpts({
    name,
    config,
    context,
    cwd,
    prefix,
    parents,
    example,
  })
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
