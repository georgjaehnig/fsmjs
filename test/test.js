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
