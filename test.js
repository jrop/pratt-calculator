const assert = require('assert')
const {calc} = require('./parser')

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
assert.equal(calc('floor(ceil(0.5) / 2)'), 0)
assert.equal(calc('PI'), Math.PI)
assert.equal(calc('abs(cos(PI)) + 9'), 10)

// eslint-disable-next-line no-console
console.log('All tests completed successfully')
