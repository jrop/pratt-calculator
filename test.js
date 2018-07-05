const _test = require('tape')
const {calc} = require('./parser')

const test = (expr, expected) =>
	_test(expr, t => {
		t.equal(calc(expr), expected)
		t.end()
	})

test('1 + 2 * 3', 7)
test('(1 + 2) * 3', 9)
test('1', 1)
test('((1))', 1)
test('3^4^.5', 9)
test('(2^3)^4', 4096)
test('-2*-2', 4)
test('-2*2', -4)
test('5/2/.5', 5)
test('5 - 3 - 1 - 4', -3)
test('floor(ceil(0.5) / 2)', 0)
test('PI', Math.PI)
test('abs(cos(PI)) + 9', 10)
