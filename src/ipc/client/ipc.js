import { argv } from 'process'

import fetch from 'cross-fetch'

export const startRunner = async function ({ load, bench }) {
  const { serverUrl, loadParams } = parseLoadParams()
  // eslint-disable-next-line fp/no-let
  let returnValue = load(loadParams)

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const params = await sendReturnValue(returnValue, serverUrl)
    // eslint-disable-next-line fp/no-mutation
    returnValue = bench(params)
  } while (true)
}

const parseLoadParams = function () {
  const { serverUrl, ...loadParams } = JSON.parse(argv[2])
  return { serverUrl, loadParams }
}

const sendReturnValue = async function (returnValue, serverUrl) {
  const returnValueString = JSON.stringify(returnValue)
  const response = await fetch(serverUrl, {
    method: 'POST',
    body: returnValueString,
  })
  const params = await response.json()
  return params
}
