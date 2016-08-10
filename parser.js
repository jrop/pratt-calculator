'use strict'

const lexer = require('./lexer')

function parser(s) {
	function infix(regex, bp) {
		return {
			regex,
			bp,
			led: function (left) {
				return { type: this.type, left, right: expr(bp) }
			},
		}
	}

	const tokens = {
		'NUMBER': {
			regex: /(?:\d+(?:\.\d*)?|\.\d+)/,
			nud: function () { return parseFloat(this.match) },
		},

		'(': {
			bp: 10,
			regex: /\(/,
			nud: function () {
				const inner = expr(10)
				this.lexer.expect(')')
				return inner
			},
		},
		')': { bp: 10, regex: /\)/ },

		'+': infix(/\+/, 20),
		'-': {
			regex: /-/,
			bp: 20,
			nud: () => ({ type: 'neg', value: expr(60) }),
			led: left => ({ type: 'sub', left, right: expr(20) }),
		},
		'*': infix(/\*/, 40),
		'/': infix(/\//, 40),
		'^': {
			regex: /\^/,
			bp: 50,
			led: (left, bp) => ({ type: '^', left, right: expr(bp - 1) })
		},

		'$SKIP': { regex: /\s+/ },
	}

	const lex = lexer(tokens)(s)

	function expr(rbp = 0) {
		let left = lex.next().nud()
		while (rbp < lex.peek().bp) {
			const operator = lex.next()
			left = operator.led(left, operator.bp)
		}
		return left
	}

	return expr()
}

module.exports = parser
