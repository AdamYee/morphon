//     Morphon.js 0.0.0
//     (c) Adam Yee

(function(root, factory) {

  // Set up Morphon appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone', 'exports'], function(_, bb, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Morphon.
      root.Morphon = factory(root, exports, _, bb);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    var bb = require('backbone');
    factory(root, exports, _, bb);

  // Finally, as a browser global.
  } else {
    root.Morphon = factory(
      root,
      {},
      root._,
      Backbone
    );
  }

}(this /*global*/, function(root, Morphon, _, Backbone) { /*factory*/

  function splitNS(namespace) {
    var result = null;
    var spaces = namespace.match(/([^\.]+)\.(.+)/);
    if (spaces !== null) {
      result = {
        root: spaces[1],
        branch: spaces[2]
      };
    }
    return result;
  }

  var NameSpace = Morphon.NameSpace = function (ns) {
    if (ns === undefined)
      throw new Error('please provide a namespace');

    // private variables
    var self = this;
    var namespace = {};
    var events = _.extend({},Backbone.Events);

    // API
    //-----------
    _.extend(this, {
      register: function(event, cb, context) {
        events.on(event, cb, context);
      },

      broadcast: function(event, options) {    
        events.trigger(event, Array.prototype.slice.call(arguments, 1));
      },

      // debugging only
      show: function () {
        return namespace;
      },

      // Retrieve a NameSpace instance
      // if argument 'ns' is multi-namespaced, recursively find the branch/leaf
      get: function(ns) {
        if (ns === undefined)
          throw new Error('no namespace provided');
        var spaces = splitNS(ns);
        ns = spaces === null ? ns : spaces.root;
        if (namespace.hasOwnProperty( ns )) {
          if (spaces === null) return namespace[ ns ];
          else return namespace[ spaces.root ].get( spaces.branch );
        }
        else
          throw new Error('namespace "'+ns+'" does not exist');
      },

      // Optionally pass a target namespace to nest a given 'ns'.
      // Otherwise, create the specified 'ns'.
      create: function(ns, target) {
        var spaces = splitNS(ns);
        var s;

        if (target !== undefined) {
          if (typeof target !== 'string') throw new Error('target must be a string');
          s = this.get(target);
          s.create(ns);
        }
        else {
          // Single namespace passed
          if (spaces === null) {
            // Try to retrieve the namespace. Create if it doesn't exist,
            // otherwise throw an already exists error.
            try {
              s = this.get(ns);
            } catch (error) {
              namespace[ns] = new NameSpace(ns);
            }
            if (s) throw new Error('namespace "'+ns+'" already exists');
          }
          else {
            // Try to retrieve the next namespace and create the branch
            // within it. If it's not found, create the next namespace.
            try {
              s = this.get( spaces.root );
              s.create( spaces.branch );
            }
            catch (error) {
              // recursively create branch namespaces
              namespace[ spaces.root ] = new NameSpace( ns );
            }
          }
        }
      }
    });

    // main constructor implementation
    var spaces = splitNS(ns);

    if (spaces === null) {
      this.name = ns;
    }
    else {
      this.name = spaces.root;
      this.create( spaces.branch );
    }
  };

  return Morphon;

}));