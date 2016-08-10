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

module.exports = lexer
