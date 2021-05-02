const { execFile } = require('child_process')
const { setTimeout } = require('timers/promises')
const { promisify } = require('util')

const pExecFile = promisify(execFile)

module.exports.random = () => {
  Math.random()
}

module.exports.empty = () => {}

module.exports.fixed = async () => {
  await setTimeout(50)
}

module.exports.uniform = async () => {
  await setTimeout(100 * Math.random())
}

module.exports.exponential = async () => {
  await setTimeout(2 ** (1 + Math.random() * 6))
}

let count = 0

module.exports.growing = async () => {
  count += 1
  await setTimeout(count)
}

module.exports.real = async () => {
  await pExecFile('node', [`${__dirname}/..`])
}
