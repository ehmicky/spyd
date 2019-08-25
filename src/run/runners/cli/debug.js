import { measure } from './benchmark/measure.js'

// Run an iteration once without benchmarking it
export const debugRun = async function({ main, before, after }) {
  await measure({ main, before, after, stdio: 'inherit' })
}
