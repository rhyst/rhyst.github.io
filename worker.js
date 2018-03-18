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
    rope: "rope",
    pause: "pause"
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
        checkConnections();
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

function checkConnections() {
    //TODO: make less bad
    var connectedNodes = nodes;
    nodes.forEach(function (n) {
        n.connectedNodes.forEach(function (cnID) {
            var cn = helper.getNode(cnID, nodes);
            if (cn.connectedNodes.indexOf(n.id) < 0) {
                connectedNodes = connectedNodes.map(function (node) {
                    if (node.id === cnID) {
                        node.connectedNodes.push(n.id);
                    }
                    return node;
                });
            }
        });
    });
    nodes = connectedNodes;
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


//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9qcy9zaGFyZWQvY29uZmlnLmpzIiwiYXBwL2pzL3NoYXJlZC9jb25zdGFudHMuanMiLCJhcHAvanMvc2hhcmVkL2hlbHBlci5qcyIsImFwcC9qcy9zaGFyZWQvbm9kZS5qcyIsImFwcC9qcy9zaGFyZWQvdmVjdG9yLmpzIiwiYXBwL2pzL3dvcmtlci93b3JrZXIuanMiXSwibmFtZXMiOlsibWV0cmUiLCJudW1PZk5vZGVzIiwibm9taW5hbFN0cmluZ0xlbmd0aCIsInNwcmluZ0NvbnN0YW50IiwiaW50ZXJuYWxWaXNjb3VzRnJpY3Rpb25Db25zdGFudCIsInZpc2NvdXNDb25zdGFudCIsInNpbXVsYXRpb25TcGVlZCIsIm1heFN0ZXAiLCJkYW5nZXJGb3JjZU1heCIsImRhbmdlckZvcmNlTWluIiwicm9wZVdlaWdodFBlck1ldHJlIiwicm9wZVdlaWdodFBlck5vZGUiLCJtb2R1bGUiLCJleHBvcnRzIiwiQ29udHJvbHNFbnVtIiwiT2JqZWN0IiwiZnJlZXplIiwicGFuIiwiZ3JhYiIsImFuY2hvciIsImVyYXNlIiwicm9wZSIsInBhdXNlIiwiY29uZmlnIiwicmVxdWlyZSIsImdldE5vZGUiLCJpZCIsIm5vZGVzIiwiZmluZCIsIm5vZGUiLCJnZXRMZW5ndGgiLCJub2RlMSIsIm5vZGUyIiwieGRpZmYiLCJNYXRoIiwiYWJzIiwicG9zaXRpb24iLCJ4IiwieWRpZmYiLCJ5Iiwic3FydCIsImdldE1pZHBvaW50IiwiZ2V0QW5nbGVGcm9tSG9yaXpvbnRhbCIsImF0YW4yIiwiZ2V0Rm9yY2UiLCJzdHJpbmdMZW5ndGgiLCJsZW5ndGhEaWZmZXJlbmNlIiwiYW5nbGVGcm9tSG9yaXpvbnRhbCIsInlTcHJpbmdGb3JjZSIsInNpbiIsInhTcHJpbmdGb3JjZSIsImNvcyIsInRvdGFsU3ByaW5nRm9yY2UiLCJ0b3RhbCIsIlZlY3RvciIsInVuaXF1ZWlkIiwiZ2V0SUQiLCJOb2RlIiwidngiLCJ2eSIsImZ4IiwiZnkiLCJmaXhlZCIsImNvbm5lY3RlZE5vZGVzIiwidmVsb2NpdHkiLCJmb3JjZSIsIm5vZGVPYmplY3QiLCJ6IiwicHJvdG90eXBlIiwibG9hZCIsInZlY3RvciIsIm5lZ2F0aXZlIiwiYWRkIiwidiIsInN1YnRyYWN0IiwibXVsdGlwbHkiLCJkaXZpZGUiLCJlcXVhbHMiLCJkb3QiLCJjcm9zcyIsImxlbmd0aCIsInVuaXQiLCJtaW4iLCJtYXgiLCJ0b0FuZ2xlcyIsInRoZXRhIiwicGhpIiwiYXNpbiIsImFuZ2xlVG8iLCJhIiwiYWNvcyIsInRvQXJyYXkiLCJuIiwic2xpY2UiLCJjbG9uZSIsImluaXQiLCJiIiwiYyIsImZyb21BbmdsZXMiLCJyYW5kb21EaXJlY3Rpb24iLCJyYW5kb20iLCJQSSIsImxlcnAiLCJmcmFjdGlvbiIsImZyb21BcnJheSIsImFuZ2xlQmV0d2VlbiIsImhlbHBlciIsInJ1bm5pbmciLCJsYXN0VGltZSIsIkRhdGUiLCJ0cnVlU2ltdWxhdGlvblNwZWVkIiwib25tZXNzYWdlIiwiZSIsImRhdGEiLCJkb1BoeXNpY3MiLCJwb3N0TWVzc2FnZSIsIkpTT04iLCJwYXJzZSIsImF0b2IiLCJzZWxlY3RlZE5vZGUiLCJtb3VzZVBvc2l0aW9uIiwicHVzaCIsImZpbHRlciIsIm1hcCIsImNuIiwibmV3Tm9kZXMiLCJjb25jYXQiLCJjaGVja0Nvbm5lY3Rpb25zIiwieHBvcyIsInlwb3MiLCJpIiwibGFzdE5vZGUiLCJ5aGFuZ25vZGUiLCJmb3JFYWNoIiwiY25JRCIsImluZGV4T2YiLCJkZWx0YSIsInNlbGYiLCJwZXJmb3JtYW5jZSIsIm5vdyIsInNldFRpbWVvdXQiLCJwaHlzaWNzIiwiZ2V0X2EiLCJ4VmVsb2NpdHlEYW1waW5nRm9yY2UiLCJ5VmVsb2NpdHlEYW1waW5nRm9yY2UiLCJjb25uZWN0ZWROb2RlSUQiLCJjb25uZWN0ZWROb2RlIiwieUdyYXZGb3JjZSIsInhHcmF2Rm9yY2UiLCJ5VmlzY291c0ZvcmNlIiwieFZpc2NvdXNGb3JjZSIsInNpbVNwZWVkUXVhbnRpdHkiLCJzaW11bGF0aW9uU3BlZWRTdW0iLCJqIiwibmV3VGltZSIsImFjdHVhbEVsYXBzZWRNaWxsaXNlY29uZHMiLCJhY3R1YWxFbGFwc2VkVGltZSIsImVsYXBzZWRNaWxsaXNlY29uZHMiLCJlbGFwc2VkVGltZSIsImNvbnNvbGUiLCJ3YXJuIiwiYWN0dWFsU2ltdWxhdGlvblNwZWVkIiwiaXNOYU4iLCJkdiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLFFBQVEsRUFBWixDLENBQWdCO0FBQ2hCLElBQUlDLGFBQWEsRUFBakI7QUFDQSxJQUFJQyxzQkFBc0IsRUFBMUIsQyxDQUE4QjtBQUM5QixJQUFJQyxpQkFBaUIsRUFBckI7QUFDQSxJQUFJQyxrQ0FBa0MsQ0FBdEM7QUFDQSxJQUFJQyxrQkFBa0IsT0FBdEI7QUFDQSxJQUFJQyxrQkFBa0IsQ0FBdEIsQyxDQUF5QjtBQUN6QixJQUFJQyxVQUFVLEVBQWQsQyxDQUFrQjtBQUNsQixJQUFJQyxpQkFBaUIsR0FBckIsQyxDQUF5QjtBQUN6QixJQUFJQyxpQkFBaUIsQ0FBckIsQyxDQUF1QjtBQUN2QixJQUFJQyxxQkFBcUIsQ0FBekI7QUFDQSxJQUFJQyxvQkFBb0JULHNCQUFzQkYsS0FBdEIsR0FBOEJVLGtCQUF0RDs7QUFFQUUsT0FBT0MsT0FBUCxHQUFpQjtBQUNiYixnQkFEYTtBQUViQywwQkFGYTtBQUdiQyw0Q0FIYTtBQUliQyxrQ0FKYTtBQUtiQyxvRUFMYTtBQU1iQyxvQ0FOYTtBQU9iQyxvQ0FQYTtBQVFiQyxvQkFSYTtBQVNiQyxrQ0FUYTtBQVViQyxrQ0FWYTtBQVdiQywwQ0FYYTtBQVliQztBQVphLENBQWpCOzs7Ozs7OztBQ2JPLElBQU1HLHNDQUFlQyxPQUFPQyxNQUFQLENBQWM7QUFDdENDLFNBQVEs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R0FBMENtSixXQUExQyxHQUF3RCxDQUE3Rjs7QUFFQTtBQUNBakkscUJBQUtPLFFBQUwsQ0FBY0csQ0FBZCxHQUNJVixLQUFLTyxRQUFMLENBQWNHLENBQWQsR0FBa0JWLEtBQUttQyxRQUFMLENBQWN6QixDQUFkLEdBQWtCdUgsV0FEeEM7QUFFQWpJLHFCQUFLTyxRQUFMLENBQWNDLENBQWQsR0FDSVIsS0FBS08sUUFBTCxDQUFjQyxDQUFkLEdBQWtCUixLQUFLbUMsUUFBTCxDQUFjM0IsQ0FBZCxHQUFrQnlILFdBRHhDOztBQUdBO0FBQ0FLLHFCQUFLckIsTUFBTWpILElBQU4sRUFBWThDLFFBQVosQ0FBcUJtRixjQUFZLENBQWpDLENBQUw7QUFDQWpJLHFCQUFLbUMsUUFBTCxDQUFjM0IsQ0FBZCxHQUFrQlIsS0FBS21DLFFBQUwsQ0FBYzNCLENBQWQsR0FBa0I4SCxHQUFHOUgsQ0FBdkM7QUFDQVIscUJBQUttQyxRQUFMLENBQWN6QixDQUFkLEdBQWtCVixLQUFLbUMsUUFBTCxDQUFjekIsQ0FBZCxHQUFrQjRILEdBQUc1SCxDQUF2QztBQUNIO0FBQ0o7QUFDSjtBQUNEdUUsMEJBQXNCMEMscUJBQXFCRCxnQkFBM0M7QUFDQSxRQUFJNUMsT0FBSixFQUFhO0FBQ1RpQyxtQkFBV0MsT0FBWCxFQUFvQixDQUFwQjtBQUNIO0FBQ0oiLCJmaWxlIjoicHVibGljL3dvcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBtZXRyZSA9IDEwOyAvL3BpeGVsc1xudmFyIG51bU9mTm9kZXMgPSA0MDtcbnZhciBub21pbmFsU3RyaW5nTGVuZ3RoID0gMTA7IC8vIHBpeGVsc1xudmFyIHNwcmluZ0NvbnN0YW50ID0gMjU7XG52YXIgaW50ZXJuYWxWaXNjb3VzRnJpY3Rpb25Db25zdGFudCA9IDg7XG52YXIgdmlzY291c0NvbnN0YW50ID0gMC4wMDAwMjtcbnZhciBzaW11bGF0aW9uU3BlZWQgPSA0OyAvLyB0aW1lcyByZWFsIHRpbWVcbnZhciBtYXhTdGVwID0gNTA7IC8vIG1pbGxpc2Vjb25kc1xudmFyIGRhbmdlckZvcmNlTWF4ID0gMTUwOy8vMjUwMDA7XG52YXIgZGFuZ2VyRm9yY2VNaW4gPSAwOy8vMTAwMDA7XG52YXIgcm9wZVdlaWdodFBlck1ldHJlID0gMTtcbnZhciByb3BlV2VpZ2h0UGVyTm9kZSA9IG5vbWluYWxTdHJpbmdMZW5ndGggLyBtZXRyZSAqIHJvcGVXZWlnaHRQZXJNZXRyZTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWV0cmUsXG4gICAgbnVtT2ZOb2RlcyxcbiAgICBub21pbmFsU3RyaW5nTGVuZ3RoLFxuICAgIHNwcmluZ0NvbnN0YW50LFxuICAgIGludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQsXG4gICAgdmlzY291c0NvbnN0YW50LFxuICAgIHNpbXVsYXRpb25TcGVlZCxcbiAgICBtYXhTdGVwLFxuICAgIGRhbmdlckZvcmNlTWF4LFxuICAgIGRhbmdlckZvcmNlTWluLFxuICAgIHJvcGVXZWlnaHRQZXJNZXRyZSxcbiAgICByb3BlV2VpZ2h0UGVyTm9kZVxufTtcbiIsImV4cG9ydCBjb25zdCBDb250cm9sc0VudW0gPSBPYmplY3QuZnJlZXplKHtcbiAgICBwYW46ICAgIFwicGFuXCIsXG4gICAgZ3JhYjogICBcImdyYWJcIixcbiAgICBhbmNob3I6IFwiYW5jaG9yXCIsXG4gICAgZXJhc2U6ICBcImVyYXNlXCIsXG4gICAgcm9wZTogICBcInJvcGVcIixcbiAgICBwYXVzZTogIFwicGF1c2VcIixcbn0pOyIsImNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2pzL3NoYXJlZC9jb25maWcnKTtcblxuZnVuY3Rpb24gZ2V0Tm9kZShpZCwgbm9kZXMpIHtcbiAgICByZXR1cm4gbm9kZXMuZmluZChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5pZCA9PT0gaWQ7XG4gICAgfSlcbn1cbmZ1bmN0aW9uIGdldExlbmd0aChub2RlMSwgbm9kZTIpIHtcbiAgICB2YXIgeGRpZmYgPSBNYXRoLmFicyhub2RlMS5wb3NpdGlvbi54IC0gbm9kZTIucG9zaXRpb24ueCk7XG4gICAgdmFyIHlkaWZmID0gTWF0aC5hYnMobm9kZTEucG9zaXRpb24ueSAtIG5vZGUyLnBvc2l0aW9uLnkpO1xuICAgIHJldHVybiBNYXRoLnNxcnQoKHhkaWZmICogeGRpZmYpICsgKHlkaWZmICogeWRpZmYpKTtcbn1cbmZ1bmN0aW9uIGdldE1pZHBvaW50KG5vZGUxLCBub2RlMikge1xuICAgIHJldHVybiB7IHg6IChub2RlMS5wb3NpdGlvbi54ICsgbm9kZTIucG9zaXRpb24ueCkgLyAyLCB5OiAobm9kZTEucG9zaXRpb24ueSArIG5vZGUyLnBvc2l0aW9uLnkpIC8gMiB9XG59XG5mdW5jdGlvbiBnZXRBbmdsZUZyb21Ib3Jpem9udGFsKG5vZGUxLCBub2RlMikge1xuICAgIHJldHVybiBNYXRoLmF0YW4yKG5vZGUyLnBvc2l0aW9uLnkgLSBub2RlMS5wb3NpdGlvbi55LCBub2RlMi5wb3NpdGlvbi54IC0gbm9kZTEucG9zaXRpb24ueClcbn1cblxuZnVuY3Rpb24gZ2V0Rm9yY2Uobm9kZTEsIG5vZGUyKSB7XG4gICAgdmFyIHN0cmluZ0xlbmd0aCA9IGdldExlbmd0aChub2RlMSwgbm9kZTIpO1xuICAgIHZhciBsZW5ndGhEaWZmZXJlbmNlID0gc3RyaW5nTGVuZ3RoIC0gY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGg7XG4gICAgdmFyIGFuZ2xlRnJvbUhvcml6b250YWwgPSBnZXRBbmdsZUZyb21Ib3Jpem9udGFsKG5vZGUxLCBub2RlMik7XG4gICAgdmFyIHlTcHJpbmdGb3JjZSA9IE1hdGguc2luKGFuZ2xlRnJvbUhvcml6b250YWwpICogbGVuZ3RoRGlmZmVyZW5jZSAqIGNvbmZpZy5zcHJpbmdDb25zdGFudDtcbiAgICB2YXIgeFNwcmluZ0ZvcmNlID0gTWF0aC5jb3MoYW5nbGVGcm9tSG9yaXpvbnRhbCkgKiBsZW5ndGhEaWZmZXJlbmNlICogY29uZmlnLnNwcmluZ0NvbnN0YW50O1xuICAgIHZhciB0b3RhbFNwcmluZ0ZvcmNlID0gTWF0aC5zcXJ0KCh5U3ByaW5nRm9yY2UqeVNwcmluZ0ZvcmNlKSsoeFNwcmluZ0ZvcmNlK3hTcHJpbmdGb3JjZSkpO1xuICAgIHJldHVybiB7dG90YWw6IHRvdGFsU3ByaW5nRm9yY2UsIHg6IHhTcHJpbmdGb3JjZSwgeTogeVNwcmluZ0ZvcmNlfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRBbmdsZUZyb21Ib3Jpem9udGFsLFxuICAgIGdldEZvcmNlLFxuICAgIGdldExlbmd0aCxcbiAgICBnZXRNaWRwb2ludCxcbiAgICBnZXROb2RlXG59IiwiY29uc3QgVmVjdG9yID0gcmVxdWlyZSgnanMvc2hhcmVkL3ZlY3RvcicpLlZlY3RvcjtcblxudmFyIHVuaXF1ZWlkID0gLTE7XG5mdW5jdGlvbiBnZXRJRCgpIHtcbiAgICB1bmlxdWVpZCArPSAxO1xuICAgIHJldHVybiB1bmlxdWVpZDtcbn1cblxuY2xhc3MgTm9kZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHggPSAwLFxuICAgICAgICB5ID0gMCxcbiAgICAgICAgdnggPSAwLFxuICAgICAgICB2eSA9IDAsXG4gICAgICAgIGZ4ID0gMCxcbiAgICAgICAgZnkgPSAwLFxuICAgICAgICBmaXhlZCA9IGZhbHNlLFxuICAgICAgICBjb25uZWN0ZWROb2RlcyA9IFtdLFxuICAgICAgICBpZFxuICAgICkge1xuICAgICAgICB0aGlzLmlkID0gaWQgPyBpZCA6IGdldElEKCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yKHgsIHkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFZlY3Rvcih2eCwgdnkpO1xuICAgICAgICB0aGlzLmZvcmNlID0gbmV3IFZlY3RvcihmeCwgZnkpO1xuICAgICAgICB0aGlzLmZpeGVkID0gZml4ZWQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkTm9kZXMgPSBjb25uZWN0ZWROb2RlcztcbiAgICB9XG4gICAgZ2V0T2JqZWN0KCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvbixcbiAgICAgICAgICAgIHZlbG9jaXR5OiB0aGlzLnZlbG9jaXR5LFxuICAgICAgICAgICAgZm9yY2U6IHRoaXMuZm9yY2UsXG4gICAgICAgICAgICBmaXhlZDogdGhpcy5maXhlZCxcbiAgICAgICAgICAgIGNvbm5lY3RlZE5vZGVzOiB0aGlzLmNvbm5lY3RlZE5vZGVzXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxvYWRPYmplY3Qobm9kZU9iamVjdCA9IHt9KSB7XG4gICAgICAgIHRoaXMuaWQgPSBub2RlT2JqZWN0LmlkID8gbm9kZU9iamVjdC5pZCA6IHRoaXMuaWQ7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBub2RlT2JqZWN0LnBvc2l0aW9uIHx8IHRoaXMucG9zaXRpb247XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBub2RlT2JqZWN0LnZlbG9jaXR5IHx8IHRoaXMudmVsb2NpdHk7XG4gICAgICAgIHRoaXMuZm9yY2UgPSBub2RlT2JqZWN0LmZvcmNlIHx8IHRoaXMuZm9yY2U7XG4gICAgICAgIHRoaXMuZml4ZWQgPSBub2RlT2JqZWN0LmZpeGVkIHx8IHRoaXMuZml4ZWQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkTm9kZXMgPSBub2RlT2JqZWN0LmNvbm5lY3RlZE5vZGVzIHx8IHRoaXMuY29ubmVjdGVkTm9kZXM7XG4gICAgfVxuICAgIGNvcHlOb2RlKCkge1xuICAgICAgICByZXR1cm4gbmV3IE5vZGUoXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLngsXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnksXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LngsXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnksXG4gICAgICAgICAgICB0aGlzLmZvcmNlLngsXG4gICAgICAgICAgICB0aGlzLmZvcmNlLnksXG4gICAgICAgICAgICB0aGlzLmZpeGVkLFxuICAgICAgICAgICAgdGhpcy5jb25uZWN0ZWROb2RlcyxcbiAgICAgICAgICAgIHRoaXMuaWRcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIE5vZGVcbn07XG4iLCIvLyBQcm92aWRlcyBhIHNpbXBsZSAzRCB2ZWN0b3IgY2xhc3MuIFZlY3RvciBvcGVyYXRpb25zIGNhbiBiZSBkb25lIHVzaW5nIG1lbWJlclxuLy8gZnVuY3Rpb25zLCB3aGljaCByZXR1cm4gbmV3IHZlY3RvcnMsIG9yIHN0YXRpYyBmdW5jdGlvbnMsIHdoaWNoIHJldXNlXG4vLyBleGlzdGluZyB2ZWN0b3JzIHRvIGF2b2lkIGdlbmVyYXRpbmcgZ2FyYmFnZS5cbmZ1bmN0aW9uIFZlY3Rvcih4LCB5LCB6KSB7XG4gIHRoaXMueCA9IHggfHwgMDtcbiAgdGhpcy55ID0geSB8fCAwO1xuICB0aGlzLnogPSB6IHx8IDA7XG59XG5cbi8vICMjIyBJbnN0YW5jZSBNZXRob2RzXG4vLyBUaGUgbWV0aG9kcyBgYWRkKClgLCBgc3VidHJhY3QoKWAsIGBtdWx0aXBseSgpYCwgYW5kIGBkaXZpZGUoKWAgY2FuIGFsbFxuLy8gdGFrZSBlaXRoZXIgYSB2ZWN0b3Igb3IgYSBudW1iZXIgYXMgYW4gYXJndW1lbnQuXG5WZWN0b3IucHJvdG90eXBlID0ge1xuICBsb2FkOiBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih2ZWN0b3IueCB8fCAwLCB2ZWN0b3IueSB8fCAwLCB2ZWN0b3IueiB8fCAwKTtcbiAgfSxcbiAgbmVnYXRpdmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKC10aGlzLngsIC10aGlzLnksIC10aGlzLnopO1xuICB9LFxuICBhZGQ6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKyB2LCB0aGlzLnkgKyB2LCB0aGlzLnogKyB2KTtcbiAgfSxcbiAgc3VidHJhY3Q6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggLSB2LCB0aGlzLnkgLSB2LCB0aGlzLnogLSB2KTtcbiAgfSxcbiAgbXVsdGlwbHk6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKiB2LCB0aGlzLnkgKiB2LCB0aGlzLnogKiB2KTtcbiAgfSxcbiAgZGl2aWRlOiBmdW5jdGlvbih2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBWZWN0b3IpIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAvIHYueCwgdGhpcy55IC8gdi55LCB0aGlzLnogLyB2LnopO1xuICAgIGVsc2UgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gdiwgdGhpcy55IC8gdiwgdGhpcy56IC8gdik7XG4gIH0sXG4gIGVxdWFsczogZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggPT0gdi54ICYmIHRoaXMueSA9PSB2LnkgJiYgdGhpcy56ID09IHYuejtcbiAgfSxcbiAgZG90OiBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHRoaXMueiAqIHYuejtcbiAgfSxcbiAgY3Jvc3M6IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgIHRoaXMueSAqIHYueiAtIHRoaXMueiAqIHYueSxcbiAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcbiAgICAgIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueFxuICAgICk7XG4gIH0sXG4gIGxlbmd0aDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRvdCh0aGlzKSk7XG4gIH0sXG4gIHVuaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRpdmlkZSh0aGlzLmxlbmd0aCgpKTtcbiAgfSxcbiAgbWluOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5taW4odGhpcy54LCB0aGlzLnkpLCB0aGlzLnopO1xuICB9LFxuICBtYXg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLm1heChNYXRoLm1heCh0aGlzLngsIHRoaXMueSksIHRoaXMueik7XG4gIH0sXG4gIHRvQW5nbGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGhldGE6IE1hdGguYXRhbjIodGhpcy56LCB0aGlzLngpLFxuICAgICAgcGhpOiBNYXRoLmFzaW4odGhpcy55IC8gdGhpcy5sZW5ndGgoKSlcbiAgICB9O1xuICB9LFxuICBhbmdsZVRvOiBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIE1hdGguYWNvcyh0aGlzLmRvdChhKSAvICh0aGlzLmxlbmd0aCgpICogYS5sZW5ndGgoKSkpO1xuICB9LFxuICB0b0FycmF5OiBmdW5jdGlvbihuKSB7XG4gICAgcmV0dXJuIFt0aGlzLngsIHRoaXMueSwgdGhpcy56XS5zbGljZSgwLCBuIHx8IDMpO1xuICB9LFxuICBjbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnksIHRoaXMueik7XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgICB0aGlzLnggPSB4OyB0aGlzLnkgPSB5OyB0aGlzLnogPSB6O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG4vLyAjIyMgU3RhdGljIE1ldGhvZHNcbi8vIGBWZWN0b3IucmFuZG9tRGlyZWN0aW9uKClgIHJldHVybnMgYSB2ZWN0b3Igd2l0aCBhIGxlbmd0aCBvZiAxIGFuZCBhXG4vLyBzdGF0aXN0aWNhbGx5IHVuaWZvcm0gZGlyZWN0aW9uLiBgVmVjdG9yLmxlcnAoKWAgcGVyZm9ybXMgbGluZWFyXG4vLyBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlY3RvcnMuXG5WZWN0b3IubmVnYXRpdmUgPSBmdW5jdGlvbihhLCBiKSB7XG4gIGIueCA9IC1hLng7IGIueSA9IC1hLnk7IGIueiA9IC1hLno7XG4gIHJldHVybiBiO1xufTtcblZlY3Rvci5hZGQgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54ICsgYi54OyBjLnkgPSBhLnkgKyBiLnk7IGMueiA9IGEueiArIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54ICsgYjsgYy55ID0gYS55ICsgYjsgYy56ID0gYS56ICsgYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3Iuc3VidHJhY3QgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54IC0gYi54OyBjLnkgPSBhLnkgLSBiLnk7IGMueiA9IGEueiAtIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54IC0gYjsgYy55ID0gYS55IC0gYjsgYy56ID0gYS56IC0gYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3IubXVsdGlwbHkgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54ICogYi54OyBjLnkgPSBhLnkgKiBiLnk7IGMueiA9IGEueiAqIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54ICogYjsgYy55ID0gYS55ICogYjsgYy56ID0gYS56ICogYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3IuZGl2aWRlID0gZnVuY3Rpb24oYSwgYiwgYykge1xuICBpZiAoYiBpbnN0YW5jZW9mIFZlY3RvcikgeyBjLnggPSBhLnggLyBiLng7IGMueSA9IGEueSAvIGIueTsgYy56ID0gYS56IC8gYi56OyB9XG4gIGVsc2UgeyBjLnggPSBhLnggLyBiOyBjLnkgPSBhLnkgLyBiOyBjLnogPSBhLnogLyBiOyB9XG4gIHJldHVybiBjO1xufTtcblZlY3Rvci5jcm9zcyA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgYy54ID0gYS55ICogYi56IC0gYS56ICogYi55O1xuICBjLnkgPSBhLnogKiBiLnggLSBhLnggKiBiLno7XG4gIGMueiA9IGEueCAqIGIueSAtIGEueSAqIGIueDtcbiAgcmV0dXJuIGM7XG59O1xuVmVjdG9yLnVuaXQgPSBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBsZW5ndGggPSBhLmxlbmd0aCgpO1xuICBiLnggPSBhLnggLyBsZW5ndGg7XG4gIGIueSA9IGEueSAvIGxlbmd0aDtcbiAgYi56ID0gYS56IC8gbGVuZ3RoO1xuICByZXR1cm4gYjtcbn07XG5WZWN0b3IuZnJvbUFuZ2xlcyA9IGZ1bmN0aW9uKHRoZXRhLCBwaGkpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5jb3ModGhldGEpICogTWF0aC5jb3MocGhpKSwgTWF0aC5zaW4ocGhpKSwgTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSk7XG59O1xuVmVjdG9yLnJhbmRvbURpcmVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gVmVjdG9yLmZyb21BbmdsZXMoTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyLCBNYXRoLmFzaW4oTWF0aC5yYW5kb20oKSAqIDIgLSAxKSk7XG59O1xuVmVjdG9yLm1pbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5taW4oYS54LCBiLngpLCBNYXRoLm1pbihhLnksIGIueSksIE1hdGgubWluKGEueiwgYi56KSk7XG59O1xuVmVjdG9yLm1heCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5tYXgoYS54LCBiLngpLCBNYXRoLm1heChhLnksIGIueSksIE1hdGgubWF4KGEueiwgYi56KSk7XG59O1xuVmVjdG9yLmxlcnAgPSBmdW5jdGlvbihhLCBiLCBmcmFjdGlvbikge1xuICByZXR1cm4gYi5zdWJ0cmFjdChhKS5tdWx0aXBseShmcmFjdGlvbikuYWRkKGEpO1xufTtcblZlY3Rvci5mcm9tQXJyYXkgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBuZXcgVmVjdG9yKGFbMF0sIGFbMV0sIGFbMl0pO1xufTtcblZlY3Rvci5hbmdsZUJldHdlZW4gPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhLmFuZ2xlVG8oYik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVmVjdG9yXG59IiwiY29uc3QgaGVscGVyID0gcmVxdWlyZShcImpzL3NoYXJlZC9oZWxwZXJcIik7XG5jb25zdCBjb25maWcgPSByZXF1aXJlKFwianMvc2hhcmVkL2NvbmZpZ1wiKTtcbmNvbnN0IFZlY3RvciA9IHJlcXVpcmUoXCJqcy9zaGFyZWQvdmVjdG9yXCIpLlZlY3RvcjtcbmNvbnN0IE5vZGUgPSByZXF1aXJlKFwianMvc2hhcmVkL25vZGVcIikuTm9kZTtcblxudmFyIHJ1bm5pbmcgPSB0cnVlO1xudmFyIG5vZGVzID0gW107XG52YXIgbGFzdFRpbWUgPSBuZXcgRGF0ZSgpO1xudmFyIHRydWVTaW11bGF0aW9uU3BlZWQgPSAwO1xuXG5vbm1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUuZGF0YSA9PT0gXCJpbml0XCIpIHtcbiAgICAgICAgaW5pdCgpO1xuICAgIH0gZWxzZSBpZiAoZS5kYXRhID09PSBcInJ1blwiKSB7XG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBkb1BoeXNpY3MoKTtcbiAgICB9IGVsc2UgaWYgKGUuZGF0YSA9PT0gXCJwYXVzZVwiKSB7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGUuZGF0YSA9PT0gXCJzZW5kXCIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2UoeyBub2Rlczogbm9kZXMsIHRydWVTaW11bGF0aW9uU3BlZWQ6IHRydWVTaW11bGF0aW9uU3BlZWQgfSk7XG4gICAgfSBlbHNlIGlmIChlLmRhdGFbMF0gPT09IFwibG9hZFwiKSB7XG4gICAgICAgIG5vZGVzID0gSlNPTi5wYXJzZShhdG9iKGUuZGF0YVsxXSkpO1xuICAgIH0gZWxzZSBpZiAoZS5kYXRhWzBdID09PSBcIm1vdmVcIikge1xuICAgICAgICB2YXIgbm9kZSA9IGhlbHBlci5nZXROb2RlKGUuZGF0YVsxXS5zZWxlY3RlZE5vZGUuaWQsIG5vZGVzKTtcbiAgICAgICAgbm9kZS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoKS5sb2FkKGUuZGF0YVsxXS5tb3VzZVBvc2l0aW9uKTtcbiAgICAgICAgbm9kZS52ZWxvY2l0eSA9IG5ldyBWZWN0b3IoKTtcbiAgICAgICAgbm9kZS5mb3JjZSA9IG5ldyBWZWN0b3IoKTtcbiAgICB9IGVsc2UgaWYgKGUuZGF0YVswXSA9PT0gXCJub21vdmVcIikge1xuICAgICAgICAvL3ZhciBub2RlID0gaGVscGVyLmdldE5vZGUoZS5kYXRhWzFdLnNlbGVjdGVkTm9kZS5pZCwgbm9kZXMpO1xuICAgIH0gZWxzZSBpZiAoZS5kYXRhWzBdID09PSBcIm5ld2FuY2hvclwiKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbiA9IGUuZGF0YVsxXS5tb3VzZVBvc2l0aW9uO1xuICAgICAgICBub2Rlcy5wdXNoKG5ldyBOb2RlKHBvc2l0aW9uLngsIHBvc2l0aW9uLnksMCwwLDAsMCx0cnVlLFtdKSk7XG4gICAgfSBlbHNlIGlmIChlLmRhdGFbMF0gPT09IFwiZGVsZXRlbm9kZVwiKSB7XG4gICAgICAgIHZhciBub2RlID0gZS5kYXRhWzFdLm5vZGU7XG4gICAgICAgIG5vZGVzID0gbm9kZXMuZmlsdGVyKG49Pm4uaWQgIT09IG5vZGUuaWQpLm1hcChuPT4ge1xuICAgICAgICAgICAgbi5jb25uZWN0ZWROb2RlcyA9IG4uY29ubmVjdGVkTm9kZXMuZmlsdGVyKGNuID0+IGNuICE9PSBub2RlLmlkKTtcbiAgICAgICAgICAgIHJldHVybiBuXG4gICAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChlLmRhdGFbMF0gPT09IFwiYWRkbm9kZXNcIikge1xuICAgICAgICB2YXIgbmV3Tm9kZXMgPSBlLmRhdGFbMV0ubm9kZXM7XG4gICAgICAgIG5vZGVzID0gbm9kZXMuY29uY2F0KG5ld05vZGVzKVxuICAgICAgICBjaGVja0Nvbm5lY3Rpb25zKCk7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB2YXIgeHBvcyA9IDIwMDtcbiAgICB2YXIgeXBvcyA9IDUwO1xuICAgIG5vZGVzLnB1c2gobmV3IE5vZGUoeHBvcywgeXBvcywgMCwgMCwgMCwgMCwgdHJ1ZSwgWzFdKSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBjb25maWcubnVtT2ZOb2RlczsgaSsrKSB7XG4gICAgICAgIHhwb3MgPSB4cG9zICsgY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGg7XG4gICAgICAgIHZhciBjb25uZWN0ZWROb2RlcyA9IFtpIC0gMV07XG4gICAgICAgIGlmIChpIDwgY29uZmlnLm51bU9mTm9kZXMgLSAxKSBjb25uZWN0ZWROb2Rlcy5wdXNoKGkgKyAxKTtcbiAgICAgICAgbm9kZXMucHVzaChuZXcgTm9kZSh4cG9zLCB5cG9zLCAwLCAwLCAwLCAwLCBmYWxzZSwgY29ubmVjdGVkTm9kZXMpKTtcbiAgICB9XG5cbiAgICB2YXIgbGFzdE5vZGUgPSBoZWxwZXIuZ2V0Tm9kZShub2Rlcy5sZW5ndGggLSAxLCBub2Rlcyk7XG4gICAgbGFzdE5vZGUuZml4ZWQgPSB0cnVlO1xuICAgIGxhc3ROb2RlLnBvc2l0aW9uLnggPSAyNjA7XG4gICAgbGFzdE5vZGUucG9zaXRpb24ueSA9IDMwMDtcblxuICAgIHZhciB5aGFuZ25vZGUgPSBuZXcgTm9kZSgyMjAsIDUwLCAwLCAwLCAwLCAwLCB0cnVlLCBbMV0pO1xuICAgIG5vZGVzLnB1c2goeWhhbmdub2RlKTtcblxuICAgIHZhciBub2RlMSA9IGhlbHBlci5nZXROb2RlKDEsIG5vZGVzKTtcbiAgICBub2RlMS5jb25uZWN0ZWROb2Rlcy5wdXNoKHloYW5nbm9kZS5pZCk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrQ29ubmVjdGlvbnMoKSB7XG4gICAgLy9UT0RPOiBtYWtlIGxlc3MgYmFkXG4gICAgbGV0IGNvbm5lY3RlZE5vZGVzID0gbm9kZXNcbiAgICBub2Rlcy5mb3JFYWNoKG4gPT4ge1xuICAgICAgICBuLmNvbm5lY3RlZE5vZGVzLmZvckVhY2goY25JRCA9PiB7XG4gICAgICAgICAgICBsZXQgY24gPSBoZWxwZXIuZ2V0Tm9kZShjbklELCBub2Rlcyk7XG4gICAgICAgICAgICBpZiAoY24uY29ubmVjdGVkTm9kZXMuaW5kZXhPZihuLmlkKSA8IDApIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0ZWROb2RlcyA9IGNvbm5lY3RlZE5vZGVzLm1hcChub2RlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaWQgPT09IGNuSUQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY29ubmVjdGVkTm9kZXMucHVzaChuLmlkKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KVxuICAgIG5vZGVzID0gY29ubmVjdGVkTm9kZXNcbn1cblxuZnVuY3Rpb24gZG9QaHlzaWNzKCkge1xuICAgIHZhciBkZWx0YSA9IDA7XG4gICAgbGFzdFRpbWUgPSBzZWxmLnBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHNldFRpbWVvdXQocGh5c2ljcywgMCk7XG59XG5cbmZ1bmN0aW9uIGdldF9hKG5vZGUpIHtcbiAgICB2YXIgeVNwcmluZ0ZvcmNlID0gMDtcbiAgICB2YXIgeFNwcmluZ0ZvcmNlID0gMDtcbiAgICB2YXIgeFZlbG9jaXR5RGFtcGluZ0ZvcmNlID0gMDtcbiAgICB2YXIgeVZlbG9jaXR5RGFtcGluZ0ZvcmNlID0gMDtcbiAgICBub2RlLmNvbm5lY3RlZE5vZGVzLmZvckVhY2goZnVuY3Rpb24oY29ubmVjdGVkTm9kZUlEKSB7XG4gICAgICAgIHZhciBjb25uZWN0ZWROb2RlID0gaGVscGVyLmdldE5vZGUoY29ubmVjdGVkTm9kZUlELCBub2Rlcyk7XG4gICAgICAgIGlmIChjb25uZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICB2YXIgc3RyaW5nTGVuZ3RoID0gaGVscGVyLmdldExlbmd0aChjb25uZWN0ZWROb2RlLCBub2RlKTtcbiAgICAgICAgICAgIGlmIChzdHJpbmdMZW5ndGggPiBjb25maWcubm9taW5hbFN0cmluZ0xlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGhEaWZmZXJlbmNlID1cbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nTGVuZ3RoIC0gY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlRnJvbUhvcml6b250YWwgPSBoZWxwZXIuZ2V0QW5nbGVGcm9tSG9yaXpvbnRhbChcbiAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGVkTm9kZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgeVNwcmluZ0ZvcmNlICs9XG4gICAgICAgICAgICAgICAgICAgIE1hdGguc2luKGFuZ2xlRnJvbUhvcml6b250YWwpICpcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoRGlmZmVyZW5jZSAqXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5zcHJpbmdDb25zdGFudDtcbiAgICAgICAgICAgICAgICB4U3ByaW5nRm9yY2UgKz1cbiAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3MoYW5nbGVGcm9tSG9yaXpvbnRhbCkgKlxuICAgICAgICAgICAgICAgICAgICBsZW5ndGhEaWZmZXJlbmNlICpcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnNwcmluZ0NvbnN0YW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeFZlbG9jaXR5RGFtcGluZ0ZvcmNlICs9XG4gICAgICAgICAgICAgICAgY29uZmlnLmludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQgKlxuICAgICAgICAgICAgICAgIChub2RlLnZlbG9jaXR5LnggLSBjb25uZWN0ZWROb2RlLnZlbG9jaXR5LngpO1xuICAgICAgICAgICAgeVZlbG9jaXR5RGFtcGluZ0ZvcmNlICs9XG4gICAgICAgICAgICAgICAgY29uZmlnLmludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQgKlxuICAgICAgICAgICAgICAgIChub2RlLnZlbG9jaXR5LnkgLSBjb25uZWN0ZWROb2RlLnZlbG9jaXR5LnkpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBPdGhlciBmb3JjZXNcbiAgICB2YXIgeUdyYXZGb3JjZSA9IDkuOCAqIGNvbmZpZy5yb3BlV2VpZ2h0UGVyTm9kZTtcbiAgICB2YXIgeEdyYXZGb3JjZSA9IDAgKiBjb25maWcucm9wZVdlaWdodFBlck5vZGU7XG4gICAgdmFyIHlWaXNjb3VzRm9yY2UgPSBub2RlLnZlbG9jaXR5LnkgKiBjb25maWcudmlzY291c0NvbnN0YW50O1xuICAgIHZhciB4VmlzY291c0ZvcmNlID0gbm9kZS52ZWxvY2l0eS54ICogY29uZmlnLnZpc2NvdXNDb25zdGFudDtcblxuICAgIC8vIFRvdGFsIGZvcmNlXG4gICAgbm9kZS5mb3JjZS55ID1cbiAgICAgICAgeUdyYXZGb3JjZSArIHlTcHJpbmdGb3JjZSAtIHlWaXNjb3VzRm9yY2UgLSB5VmVsb2NpdHlEYW1waW5nRm9yY2U7XG4gICAgbm9kZS5mb3JjZS54ID1cbiAgICAgICAgeEdyYXZGb3JjZSArIHhTcHJpbmdGb3JjZSAtIHhWaXNjb3VzRm9yY2UgLSB4VmVsb2NpdHlEYW1waW5nRm9yY2U7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgICAgbm9kZS5mb3JjZS54IC8gY29uZmlnLnJvcGVXZWlnaHRQZXJOb2RlLFxuICAgICAgICBub2RlLmZvcmNlLnkgLyBjb25maWcucm9wZVdlaWdodFBlck5vZGVcbiAgICApO1xufVxuXG5mdW5jdGlvbiBwaHlzaWNzKCkge1xuICAgIHZhciBzaW1TcGVlZFF1YW50aXR5ID0gMDtcbiAgICB2YXIgc2ltdWxhdGlvblNwZWVkU3VtID0gMDtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IDEwMDsgaisrKSB7XG4gICAgICAgIC8vIFRpbWluZyBhbmQgc2ltdWxhdGlvbiBzcGVlZFxuICAgICAgICB2YXIgbmV3VGltZSA9IHNlbGYucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHZhciBhY3R1YWxFbGFwc2VkTWlsbGlzZWNvbmRzID0gbmV3VGltZSAtIGxhc3RUaW1lO1xuICAgICAgICB2YXIgYWN0dWFsRWxhcHNlZFRpbWUgPSBhY3R1YWxFbGFwc2VkTWlsbGlzZWNvbmRzIC8gMTAwMDtcbiAgICAgICAgdmFyIGVsYXBzZWRNaWxsaXNlY29uZHMgPVxuICAgICAgICAgICAgYWN0dWFsRWxhcHNlZE1pbGxpc2Vjb25kcyAqIGNvbmZpZy5zaW11bGF0aW9uU3BlZWQ7XG4gICAgICAgIGlmIChlbGFwc2VkTWlsbGlzZWNvbmRzID4gY29uZmlnLm1heFN0ZXApIHtcbiAgICAgICAgICAgIGVsYXBzZWRUaW1lID0gY29uZmlnLm1heFN0ZXAgLyAxMDAwO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgIFwiTWF4IHN0ZXAgZXhjZWVkZWQsIHNpbXVsYXRpb24gc3BlZWQgbWF5IG5vdCBiZSBjb3JyZWN0LlwiXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxhcHNlZFRpbWUgPSBlbGFwc2VkTWlsbGlzZWNvbmRzIC8gMTAwMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYWN0dWFsU2ltdWxhdGlvblNwZWVkID0gZWxhcHNlZFRpbWUgLyBhY3R1YWxFbGFwc2VkVGltZTtcbiAgICAgICAgaWYgKCFpc05hTihhY3R1YWxTaW11bGF0aW9uU3BlZWQpKSB7XG4gICAgICAgICAgICBzaW1TcGVlZFF1YW50aXR5ICs9IDE7XG4gICAgICAgICAgICBzaW11bGF0aW9uU3BlZWRTdW0gKz0gYWN0dWFsU2ltdWxhdGlvblNwZWVkO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RUaW1lID0gbmV3VGltZTtcblxuICAgICAgICAvLyBQaHlzaWNzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICBpZiAoIW5vZGUuZml4ZWQpIHtcbiAgICAgICAgICAgICAgICBub2RlLnZlbG9jaXR5LnggPSBub2RlLnZlbG9jaXR5LnggKyAobm9kZS5mb3JjZS54IC8gY29uZmlnLnJvcGVXZWlnaHRQZXJOb2RlICogZWxhcHNlZFRpbWUgLyAyKTtcbiAgICAgICAgICAgICAgICBub2RlLnZlbG9jaXR5LnkgPSBub2RlLnZlbG9jaXR5LnkgKyAobm9kZS5mb3JjZS55IC8gY29uZmlnLnJvcGVXZWlnaHRQZXJOb2RlICogZWxhcHNlZFRpbWUgLyAyKTtcblxuICAgICAgICAgICAgICAgIC8vIHhcbiAgICAgICAgICAgICAgICBub2RlLnBvc2l0aW9uLnkgPVxuICAgICAgICAgICAgICAgICAgICBub2RlLnBvc2l0aW9uLnkgKyBub2RlLnZlbG9jaXR5LnkgKiBlbGFwc2VkVGltZTtcbiAgICAgICAgICAgICAgICBub2RlLnBvc2l0aW9uLnggPVxuICAgICAgICAgICAgICAgICAgICBub2RlLnBvc2l0aW9uLnggKyBub2RlLnZlbG9jaXR5LnggKiBlbGFwc2VkVGltZTtcblxuICAgICAgICAgICAgICAgIC8vIHZcbiAgICAgICAgICAgICAgICBkdiA9IGdldF9hKG5vZGUpLm11bHRpcGx5KGVsYXBzZWRUaW1lLzIpO1xuICAgICAgICAgICAgICAgIG5vZGUudmVsb2NpdHkueCA9IG5vZGUudmVsb2NpdHkueCArIGR2Lng7XG4gICAgICAgICAgICAgICAgbm9kZS52ZWxvY2l0eS55ID0gbm9kZS52ZWxvY2l0eS55ICsgZHYueTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB0cnVlU2ltdWxhdGlvblNwZWVkID0gc2ltdWxhdGlvblNwZWVkU3VtIC8gc2ltU3BlZWRRdWFudGl0eTtcbiAgICBpZiAocnVubmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KHBoeXNpY3MsIDApO1xuICAgIH1cbn1cbiJdfQ==