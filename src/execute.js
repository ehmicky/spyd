import { benchmark } from './temp.js'
import { printStats } from './print.js'

const func = Math.random

Array.from({ length: 10 }, () => benchmark(func, 1e8)).map(
  (stats, index, allStats) => printStats(stats, allStats),
)
