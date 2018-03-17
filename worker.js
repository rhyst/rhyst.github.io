(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("js/shared/config.js", function(exports, require, module) {"use strict";

var metre = 10; //pixels
var numOfNodes = 40;
var nominalStringLength = 10; // pixels
var springConstant = 25;
var internalViscousFrictionConstant = 8;
var viscousConstant = 0.00002;
var simulationSpeed = 4; // times real time
var maxStep = 50; // milliseconds
var dangerForceMax = 150; //25000;
var dangerForceMin = 0; //10000;
var ropeWeightPerMetre = 1;
var ropeWeightPerNode = nominalStringLength / metre * ropeWeightPerMetre;

module.exports = {
    metre: metre,
    numOfNodes: numOfNodes,
    nominalStringLength: nominalStringLength,
    springConstant: springConstant,
    internalViscousFrictionConstant: internalViscousFrictionConstant,
    viscousConstant: viscousConstant,
    simulationSpeed: simulationSpeed,
    maxStep: maxStep,
    dangerForceMax: dangerForceMax,
    dangerForceMin: dangerForceMin,
    ropeWeightPerMetre: ropeWeightPerMetre,
    ropeWeightPerNode: ropeWeightPerNode
};
});

require.register("js/shared/constants.js", function(exports, require, module) {"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var ControlsEnum = exports.ControlsEnum = Object.freeze({
    pan: "pan",
    grab: "grab",
    anchor: "anchor",
    erase: "erase",
    rope: "rope"
});
});

require.register("js/shared/helper.js", function(exports, require, module) {'use strict';

var config = require('js/shared/config');

function getNode(id, nodes) {
    return nodes.find(function (node) {
        return node.id === id;
    });
}
function getLength(node1, node2) {
    var xdiff = Math.abs(node1.position.x - node2.position.x);
    var ydiff = Math.abs(node1.position.y - node2.position.y);
    return Math.sqrt(xdiff * xdiff + ydiff * ydiff);
}
function getMidpoint(node1, node2) {
    return { x: (node1.position.x + node2.position.x) / 2, y: (node1.position.y + node2.position.y) / 2 };
}
function getAngleFromHorizontal(node1, node2) {
    return Math.atan2(node2.position.y - node1.position.y, node2.position.x - node1.position.x);
}

function getForce(node1, node2) {
    var stringLength = getLength(node1, node2);
    var lengthDifference = stringLength - config.nominalStringLength;
    var angleFromHorizontal = getAngleFromHorizontal(node1, node2);
    var ySpringForce = Math.sin(angleFromHorizontal) * lengthDifference * config.springConstant;
    var xSpringForce = Math.cos(angleFromHorizontal) * lengthDifference * config.springConstant;
    var totalSpringForce = Math.sqrt(ySpringForce * ySpringForce + (xSpringForce + xSpringForce));
    return { total: totalSpringForce, x: xSpringForce, y: ySpringForce };
}

module.exports = {
    getAngleFromHorizontal: getAngleFromHorizontal,
    getForce: getForce,
    getLength: getLength,
    getMidpoint: getMidpoint,
    getNode: getNode
};
});

;require.register("js/shared/node.js", function(exports, require, module) {'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vector = require('js/shared/vector').Vector;

var uniqueid = -1;
function getID() {
    uniqueid += 1;
    return uniqueid;
}

var Node = function () {
    function Node() {
        var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var vx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var vy = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var fx = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var fy = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
        var fixed = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
        var connectedNodes = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [];
        var id = arguments[8];

        _classCallCheck(this, Node);

        this.id = id ? id : getID();
        this.position = new Vector(x, y);
        this.velocity = new Vector(vx, vy);
        this.force = new Vector(fx, fy);
        this.fixed = fixed;
        this.connectedNodes = connectedNodes;
    }

    _createClass(Node, [{
        key: 'getObject',
        value: function getObject() {
            return {
                id: this.id,
                position: this.position,
                velocity: this.velocity,
                force: this.force,
                fixed: this.fixed,
                connectedNodes: this.connectedNodes
            };
        }
    }, {
        key: 'loadObject',
        value: function loadObject() {
            var nodeObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.id = nodeObject.id ? nodeObject.id : this.id;
            this.position = nodeObject.position || this.position;
            this.velocity = nodeObject.velocity || this.velocity;
            this.force = nodeObject.force || this.force;
            this.fixed = nodeObject.fixed || this.fixed;
            this.connectedNodes = nodeObject.connectedNodes || this.connectedNodes;
        }
    }, {
        key: 'copyNode',
        value: function copyNode() {
            return new Node(this.position.x, this.position.y, this.velocity.x, this.velocity.y, this.force.x, this.force.y, this.fixed, this.connectedNodes, this.id);
        }
    }]);

    return Node;
}();

module.exports = {
    Node: Node
};
});

require.register("js/shared/vector.js", function(exports, require, module) {"use strict";

// Provides a simple 3D vector class. Vector operations can be done using member
// functions, which return new vectors, or static functions, which reuse
// existing vectors to avoid generating garbage.
function Vector(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

// ### Instance Methods
// The methods `add()`, `subtract()`, `multiply()`, and `divide()` can all
// take either a vector or a number as an argument.
Vector.prototype = {
  load: function load(vector) {
    return new Vector(vector.x || 0, vector.y || 0, vector.z || 0);
  },
  negative: function negative() {
    return new Vector(-this.x, -this.y, -this.z);
  },
  add: function add(v) {
    if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);else return new Vector(this.x + v, this.y + v, this.z + v);
  },
  subtract: function subtract(v) {
    if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);else return new Vector(this.x - v, this.y - v, this.z - v);
  },
  multiply: function multiply(v) {
    if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);else return new Vector(this.x * v, this.y * v, this.z * v);
  },
  divide: function divide(v) {
    if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);else return new Vector(this.x / v, this.y / v, this.z / v);
  },
  equals: function equals(v) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  },
  dot: function dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  cross: function cross(v) {
    return new Vector(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
  },
  length: function length() {
    return Math.sqrt(this.dot(this));
  },
  unit: function unit() {
    return this.divide(this.length());
  },
  min: function min() {
    return Math.min(Math.min(this.x, this.y), this.z);
  },
  max: function max() {
    return Math.max(Math.max(this.x, this.y), this.z);
  },
  toAngles: function toAngles() {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length())
    };
  },
  angleTo: function angleTo(a) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  },
  toArray: function toArray(n) {
    return [this.x, this.y, this.z].slice(0, n || 3);
  },
  clone: function clone() {
    return new Vector(this.x, this.y, this.z);
  },
  init: function init(x, y, z) {
    this.x = x;this.y = y;this.z = z;
    return this;
  }
};

