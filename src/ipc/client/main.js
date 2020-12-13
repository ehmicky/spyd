import { startRunner } from './ipc.js'

const load = function ({ taskId }) {
  return { taskTitle: `${taskId} title` }
}

const bench = function ({ maxDuration }) {
  // eslint-disable-next-line no-magic-numbers
  const measure = maxDuration * Math.round(Math.random() * 1e2)
  return { measure }
}

startRunner({ load, bench })
