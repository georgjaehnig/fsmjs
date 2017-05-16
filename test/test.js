'use strict'

const WFSM = require('../src/index.js');
var assert = require('assert');

it('removeEpsilon', function() {

	var wfsm = new WFSM();
	wfsm.setE( 0, 1, 0, 0, 0.25 );
	wfsm.setE( 0, 1, wfsm.EPS, wfsm.EPS, 0.5 );
	wfsm.setE( 1, 1, wfsm.EPS, wfsm.EPS, 0.2 );
	wfsm.setE( 1, 0, 1, 1, 0.5 );

	wfsm.setI( 1, 1 );
	wfsm.setF( 1, 0.3 );
	wfsm.setF( 0, 0.25 );

	wfsm.removeEpsilon();
	assert.equal(JSON.stringify(wfsm.Q), '[[{"0":{"1":{"1":0.3125}},"1":{"0":{"0":0.25},"-1":{}}},0.4375,0],[{"0":{"1":{"1":0.625}},"1":{"-1":{}}},0.375,1]]');
});


it('union', function() {

	var fsm1 = new WFSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1 );
	fsm1.setI( 0, 0.4 );
	fsm1.setF( 1 );
	fsm1.setF( 2 );

	var fsm2 = new WFSM();
	fsm2.setE( 0, 1, 2 );
	fsm2.setI( 0, 0.6 );
	fsm2.setF( 1 );

	fsm1.union( fsm2 );

	assert.equal(JSON.stringify(fsm1.Q), '[[{"1":{"0":{"0":1}},"2":{"1":{"1":1}}},0,0],[{},1,0],[{},1,0],[{"0":{"-1":{"-1":0.4}},"4":{"-1":{"-1":0.6}}},0,1]]'); 

});


it('concat', function() {

	var fsm1 = new WFSM();
	fsm1.setE( 0, 1, 0 );
	fsm1.setE( 0, 2, 1 );
	fsm1.setI( 0 );
	fsm1.setF( 1 );
	fsm1.setF( 2, 0.8 );

	var fsm2 = new WFSM();
	fsm2.setE( 0, 1, 2 );
	fsm2.setI( 0, 0.5 );
	fsm2.setF( 1 );

	fsm1.concat( fsm2 );

	assert.equal(JSON.stringify(fsm1.Q), '[[{"1":{"0":{"0":1}},"2":{"1":{"1":1}}},0,1],[{"3":{"-1":{"-1":0.5}}},0,0],[{"3":{"-1":{"-1":0.4}}},0,0]]'); 

});