// ### Static Methods
// `Vector.randomDirection()` returns a vector with a length of 1 and a
// statistically uniform direction. `Vector.lerp()` performs linear
// interpolation between two vectors.
Vector.negative = function (a, b) {
  b.x = -a.x;b.y = -a.y;b.z = -a.z;
  return b;
};
Vector.add = function (a, b, c) {
  c = c ? c : new Vector();
  if (b instanceof Vector) {
    c.x = a.x + b.x;c.y = a.y + b.y;c.z = a.z + b.z;
  } else {
    c.x = a.x + b;c.y = a.y + b;c.z = a.z + b;
  }
  return c;
};
Vector.subtract = function (a, b, c) {
  c = c ? c : new Vector();
  if (b instanceof Vector) {
    c.x = a.x - b.x;c.y = a.y - b.y;c.z = a.z - b.z;
  } else {
    c.x = a.x - b;c.y = a.y - b;c.z = a.z - b;
  }
  return c;
};
Vector.multiply = function (a, b, c) {
  c = c ? c : new Vector();
  if (b instanceof Vector) {
    c.x = a.x * b.x;c.y = a.y * b.y;c.z = a.z * b.z;
  } else {
    c.x = a.x * b;c.y = a.y * b;c.z = a.z * b;
  }
  return c;
};
Vector.divide = function (a, b, c) {
  if (b instanceof Vector) {
    c.x = a.x / b.x;c.y = a.y / b.y;c.z = a.z / b.z;
  } else {
    c.x = a.x / b;c.y = a.y / b;c.z = a.z / b;
  }
  return c;
};
Vector.cross = function (a, b, c) {
  c.x = a.y * b.z - a.z * b.y;
  c.y = a.z * b.x - a.x * b.z;
  c.z = a.x * b.y - a.y * b.x;
  return c;
};
Vector.unit = function (a, b) {
  var length = a.length();
  b.x = a.x / length;
  b.y = a.y / length;
  b.z = a.z / length;
  return b;
};
Vector.fromAngles = function (theta, phi) {
  return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
};
Vector.randomDirection = function () {
  return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
};
Vector.min = function (a, b) {
  return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
};
Vector.max = function (a, b) {
  return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
};
Vector.lerp = function (a, b, fraction) {
  return b.subtract(a).multiply(fraction).add(a);
};
Vector.fromArray = function (a) {
  return new Vector(a[0], a[1], a[2]);
};
Vector.angleBetween = function (a, b) {
  return a.angleTo(b);
};

module.exports = {
  Vector: Vector
};
});

;"use strict";

var helper = require("js/shared/helper");
var config = require("js/shared/config");
var Vector = require("js/shared/vector").Vector;
var Node = require("js/shared/node").Node;

var running = true;
var nodes = [];
var lastTime = new Date();
var trueSimulationSpeed = 0;

onmessage = function onmessage(e) {
    if (e.data === "init") {
        init();
    } else if (e.data === "run") {
        running = true;
        doPhysics();
    } else if (e.data === "pause") {
        running = false;
    } else if (e.data === "send") {
        postMessage({ nodes: nodes, trueSimulationSpeed: trueSimulationSpeed });
    } else if (e.data[0] === "load") {
        nodes = JSON.parse(atob(e.data[1]));
    } else if (e.data[0] === "move") {
        var node = helper.getNode(e.data[1].selectedNode.id, nodes);
        node.position = new Vector().load(e.data[1].mousePosition);
        node.velocity = new Vector();
        node.force = new Vector();
    } else if (e.data[0] === "nomove") {
        //var node = helper.getNode(e.data[1].selectedNode.id, nodes);
    } else if (e.data[0] === "newanchor") {
        var position = e.data[1].mousePosition;
        nodes.push(new Node(position.x, position.y, 0, 0, 0, 0, true, []));
    } else if (e.data[0] === "deletenode") {
        var node = e.data[1].node;
        nodes = nodes.filter(function (n) {
            return n.id !== node.id;
        }).map(function (n) {
            n.connectedNodes = n.connectedNodes.filter(function (cn) {
                return cn !== node.id;
            });
            return n;
        });
    } else if (e.data[0] === "addnodes") {
        var newNodes = e.data[1].nodes;
        nodes = nodes.concat(newNodes);
    }
};

function init() {
    var xpos = 200;
    var ypos = 50;
    nodes.push(new Node(xpos, ypos, 0, 0, 0, 0, true, [1]));
    for (var i = 1; i < config.numOfNodes; i++) {
        xpos = xpos + config.nominalStringLength;
        var connectedNodes = [i - 1];
        if (i < config.numOfNodes - 1) connectedNodes.push(i + 1);
        nodes.push(new Node(xpos, ypos, 0, 0, 0, 0, false, connectedNodes));
    }

    var lastNode = helper.getNode(nodes.length - 1, nodes);
    lastNode.fixed = true;
    lastNode.position.x = 260;
    lastNode.position.y = 300;

    var yhangnode = new Node(220, 50, 0, 0, 0, 0, true, [1]);
    nodes.push(yhangnode);

    var node1 = helper.getNode(1, nodes);
    node1.connectedNodes.push(yhangnode.id);
}

function doPhysics() {
    var delta = 0;
    lastTime = self.performance.now();
    setTimeout(physics, 0);
}

function get_a(node) {
    var ySpringForce = 0;
    var xSpringForce = 0;
    var xVelocityDampingForce = 0;
    var yVelocityDampingForce = 0;
    node.connectedNodes.forEach(function (connectedNodeID) {
        var connectedNode = helper.getNode(connectedNodeID, nodes);
        if (connectedNode) {
            var stringLength = helper.getLength(connectedNode, node);
            if (stringLength > config.nominalStringLength) {
                var lengthDifference = stringLength - config.nominalStringLength;
                var angleFromHorizontal = helper.getAngleFromHorizontal(node, connectedNode);
                ySpringForce += Math.sin(angleFromHorizontal) * lengthDifference * config.springConstant;
                xSpringForce += Math.cos(angleFromHorizontal) * lengthDifference * config.springConstant;
            }
            xVelocityDampingForce += config.internalViscousFrictionConstant * (node.velocity.x - connectedNode.velocity.x);
            yVelocityDampingForce += config.internalViscousFrictionConstant * (node.velocity.y - connectedNode.velocity.y);
        }
    });

    // Other forces
    var yGravForce = 9.8 * config.ropeWeightPerNode;
    var xGravForce = 0 * config.ropeWeightPerNode;
    var yViscousForce = node.velocity.y * config.viscousConstant;
    var xViscousForce = node.velocity.x * config.viscousConstant;

    // Total force
    node.force.y = yGravForce + ySpringForce - yViscousForce - yVelocityDampingForce;
    node.force.x = xGravForce + xSpringForce - xViscousForce - xVelocityDampingForce;

    return new Vector(node.force.x / config.ropeWeightPerNode, node.force.y / config.ropeWeightPerNode);
}

