'use strict'

const lexer = require('./lexer')

const lex = lexer({
	// operators
	'PLUS': /^\+/,
	'MINUS': /^-/,
	'MULTIPLY': /^\*/,
	'DIVIDE': /^\//,
	'EXPONENT': /^\^/,
	'LPAREN': /^\(/,
	'RPAREN': /^\)/,

	'NUMBER': /^(?:\d+(?:\.\d*)?|\.\d+)/,
	'$SKIP': [ /^\s+/ ]
}, '(1 + 2^3^1) * 3') //'(-1 + 2) * 3 ^ 2 ^ 1') //  - (-2 - 1) * 3 + 2^2^2

function bp(token) {
	return {
		'$EOF': -1,
		'LPAREN': 10,
		'RPAREN': 10,
		'PLUS': 20,
		'MINUS': 30,
		'MULTIPLY': 40,
		'DIVIDE': 50,
		'EXPONENT': 60,
	}[token.type]
}

function nud(token) {
	switch (token.type) {
	case 'NUMBER':
		return parseFloat(token.match)
	case 'MINUS':
		const value = expr(70)
		console.log('\t', value)
		return { type: 'neg', value }
	case 'LPAREN':
		const rest = expr(bp(token))
		console.log(rest)
		lex.expect('RPAREN')
		return rest
	default:
		throw new Error('nud undefined for token: ' + token.type)
	}
}

function led(left, operator) {
	switch (operator.type) {
	case 'PLUS':
		return { type: 'add', left, right: expr(bp(operator)) }
	case 'MINUS':
		return { type: 'sub', left, right: expr(bp(operator)) }
	case 'MULTIPLY':
		return { type: 'mult', left, right: expr(bp(operator)) }
	case 'DIVIDE':
		return { type: 'div', left, right: expr(bp(operator)) }
	case 'EXPONENT':
		return { type: 'exp', left, right: expr(bp(operator) - 1) }
	case '$EOF':
		return left
	}
}

function expr(rbp = 0) {
	let left = nud(lex.next())
	while (rbp < bp(lex.peek())) {
		const operator = lex.next()
		left = led(left, operator)
	}
	return left
}

const ast = expr()

const result = (function visit(node) {
	if (typeof node == 'number')
		return node

	return {
		exp: n => Math.pow(visit(n.left), visit(n.right)),
		add: n => visit(n.left) + visit(n.right),
		sub: n => visit(n.left) - visit(n.right),
		mult: n => visit(n.left) * visit(n.right),
		div: n => visit(n.left) / visit(n.right),
		neg: n => -visit(n.value)
	}[node.type](node)
})(ast)

console.log(require('util').inspect(ast, null, null))
console.log(result)
