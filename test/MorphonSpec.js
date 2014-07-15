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

		describe('API', function() {
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
				});
				it('should not be able to re-create a namespace', function() {
					ns = new NameSpace('root');
					ns.create('branch');
					expect(function () {
						ns.create('branch');
					}).to.throw('namespace "branch" already exists');
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
					}).to.throw('namespace "branch" does not exist');
				});
			});
		});
	});
});