function physics() {
    var simSpeedQuantity = 0;
    var simulationSpeedSum = 0;
    for (var j = 0; j < 100; j++) {
        // Timing and simulation speed
        var newTime = self.performance.now();
        var actualElapsedMilliseconds = newTime - lastTime;
        var actualElapsedTime = actualElapsedMilliseconds / 1000;
        var elapsedMilliseconds = actualElapsedMilliseconds * config.simulationSpeed;
        if (elapsedMilliseconds > config.maxStep) {
            elapsedTime = config.maxStep / 1000;
            console.warn("Max step exceeded, simulation speed may not be correct.");
        } else {
            elapsedTime = elapsedMilliseconds / 1000;
        }
        var actualSimulationSpeed = elapsedTime / actualElapsedTime;
        if (!isNaN(actualSimulationSpeed)) {
            simSpeedQuantity += 1;
            simulationSpeedSum += actualSimulationSpeed;
        }
        lastTime = newTime;

        // Physics
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (!node.fixed) {
                node.velocity.x = node.velocity.x + node.force.x / config.ropeWeightPerNode * elapsedTime / 2;
                node.velocity.y = node.velocity.y + node.force.y / config.ropeWeightPerNode * elapsedTime / 2;

                // x
                node.position.y = node.position.y + node.velocity.y * elapsedTime;
                node.position.x = node.position.x + node.velocity.x * elapsedTime;

                // v
                dv = get_a(node).multiply(elapsedTime / 2);
                node.velocity.x = node.velocity.x + dv.x;
                node.velocity.y = node.velocity.y + dv.y;
            }
        }
    }
    trueSimulationSpeed = simulationSpeedSum / simSpeedQuantity;
    if (running) {
        setTimeout(physics, 0);
    }
}
;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9qcy9zaGFyZWQvY29uZmlnLmpzIiwiYXBwL2pzL3NoYXJlZC9jb25zdGFudHMuanMiLCJhcHAvanMvc2hhcmVkL2hlbHBlci5qcyIsImFwcC9qcy9zaGFyZWQvbm9kZS5qcyIsImFwcC9qcy9zaGFyZWQvdmVjdG9yLmpzIiwiYXBwL2pzL3dvcmtlci93b3JrZXIuanMiXSwibmFtZXMiOlsibWV0cmUiLCJudW1PZk5vZGVzIiwibm9taW5hbFN0cmluZ0xlbmd0aCIsInNwcmluZ0NvbnN0YW50IiwiaW50ZXJuYWxWaXNjb3VzRnJpY3Rpb25Db25zdGFudCIsInZpc2NvdXNDb25zdGFudCIsInNpbXVsYXRpb25TcGVlZCIsIm1heFN0ZXAiLCJkYW5nZXJGb3JjZU1heCIsImRhbmdlckZvcmNlTWluIiwicm9wZVdlaWdodFBlck1ldHJlIiwicm9wZVdlaWdodFBlck5vZGUiLCJtb2R1bGUiLCJleHBvcnRzIiwiQ29udHJvbHNFbnVtIiwiT2JqZWN0IiwiZnJlZXplIiwicGFuIiwiZ3JhYiIsImFuY2hvciIsImVyYXNlIiwicm9wZSIsImNvbmZpZyIsInJlcXVpcmUiLCJnZXROb2RlIiwiaWQiLCJub2RlcyIsImZpbmQiLCJub2RlIiwiZ2V0TGVuZ3RoIiwibm9kZTEiLCJub2RlMiIsInhkaWZmIiwiTWF0aCIsImFicyIsInBvc2l0aW9uIiwieCIsInlkaWZmIiwieSIsInNxcnQiLCJnZXRNaWRwb2ludCIsImdldEFuZ2xlRnJvbUhvcml6b250YWwiLCJhdGFuMiIsImdldEZvcmNlIiwic3RyaW5nTGVuZ3RoIiwibGVuZ3RoRGlmZmVyZW5jZSIsImFuZ2xlRnJvbUhvcml6b250YWwiLCJ5U3ByaW5nRm9yY2UiLCJzaW4iLCJ4U3ByaW5nRm9yY2UiLCJjb3MiLCJ0b3RhbFNwcmluZ0ZvcmNlIiwidG90YWwiLCJWZWN0b3IiLCJ1bmlxdWVpZCIsImdldElEIiwiTm9kZSIsInZ4IiwidnkiLCJmeCIsImZ5IiwiZml4ZWQiLCJjb25uZWN0ZWROb2RlcyIsInZlbG9jaXR5IiwiZm9yY2UiLCJub2RlT2JqZWN0IiwieiIsInByb3RvdHlwZSIsImxvYWQiLCJ2ZWN0b3IiLCJuZWdhdGl2ZSIsImFkZCIsInYiLCJzdWJ0cmFjdCIsIm11bHRpcGx5IiwiZGl2aWRlIiwiZXF1YWxzIiwiZG90IiwiY3Jvc3MiLCJsZW5ndGgiLCJ1bml0IiwibWluIiwibWF4IiwidG9BbmdsZXMiLCJ0aGV0YSIsInBoaSIsImFzaW4iLCJhbmdsZVRvIiwiYSIsImFjb3MiLCJ0b0FycmF5IiwibiIsInNsaWNlIiwiY2xvbmUiLCJpbml0IiwiYiIsImMiLCJmcm9tQW5nbGVzIiwicmFuZG9tRGlyZWN0aW9uIiwicmFuZG9tIiwiUEkiLCJsZXJwIiwiZnJhY3Rpb24iLCJmcm9tQXJyYXkiLCJhbmdsZUJldHdlZW4iLCJoZWxwZXIiLCJydW5uaW5nIiwibGFzdFRpbWUiLCJEYXRlIiwidHJ1ZVNpbXVsYXRpb25TcGVlZCIsIm9ubWVzc2FnZSIsImUiLCJkYXRhIiwiZG9QaHlzaWNzIiwicG9zdE1lc3NhZ2UiLCJKU09OIiwicGFyc2UiLCJhdG9iIiwic2VsZWN0ZWROb2RlIiwibW91c2VQb3NpdGlvbiIsInB1c2giLCJmaWx0ZXIiLCJtYXAiLCJjbiIsIm5ld05vZGVzIiwiY29uY2F0IiwieHBvcyIsInlwb3MiLCJpIiwibGFzdE5vZGUiLCJ5aGFuZ25vZGUiLCJkZWx0YSIsInNlbGYiLCJwZXJmb3JtYW5jZSIsIm5vdyIsInNldFRpbWVvdXQiLCJwaHlzaWNzIiwiZ2V0X2EiLCJ4VmVsb2NpdHlEYW1waW5nRm9yY2UiLCJ5VmVsb2NpdHlEYW1waW5nRm9yY2UiLCJmb3JFYWNoIiwiY29ubmVjdGVkTm9kZUlEIiwiY29ubmVjdGVkTm9kZSIsInlHcmF2Rm9yY2UiLCJ4R3JhdkZvcmNlIiwieVZpc2NvdXNGb3JjZSIsInhWaXNjb3VzRm9yY2UiLCJzaW1TcGVlZFF1YW50aXR5Iiwic2ltdWxhdGlvblNwZWVkU3VtIiwiaiIsIm5ld1RpbWUiLCJhY3R1YWxFbGFwc2VkTWlsbGlzZWNvbmRzIiwiYWN0dWFsRWxhcHNlZFRpbWUiLCJlbGFwc2VkTWlsbGlzZWNvbmRzIiwiZWxhcHNlZFRpbWUiLCJjb25zb2xlIiwid2FybiIsImFjdHVhbFNpbXVsYXRpb25TcGVlZCIsImlzTmFOIiwiZHYiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxRQUFRLEVBQVosQyxDQUFnQjtBQUNoQixJQUFJQyxhQUFhLEVBQWpCO0FBQ0EsSUFBSUMsc0JBQXNCLEVBQTFCLEMsQ0FBOEI7QUFDOUIsSUFBSUMsaUJBQWlCLEVBQXJCO0FBQ0EsSUFBSUMsa0NBQWtDLENBQXRDO0FBQ0EsSUFBSUMsa0JBQWtCLE9BQXRCO0FBQ0EsSUFBSUMsa0JBQWtCLENBQXRCLEMsQ0FBeUI7QUFDekIsSUFBSUMsVUFBVSxFQUFkLEMsQ0FBa0I7QUFDbEIsSUFBSUMsaUJBQWlCLEdBQXJCLEMsQ0FBeUI7QUFDekIsSUFBSUMsaUJBQWlCLENBQXJCLEMsQ0FBdUI7QUFDdkIsSUFBSUMscUJBQXFCLENBQXpCO0FBQ0EsSUFBSUMsb0JBQW9CVCxzQkFBc0JGLEtBQXRCLEdBQThCVSxrQkFBdEQ7O0FBRUFFLE9BQU9DLE9BQVAsR0FBaUI7QUFDYmIsZ0JBRGE7QUFFYkMsMEJBRmE7QUFHYkMsNENBSGE7QUFJYkMsa0NBSmE7QUFLYkMsb0VBTGE7QUFNYkMsb0NBTmE7QUFPYkMsb0NBUGE7QUFRYkMsb0JBUmE7QUFTYkMsa0NBVGE7QUFVYkMsa0NBVmE7QUFXYkMsMENBWGE7QUFZYkM7QUFaYSxDQUFqQjs7Ozs7Ozs7QUNiTyxJQUFNRyxzQ0FBZUMsT0FBT0MsTUFBUCxDQUFjO0FBQ3RDQyxTQUFRLEtBRDhCO0FBRXRDQyxVQUFRLE1BRjhCO0FBR3RDQyxZQUFRLFFBSDhCO0FB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QjtBQUNIO0FBQ0oiLCJmaWxlIjoicHVibGljL3dvcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBtZXRyZSA9IDEwOyAvL3BpeGVsc1xudmFyIG51bU9mTm9kZXMgPSA0MDtcbnZhciBub21pbmFsU3RyaW5nTGVuZ3RoID0gMTA7IC8vIHBpeGVsc1xudmFyIHNwcmluZ0NvbnN0YW50ID0gMjU7XG52YXIgaW50ZXJuYWxWaXNjb3VzRnJpY3Rpb25Db25zdGFudCA9IDg7XG52YXIgdmlzY291c0NvbnN0YW50ID0gMC4wMDAwMjtcbnZhciBzaW11bGF0aW9uU3BlZWQgPSA0OyAvLyB0aW1lcyByZWFsIHRpbWVcbnZhciBtYXhTdGVwID0gNTA7IC8vIG1pbGxpc2Vjb25kc1xudmFyIGRhbmdlckZvcmNlTWF4ID0gMTUwOy8vMjUwMDA7XG52YXIgZGFuZ2VyRm9yY2VNaW4gPSAwOy8vMTAwMDA7XG52YXIgcm9wZVdlaWdodFBlck1ldHJlID0gMTtcbnZhciByb3BlV2VpZ2h0UGVyTm9kZSA9IG5vbWluYWxTdHJpbmdMZW5ndGggLyBtZXRyZSAqIHJvcGVXZWlnaHRQZXJNZXRyZTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWV0cmUsXG4gICAgbnVtT2ZOb2RlcyxcbiAgICBub21pbmFsU3RyaW5nTGVuZ3RoLFxuICAgIHNwcmluZ0NvbnN0YW50LFxuICAgIGludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQsXG4gICAgdmlzY291c0NvbnN0YW50LFxuICAgIHNpbXVsYXRpb25TcGVlZCxcbiAgICBtYXhTdGVwLFxuICAgIGRhbmdlckZvcmNlTWF4LFxuICAgIGRhbmdlckZvcmNlTWluLFxuICAgIHJvcGVXZWlnaHRQZXJNZXRyZSxcbiAgICByb3BlV2VpZ2h0UGVyTm9kZVxufTtcbiIsImV4cG9ydCBjb25zdCBDb250cm9sc0VudW0gPSBPYmplY3QuZnJlZXplKHtcbiAgICBwYW46ICAgIFwicGFuXCIsXG4gICAgZ3JhYjogICBcImdyYWJcIixcbiAgICBhbmNob3I6IFwiYW5jaG9yXCIsXG4gICAgZXJhc2U6ICBcImVyYXNlXCIsXG4gICAgcm9wZTogICBcInJvcGVcIlxufSk7IiwiY29uc3QgY29uZmlnID0gcmVxdWlyZSgnanMvc2hhcmVkL2NvbmZpZycpO1xuXG5mdW5jdGlvbiBnZXROb2RlKGlkLCBub2Rlcykge1xuICAgIHJldHVybiBub2Rlcy5maW5kKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHJldHVybiBub2RlLmlkID09PSBpZDtcbiAgICB9KVxufVxuZnVuY3Rpb24gZ2V0TGVuZ3RoKG5vZGUxLCBub2RlMikge1xuICAgIHZhciB4ZGlmZiA9IE1hdGguYWJzKG5vZGUxLnBvc2l0aW9uLnggLSBub2RlMi5wb3NpdGlvbi54KTtcbiAgICB2YXIgeWRpZmYgPSBNYXRoLmFicyhub2RlMS5wb3NpdGlvbi55IC0gbm9kZTIucG9zaXRpb24ueSk7XG4gICAgcmV0dXJuIE1hdGguc3FydCgoeGRpZmYgKiB4ZGlmZikgKyAoeWRpZmYgKiB5ZGlmZikpO1xufVxuZnVuY3Rpb24gZ2V0TWlkcG9pbnQobm9kZTEsIG5vZGUyKSB7XG4gICAgcmV0dXJuIHsgeDogKG5vZGUxLnBvc2l0aW9uLnggKyBub2RlMi5wb3NpdGlvbi54KSAvIDIsIHk6IChub2RlMS5wb3NpdGlvbi55ICsgbm9kZTIucG9zaXRpb24ueSkgLyAyIH1cbn1cbmZ1bmN0aW9uIGdldEFuZ2xlRnJvbUhvcml6b250YWwobm9kZTEsIG5vZGUyKSB7XG4gICAgcmV0dXJuIE1hdGguYXRhbjIobm9kZTIucG9zaXRpb24ueSAtIG5vZGUxLnBvc2l0aW9uLnksIG5vZGUyLnBvc2l0aW9uLnggLSBub2RlMS5wb3NpdGlvbi54KVxufVxuXG5mdW5jdGlvbiBnZXRGb3JjZShub2RlMSwgbm9kZTIpIHtcbiAgICB2YXIgc3RyaW5nTGVuZ3RoID0gZ2V0TGVuZ3RoKG5vZGUxLCBub2RlMik7XG4gICAgdmFyIGxlbmd0aERpZmZlcmVuY2UgPSBzdHJpbmdMZW5ndGggLSBjb25maWcubm9taW5hbFN0cmluZ0xlbmd0aDtcbiAgICB2YXIgYW5nbGVGcm9tSG9yaXpvbnRhbCA9IGdldEFuZ2xlRnJvbUhvcml6b250YWwobm9kZTEsIG5vZGUyKTtcbiAgICB2YXIgeVNwcmluZ0ZvcmNlID0gTWF0aC5zaW4oYW5nbGVGcm9tSG9yaXpvbnRhbCkgKiBsZW5ndGhEaWZmZXJlbmNlICogY29uZmlnLnNwcmluZ0NvbnN0YW50O1xuICAgIHZhciB4U3ByaW5nRm9yY2UgPSBNYXRoLmNvcyhhbmdsZUZyb21Ib3Jpem9udGFsKSAqIGxlbmd0aERpZmZlcmVuY2UgKiBjb25maWcuc3ByaW5nQ29uc3RhbnQ7XG4gICAgdmFyIHRvdGFsU3ByaW5nRm9yY2UgPSBNYXRoLnNxcnQoKHlTcHJpbmdGb3JjZSp5U3ByaW5nRm9yY2UpKyh4U3ByaW5nRm9yY2UreFNwcmluZ0ZvcmNlKSk7XG4gICAgcmV0dXJuIHt0b3RhbDogdG90YWxTcHJpbmdGb3JjZSwgeDogeFNwcmluZ0ZvcmNlLCB5OiB5U3ByaW5nRm9yY2V9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdldEFuZ2xlRnJvbUhvcml6b250YWwsXG4gICAgZ2V0Rm9yY2UsXG4gICAgZ2V0TGVuZ3RoLFxuICAgIGdldE1pZHBvaW50LFxuICAgIGdldE5vZGVcbn0iLCJjb25zdCBWZWN0b3IgPSByZXF1aXJlKCdqcy9zaGFyZWQvdmVjdG9yJykuVmVjdG9yO1xuXG52YXIgdW5pcXVlaWQgPSAtMTtcbmZ1bmN0aW9uIGdldElEKCkge1xuICAgIHVuaXF1ZWlkICs9IDE7XG4gICAgcmV0dXJuIHVuaXF1ZWlkO1xufVxuXG5jbGFzcyBOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwLFxuICAgICAgICB2eCA9IDAsXG4gICAgICAgIHZ5ID0gMCxcbiAgICAgICAgZnggPSAwLFxuICAgICAgICBmeSA9IDAsXG4gICAgICAgIGZpeGVkID0gZmFsc2UsXG4gICAgICAgIGNvbm5lY3RlZE5vZGVzID0gW10sXG4gICAgICAgIGlkXG4gICAgKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZCA/IGlkIDogZ2V0SUQoKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoeCwgeSk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBuZXcgVmVjdG9yKHZ4LCB2eSk7XG4gICAgICAgIHRoaXMuZm9yY2UgPSBuZXcgVmVjdG9yKGZ4LCBmeSk7XG4gICAgICAgIHRoaXMuZml4ZWQgPSBmaXhlZDtcbiAgICAgICAgdGhpcy5jb25uZWN0ZWROb2RlcyA9IGNvbm5lY3RlZE5vZGVzO1xuICAgIH1cbiAgICBnZXRPYmplY3QoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uLFxuICAgICAgICAgICAgdmVsb2NpdHk6IHRoaXMudmVsb2NpdHksXG4gICAgICAgICAgICBmb3JjZTogdGhpcy5mb3JjZSxcbiAgICAgICAgICAgIGZpeGVkOiB0aGlzLmZpeGVkLFxuICAgICAgICAgICAgY29ubmVjdGVkTm9kZXM6IHRoaXMuY29ubmVjdGVkTm9kZXNcbiAgICAgICAgfTtcbiAgICB9XG4gICAgbG9hZE9iamVjdChub2RlT2JqZWN0ID0ge30pIHtcbiAgICAgICAgdGhpcy5pZCA9IG5vZGVPYmplY3QuaWQgPyBub2RlT2JqZWN0LmlkIDogdGhpcy5pZDtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5vZGVPYmplY3QucG9zaXRpb24gfHwgdGhpcy5wb3NpdGlvbjtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IG5vZGVPYmplY3QudmVsb2NpdHkgfHwgdGhpcy52ZWxvY2l0eTtcbiAgICAgICAgdGhpcy5mb3JjZSA9IG5vZGVPYmplY3QuZm9yY2UgfHwgdGhpcy5mb3JjZTtcbiAgICAgICAgdGhpcy5maXhlZCA9IG5vZGVPYmplY3QuZml4ZWQgfHwgdGhpcy5maXhlZDtcbiAgICAgICAgdGhpcy5jb25uZWN0ZWROb2RlcyA9IG5vZGVPYmplY3QuY29ubmVjdGVkTm9kZXMgfHwgdGhpcy5jb25uZWN0ZWROb2RlcztcbiAgICB9XG4gICAgY29weU5vZGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTm9kZShcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCxcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSxcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueCxcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueSxcbiAgICAgICAgICAgIHRoaXMuZm9yY2UueCxcbiAgICAgICAgICAgIHRoaXMuZm9yY2UueSxcbiAgICAgICAgICAgIHRoaXMuZml4ZWQsXG4gICAgICAgICAgICB0aGlzLmNvbm5lY3RlZE5vZGVzLFxuICAgICAgICAgICAgdGhpcy5pZFxuICAgICAgICApO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgTm9kZVxufTtcbiIsIi8vIFByb3ZpZGVzIGEgc2ltcGxlIDNEIHZlY3RvciBjbGFzcy4gVmVjdG9yIG9wZXJhdGlvbnMgY2FuIGJlIGRvbmUgdXNpbmcgbWVtYmVyXG4vLyBmdW5jdGlvbnMsIHdoaWNoIHJldHVybiBuZXcgdmVjdG9ycywgb3Igc3RhdGljIGZ1bmN0aW9ucywgd2hpY2ggcmV1c2Vcbi8vIGV4aXN0aW5nIHZlY3RvcnMgdG8gYXZvaWQgZ2VuZXJhdGluZyBnYXJiYWdlLlxuZnVuY3Rpb24gVmVjdG9yKHgsIHksIHopIHtcbiAgdGhpcy54ID0geCB8fCAwO1xuICB0aGlzLnkgPSB5IHx8IDA7XG4gIHRoaXMueiA9IHogfHwgMDtcbn1cblxuLy8gIyMjIEluc3RhbmNlIE1ldGhvZHNcbi8vIFRoZSBtZXRob2RzIGBhZGQoKWAsIGBzdWJ0cmFjdCgpYCwgYG11bHRpcGx5KClgLCBhbmQgYGRpdmlkZSgpYCBjYW4gYWxsXG4vLyB0YWtlIGVpdGhlciBhIHZlY3RvciBvciBhIG51bWJlciBhcyBhbiBhcmd1bWVudC5cblZlY3Rvci5wcm90b3R5cGUgPSB7XG4gIGxvYWQ6IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHZlY3Rvci54IHx8IDAsIHZlY3Rvci55IHx8IDAsIHZlY3Rvci56IHx8IDApO1xuICB9LFxuICBuZWdhdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IoLXRoaXMueCwgLXRoaXMueSwgLXRoaXMueik7XG4gIH0sXG4gIGFkZDogZnVuY3Rpb24odikge1xuICAgIGlmICh2IGluc3RhbmNlb2YgVmVjdG9yKSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSwgdGhpcy56ICsgdi56KTtcbiAgICBlbHNlIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCArIHYsIHRoaXMueSArIHYsIHRoaXMueiArIHYpO1xuICB9LFxuICBzdWJ0cmFjdDogZnVuY3Rpb24odikge1xuICAgIGlmICh2IGluc3RhbmNlb2YgVmVjdG9yKSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSwgdGhpcy56IC0gdi56KTtcbiAgICBlbHNlIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAtIHYsIHRoaXMueSAtIHYsIHRoaXMueiAtIHYpO1xuICB9LFxuICBtdWx0aXBseTogZnVuY3Rpb24odikge1xuICAgIGlmICh2IGluc3RhbmNlb2YgVmVjdG9yKSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSwgdGhpcy56ICogdi56KTtcbiAgICBlbHNlIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAqIHYsIHRoaXMueSAqIHYsIHRoaXMueiAqIHYpO1xuICB9LFxuICBkaXZpZGU6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gdi54LCB0aGlzLnkgLyB2LnksIHRoaXMueiAvIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggLyB2LCB0aGlzLnkgLyB2LCB0aGlzLnogLyB2KTtcbiAgfSxcbiAgZXF1YWxzOiBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCA9PSB2LnggJiYgdGhpcy55ID09IHYueSAmJiB0aGlzLnogPT0gdi56O1xuICB9LFxuICBkb3Q6IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56O1xuICB9LFxuICBjcm9zczogZnVuY3Rpb24odikge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKFxuICAgICAgdGhpcy55ICogdi56IC0gdGhpcy56ICogdi55LFxuICAgICAgdGhpcy56ICogdi54IC0gdGhpcy54ICogdi56LFxuICAgICAgdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54XG4gICAgKTtcbiAgfSxcbiAgbGVuZ3RoOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMuZG90KHRoaXMpKTtcbiAgfSxcbiAgdW5pdDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2aWRlKHRoaXMubGVuZ3RoKCkpO1xuICB9LFxuICBtaW46IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1pbih0aGlzLngsIHRoaXMueSksIHRoaXMueik7XG4gIH0sXG4gIG1heDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWF4KHRoaXMueCwgdGhpcy55KSwgdGhpcy56KTtcbiAgfSxcbiAgdG9BbmdsZXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0aGV0YTogTWF0aC5hdGFuMih0aGlzLnosIHRoaXMueCksXG4gICAgICBwaGk6IE1hdGguYXNpbih0aGlzLnkgLyB0aGlzLmxlbmd0aCgpKVxuICAgIH07XG4gIH0sXG4gIGFuZ2xlVG86IGZ1bmN0aW9uKGEpIHtcbiAgICByZXR1cm4gTWF0aC5hY29zKHRoaXMuZG90KGEpIC8gKHRoaXMubGVuZ3RoKCkgKiBhLmxlbmd0aCgpKSk7XG4gIH0sXG4gIHRvQXJyYXk6IGZ1bmN0aW9uKG4pIHtcbiAgICByZXR1cm4gW3RoaXMueCwgdGhpcy55LCB0aGlzLnpdLnNsaWNlKDAsIG4gfHwgMyk7XG4gIH0sXG4gIGNsb25lOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24oeCwgeSwgeikge1xuICAgIHRoaXMueCA9IHg7IHRoaXMueSA9IHk7IHRoaXMueiA9IHo7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cbi8vICMjIyBTdGF0aWMgTWV0aG9kc1xuLy8gYFZlY3Rvci5yYW5kb21EaXJlY3Rpb24oKWAgcmV0dXJucyBhIHZlY3RvciB3aXRoIGEgbGVuZ3RoIG9mIDEgYW5kIGFcbi8vIHN0YXRpc3RpY2FsbHkgdW5pZm9ybSBkaXJlY3Rpb24uIGBWZWN0b3IubGVycCgpYCBwZXJmb3JtcyBsaW5lYXJcbi8vIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjdG9ycy5cblZlY3Rvci5uZWdhdGl2ZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgYi54ID0gLWEueDsgYi55ID0gLWEueTsgYi56ID0gLWEuejtcbiAgcmV0dXJuIGI7XG59O1xuVmVjdG9yLmFkZCA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgYyA9IGMgPyBjIDogbmV3IFZlY3RvcigpO1xuICBpZiAoYiBpbnN0YW5jZW9mIFZlY3RvcikgeyBjLnggPSBhLnggKyBiLng7IGMueSA9IGEueSArIGIueTsgYy56ID0gYS56ICsgYi56OyB9XG4gIGVsc2UgeyBjLnggPSBhLnggKyBiOyBjLnkgPSBhLnkgKyBiOyBjLnogPSBhLnogKyBiOyB9XG4gIHJldHVybiBjO1xufTtcblZlY3Rvci5zdWJ0cmFjdCA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgYyA9IGMgPyBjIDogbmV3IFZlY3RvcigpO1xuICBpZiAoYiBpbnN0YW5jZW9mIFZlY3RvcikgeyBjLnggPSBhLnggLSBiLng7IGMueSA9IGEueSAtIGIueTsgYy56ID0gYS56IC0gYi56OyB9XG4gIGVsc2UgeyBjLnggPSBhLnggLSBiOyBjLnkgPSBhLnkgLSBiOyBjLnogPSBhLnogLSBiOyB9XG4gIHJldHVybiBjO1xufTtcblZlY3Rvci5tdWx0aXBseSA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgYyA9IGMgPyBjIDogbmV3IFZlY3RvcigpO1xuICBpZiAoYiBpbnN0YW5jZW9mIFZlY3RvcikgeyBjLnggPSBhLnggKiBiLng7IGMueSA9IGEueSAqIGIueTsgYy56ID0gYS56ICogYi56OyB9XG4gIGVsc2UgeyBjLnggPSBhLnggKiBiOyBjLnkgPSBhLnkgKiBiOyBjLnogPSBhLnogKiBiOyB9XG4gIHJldHVybiBjO1xufTtcblZlY3Rvci5kaXZpZGUgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGlmIChiIGluc3RhbmNlb2YgVmVjdG9yKSB7IGMueCA9IGEueCAvIGIueDsgYy55ID0gYS55IC8gYi55OyBjLnogPSBhLnogLyBiLno7IH1cbiAgZWxzZSB7IGMueCA9IGEueCAvIGI7IGMueSA9IGEueSAvIGI7IGMueiA9IGEueiAvIGI7IH1cbiAgcmV0dXJuIGM7XG59O1xuVmVjdG9yLmNyb3NzID0gZnVuY3Rpb24oYSwgYiwgYykge1xuICBjLnggPSBhLnkgKiBiLnogLSBhLnogKiBiLnk7XG4gIGMueSA9IGEueiAqIGIueCAtIGEueCAqIGIuejtcbiAgYy56ID0gYS54ICogYi55IC0gYS55ICogYi54O1xuICByZXR1cm4gYztcbn07XG5WZWN0b3IudW5pdCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGxlbmd0aCA9IGEubGVuZ3RoKCk7XG4gIGIueCA9IGEueCAvIGxlbmd0aDtcbiAgYi55ID0gYS55IC8gbGVuZ3RoO1xuICBiLnogPSBhLnogLyBsZW5ndGg7XG4gIHJldHVybiBiO1xufTtcblZlY3Rvci5mcm9tQW5nbGVzID0gZnVuY3Rpb24odGhldGEsIHBoaSkge1xuICByZXR1cm4gbmV3IFZlY3RvcihNYXRoLmNvcyh0aGV0YSkgKiBNYXRoLmNvcyhwaGkpLCBNYXRoLnNpbihwaGkpLCBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLmNvcyhwaGkpKTtcbn07XG5WZWN0b3IucmFuZG9tRGlyZWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBWZWN0b3IuZnJvbUFuZ2xlcyhNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDIsIE1hdGguYXNpbihNYXRoLnJhbmRvbSgpICogMiAtIDEpKTtcbn07XG5WZWN0b3IubWluID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gbmV3IFZlY3RvcihNYXRoLm1pbihhLngsIGIueCksIE1hdGgubWluKGEueSwgYi55KSwgTWF0aC5taW4oYS56LCBiLnopKTtcbn07XG5WZWN0b3IubWF4ID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gbmV3IFZlY3RvcihNYXRoLm1heChhLngsIGIueCksIE1hdGgubWF4KGEueSwgYi55KSwgTWF0aC5tYXgoYS56LCBiLnopKTtcbn07XG5WZWN0b3IubGVycCA9IGZ1bmN0aW9uKGEsIGIsIGZyYWN0aW9uKSB7XG4gIHJldHVybiBiLnN1YnRyYWN0KGEpLm11bHRpcGx5KGZyYWN0aW9uKS5hZGQoYSk7XG59O1xuVmVjdG9yLmZyb21BcnJheSA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoYVswXSwgYVsxXSwgYVsyXSk7XG59O1xuVmVjdG9yLmFuZ2xlQmV0d2VlbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEuYW5nbGVUbyhiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBWZWN0b3Jcbn0iLCJjb25zdCBoZWxwZXIgPSByZXF1aXJlKFwianMvc2hhcmVkL2hlbHBlclwiKTtcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoXCJqcy9zaGFyZWQvY29uZmlnXCIpO1xuY29uc3QgVmVjdG9yID0gcmVxdWlyZShcImpzL3NoYXJlZC92ZWN0b3JcIikuVmVjdG9yO1xuY29uc3QgTm9kZSA9IHJlcXVpcmUoXCJqcy9zaGFyZWQvbm9kZVwiKS5Ob2RlO1xuXG52YXIgcnVubmluZyA9IHRydWU7XG52YXIgbm9kZXMgPSBbXTtcbnZhciBsYXN0VGltZSA9IG5ldyBEYXRlKCk7XG52YXIgdHJ1ZVNpbXVsYXRpb25TcGVlZCA9IDA7XG5cbm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS5kYXRhID09PSBcImluaXRcIikge1xuICAgICAgICBpbml0KCk7XG4gICAgfSBlbHNlIGlmIChlLmRhdGEgPT09IFwicnVuXCIpIHtcbiAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgIGRvUGh5c2ljcygpO1xuICAgIH0gZWxzZSBpZiAoZS5kYXRhID09PSBcInBhdXNlXCIpIHtcbiAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoZS5kYXRhID09PSBcInNlbmRcIikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7IG5vZGVzOiBub2RlcywgdHJ1ZVNpbXVsYXRpb25TcGVlZDogdHJ1ZVNpbXVsYXRpb25TcGVlZCB9KTtcbiAgICB9IGVsc2UgaWYgKGUuZGF0YVswXSA9PT0gXCJsb2FkXCIpIHtcbiAgICAgICAgbm9kZXMgPSBKU09OLnBhcnNlKGF0b2IoZS5kYXRhWzFdKSk7XG4gICAgfSBlbHNlIGlmIChlLmRhdGFbMF0gPT09IFwibW92ZVwiKSB7XG4gICAgICAgIHZhciBub2RlID0gaGVscGVyLmdldE5vZGUoZS5kYXRhWzFdLnNlbGVjdGVkTm9kZS5pZCwgbm9kZXMpO1xuICAgICAgICBub2RlLnBvc2l0aW9uID0gbmV3IFZlY3RvcigpLmxvYWQoZS5kYXRhWzFdLm1vdXNlUG9zaXRpb24pO1xuICAgICAgICBub2RlLnZlbG9jaXR5ID0gbmV3IFZlY3RvcigpO1xuICAgICAgICBub2RlLmZvcmNlID0gbmV3IFZlY3RvcigpO1xuICAgIH0gZWxzZSBpZiAoZS5kYXRhWzBdID09PSBcIm5vbW92ZVwiKSB7XG4gICAgICAgIC8vdmFyIG5vZGUgPSBoZWxwZXIuZ2V0Tm9kZShlLmRhdGFbMV0uc2VsZWN0ZWROb2RlLmlkLCBub2Rlcyk7XG4gICAgfSBlbHNlIGlmIChlLmRhdGFbMF0gPT09IFwibmV3YW5jaG9yXCIpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gZS5kYXRhWzFdLm1vdXNlUG9zaXRpb247XG4gICAgICAgIG5vZGVzLnB1c2gobmV3IE5vZGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSwwLDAsMCwwLHRydWUsW10pKTtcbiAgICB9IGVsc2UgaWYgKGUuZGF0YVswXSA9PT0gXCJkZWxldGVub2RlXCIpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBlLmRhdGFbMV0ubm9kZTtcbiAgICAgICAgbm9kZXMgPSBub2Rlcy5maWx0ZXIobj0+bi5pZCAhPT0gbm9kZS5pZCkubWFwKG49PiB7XG4gICAgICAgICAgICBuLmNvbm5lY3RlZE5vZGVzID0gbi5jb25uZWN0ZWROb2Rlcy5maWx0ZXIoY24gPT4gY24gIT09IG5vZGUuaWQpO1xuICAgICAgICAgICAgcmV0dXJuIG5cbiAgICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKGUuZGF0YVswXSA9PT0gXCJhZGRub2Rlc1wiKSB7XG4gICAgICAgIHZhciBuZXdOb2RlcyA9IGUuZGF0YVsxXS5ub2RlcztcbiAgICAgICAgbm9kZXMgPSBub2Rlcy5jb25jYXQobmV3Tm9kZXMpXG4gICAgfVxufTtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB2YXIgeHBvcyA9IDIwMDtcbiAgICB2YXIgeXBvcyA9IDUwO1xuICAgIG5vZGVzLnB1c2gobmV3IE5vZGUoeHBvcywgeXBvcywgMCwgMCwgMCwgMCwgdHJ1ZSwgWzFdKSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBjb25maWcubnVtT2ZOb2RlczsgaSsrKSB7XG4gICAgICAgIHhwb3MgPSB4cG9zICsgY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGg7XG4gICAgICAgIHZhciBjb25uZWN0ZWROb2RlcyA9IFtpIC0gMV07XG4gICAgICAgIGlmIChpIDwgY29uZmlnLm51bU9mTm9kZXMgLSAxKSBjb25uZWN0ZWROb2Rlcy5wdXNoKGkgKyAxKTtcbiAgICAgICAgbm9kZXMucHVzaChuZXcgTm9kZSh4cG9zLCB5cG9zLCAwLCAwLCAwLCAwLCBmYWxzZSwgY29ubmVjdGVkTm9kZXMpKTtcbiAgICB9XG5cbiAgICB2YXIgbGFzdE5vZGUgPSBoZWxwZXIuZ2V0Tm9kZShub2Rlcy5sZW5ndGggLSAxLCBub2Rlcyk7XG4gICAgbGFzdE5vZGUuZml4ZWQgPSB0cnVlO1xuICAgIGxhc3ROb2RlLnBvc2l0aW9uLnggPSAyNjA7XG4gICAgbGFzdE5vZGUucG9zaXRpb24ueSA9IDMwMDtcblxuICAgIHZhciB5aGFuZ25vZGUgPSBuZXcgTm9kZSgyMjAsIDUwLCAwLCAwLCAwLCAwLCB0cnVlLCBbMV0pO1xuICAgIG5vZGVzLnB1c2goeWhhbmdub2RlKTtcblxuICAgIHZhciBub2RlMSA9IGhlbHBlci5nZXROb2RlKDEsIG5vZGVzKTtcbiAgICBub2RlMS5jb25uZWN0ZWROb2Rlcy5wdXNoKHloYW5nbm9kZS5pZCk7XG59XG5cbmZ1bmN0aW9uIGRvUGh5c2ljcygpIHtcbiAgICB2YXIgZGVsdGEgPSAwO1xuICAgIGxhc3RUaW1lID0gc2VsZi5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICBzZXRUaW1lb3V0KHBoeXNpY3MsIDApO1xufVxuXG5mdW5jdGlvbiBnZXRfYShub2RlKSB7XG4gICAgdmFyIHlTcHJpbmdGb3JjZSA9IDA7XG4gICAgdmFyIHhTcHJpbmdGb3JjZSA9IDA7XG4gICAgdmFyIHhWZWxvY2l0eURhbXBpbmdGb3JjZSA9IDA7XG4gICAgdmFyIHlWZWxvY2l0eURhbXBpbmdGb3JjZSA9IDA7XG4gICAgbm9kZS5jb25uZWN0ZWROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGNvbm5lY3RlZE5vZGVJRCkge1xuICAgICAgICB2YXIgY29ubmVjdGVkTm9kZSA9IGhlbHBlci5nZXROb2RlKGNvbm5lY3RlZE5vZGVJRCwgbm9kZXMpO1xuICAgICAgICBpZiAoY29ubmVjdGVkTm9kZSkge1xuICAgICAgICAgICAgdmFyIHN0cmluZ0xlbmd0aCA9IGhlbHBlci5nZXRMZW5ndGgoY29ubmVjdGVkTm9kZSwgbm9kZSk7XG4gICAgICAgICAgICBpZiAoc3RyaW5nTGVuZ3RoID4gY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoRGlmZmVyZW5jZSA9XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZ0xlbmd0aCAtIGNvbmZpZy5ub21pbmFsU3RyaW5nTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHZhciBhbmdsZUZyb21Ib3Jpem9udGFsID0gaGVscGVyLmdldEFuZ2xlRnJvbUhvcml6b250YWwoXG4gICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RlZE5vZGVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHlTcHJpbmdGb3JjZSArPVxuICAgICAgICAgICAgICAgICAgICBNYXRoLnNpbihhbmdsZUZyb21Ib3Jpem9udGFsKSAqXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aERpZmZlcmVuY2UgKlxuICAgICAgICAgICAgICAgICAgICBjb25maWcuc3ByaW5nQ29uc3RhbnQ7XG4gICAgICAgICAgICAgICAgeFNwcmluZ0ZvcmNlICs9XG4gICAgICAgICAgICAgICAgICAgIE1hdGguY29zKGFuZ2xlRnJvbUhvcml6b250YWwpICpcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoRGlmZmVyZW5jZSAqXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5zcHJpbmdDb25zdGFudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHhWZWxvY2l0eURhbXBpbmdGb3JjZSArPVxuICAgICAgICAgICAgICAgIGNvbmZpZy5pbnRlcm5hbFZpc2NvdXNGcmljdGlvbkNvbnN0YW50ICpcbiAgICAgICAgICAgICAgICAobm9kZS52ZWxvY2l0eS54IC0gY29ubmVjdGVkTm9kZS52ZWxvY2l0eS54KTtcbiAgICAgICAgICAgIHlWZWxvY2l0eURhbXBpbmdGb3JjZSArPVxuICAgICAgICAgICAgICAgIGNvbmZpZy5pbnRlcm5hbFZpc2NvdXNGcmljdGlvbkNvbnN0YW50ICpcbiAgICAgICAgICAgICAgICAobm9kZS52ZWxvY2l0eS55IC0gY29ubmVjdGVkTm9kZS52ZWxvY2l0eS55KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gT3RoZXIgZm9yY2VzXG4gICAgdmFyIHlHcmF2Rm9yY2UgPSA5LjggKiBjb25maWcucm9wZVdlaWdodFBlck5vZGU7XG4gICAgdmFyIHhHcmF2Rm9yY2UgPSAwICogY29uZmlnLnJvcGVXZWlnaHRQZXJOb2RlO1xuICAgIHZhciB5VmlzY291c0ZvcmNlID0gbm9kZS52ZWxvY2l0eS55ICogY29uZmlnLnZpc2NvdXNDb25zdGFudDtcbiAgICB2YXIgeFZpc2NvdXNGb3JjZSA9IG5vZGUudmVsb2NpdHkueCAqIGNvbmZpZy52aXNjb3VzQ29uc3RhbnQ7XG5cbiAgICAvLyBUb3RhbCBmb3JjZVxuICAgIG5vZGUuZm9yY2UueSA9XG4gICAgICAgIHlHcmF2Rm9yY2UgKyB5U3ByaW5nRm9yY2UgLSB5VmlzY291c0ZvcmNlIC0geVZlbG9jaXR5RGFtcGluZ0ZvcmNlO1xuICAgIG5vZGUuZm9yY2UueCA9XG4gICAgICAgIHhHcmF2Rm9yY2UgKyB4U3ByaW5nRm9yY2UgLSB4VmlzY291c0ZvcmNlIC0geFZlbG9jaXR5RGFtcGluZ0ZvcmNlO1xuXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IoXG4gICAgICAgIG5vZGUuZm9yY2UueCAvIGNvbmZpZy5yb3BlV2VpZ2h0UGVyTm9kZSxcbiAgICAgICAgbm9kZS5mb3JjZS55IC8gY29uZmlnLnJvcGVXZWlnaHRQZXJOb2RlXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gcGh5c2ljcygpIHtcbiAgICB2YXIgc2ltU3BlZWRRdWFudGl0eSA9IDA7XG4gICAgdmFyIHNpbXVsYXRpb25TcGVlZFN1bSA9IDA7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCAxMDA7IGorKykge1xuICAgICAgICAvLyBUaW1pbmcgYW5kIHNpbXVsYXRpb24gc3BlZWRcbiAgICAgICAgdmFyIG5ld1RpbWUgPSBzZWxmLnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB2YXIgYWN0dWFsRWxhcHNlZE1pbGxpc2Vjb25kcyA9IG5ld1RpbWUgLSBsYXN0VGltZTtcbiAgICAgICAgdmFyIGFjdHVhbEVsYXBzZWRUaW1lID0gYWN0dWFsRWxhcHNlZE1pbGxpc2Vjb25kcyAvIDEwMDA7XG4gICAgICAgIHZhciBlbGFwc2VkTWlsbGlzZWNvbmRzID1cbiAgICAgICAgICAgIGFjdHVhbEVsYXBzZWRNaWxsaXNlY29uZHMgKiBjb25maWcuc2ltdWxhdGlvblNwZWVkO1xuICAgICAgICBpZiAoZWxhcHNlZE1pbGxpc2Vjb25kcyA+IGNvbmZpZy5tYXhTdGVwKSB7XG4gICAgICAgICAgICBlbGFwc2VkVGltZSA9IGNvbmZpZy5tYXhTdGVwIC8gMTAwMDtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICBcIk1heCBzdGVwIGV4Y2VlZGVkLCBzaW11bGF0aW9uIHNwZWVkIG1heSBub3QgYmUgY29ycmVjdC5cIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsYXBzZWRUaW1lID0gZWxhcHNlZE1pbGxpc2Vjb25kcyAvIDEwMDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFjdHVhbFNpbXVsYXRpb25TcGVlZCA9IGVsYXBzZWRUaW1lIC8gYWN0dWFsRWxhcHNlZFRpbWU7XG4gICAgICAgIGlmICghaXNOYU4oYWN0dWFsU2ltdWxhdGlvblNwZWVkKSkge1xuICAgICAgICAgICAgc2ltU3BlZWRRdWFudGl0eSArPSAxO1xuICAgICAgICAgICAgc2ltdWxhdGlvblNwZWVkU3VtICs9IGFjdHVhbFNpbXVsYXRpb25TcGVlZDtcbiAgICAgICAgfVxuICAgICAgICBsYXN0VGltZSA9IG5ld1RpbWU7XG5cbiAgICAgICAgLy8gUGh5c2ljc1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgaWYgKCFub2RlLmZpeGVkKSB7XG4gICAgICAgICAgICAgICAgbm9kZS52ZWxvY2l0eS54ID0gbm9kZS52ZWxvY2l0eS54ICsgKG5vZGUuZm9yY2UueCAvIGNvbmZpZy5yb3BlV2VpZ2h0UGVyTm9kZSAqIGVsYXBzZWRUaW1lIC8gMik7XG4gICAgICAgICAgICAgICAgbm9kZS52ZWxvY2l0eS55ID0gbm9kZS52ZWxvY2l0eS55ICsgKG5vZGUuZm9yY2UueSAvIGNvbmZpZy5yb3BlV2VpZ2h0UGVyTm9kZSAqIGVsYXBzZWRUaW1lIC8gMik7XG5cbiAgICAgICAgICAgICAgICAvLyB4XG4gICAgICAgICAgICAgICAgbm9kZS5wb3NpdGlvbi55ID1cbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wb3NpdGlvbi55ICsgbm9kZS52ZWxvY2l0eS55ICogZWxhcHNlZFRpbWU7XG4gICAgICAgICAgICAgICAgbm9kZS5wb3NpdGlvbi54ID1cbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wb3NpdGlvbi54ICsgbm9kZS52ZWxvY2l0eS54ICogZWxhcHNlZFRpbWU7XG5cbiAgICAgICAgICAgICAgICAvLyB2XG4gICAgICAgICAgICAgICAgZHYgPSBnZXRfYShub2RlKS5tdWx0aXBseShlbGFwc2VkVGltZS8yKTtcbiAgICAgICAgICAgICAgICBub2RlLnZlbG9jaXR5LnggPSBub2RlLnZlbG9jaXR5LnggKyBkdi54O1xuICAgICAgICAgICAgICAgIG5vZGUudmVsb2NpdHkueSA9IG5vZGUudmVsb2NpdHkueSArIGR2Lnk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdHJ1ZVNpbXVsYXRpb25TcGVlZCA9IHNpbXVsYXRpb25TcGVlZFN1bSAvIHNpbVNwZWVkUXVhbnRpdHk7XG4gICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChwaHlzaWNzLCAwKTtcbiAgICB9XG59XG4iXX0=