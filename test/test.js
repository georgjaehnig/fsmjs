'use strict'

const WFSM = require('../src/index.js');
var assert = require('assert');

var fs = require('fs');

it('removeEpsilon', function() {

	var wfsm = new WFSM();
	wfsm.setE( 0, 1, 'a', 'a', 0.25 );
	wfsm.setE( 0, 1, wfsm.EPS, wfsm.EPS, 0.5 );
	wfsm.setE( 1, 1, wfsm.EPS, wfsm.EPS, 0.2 );
	wfsm.setE( 1, 0, 'b', 'b', 0.5 );

	wfsm.setI( 1, 1 );
	wfsm.setF( 1, 0.3 );
	wfsm.setF( 0, 0.25 );

	fs.writeFile("removeEpsilon-1-before.dot", wfsm.toDot(), function(err) {} );

	wfsm.removeEpsilon();

	fs.writeFile("removeEpsilon-2-after.dot", wfsm.toDot(), function(err) {} );

	assert.equal(JSON.stringify(wfsm.Q), '[[{"0":{"b":{"b":0.3125}},"1":{"a":{"a":0.25},"ε":{}}},0.4375,0],[{"0":{"b":{"b":0.625}},"1":{"ε":{}}},0.375,1]]');
});

it('union', function() {

	var wfsm1 = new WFSM();
	wfsm1.setE( 0, 1, 'a' );
	wfsm1.setE( 0, 2, 'b' );
	wfsm1.setI( 0, 0.4 );
	wfsm1.setF( 1 );
	wfsm1.setF( 2 );

	var wfsm2 = new WFSM();
	wfsm2.setE( 0, 1, 'c' );
	wfsm2.setI( 0, 0.6 );
	wfsm2.setF( 1 );

	fs.writeFile("union-1.dot", wfsm1.toDot(), function(err) {} );
	fs.writeFile("union-2.dot", wfsm2.toDot(), function(err) {} );

	wfsm1.union( wfsm2 );

	fs.writeFile("union-3-both.dot", wfsm1.toDot(), function(err) {} );

	assert.equal(JSON.stringify(wfsm1.Q), '[[{"1":{"a":{"a":1}},"2":{"b":{"b":1}}},0,0],[{},1,0],[{},1,0],[{"0":{"ε":{"ε":0.4}},"4":{"ε":{"ε":0.6}}},0,1]]'); 

});


it('concat', function() {

	var wfsm1 = new WFSM();
	wfsm1.setE( 0, 1, 'a' );
	wfsm1.setE( 0, 2, 'b' );
	wfsm1.setI( 0 );
	wfsm1.setF( 1 );
	wfsm1.setF( 2, 0.8 );

	var wfsm2 = new WFSM();
	wfsm2.setE( 0, 1, 'c' );
	wfsm2.setI( 0, 0.5 );
	wfsm2.setF( 1 );

	fs.writeFile("concat-1.dot", wfsm1.toDot(), function(err) {} );
	fs.writeFile("concat-2.dot", wfsm2.toDot(), function(err) {} );

	wfsm1.concat( wfsm2 );

	fs.writeFile("concat-3-both.dot", wfsm1.toDot(), function(err) {});

	assert.equal(JSON.stringify(wfsm1.Q), '[[{"1":{"a":{"a":1}},"2":{"b":{"b":1}}},0,1],[{"3":{"ε":{"ε":0.5}}},0,0],[{"3":{"ε":{"ε":0.4}}},0,0]]'); 

});

it('intersect', function() {

	var wfsm1 = new WFSM();
	wfsm1.setE( 0, 1, 'a' );
	wfsm1.setE( 0, 2, 'b', 'b', 0.5 );
	wfsm1.setI( 0 );
	wfsm1.setF( 1 );
	wfsm1.setF( 2, 0.8 );

	var wfsm2 = new WFSM();
	wfsm2.setE( 0, 1, 'b', 'b', 0.6 );
	wfsm2.setI( 0, 0.5 );
	wfsm2.setF( 1, 0.5 );

	var wfsm3 = new WFSM();
	wfsm3.intersect( wfsm1, wfsm2 );

	wfsm3.connect();

	fs.writeFile("intersect-1.dot", wfsm1.toDot(), function(err) {} );
	fs.writeFile("intersect-2.dot", wfsm2.toDot(), function(err) {} );
	fs.writeFile("intersect-3-intersected.dot", wfsm3.toDot(), function(err) {});

	assert.equal(JSON.stringify(wfsm3.Q), '[[{"1":{"b":{"b":0.3}}},0,0.5,"0,0"],[{},0.4,0,"2,1"]]'); 

});

it('closureTropical', function() {

	var wfsm = new WFSM();
	wfsm.setSR( wfsm.semirings.tropical );

	wfsm.setI( 3 );
	wfsm.setE( 3, 0, 'a' );
	wfsm.setE( 3, 1, 'c' );
	wfsm.setE( 1, 2, 'b' );
	wfsm.setE( 2, 1, 'c', 'c', 1 );

	wfsm.setI( 3 );
	wfsm.setF( 0, 2 );
	wfsm.setF( 2, 1 );

	fs.writeFile("closureTropical-1-before.dot", wfsm.toDot(), function(err) {} );
	wfsm.starClosure();
	fs.writeFile("closureTropical-2-after.dot", wfsm.toDot(), function(err) {} );

	assert.equal(JSON.stringify(wfsm.Q), '[[{"3":{"ε":{"ε":2}}},2,"+inf"],[{"2":{"b":{"b":0}}},"+inf","+inf"],[{"1":{"c":{"c":1}},"3":{"ε":{"ε":1}}},1,"+inf"],[{"0":{"a":{"a":0}},"1":{"c":{"c":0}}},"+inf","+inf"],[{"3":{"ε":{"ε":0}}},0,0]]'); 

});

