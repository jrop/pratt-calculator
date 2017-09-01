Pratt Parser
============

[![Greenkeeper badge](https://badges.greenkeeper.io/jrop/pratt-calculator.svg)](https://greenkeeper.io/)

This project demonstrates the fundamentals of a Pratt Parser.  It is based on [this paper](https://tdop.github.io/) by Vaughan Pratt, and also learns from [this article](http://javascript.crockford.com/tdop/tdop.html) and [this article](http://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/).

Additionally, this README file attempts to simplify the concepts so that, when I come back to try to implement this again (at some undetermined point in the future), I will be able to remember how this works.

This README assumes that you already have read the previous two articles as this text merely attempts to simplify some of the concepts, hopefully adding intuition to them.

## Concepts

In general, the Pratt Parser solves the following problem: given the string "1 + 2 * 3", does the "2" associate with the "+" or the "&#42;".  It also solves "-" being both a prefix _and_ infix operator, as well as elegantly handling right associativity.

The Pratt Parser is based on three computational units:

```js
parser.expr(rbp) // the expression parser
token.nud() // "Null Denotation" (operates on no "left" context)
token.led(left, bp) // "Left Denotation" (operates with "left" context)
```

The `parser.expr(rbp)` function looks like:

```js
function expr(rbp) {
	let left = lexer.next().nud() // (1)
	while (rbp < lexer.peek().bp) { // (2)
		const operator = lexer.next() // (3)
		left = operator.led(left, operator.bp) // (4)
	}
	return left
}
```

Of course, `nud` and `led` may recursively call `expr`.

The `expr` method can be summarized in english as "The loop (while) builds out the tree to the left, while recursion (led -> expr) builds the tree out to the right; nud handles prefix operators":

```js
function expr(rbp) {
	// (1) handle prefix operator
	// (2) continue until I encounter an operator of lesser precedence than myself
	// (3) "eat" the operator
	// (4) give the operator the left side of the tree, and let it build the right side; this new tree is our new "left"
}
```

## Contributions

The Pratt Parser is a new concept to me, and thus this README would probably benefit from clarification, and the code would probably also benefit from cleanup.  Submit a PR if you feel so inclined!

## LICENSE

ISC License (ISC)
Copyright (c) 2016, Jonathan Apodaca <jrapodaca@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
