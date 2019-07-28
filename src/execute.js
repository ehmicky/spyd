import { benchmark } from './temp.js'

const func = Math.random

const print = function(number) {
  return fixedLength(number, 10)
}

const fixedLength = function(number, length) {
  const numberStr = String(number)
  return numberStr.slice(0, length).padStart(length)
}

console.log(
  Array.from({ length: 10 }, () => {
    return benchmark(func, 1e8)
  })
    .map(
      ({
        median,
        mean,
        min,
        max,
        deviation,
        variance,
        loops,
        count,
        repeat,
      }) => {
        return [
          `median ${print(median)}`,
          `mean ${print(mean)}`,
          `min ${print(min)}`,
          `max ${print(max)}`,
          `deviation ${print(deviation)}`,
          `variance ${print(variance)}`,
          `loops ${print(loops)}`,
          `count ${print(count)}`,
          `repeat ${print(repeat)}`,
        ].join(' | ')
      },
    )
    .join('\n'),
)
