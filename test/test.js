'use strict'

const WFSM = require('../src/index.js');
var assert = require('assert');

it('removeEpsilon', function() {

	var fsm = new WFSM();
	fsm.setE( 0, 1, 0, 0, 0.25 );
	fsm.setE( 0, 1, fsm.EPS, fsm.EPS, 0.5 );
	fsm.setE( 1, 1, fsm.EPS, fsm.EPS, 0.2 );
	fsm.setE( 1, 0, 1, 1, 0.5 );

	fsm.setI( 1, 1 );
	fsm.setF( 1, 0.3 );
	fsm.setF( 0, 0.25 );

	fsm.removeEpsilon();
	assert.equal(JSON.stringify(fsm.Q), '[[{"0":{"1":{"1":0.3125}},"1":{"0":{"0":0.25},"-1":{}}},0.4375,0],[{"0":{"1":{"1":0.625}},"1":{"-1":{}}},0.375,1]]');
});
