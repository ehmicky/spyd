import { measure } from './measure.js'
import { getStats } from './stats.js'

export const getResults = function({ tasks, opts, opts: { repeat } }) {
  const loop = Array.from({ length: repeat }, getIndex)
  return tasks.flatMap(task => getResult({ task, loop, opts }))
}

const getIndex = function(value, index) {
  return index
}

const getResult = function({
  task,
  task: { name, main, variants },
  loop,
  opts,
}) {
  const taskA = { ...task, name }

  if (variants === undefined) {
    return getArgResult({ name, main, loop, task: taskA, opts })
  }

  return Object.entries(variants).map(([variant, variantArgs]) =>
    getArgResult({
      name,
      main,
      variantArgs,
      variant,
      loop,
      task: taskA,
      opts,
    }),
  )
}

const getArgResult = function({
  name,
  main,
  variantArgs,
  variant,
  loop,
  task,
  opts,
}) {
  const nameA = variant === undefined ? name : `${name} (${variant})`
  const mainA = useVariantArgs(main, variantArgs)
  const getDuration = measure.bind(null, mainA)

  const durations = loop.map(getDuration)
  const duration = getStats(durations)
  return { name: nameA, task, variant, duration, opts }
}

const useVariantArgs = function(main, variantArgs) {
  if (variantArgs === undefined) {
    return main
  }

  if (Array.isArray(variantArgs)) {
    return main.bind(null, ...variantArgs)
  }

  return main.bind(null, variantArgs)
}
