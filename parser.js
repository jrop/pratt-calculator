'use strict'

const perplex = require('perplex')

function parser(s) {
	//
	// BEGIN lexer:
	//
	const lexer = perplex()
		.extra({
			nud() {
				const pos = this.position()
				throw new Error(`Unexpected token: ${this.type} (${pos.start.line}:${pos.start.column})`)
			},
			led() {
				const pos = this.position()
				throw new Error(`Unexpected token: ${this.type} (${pos.start.line}:${pos.start.column})`)
			},
		})

		.token('NUMBER', /(?:\d+(?:\.\d*)?|\.\d+)/, {
			bp: Number.MAX_VALUE,
			nud() { return parseFloat(this.match) },
		})

		// + and -
		.token('+', /\+/, {
			bp: 20,
			nud() { return expr(60) },
			led(left, bp) { return { type: '+', left, right: expr(20) } }
		})
		.token('-', /-/, {
			bp: 20,
			nud() { return { type: 'neg', value: expr(60) } },
			led(left, bp) { return { type: '-', left, right: expr(20) } }
		})

		// * and /
		.token('*', /\*/, {
			bp: 30,
			led(left, bp) { return { type: '*', left, right: expr(30) } }
		})
		.token('/', /\//, {
			bp: 30,
			led(left, bp) { return { type: '/', left, right: expr(30) } }
		})

		// ^
		.token('^', /\^/, {
			bp: 40,
			led(left, bp) { return { type: '^', left, right: expr(bp - 1) } }
		})

		// ()
		.token('(', /\(/, {
			bp: 50,
			nud: function () {
				const inner = expr(10)
				this.lexer.expect(')')
				return inner
			},
		})
		.token(')', /\)/, { bp: 10 })

		// whitespace
		.token('$SKIP', /\s+/)
		.source(s)
	//
	// END lexer
	//

	//
	// The infamous Pratt Expression routine:
	//
	function expr(rbp = 0) {
		let left = lexer.next().nud()
		while (rbp < lexer.peek().bp) {
			const operator = lexer.next()
			left = operator.led(left, operator.bp)
		}
		return left
	}

	// Kick off the process:
	return expr()
} // parser

module.exports = parser
