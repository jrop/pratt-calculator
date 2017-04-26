import test from 'ava'
import {calc} from './parser'

test('1 + 2 * 3', t =>
	t.is(calc('1 + 2 * 3'), 7))

test('(1 + 2) * 3', t =>
	t.is(calc('(1 + 2) * 3'), 9))

test('1', t =>
	t.is(calc('1'), 1))

test('((1))', t =>
	t.is(calc('((1))'), 1))

test('3^4^.5', t =>
	t.is(calc('3^4^.5'), 9))

test('(2^3)^4', t =>
	t.is(calc('(2^3)^4'), 4096))

test('-2*-2', t =>
	t.is(calc('-2*-2'), 4))

test('-2*2', t =>
	t.is(calc('-2*2'), -4))

test('5/2/.5', t =>
	t.is(calc('5/2/.5'), 5))

test('5 - 3 - 1 - 4', t =>
	t.is(calc('5 - 3 - 1 - 4'), -3))

test('floor(ceil(0.5) / 2)', t =>
	t.is(calc('floor(ceil(0.5) / 2)'), 0))

test('PI', t =>
	t.is(calc('PI'), Math.PI))

test('abs(cos(PI)) + 9', t =>
	t.is(calc('abs(cos(PI)) + 9'), 10))