/*

it('pushWeights', function() {

	var wfsm = new WFSM();
	wfsm.setI( 0 );
	wfsm.setE( 0, 1, 0, 0, 2 );
	wfsm.setE( 1, 15, 1, 1, 1 );
	wfsm.setE( 15, 16, 0, 0, 0.5 );
	wfsm.setE( 15, 17, 1, 1, 0.5 );
	wfsm.setF( 16, 0.1 );
	wfsm.setF( 17, 0.12 );

	wfsm.setE( 0, 2, 1, 1, 2 );
	wfsm.setE( 2, 11, 0, 0, 0.5 );
	wfsm.setE( 11, 14, 2, 2, 1 );
	wfsm.setE( 2, 12, 1, 1, 0.5 );
	wfsm.setE( 12, 13, 2, 2, 1 );
	wfsm.setF( 14, 0.3 );
	wfsm.setF( 13, 0.02 );

	wfsm.setE( 0, 3, 2, 2, 4 );
	wfsm.setE( 3, 4, 0, 0, 0.25 );
	wfsm.setE( 4, 10, 1, 1, 1 );
	wfsm.setE( 3, 5, 1, 1, 0.5 );
	wfsm.setE( 5, 8, 0, 0, 0.5 );
	wfsm.setE( 5, 9, 1, 1, 0.5 );
	wfsm.setE( 3, 6, 2, 2, 0.25 );
	wfsm.setE( 6, 7, 0, 0, 1 );
	wfsm.setF( 10, 0.03 );
	wfsm.setF( 8, 0.18 );
	wfsm.setF( 9, 0.07 );
	wfsm.setF( 7, 0.18 );

	fs.writeFile("pushWeights-1-before.dot", wfsm.toDot(), function(err) {} );
	wfsm.pushWeights();
	fs.writeFile("pushWeights-2-after.dot", wfsm.toDot(), function(err) {} );

	assert.equal(JSON.stringify(wfsm.Q), '[[{"1":{"0":{"0":0.22}},"2":{"1":{"1":0.32}},"3":{"2":{"2":0.46}}},0,1],[{"15":{"1":{"1":1}}},0,0],[{"11":{"0":{"0":0.9375}},"12":{"1":{"1":0.0625}}},0,0],[{"4":{"0":{"0":0.0652}},"5":{"1":{"1":0.5435}},"6":{"2":{"2":0.3913}}},0,0],[{"10":{"1":{"1":1}}},0,0],[{"8":{"0":{"0":0.72}},"9":{"1":{"1":0.28}}},0,0],[{"7":{"0":{"0":1}}},0,0],[{},1,0],[{},1,0],[{},1,0],[{},1,0],[{"14":{"2":{"2":1}}},0,0],[{"13":{"2":{"2":1}}},0,0],[{},1,0],[{},1,0],[{"16":{"0":{"0":0.4545}},"17":{"1":{"1":0.5455}}},0,0],[{},1,0],[{},1,0]]'); 

});


it('determinize', function() {

	var wfsm = new WFSM();
	wfsm.setE( 0, 1, 0, 0, 0.3 );
	wfsm.setE( 1, 1, 1, 1, 0.4 );
	wfsm.setE( 1, 3, 2, 2, 0.6 );
	wfsm.setE( 0, 2, 0, 0, 0.7 );
	wfsm.setE( 2, 2, 1, 1, 0.4 );
	wfsm.setE( 2, 3, 3, 3, 0.6 );
	wfsm.setI( 0 );
	wfsm.setF( 3 );
	
	fs.writeFile("determinize-1-before.dot", wfsm.toDot(), function(err) {} );
	wfsm.determinize();
	fs.writeFile("determinize-2-after.dot", wfsm.toDot(), function(err) {} );

	assert.equal(JSON.stringify(wfsm.Q), '[[{"1":{"0":{"0":1}}},0,1],[{"1":{"1":{"1":0.4}},"2":{"2":{"2":0.18},"3":{"3":0.42}}},0,0,"1,0.3 / 2,0.7"],[{},1,0,"3,1"],null]'); 

});


it('minimize', function() {

	var wfsm = new WFSM();
	wfsm.setE( 0, 1, 0, 0 );
	wfsm.setE( 1, 2, 1, 1 );
	wfsm.setE( 0, 3, 0, 0 );
	wfsm.setE( 3, 4, 1, 1 );
	wfsm.setI( 0 );
	wfsm.setF( 2 );
	wfsm.setF( 4 );

	fs.writeFile("minimize-1-before.dot", wfsm.toDot(), function(err) {} );
	wfsm.minimize();
	fs.writeFile("minimize-2-after.dot", wfsm.toDot(), function(err) {} );

	assert.equal(JSON.stringify(wfsm.Q), '[[{"1":{"0":{"0":2}}},0,1],[{"2":{"1":{"1":2}}},0,0],[{},1,0],null,null]'); 

});

*/
