'use strict'

function lexer(tokenTypes, s) {
	let pos = 0
	let curr = null

	function skip() {
		let skipRegexes = tokenTypes['$SKIP'] || [ ]
		if (!Array.isArray(skipRegexes))
			skipRegexes = [ skipRegexes ]

		let skips = [ ]
		do {
			skips = skipRegexes.map(r => peekRegex(r))
				.filter(m => m !== null)
			pos += skips.length > 0 ? skips[0].length : 0
		} while (skips.length > 0)
	}

	function next(type) {
		const m = peek(type)
		pos += m && m.match ? m.match.length : 0
		curr = m
		return m
	}

	function expect(types) {
		if (!Array.isArray(types))
			types = [ types ]

		const t = next(types)
		if (!t || !types.includes(t.type))
			throw new Error('Expected: ' + types)
		return t
	}

	function current() {
		return curr
	}

	function peek(types) {
		skip()
		if (pos >= s.length)
			return { type: '$EOF', match: '' }

		types = types || Object.keys(tokenTypes).filter(key => key != '$SKIP')
		if (!Array.isArray(types))
			types = [ types ]

		let match = types.map(type => {
				const m = peekRegex(tokenTypes[type])
				return m ? { type: type, match: m[0] } : null
			})
			.filter(m => m !== null)
		return match.length > 0 ? match[0] : null
	}

	function peekRegex(r) {
		r.lastMatch = 0
		const m = r.exec(s.substring(pos))
		return m ? m[0] : null
	}

	return { next, peek, expect, current }
}

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
}, '1^2^3^4') //'(-1 + 2) * 3 ^ 2 ^ 1') //  - (-2 - 1) * 3 + 2^2^2

function bp(token) {
	return {
		'$EOF': -1,
		'LPAREN': 5,
		'RPAREN': 5,
		'PLUS': 10,
		'MINUS': 10,
		'MULTIPLY': 20,
		'DIVIDE': 20,
		'EXPONENT': 30,
	}[token.type]
}

function nud(token) {
	switch (token.type) {
	case 'NUMBER':
		return parseFloat(token.match)
	case 'MINUS':
		const value = expr(50)
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
console.log(require('util').inspect(ast, null, null))
