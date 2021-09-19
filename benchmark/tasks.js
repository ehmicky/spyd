// eslint-disable-next-line no-shadow
import { setTimeout } from 'timers/promises'

export const random = () => {
  Math.random()
}

// eslint-disable-next-line no-empty-function
export const empty = () => {}

export const fixed = async () => {
  await setTimeout(0)
}

export const slow = async () => {
  await setTimeout(1e4)
}

export const uniform = async () => {
  await setTimeout(100 * Math.random())
}

export const exponential = async () => {
  await setTimeout(2 ** (1 + Math.random() * 6))
}

// eslint-disable-next-line fp/no-let
let count = 0

export const growing = async () => {
  // eslint-disable-next-line fp/no-mutation
  count += 1
  await setTimeout(count)
}

export const real = async () => {
  await import('spyd')
}
