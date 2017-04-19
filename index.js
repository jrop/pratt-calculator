#!/usr/bin/env node
/* eslint-disable no-console */
const {calc} = require('./parser')

const args = process.argv.slice(2)
if (args.length == 0) { // no args
	const readline = require('readline')

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		prompt: '> ',
	})

	rl.on('line', function (line) {
		try {
			console.log(calc(line))
		} catch (e) {
			console.error(e.message)
		}
		rl.prompt()
	})
	rl.prompt()
} else {
	const s = args.join(' ')
	console.log(calc(s))
}
