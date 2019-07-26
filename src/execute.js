import { benchmark } from './temp.js'

const func = Math.random

console.log(
  Array.from({ length: 10 }, () => {
    return benchmark(func, 1e8)
  }).join('\n'),
)
