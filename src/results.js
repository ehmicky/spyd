import { measure } from './measure.js'
import { getStats } from './stats.js'

export const getResults = function({ tasks, options, options: { repeat } }) {
  const loop = Array.from({ length: repeat }, getIndex)
  return Object.entries(tasks).flatMap(([id, task]) =>
    getResult({ id, task, loop, options }),
  )
}

const getIndex = function(value, index) {
  return index
}

const getResult = function({
  id,
  task,
  task: { title = id, main, variants },
  loop,
  options,
}) {
  const taskA = { ...task, title }

  if (variants === undefined) {
    return getArgResult({ title, main, loop, task: taskA, options })
  }

  return Object.entries(variants).map(([variant, variantArgs]) =>
    getArgResult({
      title,
      main,
      variantArgs,
      variant,
      loop,
      task: taskA,
      options,
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
  options,
}) {
  const titleA = variant === undefined ? title : `${title} (${variant})`
  const mainA =
    variantArgs === undefined ? main : main.bind(null, ...variantArgs)

  const durations = loop.map(() => measure(mainA))
  const duration = getStats(durations)
  return { title: titleA, task, variant, duration, options }
}
