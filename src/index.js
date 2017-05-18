module.exports = function WFSM() {

  var	wfsm = {};

	wfsm.semirings = {}
	wfsm.semirings.real = {
		// a = abstract
		aSum: function( w1, w2 ) {
			if ( w1 == "+inf" || w2 == "+inf" ) return "+inf";
			var res = w1 + w2;
			// round to avoid weird comma values
			return Math.round( res * 10000 ) / 10000;
			return w1 + w2;
		},
		aProduct: function( w1, w2 ) {
			if ( w1 == this.a0 || w2 == this.a0 ) return this.a0;
			if ( w1 == "+inf" || w2 == "+inf" ) return "+inf";
			var res = w1 * w2;
			return Math.round( res * 10000 ) / 10000;
			return w1 * w2;
		},
		a0: 0,
		a1: 1,
		aProductClosure: function ( w ) {
			if ( w > 1 ) return "+inf";
			if ( w == 1 ) return 1;
			var res =  1 / ( 1 - w ) ;
			return Math.round( res * 10000 ) / 10000;
			return 1 / ( 1 - w ) ;
		},
		aInverse: function ( w ) {
			var res = 1 / w;
			return Math.round( res * 10000 ) / 10000;
			return 1 / w;
		}
	};

	wfsm.semirings.tropical = {
		// a = abstract
		aSum: function( w1, w2 ) {
			if ( w1 == this.a0 ) return w2;
			if ( w2 == this.a0 ) return w1;
			return Math.min(w1, w2);
		},
		aProduct: function( w1, w2 ) {
			if ( ( w1 == this.a0 ) || ( w2 == this.a0 ) ) return this.a0;
			return w1 + w2;
		},
		a0: "+inf",
		a1: 0,
		aProductClosure: function ( w ) {
			return this.a0;
		}
	};

	/*
	wfsm.EPS = -1;
	wfsm.EPS1 = -2;
	wfsm.EPS2 = -3;

	wfsm.symbols = ['a', 'b', 'c', 'd', 'e'];

	wfsm.symbols[wfsm.EPS] = 'ε';
	wfsm.symbols[wfsm.EPS1] = 'ε₁';
	wfsm.symbols[wfsm.EPS2] = 'ε₂';
	*/

	wfsm.EPS = 'ε';
	wfsm.EPS1 = 'ε₁';
	wfsm.EPS2 = 'ε₂';

	wfsm.symbols = new Set(['a', 'b', 'c', 'd', 'e', wfsm.EPS, wfsm.EPS1, wfsm.EPS2]);

	/*
	 * variable names:
	 *
	 * Q = states
	 * E = transitions
	 * F = final weight
	 * I = initial weight
	 * N = name (optional)
	 *
	 * p = source state
	 * q = target state
	 * r = next target state
	 *
	 * a = input symbol
	 * b = output symbol
	 * w = weight
	 *
	 * sr = semiring
	 *
	 */

		var fsm = this;

		var Q = [];
		wfsm.Q = Q;

		const E = 0;	// transitions
		const F = 1;	// final weight
		const I = 2;	// initial weight
		const N = 3;	// name

	/* example: 
	 * state 1 with final weight 0.8 
	 * and outgoing transition 
	 * 	to state 2 
	 * 	with input symbol 3 
	 * 	and output symbol 4
	 * 	and transitions weight 0.5
	 * will look like
	 *
	 * Q[1][E][2][3][4] = 0.5
	 * Q[1][F] = 0.8
	 */

		var sr = wfsm.semirings.real;
		
		wfsm.setSR = function( semiring )
		{
			sr = semiring;
		}

		wfsm.isFSA = true;

		// general helpers  --------------------------------------------------------------------

		// extends obj1 with obj2
		// returns void
		function extendObject( obj1, obj2 )
		{
			for (var attrname in obj2)  { 
				obj1[attrname] = obj2[attrname]; 
			}
		}

		// returns position of an element with same content of el in ar (deep copy)
		// return -1 if el not in ar
		function deepIndexOf( ar, el )
		{
			for ( var i in ar ) {
				if ( serialize( ar[i] ) == serialize( el ) ) return i;
			}
			return -1;
		}

		function serialize( mixed_value )
		{
			// http://kevin.vanzonneveld.net
			// +   original by: Arpad Ray (mailto:arpad@php.net)
			// +   improved by: Dino
			// +   bugfixed by: Andrej Pavlovic
			// +   bugfixed by: Garagoth
			// %          note: We feel the main purpose of this function should be to
			// ease the transport of data between php & js
			// %          note: Aiming for PHP-compatibility, we have to translate
			// objects to arrays
			// *     example 1: serialize(['Kevin', 'van', 'Zonneveld']);
			// *     returns 1:
			// 'a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}'
			// *     example 2: serialize({firstName: 'Kevin', midName: 'van',
			// surName: 'Zonneveld'});
			// *     returns 2:
			// 'a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}'
		 
			var _getType = function( inp ) {
				var type = typeof inp, match;
				var key;
				if (type == 'object' && !inp) {
					return 'null';
				}
				if (type == "object") {
					if (!inp.constructor) {
						return 'object';
					}
					var cons = inp.constructor.toString();
					match = cons.match(/(\w+)\(/);
					if (match) {
						cons = match[1].toLowerCase();
					}
					var types = ["boolean", "number", "string", "array"];
					for (key in types) {
						if (cons == types[key]) {
							type = types[key];
							break;
						}
					}
				}
				return type;
			};
			var type = _getType(mixed_value);
			var val = '';
			var ktype = '';
			
			switch (type) {
				case "function": 
					val = ""; 
					break;
				case "undefined":
					val = "N";
					break;
				case "boolean":
					val = "b:" + (mixed_value ? "1" : "0");
					break;
				case "number":
					val = (Math.round(mixed_value) == mixed_value ? "i" : "d") + ":" + mixed_value;
					break;
				case "string":
					val = "s:" + mixed_value.length + ":\"" + mixed_value + "\"";
					break;
				case "array":
				case "object":
					val = "a";
					var count = 0;
					var vals = "";
					var okey;
					var key;
					for (key in mixed_value) {
						ktype = _getType(mixed_value[key]);
						if (ktype == "function") { 
							continue; 
						}
						
						okey = (key.match(/^[0-9]+$/) ? parseInt(key) : key);
						vals += serialize(okey) +
								serialize(mixed_value[key]);
						count++;
					}
					val += ":" + count + ":{" + vals + "}";
					break;
			}
			if (type != "object" && type != "array") val += ";";
			return val;
		}


		// fsm helpers  --------------------------------------------------------------------

		// calculates index for a new q
		// as "cross-product" out of q1 and q2
		// returns q
		wfsm.pairQ = function( q1, q2, q2Length )
		{
			var q = q1 * q2Length + parseInt( q2 );
			wfsm.setN( q, q1 + "," + q2 );
			return q;
		}

		// gets name of q
		// returns n
		wfsm.getN = function( q )
		{
			wfsm.ensureQ( q );
			if ( Q[q][N] == undefined ) return q;
			return Q[q][N];
		}

		// sets name of w with n
		// returns void
		wfsm.setN = function( q, n )
		{
			wfsm.ensureQ( q );
			Q[q][N] = n;
		}

		// checks if q exists
		// if not: creates q
		// returns void
		wfsm.ensureQ = function ( q )
		{
			if (! Q[q] ) {
				wfsm.setQ( q );
			}
		}

		// sets q
		// returns void
		wfsm.setQ = function ( q )
		{
			Q[q] = [];
			Q[q][E] = {};
			Q[q][F] = sr.a0;
			Q[q][I] = sr.a0;
		}

		// unsets q
		// returns void
		wfsm.unsetQ = function ( q )
		{
			Q[q] = undefined;
		}

		// checks if q is defined
		// returns bool
		wfsm.isQ = function ( q )
		{
			return ( Q[q] != undefined );
		}

		// deletes all undefined states in Q array
		// returns void
		wfsm.shrink = function()
		{
			var count = 0;
			var newIndices = {};
			for ( var q in Q ) {
				if ( Q[q] != undefined ) {
					newIndices[q] = count;
					count++
				}
			}
			q = 0;
			while ( q < Q.length ) {
				if ( Q[q] == undefined ) {
					Q.splice(q, 1);
				} else {
					wfsm.adjustE( q, newIndices );
					q++;
				}
			}
		}

		// sets transition between p and q with a:b and weight w
		// returns void
		wfsm.setE = function( p, q, a, b, w ) 
		{
			if ( w == sr.a0 ) return; // 0 weight = no transition

			if ( w == undefined ) w = sr.a1;	// weight trivially
			if ( b == undefined ) b = a;

			if ( a != b ) wfsm.isFSA = false;

			wfsm.ensureQ( p );
			wfsm.ensureQ( q );

			if (! Q[p][E][q] ) Q[p][E][q] = {}; 
			if (! Q[p][E][q][a] ) Q[p][E][q][a] = {}; 
			
			Q[p][E][q][a][b] = sr.aSum( 
				wfsm.getE( p, q, a, b ),
				w
			);
		}

		// checks if p has outgoing transition with a:b
		// returns bool
		wfsm.hasE = function( p, a, b ) 
		{
			//if ( b == undefined ) b = a;
			for ( var q in Q[p][E] ) { 
				for ( var ai in Q[p][E][q] ) { 
					if ( ( a != undefined ) && ( a != ai ) ) continue;
					for ( var bi in Q[p][E][q][ai] ) { 
						if ( ( b != undefined ) && ( b != bi ) ) continue;
						return true;
					}
				}
			}
			return false;
		}
		
		// checks if transition exists
		// returns bool
		wfsm.isE = function( p, q, a, b ) 
		{
			if ( b == undefined ) b = a;
			return (
				( Q[p][E][q] != undefined ) &&
				( Q[p][E][q][a] != undefined ) &&
				( Q[p][E][q][a][b] != undefined )
			);
		}
		
		// deletes transition
		// returns void
		wfsm.unsetE = function( p, q, a, b ) 
		{
			if ( b == undefined ) b = a;
			if (! wfsm.isE( p, q, a, b ) ) return;
			delete Q[p][E][q][a][b];
		}

		// gets weight of transition
		// returns w
		wfsm.getE = function( p, q, a, b ) 
		{
			if ( b == undefined ) b = a;
			if (! wfsm.isE( p, q, a, b ) ) return sr.a0;
			return Q[p][E][q][a][b];
		}

		// sets initial weight to w
		// returns void
		wfsm.setI = function( q, w ) 
		{
			if ( w == undefined ) w = sr.a1;
			wfsm.ensureQ( q );
			Q[q][I] = w;
		}

		// sets initial weight to a0
		// returns void
		wfsm.unsetI = function( q ) 
		{
			wfsm.ensureQ( q );
			Q[q][I] = sr.a0;
		}

		// gets initial weight
		// returns w
		wfsm.getI = function( q ) 
		{
			wfsm.ensureQ( q );
			return Q[q][I];
		}

		// checks if q is an initial state
		// returns bool
		wfsm.isI = function( q ) 
		{
			return ( Q[q][I] != sr.a0 );
		}

		// sets final weight to w
		// returns void
		wfsm.setF = function( q, w ) 
		{
			if ( w == undefined ) w = sr.a1;
			wfsm.ensureQ( q );
			Q[q][F] = w;
		}

		// sets final weight to a0
		// returns void
		wfsm.unsetF = function( q ) 
		{
			wfsm.ensureQ( q );
			Q[q][F] = sr.a0;
		}

		// gets final weight
		// returns w
		wfsm.getF = function( q ) 
		{
			wfsm.ensureQ( q );
			return Q[q][F];
		}

		// checks if q is a final state
		// returns bool
		wfsm.isF = function( q ) 
		{
			return ( Q[q][F] != sr.a0 );
		}

		// map all state indicies in Q[p][E] to new ones
		// returns void
		wfsm.adjustE = function( p, newIndices )
		{
				var E2 = {};
				for ( var q in Q[p][E] ) {
					E2[newIndices[q]] = Q[p][E][q];
				}
				Q[p][E] = E2;
		}

		// increase all state indicies in Q[p][E] by offset
		// returns void
		wfsm.transposeE = function( p, offset )
		{
				var E2 = {};
				for ( var q in Q[p][E] ) {
					E2[parseInt( q ) + parseInt( offset )] = Q[p][E][q];
				}
				Q[p][E] = E2;
		}

		// create a new start state
		// connect it with all other ones
		// unset them
		// returns void
		wfsm.swapI = function()
		{
			var q0 = Q.length;
			wfsm.setQ( q0 );
			for ( var q in Q ) {
				if (! wfsm.isI( q ) ) continue;
				wfsm.setE( q0, q, wfsm.EPS, wfsm.EPS, wfsm.getI( q ) );
				wfsm.unsetI( q );
			}
			wfsm.setI( q0 );
			return q0;
		}


		// binary operations  --------------------------------------------------------------------

		// creates union of fsm an fsm2
		// (extends fsm with fsm2)
		// fsm2 is unusable afterwards
		// returns void
		wfsm.union = function( fsm2 )	
		{
			var q0 = wfsm.swapI();
			Q = Q.concat( fsm2.Q );

			for ( var q in Q ) {
				// transpose former fsm2 E targets
				if ( q <= q0 ) continue;
				wfsm.transposeE( q, q0 + 1 );
				// connect q0 with fsm2 initial states
				if (! wfsm.isI( q ) ) continue;
				wfsm.setE( q0, q, wfsm.EPS, wfsm.EPS, wfsm.getI( q ) );
				wfsm.unsetI( q );
			}
			wfsm.isFSA = wfsm.isFSA && fsm2.isFSA;
		}

		// concats fsm with fsm2
		// (connects every word in fsm with every word in fsm2)
		// fsm2 is unusable afterwards
		// returns void
		wfsm.concat = function( fsm2 )	// destroys fsm2
		{
			var fsm1Length = Q.length;
			Q = Q.concat( fsm2.Q );

			var fsm2I = {}; 
			for ( var q in Q ) {
				if ( q < fsm1Length ) continue;
				wfsm.transposeE( q, fsm1Length );
				// remember all fsm2 start states
				if (! wfsm.isI( q ) ) continue;
				fsm2I[q] = wfsm.getI( q );
			}

			// connect fsm1 final states with fsm2 start states
			for ( var p in Q ) {
				if ( p >= fsm1Length ) continue;
				if (! wfsm.isF( p ) ) continue;
				for ( var q in fsm2I ) {
					wfsm.setE( 
						p, q, wfsm.EPS, wfsm.EPS, 
						sr.aProduct(
							wfsm.getF( p ),
							fsm2I[q]
						)
					);
				}
				wfsm.unsetF( p );
			}

			// unset fsm2 start states
			for ( var q in fsm2I ) {
				wfsm.unsetI( q );
			}
			wfsm.isFSA = wfsm.isFSA && fsm2.isFSA;
		}

		wfsm.intersect = function( fsm1, fsm2 )
		{
			if (! fsm1.isFSA ) throw "fsm1 must be a FSA.";
			if (! fsm2.isFSA ) throw "fsm2 must be a FSA.";

			wfsm.composeDo( fsm1, fsm2 );
		}

		wfsm.renameE = function( abOld, abNew )
		{
			for ( var p in wfsm.Q ) {
				for ( var q in wfsm.Q[p][E] ) {
					for ( var a in wfsm.Q[p][E][q] ) {
						for ( var b in wfsm.Q[p][E][q][a] ) {
							if ( b != abOld ) continue;
							wfsm.Q[p][E][q][a][abNew] = wfsm.Q[p][E][q][a][abOld]; 
							delete wfsm.Q[p][E][q][a][abOld]; 
						}
						if ( a != abOld ) continue;
						wfsm.Q[p][E][q][abNew] = wfsm.Q[p][E][q][abOld]; 
						delete wfsm.Q[p][E][q][abOld]; 
					}
				}
			}
		}

		wfsm.compose = function( fsm1, fsm2 )
		{
			fsm1.renameE( wfsm.EPS, wfsm.EPS1 );
			for (var  q in fsm1.Q ) { 
				fsm1.setE( q, q, wfsm.EPS2, wfsm.EPS2 );
			}
			fsm1.print();	

			fsm2.renameE( wfsm.EPS, wfsm.EPS2 );
			for ( q in fsm2.Q ) {
				fsm2.setE( q, q, wfsm.EPS1, wfsm.EPS1 );
			}
			fsm2.print();	

			var fsmEpsFilter = new FSM(); 
			for ( var ab in wfsm.symbols ) {
				if ( ab < 0 ) continue;
				fsmEpsFilter.setE( 0, 0, ab );
				fsmEpsFilter.setE( 1, 0, ab );
				fsmEpsFilter.setE( 2, 0, ab );
			}

			fsmEpsFilter.setE( 0, 1, wfsm.EPS1, wfsm.EPS1 );
			fsmEpsFilter.setE( 0, 2, wfsm.EPS2, wfsm.EPS2 );
			fsmEpsFilter.setE( 0, 0, wfsm.EPS1, wfsm.EPS2 );
			fsmEpsFilter.setE( 1, 1, wfsm.EPS1, wfsm.EPS1 );
			fsmEpsFilter.setE( 2, 2, wfsm.EPS2, wfsm.EPS2 );

			fsmEpsFilter.setI( 0 );
			fsmEpsFilter.setF( 0 );
			fsmEpsFilter.setF( 1 );
			fsmEpsFilter.setF( 2 );

			//fsmEpsFilter.print();

			var fsm1Filtered = new FSM(); 
			fsm1Filtered.composeDo( fsm1, fsmEpsFilter );

			//fsm1Filtered.trim();
			//fsm1Filtered.print();

			wfsm.composeDo( fsm1Filtered, fsm2 );
			//wfsm.print();
			wfsm.connect();
			wfsm.trim();
			wfsm.renameE( wfsm.EPS1, wfsm.EPS );
			wfsm.renameE( wfsm.EPS2, wfsm.EPS );
		}

		wfsm.composeDo = function( fsm1, fsm2 )
		{
			for ( var p1 in fsm1.Q ) {
				for ( var p2 in fsm2.Q ) {
					var p = wfsm.pairQ( p1, p2, fsm2.Q.length );
					wfsm.setI( p, sr.aProduct( fsm1.getI( p1 ), fsm2.getI( p2 ) ) );
					wfsm.setF( p, sr.aProduct( fsm1.getF( p1 ), fsm2.getF( p2 ) ) ); 
					// epsilon transitions
					for ( var q1 in fsm1.Q[p1][E] ) {
						for ( var a1 in fsm1.Q[p1][E][q1] ) {
							for ( var b1 in fsm1.Q[p1][E][q1][a1] ) {
								if ( b1 != wfsm.EPS ) continue;
								var q = wfsm.pairQ( q1, p2, fsm2.Q.length );
								wfsm.setE( 
									p, q, a1, b1,
									fsm1.getE( p1, q1, a1, b1 )
								);
							}
						}
					}
					for ( var q2 in fsm2.Q[p2][E] ) {
						var a2 = wfsm.EPS;
						for ( var b2 in fsm2.Q[p2][E][q2][a2] ) {
							var q = wfsm.pairQ( p1, q2, fsm2.Q.length );
							wfsm.setE( 
								p, q, a2, b2,
								fsm2.getE( p2, q2, a2, b2 )
							);
						}
					}
					for ( var q1 in fsm1.Q[p1][E] ) {
						for ( var q2 in fsm2.Q[p2][E] ) {
							for ( var a1 in fsm1.Q[p1][E][q1] ) {
								for ( var b1a2 in fsm1.Q[p1][E][q1][a1] ) {
									for ( var b2 in fsm2.Q[p2][E][q2][b1a2] ) {
										//alert(p1 + " " + q1 + " " + p2 + " " + q2 + " " + a1 );
										var q = wfsm.pairQ( q1, q2, fsm2.Q.length );
										wfsm.setE( 
											p, q, a1, b2,
											sr.aProduct(
												fsm1.getE( p1, q1, a1, b1a2 ),
												fsm2.getE( p2, q2, b1a2, b2 )
											)
										);
									}
								}
							}
						}
					}
				}
			}
		}
		// unary operations  --------------------------------------------------------------------

		wfsm.plusClosure = function()
		{
			for ( var p in Q ) {
				if (! wfsm.isF( p ) ) continue;
				for ( var q in Q ) {
					if (! wfsm.isI( q ) ) continue;
					wfsm.setE( 
						p, q, wfsm.EPS, wfsm.EPS, 
						sr.aProduct(
							wfsm.getF( p ),
							wfsm.getI( q )
						)
					);
				}
			}
		}

		wfsm.starClosure = function()
		{
			wfsm.plusClosure();
			var q0 = wfsm.swapI();
			wfsm.setF( q0 );
		}

		
		wfsm.singleSourceDistance = function( s )
		{
			var d = [];
			var r = [];
			for ( var q in Q ) {
				d[q] = sr.a0;
				r[q] = sr.a0;
			}
			d[s] = sr.a1;
			r[s] = sr.a1;

			var queue = [ s ]
			var i = 0;
			while ( queue.length > 0 ) {
				i++;
				var p = queue.shift(); 
				var rp = r[p];
				r[p] = sr.a0;
				for ( var q in Q[p][E] ) {
					for ( var a in Q[p][E][q] ) {
						for ( var b in Q[p][E][q][a] ) {
							var w = wfsm.getE( p, q, a, b );
							//alert ( p + " " + w );
							if ( d[q] == sr.aSum( d[q], sr.aProduct( rp, w ) ) ) continue;
							d[q] = sr.aSum( d[q], sr.aProduct( rp, w ) )
							r[q] = sr.aSum( r[q], sr.aProduct( rp, w ) )
							if ( queue.indexOf( q ) == -1 ) {
								queue.push( q );
							}
						}
					}
				}
			}
			return d;
		}
		

		// calculates all-pairs-distance
		// if symbols defined: only these symbols are considered
		// returns distance matrix
		wfsm.allPairsDistance = function( symbols )
		{
			var d = [];
			for ( var i in Q ) {
				d[i] = [];
				for ( var j in Q ) {
					d[i][j] = sr.a0; 
					for ( var a in Q[i][E][j] ) {
						if ( ( symbols != undefined ) && ( !symbols.has( a ) ) ) continue;
						for ( var b in Q[i][E][j][a] ) {
							if ( ( symbols != undefined ) && ( !symbols.has( b ) ) ) continue;
							d[i][j] = sr.aSum(
								d[i][j],
								wfsm.getE( i, j, a, b )
							);
						}
					}
				}
			}
			for ( var k in Q ) {
				for ( var i in Q ) {
					if ( i == k ) continue;
					for ( var j in Q ) {
						if ( j == k ) continue;
						d[i][j] = sr.aSum( 
							d[i][j],
							sr.aProduct(
								d[i][k],
								sr.aProduct(
									sr.aProductClosure( d[k][k] ),
									d[k][j]
								)
							)
						);
					}
				}
				for ( var i in Q ) {
					if ( i == k ) continue;
					d[k][i] = sr.aProduct(
						sr.aProductClosure( d[k][k] ),
						d[k][i]
					);
					d[i][k] = sr.aProduct(
						d[i][k],
						sr.aProductClosure( d[k][k] )
					);
				}
				d[k][k] = sr.aProductClosure( d[k][k] )
			}
			return d;
		}

		// equivalence operations  --------------------------------------------------------------------

		wfsm.removeEpsilon = function()
		{
			var epsClosure = wfsm.allPairsDistance( new Set(wfsm.EPS) );
			for ( var p in Q ) { 
				for ( var q in epsClosure[p] ) {
					if ( epsClosure[p][q] == sr.a0 ) continue;
					wfsm.setF(
						p,
						sr.aSum(
							( p != q ?  wfsm.getF( p ) : sr.a0 ), // Mohri always uses here wfsm.getF(p) 
							sr.aProduct(
								epsClosure[p][q],
								wfsm.getF( q )
							)
						)
					);
					for ( var r in Q[q][E] ) {
						for ( var a in Q[q][E][r] ) {
							if ( a == wfsm.EPS ) continue;
							for ( var b in Q[q][E][r][a] ) {
								if ( b == wfsm.EPS ) continue;
								// remember old weight and delete it
								// so it won't get added to new one
								var w = wfsm.getE( q, r, a, b );
								wfsm.unsetE( p, r, a, b );
								wfsm.setE( 
									p, r, a, b, 
									sr.aProduct( 
										epsClosure[p][q], 
										w
									)
								);
	/*
								alert( 
									"p: " + p + 
									", target: " + q + 
									", next: " + r + 
									", E: " + wfsm.getE( p, r, a, b ) +
									", F(" + p + "): " + wfsm.getF( p )
								);
	*/
							}
						}
					}
					wfsm.unsetE( p, q, wfsm.EPS, wfsm.EPS );
				}
			}
		}

		wfsm.determinize = function()
		{
			var fsmD = new WFSM();

			// init new start state (only 1)
			var q0 = 0;
			var q0DS = [];
			for ( var q in Q ) {
				if (! wfsm.isI( q ) ) continue;
				q0DS.push( [ q, wfsm.getI ( q ) ] );
			}
			var queue = [ q0DS ];
			fsmD.setI( q0 );
			fsmD.setN( q0DS.join( " / " ) );
		
			var pD = 0;	
			while ( pD < queue.length ) {
				
				var pDS = queue[pD]; // pDS = [ [ 0, 1 ] ]: subset structure of source state pD 
				var wD = {}	// wD[a] = 123: weight of transition leaving with a
				var qDS = {};	// qDS[a] = [ [ 1, 0.3 ], [ 2, 0.7 ] ]: subset structure of target state qD reached by a

				for ( var i in pDS ) {
					var p = pDS[i][0];
					var v = pDS[i][1];
					for ( var q in Q[p][E] ) {
						for ( var a in Q[p][E][q] ) {
							// transition weight
							var w = wfsm.getE( p, q, a, a ); // temporary assuming a WFS_A_  
							wD[a] = sr.aSum(
								( wD[a] != undefined ? wD[a] : sr.a0 ),
								sr.aProduct( v, w )
							);
						}
					}
				}
				for ( var i in pDS ) {
					var p = pDS[i][0];
					var v = pDS[i][1];
					for ( var q in Q[p][E] ) {
						for ( var a in Q[p][E][q] ) {
							// calculate subset structure of target state
							w = wfsm.getE( p, q, a, a ); // temporary assuming a WFS_A_ 
							if ( qDS[a] == undefined ) qDS[a] = [];
							qDS[a].push( 
								[ 
									q, 
									sr.aProduct(
										sr.aInverse( wD[a] ),
										sr.aProduct( v, w )
									)
								] 
							);
						}
					}
				}
				fsmD.ensureQ( pD );
				for ( let a of wfsm.symbols ) {
					if ( qDS[a] == undefined ) continue;

					var qD = deepIndexOf( queue, qDS[a] );
					if ( qD == -1 ) {
						// add new state
						var qD = fsmD.Q.length; 
						var f = sr.a0;
						for ( var i in qDS[a] ) {
							var q = qDS[a][i][0];
							var v = qDS[a][i][1];
							f = sr.aSum(
								f,
								sr.aProduct(
									v,
									wfsm.getF( q )
								)
							);
						}
						fsmD.setF( qD, f );
						queue.push( qDS[a] );
					}

					fsmD.setE( pD, qD, a, a, wD[a] );
					fsmD.setN( qD, qDS[a].join( " / " ) );
				}
				pD++;
			}
			wfsm.replace( fsmD );
		}

		// replaces fsm with fsmR
		wfsm.replace = function( fsmR ) 
		{
			// replace fsm with fsmD
			for ( var q in wfsm.Q ) {
				delete wfsm.Q[q];
			}
			for ( var q in fsmR.Q ) {
				wfsm.Q[q] = fsmR.Q[q];
			}
			fsm = fsmR;
		}

		wfsm.pushWeights = function()
		{
			var d = wfsm.allPairsDistance();
			var pot = [];
			for ( var p in Q ) {
				for ( var q in Q ) {
					if (! wfsm.isF( q ) ) continue;
					pot[p] = sr.aSum(
						( pot[p] != undefined ? pot[p] : sr.a0 ),
						sr.aProduct(
							d[p][q],
							wfsm.getF( q )
						)
					);
				}
			}
			for ( var p in Q ) {
				wfsm.setI( 
					p,
					sr.aProduct(
						wfsm.getI( p ),
						pot[p]
					)
				);
				wfsm.setF( 
					p, 
					sr.aProduct(
						sr.aInverse( pot[p] ),
						wfsm.getF( p )
					)
				);
				for ( var q in Q[p][E] ) {
					for ( var a in Q[p][E][q] ) {
						for ( var b in Q[p][E][q][a] ) {
							var w = wfsm.getE( p, q, a, b );
							wfsm.unsetE( p, q, a, b );
							wfsm.setE( 
								p, q, a, b, 
								sr.aProduct(
									sr.aInverse( pot[p] ),
									sr.aProduct(
										w,
										pot[q]
									)
								)
							);
						}
					}
				}
			}
		}

		wfsm.minimize = function()
		{
			// classical algorithm
			// assumes deterministic, pushed and trimmed wfsa
			var neq = [];
			for ( var p in Q ) {
				neq[p] = [];
				for ( var q in Q ) {
					neq[p][q] =
						( wfsm.isF( p ) && ! wfsm.isF( q ) ) ||
						(! wfsm.isF( p ) && wfsm.isF( q ) );
				}
			}

			var marked = false;
			do {
				marked = false;
				for ( var p in Q ) {
					for ( var q in Q ) {
						if ( neq[p][q] ) continue;
						for ( var pq in Q[p][E] ) {
							for ( var qq in Q[q][E] ) {
								neq[p][q] =
									neq[pq][qq] ||
									( serialize( Q[p][E][pq] ) != serialize( Q[q][E][qq] ) );
							}
						}
					}
				}
			} while ( marked );

			// map equivalence classes to new states
			var map = {};
			for ( var p in neq ) {
				var q = 0;
				while ( neq[p][q] ) {
					q++;
				}
				map[p] = q;
			}

			// create new FSM
			var fsmM = new WFSM();
			for ( var p in Q ) {
				fsmM.setF( map[p], wfsm.getF( p ) );
				fsmM.setI( map[p], wfsm.getI( p ) );
				for ( var q in Q[p][E] ) {
					for ( var a in Q[p][E][q] ) {
						for ( var b in Q[p][E][q][a] ) {
							var w = wfsm.getE( p, q, a, b );
							fsmM.setE( map[p], map[q], a, b, w );
						}
					}
				}
			}
			wfsm.replace( fsmM );
		}

		wfsm.connect = function()
		{
			var accessibleQ = {}; 
			for ( var q in Q ) {
				if (! wfsm.isI( q ) ) continue;
				accessibleQ[q] = true;
			}

			var added = false;
			do {
				added = false;
				// it is actually unnecessary to iterate always over all accessibleQ 
				// only over the added ones would be enough
				for ( var p in accessibleQ ) {
					for ( var q in Q[p][E] ) {
						if ( accessibleQ[q] ) continue;
						accessibleQ[q] = true;
						added = true;
					}
				}
			} while( added );

			for ( var q in Q ) {
				if ( accessibleQ[q] ) continue;
				wfsm.unsetQ( q );
			}
			wfsm.shrink();
		}	
		
		wfsm.trim = function()
		{
			wfsm.connect();
			wfsm.reverse();
			wfsm.connect();
			wfsm.reverse();
		}

		wfsm.reverse = function()
		{
			// init help array
			var QE = [];
			for ( var q in Q ) {
				QE[q] = [];
			}
			// remember reversed transitions in help array
			for ( var p in Q ) {
				for ( var q in Q[p][E] ) {
					QE[q][p] = Q[p][E][q];
				}
			}
			// copy help array to Q
			for ( var q in QE ) {
				Q[q][E] = QE[q];
				// swap initial and final weight
				var w = wfsm.getI( q );
				wfsm.setI( q, wfsm.getF( q ) );
				wfsm.setF( q, w );
			}
		}

		// output operations  --------------------------------------------------------------------

		wfsm.toDot = function()
		{
			var code = "digraph {\n" ;	
			for ( var p in Q ) {
				if (! wfsm.isQ( p ) ) continue;
				for ( var q in Q[p][E] ) {
					for ( var a in Q[p][E][q] ) {
						for ( var b in Q[p][E][q][a] ) {
							code += 
								p + 
								" -> " + 
								q + 
								" [ label=\"" + 
								a + 
								( a != b ?  ":" + b : "" ) +
								( wfsm.getE( p, q, a, b ) != sr.a1 ? "/" + wfsm.getE( p, q, a, b ) : "" ) + 
								"\" ] \n" ;
						}
					}
				}
			}
			for ( var q in Q ) {
				if (! wfsm.isQ( q ) ) continue;
				code +=
					q + 
					" [ " +
					"label=\"" +
						wfsm.getN( q ) +
						// print weights only if not a0 or a1
						( ( wfsm.isI( q ) && wfsm.getI( q ) != sr.a1 ) ? "\\nI=" + wfsm.getI( q ) : "" ) + 
						( ( wfsm.isF( q ) && wfsm.getF( q ) != sr.a1 ) ? "\\nF=" + wfsm.getF( q ) : "" ) + 
						"\" " + 
					"shape=\"" +
						( wfsm.isF( q ) ? "doublecircle" : "circle" ) +
						"\" " +
					( wfsm.isI( q ) ? "style=\"bold\"" : "" ) +
					"]\n";
			}
			code += "rankdir=LR\n" ;	
			code += "}" ;	

			return code;
		}

		wfsm.print = function() {
			var code = wfsm.toDot();
			console.log(code);
		}
	
		wfsm.print = function() {
			var code = wfsm.toDot();
			console.log(code);
		}

	return wfsm;
}

