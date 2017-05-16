'use strict'

const WFSM = require('../src/index.js');
var assert = require('assert');

var fs = require('fs');

it('removeEpsilon', function() {

	var wfsm = new WFSM();
	wfsm.setE( 0, 1, 0, 0, 0.25 );
	wfsm.setE( 0, 1, wfsm.EPS, wfsm.EPS, 0.5 );
	wfsm.setE( 1, 1, wfsm.EPS, wfsm.EPS, 0.2 );
	wfsm.setE( 1, 0, 1, 1, 0.5 );

	wfsm.setI( 1, 1 );
	wfsm.setF( 1, 0.3 );
	wfsm.setF( 0, 0.25 );

	fs.writeFile("removeEpsilon-1-before.dot", wfsm.toDot());

	wfsm.removeEpsilon();

	fs.writeFile("removeEpsilon-2-after.dot", wfsm.toDot());

	assert.equal(JSON.stringify(wfsm.Q), '[[{"0":{"1":{"1":0.3125}},"1":{"0":{"0":0.25},"-1":{}}},0.4375,0],[{"0":{"1":{"1":0.625}},"1":{"-1":{}}},0.375,1]]');
});


it('union', function() {

	var wfsm1 = new WFSM();
	wfsm1.setE( 0, 1, 0 );
	wfsm1.setE( 0, 2, 1 );
	wfsm1.setI( 0, 0.4 );
	wfsm1.setF( 1 );
	wfsm1.setF( 2 );

	var wfsm2 = new WFSM();
	wfsm2.setE( 0, 1, 2 );
	wfsm2.setI( 0, 0.6 );
	wfsm2.setF( 1 );

	wfsm1.union( wfsm2 );

	assert.equal(JSON.stringify(wfsm1.Q), '[[{"1":{"0":{"0":1}},"2":{"1":{"1":1}}},0,0],[{},1,0],[{},1,0],[{"0":{"-1":{"-1":0.4}},"4":{"-1":{"-1":0.6}}},0,1]]'); 

});


it('concat', function() {

	var wfsm1 = new WFSM();
	wfsm1.setE( 0, 1, 0 );
	wfsm1.setE( 0, 2, 1 );
	wfsm1.setI( 0 );
	wfsm1.setF( 1 );
	wfsm1.setF( 2, 0.8 );

	var wfsm2 = new WFSM();
	wfsm2.setE( 0, 1, 2 );
	wfsm2.setI( 0, 0.5 );
	wfsm2.setF( 1 );

	wfsm1.concat( wfsm2 );

	assert.equal(JSON.stringify(wfsm1.Q), '[[{"1":{"0":{"0":1}},"2":{"1":{"1":1}}},0,1],[{"3":{"-1":{"-1":0.5}}},0,0],[{"3":{"-1":{"-1":0.4}}},0,0]]'); 

});


it('intersect', function() {

	var wfsm1 = new WFSM();
	wfsm1.setE( 0, 1, 0 );
	wfsm1.setE( 0, 2, 1, 1, 0.5 );
	wfsm1.setI( 0 );
	wfsm1.setF( 1 );
	wfsm1.setF( 2, 0.8 );

	var wfsm2 = new WFSM();
	wfsm2.setE( 0, 1, 1, 1, 0.6 );
	wfsm2.setI( 0, 0.5 );
	wfsm2.setF( 1, 0.5 );

	var wfsm3 = new WFSM();
	wfsm3.intersect( wfsm1, wfsm2 );

	wfsm3.connect();

	assert.equal(JSON.stringify(wfsm3.Q), '[[{"1":{"1":{"1":0.3}}},0,0.5,"0,0"],[{},0.4,0,"2,1"]]'); 

});


it('closureTropical', function() {

	var wfsm = new WFSM();
	wfsm.setSR( wfsm.semirings.tropical );

	wfsm.setI( 3 );
	wfsm.setE( 3, 0, 0 );
	wfsm.setE( 3, 1, 2 );
	wfsm.setE( 1, 2, 1 );
	wfsm.setE( 2, 1, 2, 2, 1 );

	wfsm.setI( 3 );
	wfsm.setF( 0, 2 );
	wfsm.setF( 2, 1 );

	wfsm.starClosure();

	assert.equal(JSON.stringify(wfsm.Q), '[[{"3":{"-1":{"-1":2}}},2,"+inf"],[{"2":{"1":{"1":0}}},"+inf","+inf"],[{"1":{"2":{"2":1}},"3":{"-1":{"-1":1}}},1,"+inf"],[{"0":{"0":{"0":0}},"1":{"2":{"2":0}}},"+inf","+inf"],[{"3":{"-1":{"-1":0}}},0,0]]'); 

});


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

	assert.equal(JSON.stringify(wfsm.Q), '[[{"1":{"0":{"0":2}},"2":{"1":{"1":2}},"3":{"2":{"2":4}}},0,1],[{"15":{"1":{"1":1}}},0,0],[{"11":{"0":{"0":0.5}},"12":{"1":{"1":0.5}}},0,0],[{"4":{"0":{"0":0.25}},"5":{"1":{"1":0.5}},"6":{"2":{"2":0.25}}},0,0],[{"10":{"1":{"1":1}}},0,0],[{"8":{"0":{"0":0.5}},"9":{"1":{"1":0.5}}},0,0],[{"7":{"0":{"0":1}}},0,0],[{},0.18,0],[{},0.18,0],[{},0.07,0],[{},0.03,0],[{"14":{"2":{"2":1}}},0,0],[{"13":{"2":{"2":1}}},0,0],[{},0.02,0],[{},0.3,0],[{"16":{"0":{"0":0.5}},"17":{"1":{"1":0.5}}},0,0],[{},0.1,0],[{},0.12,0]]'); 

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
	
	wfsm.determinize();

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
	wfsm.minimize();

	assert.equal(JSON.stringify(wfsm.Q), '[[{"1":{"0":{"0":2}}},0,1],[{"2":{"1":{"1":2}}},0,0],[{},1,0],null,null]'); 

});
