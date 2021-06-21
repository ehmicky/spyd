// eslint-disable-next-line no-shadow
import { setTimeout } from 'timers/promises'

export const random = () => {
  Math.random()
}

// eslint-disable-next-line no-empty-function
export const empty = () => {}

export const fixed = async () => {
  // eslint-disable-next-line no-magic-numbers
  await setTimeout(50)
}

export const slow = async () => {
  // eslint-disable-next-line no-magic-numbers
  await setTimeout(1e4)
}

export const uniform = async () => {
  // eslint-disable-next-line no-magic-numbers
  await setTimeout(100 * Math.random())
}

export const exponential = async () => {
  // eslint-disable-next-line no-magic-numbers
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
