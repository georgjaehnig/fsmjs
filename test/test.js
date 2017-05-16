'use strict'

const WFSM = require('../src/index.js');

var wfsm = WFSM();

wfsm.setI( 0 );
wfsm.setF( 0, 0.5 );

wfsm.print();
