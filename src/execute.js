import { benchmark } from './temp.js'

const func = () => {}

Array.from({ length: 10 }, () => {
  benchmark(func, 1e7)
})
