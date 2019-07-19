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
  task: { title, main, variants },
  loop,
  opts,
}) {
  const taskA = { ...task, title }

  if (variants === undefined) {
    return getArgResult({ title, main, loop, task: taskA, opts })
  }

  return Object.entries(variants).map(([variant, variantArgs]) =>
    getArgResult({
      title,
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
  title,
  main,
  variantArgs,
  variant,
  loop,
  task,
  opts,
}) {
  const titleA = variant === undefined ? title : `${title} (${variant})`
  const mainA = useVariantArgs(main, variantArgs)
  const getDuration = measure.bind(null, mainA)

  const durations = loop.map(getDuration)
  const duration = getStats(durations)
  return { title: titleA, task, variant, duration, opts }
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
