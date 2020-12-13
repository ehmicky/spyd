import { argv } from 'process'

import fetch from 'cross-fetch'

export const startRunner = async function ({ load, bench }) {
  const { serverUrl, loadParams } = parseLoadParams()
  // eslint-disable-next-line fp/no-let
  let output = load(loadParams)

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const params = await sendOutput(output, serverUrl)
    // eslint-disable-next-line fp/no-mutation
    output = bench(params)
  } while (true)
}

const parseLoadParams = function () {
  const { serverUrl, ...loadParams } = JSON.parse(argv[2])
  return { serverUrl, loadParams }
}

const sendOutput = async function (output, serverUrl) {
  const outputString = JSON.stringify(output)
  const response = await fetch(serverUrl, {
    method: 'POST',
    body: outputString,
  })
  const params = await response.json()
  return params
}
