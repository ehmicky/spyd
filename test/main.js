import test from 'ava'
import testEach from 'test-each'

import checkSpeed from '../src/main.js'

// eslint-disable-next-line no-empty-function
const main = function() {}

const normalizeResults = function(results) {
  return results.map(normalizeResult)
}

const normalizeResult = function({ duration: { average, all }, ...result }) {
  const averageA = typeof average
  const allA = all.length
  return { ...result, duration: { average: averageA, all: allA } }
}

testEach(
  [
    { one: { main }, opts: { repeat: 1 } },
    { one: { main }, opts: { repeat: 3 } },
    {
      one: { main, variants: { blue: ['blue'], green: ['green'] } },
      opts: { repeat: 1 },
    },
  ],
  ({ title }, { opts, ...tasks }) => {
    test(`checkSpeed() | ${title}`, t => {
      t.snapshot(normalizeResults(checkSpeed(tasks, opts)))
    })
  },
)
