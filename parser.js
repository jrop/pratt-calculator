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
				throw new Error(`Unexpected token: ${this.match} at ${pos.start.line}:${pos.start.column}`)
			},
			led() {
				const pos = this.position()
				throw new Error(`Unexpected token: ${this.match} at ${pos.start.line}:${pos.start.column}`)
			},
		})

		.token('NUMBER', /(?:\d+(?:\.\d*)?|\.\d+)/, {
			bp: Number.MAX_VALUE,
			nud() { return parseFloat(this.match) },
		})

		.token('ID', /[A-Za-z]+/, {
			bp: Number.MAX_VALUE,
			nud() {
				const mbr = Math[this.match]
				if (typeof mbr == 'undefined') {
					const pos = this.position().start
					throw new Error(`Undefined variable: '${this.match}' (at ${pos.line}:${pos.column})`)
				}
				return { type: 'id', ref: mbr, id: this.match }
			},
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
			led: function (left, bp) {
				if (left.type != 'id') {
					const pos = this.position().start
					throw new Error(`Cannot invoke expression as if it was a function (at ${pos.line}:${pos.column})`)
				}
				if (typeof left.ref != 'function') {
					const pos = this.position().start
					throw new Error(`Cannot invoke non-function (at ${pos.line}:${pos.column})`)
				}

				const args = expr(10)
				this.lexer.expect(')')
				return { type: '()', target: left, args }
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

parser.visit = function visit(node) {
	if (typeof node == 'number')
		return node

	return {
		'id': n => n.ref,
		'^': n => Math.pow(visit(n.left), visit(n.right)),
		'+': n => visit(n.left) + visit(n.right),
		'-': n => visit(n.left) - visit(n.right),
		'*': n => visit(n.left) * visit(n.right),
		'/': n => visit(n.left) / visit(n.right),
		'()': node => node.target.ref(visit(node.args)),
		neg: n => -visit(n.value)
	}[node.type](node)
}

parser.calc = function calc(s) {
	return parser.visit(parser(s))
}

module.exports = parser
