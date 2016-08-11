'use strict'

const assert = require('assert')
const { calc } = require('./parser')

// const inspect = require('util').inspect
// const ast = parser('3.^4^.5')
// console.log(inspect(ast, null, null))

assert.equal(calc('1 + 2 * 3'), 7)
assert.equal(calc('(1 + 2) * 3'), 9)
assert.equal(calc('1'), 1)
assert.equal(calc('((1))'), 1)
assert.equal(calc('3^4^.5'), 9)
assert.equal(calc('(2^3)^4'), 4096)
assert.equal(calc('-2*-2'), 4)
assert.equal(calc('-2*2'), -4)
assert.equal(calc('5/2/.5'), 5)
assert.equal(calc('5 - 3 - 1 - 4'), -3)

console.log('All tests completed successfully')
