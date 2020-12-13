import { argv } from 'process'

import fetch from 'cross-fetch'

export const startRunner = async function ({ load, bench }) {
  const { serverUrl, initialInput } = parseInput()
  // eslint-disable-next-line fp/no-let
  let output = load(initialInput)

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const input = await sendOutput(output, serverUrl)
    // eslint-disable-next-line fp/no-mutation
    output = bench(input)
  } while (true)
}

const parseInput = function () {
  const { serverUrl, ...initialInput } = JSON.parse(argv[2])
  return { serverUrl, initialInput }
}

const sendOutput = async function (output, serverUrl) {
  const outputString = JSON.stringify(output)
  const response = await fetch(serverUrl, {
    method: 'POST',
    body: outputString,
  })
  const nextInput = await response.json()
  return nextInput
}
