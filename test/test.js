'use strict'

const FSM = require('../src/index.js');
var assert = require('assert');

var fs = require('fs');

it('removeEpsilon', function() {

	var wfsm = new FSM();
	wfsm.setE( 0, 1, 0, 0, 0.25 );
	wfsm.setE( 0, 1, wfsm.EPS, wfsm.EPS, 0.5 );
	wfsm.setE( 1, 1, wfsm.EPS, wfsm.EPS, 0.2 );
	wfsm.setE( 1, 0, 1, 1, 0.5 );

	wfsm.setI( 1, 1 );
	wfsm.setF( 1, 0.3 );
	wfsm.setF( 0, 0.25 );

	fs.writeFile("removeEpsilon1.dot", wfsm.toDot());

	wfsm.removeEpsilon();

	fs.writeFile("removeEpsilon2.dot", wfsm.toDot());

	assert.equal(JSON.stringify(wfsm.Q), '[[{"0":{"1":{"1":0.3125}},"1":{"0":{"0":0.25},"-1":{}}},0.4375,0],[{"0":{"1":{"1":0.625}},"1":{"-1":{}}},0.375,1]]');
});


it('union', function() {

	var fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1 );
	fsm1.setI( 0, 0.4 );
	fsm1.setF( 1 );
	fsm1.setF( 2 );

	var fsm2 = new FSM();
	fsm2.setE( 0, 1, 2 );
	fsm2.setI( 0, 0.6 );
	fsm2.setF( 1 );

	fsm1.union( fsm2 );

	assert.equal(JSON.stringify(fsm1.Q), '[[{"1":{"0":{"0":1}},"2":{"1":{"1":1}}},0,0],[{},1,0],[{},1,0],[{"0":{"-1":{"-1":0.4}},"4":{"-1":{"-1":0.6}}},0,1]]'); 

});


it('concat', function() {

	var fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1 );
	fsm1.setI( 0 );
	fsm1.setF( 1 );
	fsm1.setF( 2, 0.8 );

	var fsm2 = new FSM();
	fsm2.setE( 0, 1, 2 );
	fsm2.setI( 0, 0.5 );
	fsm2.setF( 1 );

	fsm1.concat( fsm2 );

	assert.equal(JSON.stringify(fsm1.Q), '[[{"1":{"0":{"0":1}},"2":{"1":{"1":1}}},0,1],[{"3":{"-1":{"-1":0.5}}},0,0],[{"3":{"-1":{"-1":0.4}}},0,0]]'); 

});


it('intersect', function() {

	var fsm1 = new FSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1, 1, 0.5 );
	fsm1.setI( 0 );
	fsm1.setF( 1 );
	fsm1.setF( 2, 0.8 );

	var fsm2 = new FSM();
	fsm2.setE( 0, 1, 1, 1, 0.6 );
	fsm2.setI( 0, 0.5 );
	fsm2.setF( 1, 0.5 );

	var fsm3 = new FSM();
	fsm3.intersect( fsm1, fsm2 );

	fsm3.connect();

	assert.equal(JSON.stringify(fsm3.Q), '[[{"1":{"1":{"1":0.3}}},0,0.5,"0,0"],[{},0.4,0,"2,1"]]'); 

});


it('closureTropical', function() {

	var fsm = new FSM();
	fsm.setSR( fsm.semirings.tropical );

	fsm.setI( 3 );
	fsm.setE( 3, 0, 0 );
	fsm.setE( 3, 1, 2 );
	fsm.setE( 1, 2, 1 );
	fsm.setE( 2, 1, 2, 2, 1 );

	fsm.setI( 3 );
	fsm.setF( 0, 2 );
	fsm.setF( 2, 1 );

	fsm.starClosure();

	assert.equal(JSON.stringify(fsm.Q), '[[{"3":{"-1":{"-1":2}}},2,"+inf"],[{"2":{"1":{"1":0}}},"+inf","+inf"],[{"1":{"2":{"2":1}},"3":{"-1":{"-1":1}}},1,"+inf"],[{"0":{"0":{"0":0}},"1":{"2":{"2":0}}},"+inf","+inf"],[{"3":{"-1":{"-1":0}}},0,0]]'); 

});


