var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var Morphon = require('../morphon');

var NameSpace = Morphon.NameSpace;

var ns;

describe('Morphon', function(){
	it('should be defined', function() {
		Morphon.should.exist;
	});
	describe('NameSpace', function() {
		it('should be defined', function() {
			NameSpace.should.exist;
		});

		describe('objects', function() {
			it('should always have a name', function() {
				var fn = function () {
					new NameSpace();
				};
				expect(fn).to.throw('please provide a namespace');
			});
			it('can be constructed with a single or multiple namespace argument (i.e. "root" vs. "root.branch.twig")', function() {
				ns = new NameSpace('root');
				expect(ns.name).to.equal('root');
				ns = new NameSpace('root.branch.twig');
				expect(ns.name).to.equal('root');
				expect(ns.get('branch').name).to.equal('branch');
				expect(ns.get('branch.twig').name).to.equal('twig');
			});
		});

		describe('API method:', function() {
			describe('get()', function() {
				it('can recursively find a branch namespace', function() {
					ns = new NameSpace('root.branch');
					var branchNameSpace = ns.get('branch');
					expect(branchNameSpace instanceof NameSpace).to.be.true;
					expect(branchNameSpace.name).to.equal('branch');
					// todo
					// ns = new NameSpace('root.branch.twig');
				});
			});
			describe('create(namespace)', function() {
				it('should create the namespace and nested namespaces (if specified)', function() {
					ns = new NameSpace('root');
					// create a 'twig' namespace under 'root.branch'
					ns.create('branch.twig');
					expect(ns.get('branch').name).to.equal('branch');
					expect(ns.get('branch.twig').name).to.equal('twig');

					ns.create('branch.vine');
					expect(ns.get('branch.vine').name).to.equal('vine');
					expect(ns.get('branch.twig').name).to.equal('twig');
					expect(function () {
						ns.get('branch.missing')
					}).to.throw('Namespace "missing" does not exist');
				});
				it('should not be able to re-create a namespace', function() {
					ns = new NameSpace('root');
					ns.create('branch');
					expect(function () {
						ns.create('branch');
					}).to.throw('Namespace "branch" already exists');
				});
			});
			describe('create(namespace, target)', function() {
				it('can create a new namespace in a target namespace', function() {
					ns = new NameSpace('root.branch');
					// create a 'branch' namespace under 'root',
					// i.e. create 'twig' in 'branch'
					ns.create('twig', 'branch');
					expect(ns.get('branch.twig').name).to.equal('twig');
				});
				it('should throw an error if the target doesn\'t exist', function() {
					ns = new NameSpace('root');
					expect(function() {
						ns.create('twig', 'branch');
					}).to.throw('Namespace "branch" does not exist');
				});
			});

			describe('broadcast(event, propogate)', function() {
				var counter;
				var args;
				function increment () {
					counter += 1;
					args.push(Array.prototype.slice.call(arguments));
				}	
				beforeEach(function() {
					ns = new NameSpace('root.branch.twig');
					ns.create('branch2');
					ns.create('branch3');
					counter = 0;
					args = [];
				})
				it('triggers an event and passes along arguments to callback', function() {
					ns.register('root-event', increment);
					ns.broadcast('root-event', false, 'foo');
					expect(counter).to.equal(1);
					// first callback, first arg
					expect(args[0][0]).to.equal('foo');
				});
				it('propogates an event down the chain and passes along arguments to each registered callback', function() {
					ns.register('root-event', increment);
					ns.get('branch').register('root-event', increment);
					ns.get('branch2').register('root-event', increment);
					ns.get('branch3').register('root-event', increment);
					ns.broadcast('root-event', true, 'foo');
					expect(counter).to.equal(4);
					for (var i=0; i<counter; i+=1) {
						expect(args[i][0]).to.equal('foo');
					}
					ns.get('branch.twig').register('root-event', increment);
					ns.broadcast('root-event', true);
					expect(counter).to.equal(9);
				});
			});
		});
	});
});
