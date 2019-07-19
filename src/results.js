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
  task: { name, main, parameters },
  loop,
  opts,
}) {
  const taskA = { ...task, name }

  if (parameters === undefined) {
    return getArgResult({ name, main, loop, task: taskA, opts })
  }

  return parameters.map(({ name: parameter, values: args }) =>
    getArgResult({
      name,
      main,
      parameter,
      args,
      loop,
      task: taskA,
      opts,
    }),
  )
}

const getArgResult = function({
  name,
  main,
  parameter,
  args,
  loop,
  task,
  opts,
}) {
  const mainA = useArgs(main, args)
  const getDuration = measure.bind(null, mainA)

  const durations = loop.map(getDuration)
  const duration = getStats(durations)
  return { name, task, parameter, duration, opts }
}

const useArgs = function(main, args) {
  if (args === undefined) {
    return main
  }

  return main.bind(null, ...args)
}
