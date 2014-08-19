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

  // Next for Node.js or CommonJS.
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
    if (ns === undefined) {
      throw {
        type: 'NamespaceError',
        message: 'please provide a namespace'
      };
    }

    this.namespace = {};
    this.events = _.extend({},Backbone.Events);
    
    var spaces = splitNS(ns);
    if (spaces === null) {
      this.name = ns;
    }
    else {
      this.name = spaces.root;
      this.create( spaces.branch );
    }
  };

  // API
  //-----------
  _.extend(NameSpace.prototype, {
    register: function(event, cb, context) {
      this.events.on(event, cb, context);
    },

    unregister: function(event, cb, context) {
      this.events.off(event, cb, context);
    },

    broadcast: function(event) {    
      this.events.trigger(event, Array.prototype.slice.call(arguments, 1));
    },

    // Retrieve a NameSpace instance
    // if argument 'ns' is multi-namespaced, recursively find the branch/leaf
    get: function(ns) {
      if (ns === undefined) {
        throw {
          type: 'NamespaceError',
          message: 'please provide a namespace'
        };
      }
      var spaces = splitNS(ns);
      ns = spaces === null ? ns : spaces.root;
      if (this.namespace.hasOwnProperty( ns )) {
        if (spaces === null) return this.namespace[ ns ];
        else return this.namespace[ spaces.root ].get( spaces.branch );
      }
      else {
        throw {
          type: 'NamespaceError',
          message: 'Namespace "' + ns + '" does not exist'
        };
      }
    },

    // Optionally pass a target namespace to nest a given 'ns'.
    // Otherwise, create the specified 'ns'.
    create: function(ns, target) {
      var spaces = splitNS(ns);
      var s;

      if (target !== undefined) {
        if (typeof target !== 'string') {
          throw {
            type: 'NamespaceError',
            message: 'target Namepsace must be a string'
          };
        }
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
            this.namespace[ns] = new NameSpace(ns);
          }
          if (s) {
            throw {
              type: 'NamespaceError',
              message: 'Namespace "'+ns+'" already exists'
            };
          }
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
            this.namespace[ spaces.root ] = new NameSpace( ns );
          }
        }
      }
    }
  });

  return Morphon;

}));
