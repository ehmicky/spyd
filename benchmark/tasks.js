// This is an example of tasks, used mostly for debugging
import { execFile } from 'node:child_process'
import { randomInt, createHash } from 'node:crypto'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'
import { promisify } from 'node:util'

import { got } from 'got'
import { tmpName } from 'tmp-promise'

const pExecFile = promisify(execFile)

const CURRENT_URL = new URL(import.meta.url)

// The fastest possible task
// eslint-disable-next-line no-empty-function
export const noop = () => {}

// Very fast task
export const fast = () => {
  Math.random()
}

// Very slow task
export const slow = async () => {
  await setTimeout(1e3)
}

// Very precise task
export const veryPrecise = async () => {
  await setTimeout(0)
}

// Very imprecise task
export const imprecise = () => {
  randomInt(2)
}

// eslint-disable-next-line fp/no-let, init-declarations
let fileContent

// CPU-bound task
export const cpu = {
  beforeAll: async () => {
    // eslint-disable-next-line fp/no-mutation
    fileContent = await readFile(CURRENT_URL, 'utf8')
  },
  beforeEach: ({ context }) => {
    // eslint-disable-next-line no-param-reassign, fp/no-mutation
    context.hash = createHash('sha256')
  },
  main: ({ context: { hash } }) => {
    hash.update(fileContent)
    hash.digest('hex')
  },
}

// IO-bound read task
export const read = async () => {
  await readFile(CURRENT_URL)
}

// IO-bound write task
export const write = {
  beforeAll: async () => {
    // eslint-disable-next-line fp/no-mutation
    fileContent = await readFile(CURRENT_URL, 'utf8')
  },
  beforeEach: async ({ context }) => {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    context.tmpPath = await tmpName()
  },
  main: async ({ context: { tmpPath } }) => {
    await writeFile(tmpPath, fileContent)
  },
  afterEach: async ({ context: { tmpPath } }) => {
    await unlink(tmpPath)
  },
}

// Process-spawning-bound task
export const spawn = async () => {
  await pExecFile('node', ['--version'])
}

// Network-bound task
export const network = async () => {
  await got('https://example.com')
}

// Task with a high complexity mimicking real tasks
export const complex = async () => {
  await import('spyd')
}

// Task with a uniform distribution
export const uniform = async () => {
  await setTimeout(100 * Math.random())
}

// Task with an exponential distribution
export const exponential = async () => {
  await setTimeout(1.1 ** (1 + Math.random() * 60))
}

// Task with a U-shaped distribution
export const ushaped = async () => {
  const duration = 1.1 ** (1 + Math.random() * 60)
  const durationA = Math.random() < 0.5 ? duration : 1.1 ** 61 - duration
  await setTimeout(durationA)
}

// eslint-disable-next-line fp/no-let
let count = 0

// Task with an ever-slowing speed
export const growing = async () => {
  // eslint-disable-next-line fp/no-mutation
  count += 1
  await setTimeout(count)
}
