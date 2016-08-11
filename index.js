'use strict'

const { calc } = require('./parser')
const readline = require('readline')

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true,
	prompt: '> ',
})

rl.on('line', function (line) {
	try {
		console.log('= ' + calc(line))
	} catch (e) {
		console.error(e.message)
	}
	rl.prompt()
})
rl.prompt()
