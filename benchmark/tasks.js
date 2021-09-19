// This is an example of tasks, used mostly for debugging
import { execFile } from 'child_process'
import { randomInt, createHash } from 'crypto'
import { promises as fs } from 'fs'
// eslint-disable-next-line no-shadow
import { setTimeout } from 'timers/promises'
import { promisify } from 'util'

import got from 'got'
import { tmpName } from 'tmp-promise'

const pExecFile = promisify(execFile)

const CURRENT_URL = new URL(import.meta.url)

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

// eslint-disable-next-line fp/no-let, init-declarations
let fileContent

// CPU-bound task
export const cpu = {
  async beforeAll() {
    // eslint-disable-next-line fp/no-mutation
    fileContent = await fs.readFile(CURRENT_URL, 'utf8')
  },
  beforeEach({ context }) {
    // eslint-disable-next-line no-param-reassign, fp/no-mutation
    context.hash = createHash('sha256')
  },
  main({ context: { hash } }) {
    hash.update(fileContent)
    hash.digest('hex')
  },
}

// IO-bound read task
export const read = async function () {
  await fs.readFile(CURRENT_URL)
}

// IO-bound write task
export const write = {
  async beforeAll() {
    // eslint-disable-next-line fp/no-mutation
    fileContent = await fs.readFile(CURRENT_URL, 'utf8')
  },
  async beforeEach({ context }) {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    context.tmpPath = await tmpName()
  },
  async main({ context: { tmpPath } }) {
    await fs.writeFile(tmpPath, fileContent)
  },
  async afterEach({ context: { tmpPath } }) {
    await fs.unlink(tmpPath)
  },
}

// Process-spawning-bound task
export const spawn = async function () {
  await pExecFile('node', ['--version'])
}

// Network-bound task
export const network = async function () {
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
