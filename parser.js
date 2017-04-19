const perplex = require('perplex')
const pratt = require('pratt')

function parser(s) {
	const lexer = perplex(s)
		.token('NUMBER', /(?:\d+(?:\.\d*)?|\.\d+)/)
		.token('ID', /[A-Za-z]+/)
		.token('+', /\+/)
		.token('-', /-/)
		.token('*', /\*/)
		.token('/', /\//)
		.token('^', /\^/)
		.token('(', /\(/)
		.token(')', /\)/)
		.token('$SKIP', /\s+/)

	const parser = new pratt.Parser(lexer)
		.builder()
		.bp('$EOF', -1)
		.nud('NUMBER', Number.MAX_VALUE, t => parseFloat(t.match))
		.nud('ID', Number.MAX_VALUE, t => {
			const mbr = Math[t.match]
			if (typeof mbr == 'undefined') {
				const pos = t.strpos().start
				throw new Error(`Undefined variable: '${t.match}' (at ${pos.line}:${pos.column})`)
			}
			return {type: 'id', ref: mbr, id: t.match}
		})

		.nud('+', 20, (t, bp) => parser.parse(bp))
		.led('+', 20, (left, t, bp) => ({type: '+', left, right: parser.parse(bp)}))
		.nud('-', 20, (t, bp) => ({type: 'neg', value: parser.parse(bp)}))
		.led('-', 20, (left, t, bp) => ({type: '-', left, right: parser.parse(bp)}))

		.led('*', 30, (left, t, bp) => ({type: '*', left, right: parser.parse(bp)}))
		.led('/', 30, (left, t, bp) => ({type: '/', left, right: parser.parse(bp)}))

		.led('^', 40, (left, t, bp) => ({type: '^', left, right: parser.parse(bp - 1)}))

		.bp(')', 0)
		.nud('(', 50, () => {
			const inner = parser.parse()
			lexer.expect(')')
			return inner
		})
		.led('(', 50, (left, t) => {
			if (left.type != 'id') {
				const pos = t.strpos().start
				throw new Error(`Cannot invoke expression as if it was a function (at ${pos.line}:${pos.column})`)
			}
			if (typeof left.ref != 'function') {
				const pos = t.strpos().start
				throw new Error(`Cannot invoke non-function (at ${pos.line}:${pos.column})`)
			}

			const args = parser.parse()
			lexer.expect(')')
			return {type: '()', target: left, args}
		})
		.build()

	return parser.parse()
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
		'neg': n => -visit(n.value),
	}[node.type](node)
}

parser.calc = function calc(s) {
	return parser.visit(parser(s))
}

module.exports = parser