it('pushWeights', function() {

	var fsm = new FSM();
	fsm.setI( 0 );
	fsm.setE( 0, 1, 0, 0, 2 );
	fsm.setE( 1, 15, 1, 1, 1 );
	fsm.setE( 15, 16, 0, 0, 0.5 );
	fsm.setE( 15, 17, 1, 1, 0.5 );
	fsm.setF( 16, 0.1 );
	fsm.setF( 17, 0.12 );

	fsm.setE( 0, 2, 1, 1, 2 );
	fsm.setE( 2, 11, 0, 0, 0.5 );
	fsm.setE( 11, 14, 2, 2, 1 );
	fsm.setE( 2, 12, 1, 1, 0.5 );
	fsm.setE( 12, 13, 2, 2, 1 );
	fsm.setF( 14, 0.3 );
	fsm.setF( 13, 0.02 );

	fsm.setE( 0, 3, 2, 2, 4 );
	fsm.setE( 3, 4, 0, 0, 0.25 );
	fsm.setE( 4, 10, 1, 1, 1 );
	fsm.setE( 3, 5, 1, 1, 0.5 );
	fsm.setE( 5, 8, 0, 0, 0.5 );
	fsm.setE( 5, 9, 1, 1, 0.5 );
	fsm.setE( 3, 6, 2, 2, 0.25 );
	fsm.setE( 6, 7, 0, 0, 1 );
	fsm.setF( 10, 0.03 );
	fsm.setF( 8, 0.18 );
	fsm.setF( 9, 0.07 );
	fsm.setF( 7, 0.18 );

	assert.equal(JSON.stringify(fsm.Q), '[[{"1":{"0":{"0":2}},"2":{"1":{"1":2}},"3":{"2":{"2":4}}},0,1],[{"15":{"1":{"1":1}}},0,0],[{"11":{"0":{"0":0.5}},"12":{"1":{"1":0.5}}},0,0],[{"4":{"0":{"0":0.25}},"5":{"1":{"1":0.5}},"6":{"2":{"2":0.25}}},0,0],[{"10":{"1":{"1":1}}},0,0],[{"8":{"0":{"0":0.5}},"9":{"1":{"1":0.5}}},0,0],[{"7":{"0":{"0":1}}},0,0],[{},0.18,0],[{},0.18,0],[{},0.07,0],[{},0.03,0],[{"14":{"2":{"2":1}}},0,0],[{"13":{"2":{"2":1}}},0,0],[{},0.02,0],[{},0.3,0],[{"16":{"0":{"0":0.5}},"17":{"1":{"1":0.5}}},0,0],[{},0.1,0],[{},0.12,0]]'); 

});


it('determinize', function() {

	var fsm = new FSM();
	fsm.setE( 0, 1, 0, 0, 0.3 );
	fsm.setE( 1, 1, 1, 1, 0.4 );
	fsm.setE( 1, 3, 2, 2, 0.6 );
	fsm.setE( 0, 2, 0, 0, 0.7 );
	fsm.setE( 2, 2, 1, 1, 0.4 );
	fsm.setE( 2, 3, 3, 3, 0.6 );
	fsm.setI( 0 );
	fsm.setF( 3 );
	
	fsm.determinize();

	assert.equal(JSON.stringify(fsm.Q), '[[{"1":{"0":{"0":1}}},0,1],[{"1":{"1":{"1":0.4}},"2":{"2":{"2":0.18},"3":{"3":0.42}}},0,0,"1,0.3 / 2,0.7"],[{},1,0,"3,1"],null]'); 

});


it('minimize', function() {

	var fsm = new FSM();
	fsm.setE( 0, 1, 0, 0 );
	fsm.setE( 1, 2, 1, 1 );
	fsm.setE( 0, 3, 0, 0 );
	fsm.setE( 3, 4, 1, 1 );
	fsm.setI( 0 );
	fsm.setF( 2 );
	fsm.setF( 4 );
	fsm.minimize();

	assert.equal(JSON.stringify(fsm.Q), '[[{"1":{"0":{"0":2}}},0,1],[{"2":{"1":{"1":2}}},0,0],[{},1,0],null,null]'); 

});
