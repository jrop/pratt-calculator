'use strict'

const assert = require('assert')
const inspect = require('util').inspect
const parser = require('./parser')

function visit(node) {
	if (typeof node == 'number')
		return node

	return {
		'^': n => Math.pow(visit(n.left), visit(n.right)),
		'+': n => visit(n.left) + visit(n.right),
		'-': n => visit(n.left) - visit(n.right),
		'*': n => visit(n.left) * visit(n.right),
		'/': n => visit(n.left) / visit(n.right),
		neg: n => -visit(n.value)
	}[node.type](node)
}

function calc(s) {
	return visit(parser(s))
}

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

console.log('All tests completed successfully')
