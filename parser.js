const createLexer = require('./lexer')

function parser(s) {
	const lexer = createLexer(s)
	const BPS = {
		[null]: 0,
		NUMBER: 0,
		ID: 0,
		')': 0,
		'+': 20,
		'-': 20,
		'*': 30,
		'/': 30,
		'^': 40,
		'(': 50,
	}
	const NUDS = {
		NUMBER: t => parseFloat(t.match),
		ID: t => {
			const mbr = Math[t.match]
			if (typeof mbr == 'undefined') {
				const pos = t.strpos().start
				throw new Error(
					`Undefined variable: '${t.match}' (at ${pos.line}:${pos.column})`
				)
			}
			return {type: 'id', ref: mbr, id: t.match}
		},
		'+': (t, bp) => parse(bp),
		'-': (t, bp) => ({type: 'neg', value: parse(bp)}),
		'(': () => {
			const inner = parse()
			lexer.expect(')')
			return inner
		},
	}
	const LEDS = {
		'+': (left, t, bp) => ({type: '+', left, right: parse(bp)}),
		'-': (left, t, bp) => ({type: '-', left, right: parse(bp)}),
		'*': (left, t, bp) => ({type: '*', left, right: parse(bp)}),
		'/': (left, t, bp) => ({type: '/', left, right: parse(bp)}),
		'^': (left, t, bp) => ({
			type: '^',
			left,
			right: parse(bp - 1),
		}),
		'(': left => {
			if (left.type != 'id') {
				throw new Error(`Cannot invoke expression as if it was a function)`)
			}
			if (typeof left.ref != 'function') {
				throw new Error(`Cannot invoke non-function`)
			}

			const args = parse()
			lexer.expect(')')
			return {type: '()', target: left, args}
		},
	}
	function bp(token) {
		return BPS[token.type] || 0
	}
	function nud(token) {
		if (!NUDS[token.type])
			throw new Error(
				`NUD not defined for token type: ${JSON.stringify(token.type)}`
			)
		return NUDS[token.type](token, bp(token))
	}
	function led(left, token) {
		if (!LEDS[token.type])
			throw new Error(
				`LED not defined for token type: ${JSON.stringify(token.type)}`
			)
		return LEDS[token.type](left, token, bp(token))
	}
	function parse(rbp = 0) {
		let left = nud(lexer.next())
		while (bp(lexer.peek()) > rbp) {
			left = led(left, lexer.next())
		}
		return left
	}
	return parse
} // parser

parser.visit = function visit(node) {
	if (typeof node == 'number') return node
	return {
		id: n => n.ref,
		'^': n => Math.pow(visit(n.left), visit(n.right)),
		'+': n => visit(n.left) + visit(n.right),
		'-': n => visit(n.left) - visit(n.right),
		'*': n => visit(n.left) * visit(n.right),
		'/': n => visit(n.left) / visit(n.right),
		'()': node => node.target.ref(visit(node.args)),
		neg: n => -visit(n.value),
	}[node.type](node)
}

parser.calc = function calc(s) {
	const parse = parser(s)
	return parser.visit(parse())
}

module.exports = parser
