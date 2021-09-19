// This is an example of tasks, used mostly for debugging
// eslint-disable-next-line no-shadow
import { setTimeout } from 'timers/promises'

// Very fast task
export const random = () => {
  Math.random()
}

// The fastest possible task
// eslint-disable-next-line no-empty-function
export const empty = () => {}

// Very precise task
export const fixed = async () => {
  await setTimeout(0)
}

// Very slow task
export const slow = async () => {
  await setTimeout(1e4)
}

// Task with a uniform distribution
export const uniform = async () => {
  await setTimeout(100 * Math.random())
}

// Task with an exponiential distribution
export const exponential = async () => {
  await setTimeout(2 ** (1 + Math.random() * 6))
}

// eslint-disable-next-line fp/no-let
let count = 0

// Task with an ever-slowing speed
export const growing = async () => {
  // eslint-disable-next-line fp/no-mutation
  count += 1
  await setTimeout(count)
}

// Task with a high complexity mimicking real tasks
export const real = async () => {
  await import('spyd')
}
