const test = require('tape')
const {calc} = require('./parser')

test('1 + 2 * 3', t => {
	t.equal(calc('1 + 2 * 3'), 7)
	t.end()
})

test('(1 + 2) * 3', t => {
	t.equal(calc('(1 + 2) * 3'), 9)
	t.end()
})

test('1', t => {
	t.equal(calc('1'), 1)
	t.end()
})

test('((1))', t => {
	t.equal(calc('((1))'), 1)
	t.end()
})

test('3^4^.5', t => {
	t.equal(calc('3^4^.5'), 9)
	t.end()
})

test('(2^3)^4', t => {
	t.equal(calc('(2^3)^4'), 4096)
	t.end()
})

test('-2*-2', t => {
	t.equal(calc('-2*-2'), 4)
	t.end()
})

test('-2*2', t => {
	t.equal(calc('-2*2'), -4)
	t.end()
})

test('5/2/.5', t => {
	t.equal(calc('5/2/.5'), 5)
	t.end()
})

test('5 - 3 - 1 - 4', t => {
	t.equal(calc('5 - 3 - 1 - 4'), -3)
	t.end()
})

test('floor(ceil(0.5) / 2)', t => {
	t.equal(calc('floor(ceil(0.5) / 2)'), 0)
	t.end()
})

test('PI', t => {
	t.equal(calc('PI'), Math.PI)
	t.end()
})

test('abs(cos(PI)) + 9', t => {
	t.equal(calc('abs(cos(PI)) + 9'), 10)
	t.end()
})
