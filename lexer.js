const EOF = {type: null, match: null}
class Lexer {
	constructor(tkns) {
		this.tokens = tkns
		this.position = 0
	}
	peek() {
		return this.tokens[this.position] || EOF
	}
	next() {
		return this.tokens[this.position++] || EOF
	}
	expect(type) {
		const t = this.next()
		if (type != t.type)
			throw new Error(`Unexpected token: ${t.match || '<<EOF>>'}`)
	}
	eof() {
		return this.position >= this.tokens.length
	}
}

function lex(s) {
	const tokens = [
		{type: 'NUMBER', re: /(?:\d+(?:\.\d*)?|\.\d+)/},
		{type: 'ID', re: /[A-Za-z]+/},
		{type: '+', re: /\+/},
		{type: '-', re: /-/},
		{type: '*', re: /\*/},
		{type: '/', re: /\//},
		{type: '^', re: /\^/},
		{type: '(', re: /\(/},
		{type: ')', re: /\)/},
	]
	const normalizeRegExp = re => new RegExp(`^${re.source}`)
	s = s.replace(/\s+/g, '')
	const tkns = []
	while (s.length > 0) {
		const token = tokens.find(t => normalizeRegExp(t.re).test(s))
		const match = normalizeRegExp(token.re).exec(s)
		tkns.push({type: token.type, match: match[0]})
		s = s.substr(match[0].length)
	}
	return new Lexer(tkns)
}
module.exports = lex
