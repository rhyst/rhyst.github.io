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


//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9qcy9zaGFyZWQvY29uZmlnLmpzIiwiYXBwL2pzL3NoYXJlZC9jb25zdGFudHMuanMiLCJhcHAvanMvc2hhcmVkL2hlbHBlci5qcyIsImFwcC9qcy9zaGFyZWQvbm9kZS5qcyIsImFwcC9qcy9zaGFyZWQvdmVjdG9yLmpzIiwiYXBwL2pzL3dvcmtlci93b3JrZXIuanMiXSwibmFtZXMiOlsibWV0cmUiLCJudW1PZk5vZGVzIiwibm9taW5hbFN0cmluZ0xlbmd0aCIsInNwcmluZ0NvbnN0YW50IiwiaW50ZXJuYWxWaXNjb3VzRnJpY3Rpb25Db25zdGFudCIsInZpc2NvdXNDb25zdGFudCIsInNpbXVsYXRpb25TcGVlZCIsIm1heFN0ZXAiLCJkYW5nZXJGb3JjZU1heCIsImRhbmdlckZvcmNlTWluIiwicm9wZVdlaWdodFBlck1ldHJlIiwicm9wZVdlaWdodFBlck5vZGUiLCJtb2R1bGUiLCJleHBvcnRzIiwiQ29udHJvbHNFbnVtIiwiT2JqZWN0IiwiZnJlZXplIiwicGFuIiwiZ3JhYiIsImFuY2hvciIsImVyYXNlIiwicm9wZSIsInBhdXNlIiwiY29uZmlnIiwicmVxdWlyZSIsImdldE5vZGUiLCJpZCIsIm5vZGVzIiwiZmluZCIsIm5vZGUiLCJnZXRMZW5ndGgiLCJub2RlMSIsIm5vZGUyIiwieGRpZmYiLCJNYXRoIiwiYWJzIiwicG9zaXRpb24iLCJ4IiwieWRpZmYiLCJ5Iiwic3FydCIsImdldE1pZHBvaW50IiwiZ2V0QW5nbGVGcm9tSG9yaXpvbnRhbCIsImF0YW4yIiwiZ2V0Rm9yY2UiLCJzdHJpbmdMZW5ndGgiLCJsZW5ndGhEaWZmZXJlbmNlIiwiYW5nbGVGcm9tSG9yaXpvbnRhbCIsInlTcHJpbmdGb3JjZSIsInNpbiIsInhTcHJpbmdGb3JjZSIsImNvcyIsInRvdGFsU3ByaW5nRm9yY2UiLCJ0b3RhbCIsIlZlY3RvciIsInVuaXF1ZWlkIiwiZ2V0SUQiLCJOb2RlIiwidngiLCJ2eSIsImZ4IiwiZnkiLCJmaXhlZCIsImNvbm5lY3RlZE5vZGVzIiwidmVsb2NpdHkiLCJmb3JjZSIsIm5vZGVPYmplY3QiLCJ6IiwicHJvdG90eXBlIiwibG9hZCIsInZlY3RvciIsIm5lZ2F0aXZlIiwiYWRkIiwidiIsInN1YnRyYWN0IiwibXVsdGlwbHkiLCJkaXZpZGUiLCJlcXVhbHMiLCJkb3QiLCJjcm9zcyIsImxlbmd0aCIsInVuaXQiLCJtaW4iLCJtYXgiLCJ0b0FuZ2xlcyIsInRoZXRhIiwicGhpIiwiYXNpbiIsImFuZ2xlVG8iLCJhIiwiYWNvcyIsInRvQXJyYXkiLCJuIiwic2xpY2UiLCJjbG9uZSIsImluaXQiLCJiIiwiYyIsImZyb21BbmdsZXMiLCJyYW5kb21EaXJlY3Rpb24iLCJyYW5kb20iLCJQSSIsImxlcnAiLCJmcmFjdGlvbiIsImZyb21BcnJheSIsImFuZ2xlQmV0d2VlbiIsImhlbHBlciIsInJ1bm5pbmciLCJsYXN0VGltZSIsIkRhdGUiLCJ0cnVlU2ltdWxhdGlvblNwZWVkIiwib25tZXNzYWdlIiwiZSIsImRhdGEiLCJkb1BoeXNpY3MiLCJwb3N0TWVzc2FnZSIsIkpTT04iLCJwYXJzZSIsImF0b2IiLCJzZWxlY3RlZE5vZGUiLCJtb3VzZVBvc2l0aW9uIiwicHVzaCIsImZpbHRlciIsIm1hcCIsImNuIiwibmV3Tm9kZXMiLCJjb25jYXQiLCJ4cG9zIiwieXBvcyIsImkiLCJsYXN0Tm9kZSIsInloYW5nbm9kZSIsImRlbHRhIiwic2VsZiIsInBlcmZvcm1hbmNlIiwibm93Iiwic2V0VGltZW91dCIsInBoeXNpY3MiLCJnZXRfYSIsInhWZWxvY2l0eURhbXBpbmdGb3JjZSIsInlWZWxvY2l0eURhbXBpbmdGb3JjZSIsImZvckVhY2giLCJjb25uZWN0ZWROb2RlSUQiLCJjb25uZWN0ZWROb2RlIiwieUdyYXZGb3JjZSIsInhHcmF2Rm9yY2UiLCJ5VmlzY291c0ZvcmNlIiwieFZpc2NvdXNGb3JjZSIsInNpbVNwZWVkUXVhbnRpdHkiLCJzaW11bGF0aW9uU3BlZWRTdW0iLCJqIiwibmV3VGltZSIsImFjdHVhbEVsYXBzZWRNaWxsaXNlY29uZHMiLCJhY3R1YWxFbGFwc2VkVGltZSIsImVsYXBzZWRNaWxsaXNlY29uZHMiLCJlbGFwc2VkVGltZSIsImNvbnNvbGUiLCJ3YXJuIiwiYWN0dWFsU2ltdWxhdGlvblNwZWVkIiwiaXNOYU4iLCJkdiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLFFBQVEsRUFBWixDLENBQWdCO0FBQ2hCLElBQUlDLGFBQWEsRUFBakI7QUFDQSxJQUFJQyxzQkFBc0IsRUFBMUIsQyxDQUE4QjtBQUM5QixJQUFJQyxpQkFBaUIsRUFBckI7QUFDQSxJQUFJQyxrQ0FBa0MsQ0FBdEM7QUFDQSxJQUFJQyxrQkFBa0IsT0FBdEI7QUFDQSxJQUFJQyxrQkFBa0IsQ0FBdEIsQyxDQUF5QjtBQUN6QixJQUFJQyxVQUFVLEVBQWQsQyxDQUFrQjtBQUNsQixJQUFJQyxpQkFBaUIsR0FBckIsQyxDQUF5QjtBQUN6QixJQUFJQyxpQkFBaUIsQ0FBckIsQyxDQUF1QjtBQUN2QixJQUFJQyxxQkFBcUIsQ0FBekI7QUFDQSxJQUFJQyxvQkFBb0JULHNCQUFzQkYsS0FBdEIsR0FBOEJVLGtCQUF0RDs7QUFFQUUsT0FBT0MsT0FBUCxHQUFpQjtBQUNiYixnQkFEYTtBQUViQywwQkFGYTtBQUdiQyw0Q0FIYTtBQUliQyxrQ0FKYTtBQUtiQyxvRUFMYTtBQU1iQyxvQ0FOYTtBQU9iQyxvQ0FQYTtBQVFiQyxvQkFSYTtBQVNiQyxrQ0FUYTtBQVViQyxrQ0FWYTtBQVdiQywwQ0FYYTtBQVliQztBQVphLENBQWpCOzs7Ozs7OztBQ2JPLElBQU1HLHNDQUFlQyxPQUFPQyxNQUFQLENBQWM7QUFDdENDLFNBQVEsS0FEOEI7QUFFdENDLFVBQVEsTUFGOEI7QUFHdENDLFlBQVEs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QUNUNkIsbUJBQVdDLE9BQVgsRUFBb0IsQ0FBcEI7QUFDSDtBQUNKIiwiZmlsZSI6InB1YmxpYy93b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgbWV0cmUgPSAxMDsgLy9waXhlbHNcbnZhciBudW1PZk5vZGVzID0gNDA7XG52YXIgbm9taW5hbFN0cmluZ0xlbmd0aCA9IDEwOyAvLyBwaXhlbHNcbnZhciBzcHJpbmdDb25zdGFudCA9IDI1O1xudmFyIGludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQgPSA4O1xudmFyIHZpc2NvdXNDb25zdGFudCA9IDAuMDAwMDI7XG52YXIgc2ltdWxhdGlvblNwZWVkID0gNDsgLy8gdGltZXMgcmVhbCB0aW1lXG52YXIgbWF4U3RlcCA9IDUwOyAvLyBtaWxsaXNlY29uZHNcbnZhciBkYW5nZXJGb3JjZU1heCA9IDE1MDsvLzI1MDAwO1xudmFyIGRhbmdlckZvcmNlTWluID0gMDsvLzEwMDAwO1xudmFyIHJvcGVXZWlnaHRQZXJNZXRyZSA9IDE7XG52YXIgcm9wZVdlaWdodFBlck5vZGUgPSBub21pbmFsU3RyaW5nTGVuZ3RoIC8gbWV0cmUgKiByb3BlV2VpZ2h0UGVyTWV0cmU7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1ldHJlLFxuICAgIG51bU9mTm9kZXMsXG4gICAgbm9taW5hbFN0cmluZ0xlbmd0aCxcbiAgICBzcHJpbmdDb25zdGFudCxcbiAgICBpbnRlcm5hbFZpc2NvdXNGcmljdGlvbkNvbnN0YW50LFxuICAgIHZpc2NvdXNDb25zdGFudCxcbiAgICBzaW11bGF0aW9uU3BlZWQsXG4gICAgbWF4U3RlcCxcbiAgICBkYW5nZXJGb3JjZU1heCxcbiAgICBkYW5nZXJGb3JjZU1pbixcbiAgICByb3BlV2VpZ2h0UGVyTWV0cmUsXG4gICAgcm9wZVdlaWdodFBlck5vZGVcbn07XG4iLCJleHBvcnQgY29uc3QgQ29udHJvbHNFbnVtID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgcGFuOiAgICBcInBhblwiLFxuICAgIGdyYWI6ICAgXCJncmFiXCIsXG4gICAgYW5jaG9yOiBcImFuY2hvclwiLFxuICAgIGVyYXNlOiAgXCJlcmFzZVwiLFxuICAgIHJvcGU6ICAgXCJyb3BlXCIsXG4gICAgcGF1c2U6ICBcInBhdXNlXCIsXG59KTsiLCJjb25zdCBjb25maWcgPSByZXF1aXJlKCdqcy9zaGFyZWQvY29uZmlnJyk7XG5cbmZ1bmN0aW9uIGdldE5vZGUoaWQsIG5vZGVzKSB7XG4gICAgcmV0dXJuIG5vZGVzLmZpbmQoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuaWQgPT09IGlkO1xuICAgIH0pXG59XG5mdW5jdGlvbiBnZXRMZW5ndGgobm9kZTEsIG5vZGUyKSB7XG4gICAgdmFyIHhkaWZmID0gTWF0aC5hYnMobm9kZTEucG9zaXRpb24ueCAtIG5vZGUyLnBvc2l0aW9uLngpO1xuICAgIHZhciB5ZGlmZiA9IE1hdGguYWJzKG5vZGUxLnBvc2l0aW9uLnkgLSBub2RlMi5wb3NpdGlvbi55KTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCh4ZGlmZiAqIHhkaWZmKSArICh5ZGlmZiAqIHlkaWZmKSk7XG59XG5mdW5jdGlvbiBnZXRNaWRwb2ludChub2RlMSwgbm9kZTIpIHtcbiAgICByZXR1cm4geyB4OiAobm9kZTEucG9zaXRpb24ueCArIG5vZGUyLnBvc2l0aW9uLngpIC8gMiwgeTogKG5vZGUxLnBvc2l0aW9uLnkgKyBub2RlMi5wb3NpdGlvbi55KSAvIDIgfVxufVxuZnVuY3Rpb24gZ2V0QW5nbGVGcm9tSG9yaXpvbnRhbChub2RlMSwgbm9kZTIpIHtcbiAgICByZXR1cm4gTWF0aC5hdGFuMihub2RlMi5wb3NpdGlvbi55IC0gbm9kZTEucG9zaXRpb24ueSwgbm9kZTIucG9zaXRpb24ueCAtIG5vZGUxLnBvc2l0aW9uLngpXG59XG5cbmZ1bmN0aW9uIGdldEZvcmNlKG5vZGUxLCBub2RlMikge1xuICAgIHZhciBzdHJpbmdMZW5ndGggPSBnZXRMZW5ndGgobm9kZTEsIG5vZGUyKTtcbiAgICB2YXIgbGVuZ3RoRGlmZmVyZW5jZSA9IHN0cmluZ0xlbmd0aCAtIGNvbmZpZy5ub21pbmFsU3RyaW5nTGVuZ3RoO1xuICAgIHZhciBhbmdsZUZyb21Ib3Jpem9udGFsID0gZ2V0QW5nbGVGcm9tSG9yaXpvbnRhbChub2RlMSwgbm9kZTIpO1xuICAgIHZhciB5U3ByaW5nRm9yY2UgPSBNYXRoLnNpbihhbmdsZUZyb21Ib3Jpem9udGFsKSAqIGxlbmd0aERpZmZlcmVuY2UgKiBjb25maWcuc3ByaW5nQ29uc3RhbnQ7XG4gICAgdmFyIHhTcHJpbmdGb3JjZSA9IE1hdGguY29zKGFuZ2xlRnJvbUhvcml6b250YWwpICogbGVuZ3RoRGlmZmVyZW5jZSAqIGNvbmZpZy5zcHJpbmdDb25zdGFudDtcbiAgICB2YXIgdG90YWxTcHJpbmdGb3JjZSA9IE1hdGguc3FydCgoeVNwcmluZ0ZvcmNlKnlTcHJpbmdGb3JjZSkrKHhTcHJpbmdGb3JjZSt4U3ByaW5nRm9yY2UpKTtcbiAgICByZXR1cm4ge3RvdGFsOiB0b3RhbFNwcmluZ0ZvcmNlLCB4OiB4U3ByaW5nRm9yY2UsIHk6IHlTcHJpbmdGb3JjZX1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0QW5nbGVGcm9tSG9yaXpvbnRhbCxcbiAgICBnZXRGb3JjZSxcbiAgICBnZXRMZW5ndGgsXG4gICAgZ2V0TWlkcG9pbnQsXG4gICAgZ2V0Tm9kZVxufSIsImNvbnN0IFZlY3RvciA9IHJlcXVpcmUoJ2pzL3NoYXJlZC92ZWN0b3InKS5WZWN0b3I7XG5cbnZhciB1bmlxdWVpZCA9IC0xO1xuZnVuY3Rpb24gZ2V0SUQoKSB7XG4gICAgdW5pcXVlaWQgKz0gMTtcbiAgICByZXR1cm4gdW5pcXVlaWQ7XG59XG5cbmNsYXNzIE5vZGUge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICB4ID0gMCxcbiAgICAgICAgeSA9IDAsXG4gICAgICAgIHZ4ID0gMCxcbiAgICAgICAgdnkgPSAwLFxuICAgICAgICBmeCA9IDAsXG4gICAgICAgIGZ5ID0gMCxcbiAgICAgICAgZml4ZWQgPSBmYWxzZSxcbiAgICAgICAgY29ubmVjdGVkTm9kZXMgPSBbXSxcbiAgICAgICAgaWRcbiAgICApIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkID8gaWQgOiBnZXRJRCgpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3Rvcih4LCB5KTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBWZWN0b3IodngsIHZ5KTtcbiAgICAgICAgdGhpcy5mb3JjZSA9IG5ldyBWZWN0b3IoZngsIGZ5KTtcbiAgICAgICAgdGhpcy5maXhlZCA9IGZpeGVkO1xuICAgICAgICB0aGlzLmNvbm5lY3RlZE5vZGVzID0gY29ubmVjdGVkTm9kZXM7XG4gICAgfVxuICAgIGdldE9iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICAgICAgcG9zaXRpb246IHRoaXMucG9zaXRpb24sXG4gICAgICAgICAgICB2ZWxvY2l0eTogdGhpcy52ZWxvY2l0eSxcbiAgICAgICAgICAgIGZvcmNlOiB0aGlzLmZvcmNlLFxuICAgICAgICAgICAgZml4ZWQ6IHRoaXMuZml4ZWQsXG4gICAgICAgICAgICBjb25uZWN0ZWROb2RlczogdGhpcy5jb25uZWN0ZWROb2Rlc1xuICAgICAgICB9O1xuICAgIH1cbiAgICBsb2FkT2JqZWN0KG5vZGVPYmplY3QgPSB7fSkge1xuICAgICAgICB0aGlzLmlkID0gbm9kZU9iamVjdC5pZCA/IG5vZGVPYmplY3QuaWQgOiB0aGlzLmlkO1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbm9kZU9iamVjdC5wb3NpdGlvbiB8fCB0aGlzLnBvc2l0aW9uO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gbm9kZU9iamVjdC52ZWxvY2l0eSB8fCB0aGlzLnZlbG9jaXR5O1xuICAgICAgICB0aGlzLmZvcmNlID0gbm9kZU9iamVjdC5mb3JjZSB8fCB0aGlzLmZvcmNlO1xuICAgICAgICB0aGlzLmZpeGVkID0gbm9kZU9iamVjdC5maXhlZCB8fCB0aGlzLmZpeGVkO1xuICAgICAgICB0aGlzLmNvbm5lY3RlZE5vZGVzID0gbm9kZU9iamVjdC5jb25uZWN0ZWROb2RlcyB8fCB0aGlzLmNvbm5lY3RlZE5vZGVzO1xuICAgIH1cbiAgICBjb3B5Tm9kZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBOb2RlKFxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54LFxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55LFxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS54LFxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS55LFxuICAgICAgICAgICAgdGhpcy5mb3JjZS54LFxuICAgICAgICAgICAgdGhpcy5mb3JjZS55LFxuICAgICAgICAgICAgdGhpcy5maXhlZCxcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGVkTm9kZXMsXG4gICAgICAgICAgICB0aGlzLmlkXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBOb2RlXG59O1xuIiwiLy8gUHJvdmlkZXMgYSBzaW1wbGUgM0QgdmVjdG9yIGNsYXNzLiBWZWN0b3Igb3BlcmF0aW9ucyBjYW4gYmUgZG9uZSB1c2luZyBtZW1iZXJcbi8vIGZ1bmN0aW9ucywgd2hpY2ggcmV0dXJuIG5ldyB2ZWN0b3JzLCBvciBzdGF0aWMgZnVuY3Rpb25zLCB3aGljaCByZXVzZVxuLy8gZXhpc3RpbmcgdmVjdG9ycyB0byBhdm9pZCBnZW5lcmF0aW5nIGdhcmJhZ2UuXG5mdW5jdGlvbiBWZWN0b3IoeCwgeSwgeikge1xuICB0aGlzLnggPSB4IHx8IDA7XG4gIHRoaXMueSA9IHkgfHwgMDtcbiAgdGhpcy56ID0geiB8fCAwO1xufVxuXG4vLyAjIyMgSW5zdGFuY2UgTWV0aG9kc1xuLy8gVGhlIG1ldGhvZHMgYGFkZCgpYCwgYHN1YnRyYWN0KClgLCBgbXVsdGlwbHkoKWAsIGFuZCBgZGl2aWRlKClgIGNhbiBhbGxcbi8vIHRha2UgZWl0aGVyIGEgdmVjdG9yIG9yIGEgbnVtYmVyIGFzIGFuIGFyZ3VtZW50LlxuVmVjdG9yLnByb3RvdHlwZSA9IHtcbiAgbG9hZDogZnVuY3Rpb24odmVjdG9yKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodmVjdG9yLnggfHwgMCwgdmVjdG9yLnkgfHwgMCwgdmVjdG9yLnogfHwgMCk7XG4gIH0sXG4gIG5lZ2F0aXZlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcigtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56KTtcbiAgfSxcbiAgYWRkOiBmdW5jdGlvbih2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBWZWN0b3IpIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55LCB0aGlzLnogKyB2LnopO1xuICAgIGVsc2UgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICsgdiwgdGhpcy55ICsgdiwgdGhpcy56ICsgdik7XG4gIH0sXG4gIHN1YnRyYWN0OiBmdW5jdGlvbih2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBWZWN0b3IpIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55LCB0aGlzLnogLSB2LnopO1xuICAgIGVsc2UgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC0gdiwgdGhpcy55IC0gdiwgdGhpcy56IC0gdik7XG4gIH0sXG4gIG11bHRpcGx5OiBmdW5jdGlvbih2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBWZWN0b3IpIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAqIHYueCwgdGhpcy55ICogdi55LCB0aGlzLnogKiB2LnopO1xuICAgIGVsc2UgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICogdiwgdGhpcy55ICogdiwgdGhpcy56ICogdik7XG4gIH0sXG4gIGRpdmlkZTogZnVuY3Rpb24odikge1xuICAgIGlmICh2IGluc3RhbmNlb2YgVmVjdG9yKSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggLyB2LngsIHRoaXMueSAvIHYueSwgdGhpcy56IC8gdi56KTtcbiAgICBlbHNlIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAvIHYsIHRoaXMueSAvIHYsIHRoaXMueiAvIHYpO1xuICB9LFxuICBlcXVhbHM6IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ID09IHYueCAmJiB0aGlzLnkgPT0gdi55ICYmIHRoaXMueiA9PSB2Lno7XG4gIH0sXG4gIGRvdDogZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2Lno7XG4gIH0sXG4gIGNyb3NzOiBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IoXG4gICAgICB0aGlzLnkgKiB2LnogLSB0aGlzLnogKiB2LnksXG4gICAgICB0aGlzLnogKiB2LnggLSB0aGlzLnggKiB2LnosXG4gICAgICB0aGlzLnggKiB2LnkgLSB0aGlzLnkgKiB2LnhcbiAgICApO1xuICB9LFxuICBsZW5ndGg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5kb3QodGhpcykpO1xuICB9LFxuICB1bml0OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kaXZpZGUodGhpcy5sZW5ndGgoKSk7XG4gIH0sXG4gIG1pbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWluKHRoaXMueCwgdGhpcy55KSwgdGhpcy56KTtcbiAgfSxcbiAgbWF4OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5tYXgodGhpcy54LCB0aGlzLnkpLCB0aGlzLnopO1xuICB9LFxuICB0b0FuZ2xlczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRoZXRhOiBNYXRoLmF0YW4yKHRoaXMueiwgdGhpcy54KSxcbiAgICAgIHBoaTogTWF0aC5hc2luKHRoaXMueSAvIHRoaXMubGVuZ3RoKCkpXG4gICAgfTtcbiAgfSxcbiAgYW5nbGVUbzogZnVuY3Rpb24oYSkge1xuICAgIHJldHVybiBNYXRoLmFjb3ModGhpcy5kb3QoYSkgLyAodGhpcy5sZW5ndGgoKSAqIGEubGVuZ3RoKCkpKTtcbiAgfSxcbiAgdG9BcnJheTogZnVuY3Rpb24obikge1xuICAgIHJldHVybiBbdGhpcy54LCB0aGlzLnksIHRoaXMuel0uc2xpY2UoMCwgbiB8fCAzKTtcbiAgfSxcbiAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCwgdGhpcy55LCB0aGlzLnopO1xuICB9LFxuICBpbml0OiBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgdGhpcy54ID0geDsgdGhpcy55ID0geTsgdGhpcy56ID0gejtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxuLy8gIyMjIFN0YXRpYyBNZXRob2RzXG4vLyBgVmVjdG9yLnJhbmRvbURpcmVjdGlvbigpYCByZXR1cm5zIGEgdmVjdG9yIHdpdGggYSBsZW5ndGggb2YgMSBhbmQgYVxuLy8gc3RhdGlzdGljYWxseSB1bmlmb3JtIGRpcmVjdGlvbi4gYFZlY3Rvci5sZXJwKClgIHBlcmZvcm1zIGxpbmVhclxuLy8gaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWN0b3JzLlxuVmVjdG9yLm5lZ2F0aXZlID0gZnVuY3Rpb24oYSwgYikge1xuICBiLnggPSAtYS54OyBiLnkgPSAtYS55OyBiLnogPSAtYS56O1xuICByZXR1cm4gYjtcbn07XG5WZWN0b3IuYWRkID0gZnVuY3Rpb24oYSwgYiwgYykge1xuICBjID0gYyA/IGMgOiBuZXcgVmVjdG9yKCk7XG4gIGlmIChiIGluc3RhbmNlb2YgVmVjdG9yKSB7IGMueCA9IGEueCArIGIueDsgYy55ID0gYS55ICsgYi55OyBjLnogPSBhLnogKyBiLno7IH1cbiAgZWxzZSB7IGMueCA9IGEueCArIGI7IGMueSA9IGEueSArIGI7IGMueiA9IGEueiArIGI7IH1cbiAgcmV0dXJuIGM7XG59O1xuVmVjdG9yLnN1YnRyYWN0ID0gZnVuY3Rpb24oYSwgYiwgYykge1xuICBjID0gYyA/IGMgOiBuZXcgVmVjdG9yKCk7XG4gIGlmIChiIGluc3RhbmNlb2YgVmVjdG9yKSB7IGMueCA9IGEueCAtIGIueDsgYy55ID0gYS55IC0gYi55OyBjLnogPSBhLnogLSBiLno7IH1cbiAgZWxzZSB7IGMueCA9IGEueCAtIGI7IGMueSA9IGEueSAtIGI7IGMueiA9IGEueiAtIGI7IH1cbiAgcmV0dXJuIGM7XG59O1xuVmVjdG9yLm11bHRpcGx5ID0gZnVuY3Rpb24oYSwgYiwgYykge1xuICBjID0gYyA/IGMgOiBuZXcgVmVjdG9yKCk7XG4gIGlmIChiIGluc3RhbmNlb2YgVmVjdG9yKSB7IGMueCA9IGEueCAqIGIueDsgYy55ID0gYS55ICogYi55OyBjLnogPSBhLnogKiBiLno7IH1cbiAgZWxzZSB7IGMueCA9IGEueCAqIGI7IGMueSA9IGEueSAqIGI7IGMueiA9IGEueiAqIGI7IH1cbiAgcmV0dXJuIGM7XG59O1xuVmVjdG9yLmRpdmlkZSA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54IC8gYi54OyBjLnkgPSBhLnkgLyBiLnk7IGMueiA9IGEueiAvIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54IC8gYjsgYy55ID0gYS55IC8gYjsgYy56ID0gYS56IC8gYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3IuY3Jvc3MgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMueCA9IGEueSAqIGIueiAtIGEueiAqIGIueTtcbiAgYy55ID0gYS56ICogYi54IC0gYS54ICogYi56O1xuICBjLnogPSBhLnggKiBiLnkgLSBhLnkgKiBiLng7XG4gIHJldHVybiBjO1xufTtcblZlY3Rvci51bml0ID0gZnVuY3Rpb24oYSwgYikge1xuICB2YXIgbGVuZ3RoID0gYS5sZW5ndGgoKTtcbiAgYi54ID0gYS54IC8gbGVuZ3RoO1xuICBiLnkgPSBhLnkgLyBsZW5ndGg7XG4gIGIueiA9IGEueiAvIGxlbmd0aDtcbiAgcmV0dXJuIGI7XG59O1xuVmVjdG9yLmZyb21BbmdsZXMgPSBmdW5jdGlvbih0aGV0YSwgcGhpKSB7XG4gIHJldHVybiBuZXcgVmVjdG9yKE1hdGguY29zKHRoZXRhKSAqIE1hdGguY29zKHBoaSksIE1hdGguc2luKHBoaSksIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSkpO1xufTtcblZlY3Rvci5yYW5kb21EaXJlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFZlY3Rvci5mcm9tQW5nbGVzKE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJICogMiwgTWF0aC5hc2luKE1hdGgucmFuZG9tKCkgKiAyIC0gMSkpO1xufTtcblZlY3Rvci5taW4gPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBuZXcgVmVjdG9yKE1hdGgubWluKGEueCwgYi54KSwgTWF0aC5taW4oYS55LCBiLnkpLCBNYXRoLm1pbihhLnosIGIueikpO1xufTtcblZlY3Rvci5tYXggPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBuZXcgVmVjdG9yKE1hdGgubWF4KGEueCwgYi54KSwgTWF0aC5tYXgoYS55LCBiLnkpLCBNYXRoLm1heChhLnosIGIueikpO1xufTtcblZlY3Rvci5sZXJwID0gZnVuY3Rpb24oYSwgYiwgZnJhY3Rpb24pIHtcbiAgcmV0dXJuIGIuc3VidHJhY3QoYSkubXVsdGlwbHkoZnJhY3Rpb24pLmFkZChhKTtcbn07XG5WZWN0b3IuZnJvbUFycmF5ID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gbmV3IFZlY3RvcihhWzBdLCBhWzFdLCBhWzJdKTtcbn07XG5WZWN0b3IuYW5nbGVCZXR3ZWVuID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYS5hbmdsZVRvKGIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFZlY3RvclxufSIsImNvbnN0IGhlbHBlciA9IHJlcXVpcmUoXCJqcy9zaGFyZWQvaGVscGVyXCIpO1xuY29uc3QgY29uZmlnID0gcmVxdWlyZShcImpzL3NoYXJlZC9jb25maWdcIik7XG5jb25zdCBWZWN0b3IgPSByZXF1aXJlKFwianMvc2hhcmVkL3ZlY3RvclwiKS5WZWN0b3I7XG5jb25zdCBOb2RlID0gcmVxdWlyZShcImpzL3NoYXJlZC9ub2RlXCIpLk5vZGU7XG5cbnZhciBydW5uaW5nID0gdHJ1ZTtcbnZhciBub2RlcyA9IFtdO1xudmFyIGxhc3RUaW1lID0gbmV3IERhdGUoKTtcbnZhciB0cnVlU2ltdWxhdGlvblNwZWVkID0gMDtcblxub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLmRhdGEgPT09IFwiaW5pdFwiKSB7XG4gICAgICAgIGluaXQoKTtcbiAgICB9IGVsc2UgaWYgKGUuZGF0YSA9PT0gXCJydW5cIikge1xuICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgZG9QaHlzaWNzKCk7XG4gICAgfSBlbHNlIGlmIChlLmRhdGEgPT09IFwicGF1c2VcIikge1xuICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChlLmRhdGEgPT09IFwic2VuZFwiKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHsgbm9kZXM6IG5vZGVzLCB0cnVlU2ltdWxhdGlvblNwZWVkOiB0cnVlU2ltdWxhdGlvblNwZWVkIH0pO1xuICAgIH0gZWxzZSBpZiAoZS5kYXRhWzBdID09PSBcImxvYWRcIikge1xuICAgICAgICBub2RlcyA9IEpTT04ucGFyc2UoYXRvYihlLmRhdGFbMV0pKTtcbiAgICB9IGVsc2UgaWYgKGUuZGF0YVswXSA9PT0gXCJtb3ZlXCIpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBoZWxwZXIuZ2V0Tm9kZShlLmRhdGFbMV0uc2VsZWN0ZWROb2RlLmlkLCBub2Rlcyk7XG4gICAgICAgIG5vZGUucG9zaXRpb24gPSBuZXcgVmVjdG9yKCkubG9hZChlLmRhdGFbMV0ubW91c2VQb3NpdGlvbik7XG4gICAgICAgIG5vZGUudmVsb2NpdHkgPSBuZXcgVmVjdG9yKCk7XG4gICAgICAgIG5vZGUuZm9yY2UgPSBuZXcgVmVjdG9yKCk7XG4gICAgfSBlbHNlIGlmIChlLmRhdGFbMF0gPT09IFwibm9tb3ZlXCIpIHtcbiAgICAgICAgLy92YXIgbm9kZSA9IGhlbHBlci5nZXROb2RlKGUuZGF0YVsxXS5zZWxlY3RlZE5vZGUuaWQsIG5vZGVzKTtcbiAgICB9IGVsc2UgaWYgKGUuZGF0YVswXSA9PT0gXCJuZXdhbmNob3JcIikge1xuICAgICAgICB2YXIgcG9zaXRpb24gPSBlLmRhdGFbMV0ubW91c2VQb3NpdGlvbjtcbiAgICAgICAgbm9kZXMucHVzaChuZXcgTm9kZShwb3NpdGlvbi54LCBwb3NpdGlvbi55LDAsMCwwLDAsdHJ1ZSxbXSkpO1xuICAgIH0gZWxzZSBpZiAoZS5kYXRhWzBdID09PSBcImRlbGV0ZW5vZGVcIikge1xuICAgICAgICB2YXIgbm9kZSA9IGUuZGF0YVsxXS5ub2RlO1xuICAgICAgICBub2RlcyA9IG5vZGVzLmZpbHRlcihuPT5uLmlkICE9PSBub2RlLmlkKS5tYXAobj0+IHtcbiAgICAgICAgICAgIG4uY29ubmVjdGVkTm9kZXMgPSBuLmNvbm5lY3RlZE5vZGVzLmZpbHRlcihjbiA9PiBjbiAhPT0gbm9kZS5pZCk7XG4gICAgICAgICAgICByZXR1cm4gblxuICAgICAgICB9KVxuICAgIH0gZWxzZSBpZiAoZS5kYXRhWzBdID09PSBcImFkZG5vZGVzXCIpIHtcbiAgICAgICAgdmFyIG5ld05vZGVzID0gZS5kYXRhWzFdLm5vZGVzO1xuICAgICAgICBub2RlcyA9IG5vZGVzLmNvbmNhdChuZXdOb2RlcylcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciB4cG9zID0gMjAwO1xuICAgIHZhciB5cG9zID0gNTA7XG4gICAgbm9kZXMucHVzaChuZXcgTm9kZSh4cG9zLCB5cG9zLCAwLCAwLCAwLCAwLCB0cnVlLCBbMV0pKTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGNvbmZpZy5udW1PZk5vZGVzOyBpKyspIHtcbiAgICAgICAgeHBvcyA9IHhwb3MgKyBjb25maWcubm9taW5hbFN0cmluZ0xlbmd0aDtcbiAgICAgICAgdmFyIGNvbm5lY3RlZE5vZGVzID0gW2kgLSAxXTtcbiAgICAgICAgaWYgKGkgPCBjb25maWcubnVtT2ZOb2RlcyAtIDEpIGNvbm5lY3RlZE5vZGVzLnB1c2goaSArIDEpO1xuICAgICAgICBub2Rlcy5wdXNoKG5ldyBOb2RlKHhwb3MsIHlwb3MsIDAsIDAsIDAsIDAsIGZhbHNlLCBjb25uZWN0ZWROb2RlcykpO1xuICAgIH1cblxuICAgIHZhciBsYXN0Tm9kZSA9IGhlbHBlci5nZXROb2RlKG5vZGVzLmxlbmd0aCAtIDEsIG5vZGVzKTtcbiAgICBsYXN0Tm9kZS5maXhlZCA9IHRydWU7XG4gICAgbGFzdE5vZGUucG9zaXRpb24ueCA9IDI2MDtcbiAgICBsYXN0Tm9kZS5wb3NpdGlvbi55ID0gMzAwO1xuXG4gICAgdmFyIHloYW5nbm9kZSA9IG5ldyBOb2RlKDIyMCwgNTAsIDAsIDAsIDAsIDAsIHRydWUsIFsxXSk7XG4gICAgbm9kZXMucHVzaCh5aGFuZ25vZGUpO1xuXG4gICAgdmFyIG5vZGUxID0gaGVscGVyLmdldE5vZGUoMSwgbm9kZXMpO1xuICAgIG5vZGUxLmNvbm5lY3RlZE5vZGVzLnB1c2goeWhhbmdub2RlLmlkKTtcbn1cblxuZnVuY3Rpb24gZG9QaHlzaWNzKCkge1xuICAgIHZhciBkZWx0YSA9IDA7XG4gICAgbGFzdFRpbWUgPSBzZWxmLnBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHNldFRpbWVvdXQocGh5c2ljcywgMCk7XG59XG5cbmZ1bmN0aW9uIGdldF9hKG5vZGUpIHtcbiAgICB2YXIgeVNwcmluZ0ZvcmNlID0gMDtcbiAgICB2YXIgeFNwcmluZ0ZvcmNlID0gMDtcbiAgICB2YXIgeFZlbG9jaXR5RGFtcGluZ0ZvcmNlID0gMDtcbiAgICB2YXIgeVZlbG9jaXR5RGFtcGluZ0ZvcmNlID0gMDtcbiAgICBub2RlLmNvbm5lY3RlZE5vZGVzLmZvckVhY2goZnVuY3Rpb24oY29ubmVjdGVkTm9kZUlEKSB7XG4gICAgICAgIHZhciBjb25uZWN0ZWROb2RlID0gaGVscGVyLmdldE5vZGUoY29ubmVjdGVkTm9kZUlELCBub2Rlcyk7XG4gICAgICAgIGlmIChjb25uZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICB2YXIgc3RyaW5nTGVuZ3RoID0gaGVscGVyLmdldExlbmd0aChjb25uZWN0ZWROb2RlLCBub2RlKTtcbiAgICAgICAgICAgIGlmIChzdHJpbmdMZW5ndGggPiBjb25maWcubm9taW5hbFN0cmluZ0xlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGhEaWZmZXJlbmNlID1cbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nTGVuZ3RoIC0gY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlRnJvbUhvcml6b250YWwgPSBoZWxwZXIuZ2V0QW5nbGVGcm9tSG9yaXpvbnRhbChcbiAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGVkTm9kZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgeVNwcmluZ0ZvcmNlICs9XG4gICAgICAgICAgICAgICAgICAgIE1hdGguc2luKGFuZ2xlRnJvbUhvcml6b250YWwpICpcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoRGlmZmVyZW5jZSAqXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5zcHJpbmdDb25zdGFudDtcbiAgICAgICAgICAgICAgICB4U3ByaW5nRm9yY2UgKz1cbiAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3MoYW5nbGVGcm9tSG9yaXpvbnRhbCkgKlxuICAgICAgICAgICAgICAgICAgICBsZW5ndGhEaWZmZXJlbmNlICpcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnNwcmluZ0NvbnN0YW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeFZlbG9jaXR5RGFtcGluZ0ZvcmNlICs9XG4gICAgICAgICAgICAgICAgY29uZmlnLmludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQgKlxuICAgICAgICAgICAgICAgIChub2RlLnZlbG9jaXR5LnggLSBjb25uZWN0ZWROb2RlLnZlbG9jaXR5LngpO1xuICAgICAgICAgICAgeVZlbG9jaXR5RGFtcGluZ0ZvcmNlICs9XG4gICAgICAgICAgICAgICAgY29uZmlnLmludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQgKlxuICAgICAgICAgICAgICAgIChub2RlLnZlbG9jaXR5LnkgLSBjb25uZWN0ZWROb2RlLnZlbG9jaXR5LnkpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBPdGhlciBmb3JjZXNcbiAgICB2YXIgeUdyYXZGb3JjZSA9IDkuOCAqIGNvbmZpZy5yb3BlV2VpZ2h0UGVyTm9kZTtcbiAgICB2YXIgeEdyYXZGb3JjZSA9IDAgKiBjb25maWcucm9wZVdlaWdodFBlck5vZGU7XG4gICAgdmFyIHlWaXNjb3VzRm9yY2UgPSBub2RlLnZlbG9jaXR5LnkgKiBjb25maWcudmlzY291c0NvbnN0YW50O1xuICAgIHZhciB4VmlzY291c0ZvcmNlID0gbm9kZS52ZWxvY2l0eS54ICogY29uZmlnLnZpc2NvdXNDb25zdGFudDtcblxuICAgIC8vIFRvdGFsIGZvcmNlXG4gICAgbm9kZS5mb3JjZS55ID1cbiAgICAgICAgeUdyYXZGb3JjZSArIHlTcHJpbmdGb3JjZSAtIHlWaXNjb3VzRm9yY2UgLSB5VmVsb2NpdHlEYW1waW5nRm9yY2U7XG4gICAgbm9kZS5mb3JjZS54ID1cbiAgICAgICAgeEdyYXZGb3JjZSArIHhTcHJpbmdGb3JjZSAtIHhWaXNjb3VzRm9yY2UgLSB4VmVsb2NpdHlEYW1waW5nRm9yY2U7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgICAgbm9kZS5mb3JjZS54IC8gY29uZmlnLnJvcGVXZWlnaHRQZXJOb2RlLFxuICAgICAgICBub2RlLmZvcmNlLnkgLyBjb25maWcucm9wZVdlaWdodFBlck5vZGVcbiAgICApO1xufVxuXG5mdW5jdGlvbiBwaHlzaWNzKCkge1xuICAgIHZhciBzaW1TcGVlZFF1YW50aXR5ID0gMDtcbiAgICB2YXIgc2ltdWxhdGlvblNwZWVkU3VtID0gMDtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IDEwMDsgaisrKSB7XG4gICAgICAgIC8vIFRpbWluZyBhbmQgc2ltdWxhdGlvbiBzcGVlZFxuICAgICAgICB2YXIgbmV3VGltZSA9IHNlbGYucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHZhciBhY3R1YWxFbGFwc2VkTWlsbGlzZWNvbmRzID0gbmV3VGltZSAtIGxhc3RUaW1lO1xuICAgICAgICB2YXIgYWN0dWFsRWxhcHNlZFRpbWUgPSBhY3R1YWxFbGFwc2VkTWlsbGlzZWNvbmRzIC8gMTAwMDtcbiAgICAgICAgdmFyIGVsYXBzZWRNaWxsaXNlY29uZHMgPVxuICAgICAgICAgICAgYWN0dWFsRWxhcHNlZE1pbGxpc2Vjb25kcyAqIGNvbmZpZy5zaW11bGF0aW9uU3BlZWQ7XG4gICAgICAgIGlmIChlbGFwc2VkTWlsbGlzZWNvbmRzID4gY29uZmlnLm1heFN0ZXApIHtcbiAgICAgICAgICAgIGVsYXBzZWRUaW1lID0gY29uZmlnLm1heFN0ZXAgLyAxMDAwO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgIFwiTWF4IHN0ZXAgZXhjZWVkZWQsIHNpbXVsYXRpb24gc3BlZWQgbWF5IG5vdCBiZSBjb3JyZWN0LlwiXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxhcHNlZFRpbWUgPSBlbGFwc2VkTWlsbGlzZWNvbmRzIC8gMTAwMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYWN0dWFsU2ltdWxhdGlvblNwZWVkID0gZWxhcHNlZFRpbWUgLyBhY3R1YWxFbGFwc2VkVGltZTtcbiAgICAgICAgaWYgKCFpc05hTihhY3R1YWxTaW11bGF0aW9uU3BlZWQpKSB7XG4gICAgICAgICAgICBzaW1TcGVlZFF1YW50aXR5ICs9IDE7XG4gICAgICAgICAgICBzaW11bGF0aW9uU3BlZWRTdW0gKz0gYWN0dWFsU2ltdWxhdGlvblNwZWVkO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RUaW1lID0gbmV3VGltZTtcblxuICAgICAgICAvLyBQaHlzaWNzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICBpZiAoIW5vZGUuZml4ZWQpIHtcbiAgICAgICAgICAgICAgICBub2RlLnZlbG9jaXR5LnggPSBub2RlLnZlbG9jaXR5LnggKyAobm9kZS5mb3JjZS54IC8gY29uZmlnLnJvcGVXZWlnaHRQZXJOb2RlICogZWxhcHNlZFRpbWUgLyAyKTtcbiAgICAgICAgICAgICAgICBub2RlLnZlbG9jaXR5LnkgPSBub2RlLnZlbG9jaXR5LnkgKyAobm9kZS5mb3JjZS55IC8gY29uZmlnLnJvcGVXZWlnaHRQZXJOb2RlICogZWxhcHNlZFRpbWUgLyAyKTtcblxuICAgICAgICAgICAgICAgIC8vIHhcbiAgICAgICAgICAgICAgICBub2RlLnBvc2l0aW9uLnkgPVxuICAgICAgICAgICAgICAgICAgICBub2RlLnBvc2l0aW9uLnkgKyBub2RlLnZlbG9jaXR5LnkgKiBlbGFwc2VkVGltZTtcbiAgICAgICAgICAgICAgICBub2RlLnBvc2l0aW9uLnggPVxuICAgICAgICAgICAgICAgICAgICBub2RlLnBvc2l0aW9uLnggKyBub2RlLnZlbG9jaXR5LnggKiBlbGFwc2VkVGltZTtcblxuICAgICAgICAgICAgICAgIC8vIHZcbiAgICAgICAgICAgICAgICBkdiA9IGdldF9hKG5vZGUpLm11bHRpcGx5KGVsYXBzZWRUaW1lLzIpO1xuICAgICAgICAgICAgICAgIG5vZGUudmVsb2NpdHkueCA9IG5vZGUudmVsb2NpdHkueCArIGR2Lng7XG4gICAgICAgICAgICAgICAgbm9kZS52ZWxvY2l0eS55ID0gbm9kZS52ZWxvY2l0eS55ICsgZHYueTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB0cnVlU2ltdWxhdGlvblNwZWVkID0gc2ltdWxhdGlvblNwZWVkU3VtIC8gc2ltU3BlZWRRdWFudGl0eTtcbiAgICBpZiAocnVubmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KHBoeXNpY3MsIDApO1xuICAgIH1cbn1cbiJdfQ==