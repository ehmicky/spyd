// This is an example of tasks, used mostly for debugging
import { randomInt } from 'crypto'
// eslint-disable-next-line no-shadow
import { setTimeout } from 'timers/promises'

// The fastest possible task
// eslint-disable-next-line no-empty-function
export const snappy = () => {}

// Very fast task
export const fast = () => {
  Math.random()
}

// Very slow task
export const slow = async () => {
  await setTimeout(1e4)
}

// Very precise task
export const precise = async () => {
  await setTimeout(0)
}

// Very imprecise task
export const imprecise = function () {
  randomInt(2)
}

// Task with a high complexity mimicking real tasks
export const complex = async () => {
  await import('spyd')
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
