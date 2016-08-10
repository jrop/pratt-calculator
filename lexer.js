'use strict'

const except = require('except')

function normalizeTokenTypes(tokenTypes) {
	Object.keys(tokenTypes).forEach(key => {
		const tokenType = tokenTypes[key]
		if (!tokenType.regex.source.startsWith('^'))
			tokenType.regex = new RegExp(`^${tokenType.regex.source}`, tokenType.regex.flags)
	})
}

function lexer(tokenTypes, s) {
	normalizeTokenTypes(tokenTypes)

	let pos = 0
	let curr = null

	function skip() {
		let skipRegexes = tokenTypes['$SKIP'] || [ ]
		if (!Array.isArray(skipRegexes))
			skipRegexes = [ skipRegexes ]

		let skips = [ ]
		do {
			skips = skipRegexes.map(s => peekRegex(s.regex))
				.filter(m => m !== null)
			pos += skips.length > 0 ? skips[0].length : 0
		} while (skips.length > 0)
	}

	function next(types) {
		const m = peek(types)
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
				const m = peekRegex(tokenTypes[type].regex)
				if (m) {
					const extraProps = except(tokenTypes[type], 'regex')
					const token = Object.assign({ type, match: m, lexer: lexerInst }, extraProps)
					Object.keys(token).forEach(key => {
						if (typeof token[key] == 'function')
							token[key] = token[key].bind(token)
					})
					return token
				} else
					return null
			})
			.filter(m => m !== null)
		return match.length > 0 ? match[0] : null
	}

	function peekRegex(r) {
		r.lastMatch = 0
		const m = r.exec(s.substring(pos))
		return m ? m[0] : null
	}

	const lexerInst = { next, peek, expect, current }
	return lexerInst
}

module.exports = function createLexer(tokenTypes) {
	return s => lexer(tokenTypes, s)
}
