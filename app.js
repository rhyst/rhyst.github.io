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

require.register("preact/dist/preact.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "preact");
  (function() {
    !function() {
    'use strict';
    function VNode() {}
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if ('boolean' == typeof child) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (children === EMPTY_CHILDREN) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p, list = items;
        items = [];
        while (p = list.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName); else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        var parentNode = node.parentNode;
        if (parentNode) parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            if (old) old(null);
            if (value) value(node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !1 === IS_NON_DIMENSIONAL.test(i) ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || !1 === value) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink\:?/, ''));
            if (null == value || !1 === value) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode || 'boolean' == typeof vnode) vnode = '';
        if ('string' == typeof vnode || 'number' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        var vnodeName = vnode.nodeName;
        if ('function' == typeof vnodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnodeName ? !0 : 'foreignObject' === vnodeName ? !1 : isSvgMode;
        vnodeName = String(vnodeName);
        if (!dom || !isNamedNode(dom, vnodeName)) {
            out = createNode(vnodeName, isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__preactattr_, vchildren = vnode.children;
        if (null == props) {
            props = out.__preactattr_ = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, f, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__preactattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            f = originalChildren[i];
            if (child && child !== dom && child !== f) if (null == f) dom.appendChild(child); else if (child === f.nextSibling) removeNode(f); else dom.insertBefore(child, f);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__preactattr_ && node.__preactattr_.ref) node.__preactattr_.ref(null);
            if (!1 === unmountOnly || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name;
        (components[name] || (components[name] = [])).push(component);
    }
    function createComponent(Ctor, props, context) {
        var inst, list = components[Ctor.name];
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
            inst.__b = list[i].__b;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            if (component.__r = props.ref) delete props.ref;
            if (component.__k = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== opts) if (1 === opts || !1 !== options.syncComponentUpdates || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            if (component.__r) component.__r(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && !1 === component.shouldComponentUpdate(props, state, context)) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            if (null != component.__h) while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (base.__preactattr_ && base.__preactattr_.ref) base.__preactattr_.ref(null);
            component.__b = base;
            removeNode(base);
            collectComponent(component);
            removeChildren(base);
        }
        if (component.__r) component.__r(null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var defer = 'function' == typeof Promise ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        setState: function(state, callback) {
            var s = this.state;
            if (!this.__s) this.__s = extend({}, s);
            extend(s, 'function' == typeof state ? state(s, this.props) : state);
            if (callback) (this.__h = this.__h || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function(callback) {
            if (callback) (this.__h = this.__h || []).push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if ('undefined' != typeof module) module.exports = preact; else self.preact = preact;
}();
//# sourceMappingURL=preact.js.map
  })();
});
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

;require.register("js/initialise.js", function(exports, require, module) {"use strict";

var _preact = require("preact");

var _App = require("./ui/components/App");

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener("DOMContentLoaded", function () {
    (0, _preact.render)((0, _preact.h)(_App2.default, null), document.querySelector("#app"));
});
});

require.register("js/ui/components/App.js", function(exports, require, module) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preact = require("preact");

var _canvas = require("js/ui/components/canvas/canvas");

var _canvas2 = _interopRequireDefault(_canvas);

var _controls = require("js/ui/components/controls/controls");

var _controls2 = _interopRequireDefault(_controls);

var _stats = require("js/ui/components/stats/stats");

var _stats2 = _interopRequireDefault(_stats);

var _constants = require("js/shared/constants.js");

var _config = require("js/shared/config");

var config = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_Component) {
  _inherits(App, _Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.onFrame = function () {
      _this.state.worker.postMessage("send");
      requestAnimationFrame(_this.onFrame);
    };

    _this.handleWorker = function (data) {
      _this.setState({
        nodes: data.data.nodes,
        trueSimulationSpeed: data.data.trueSimulationSpeed
      });
      //compute();
    };

    _this.changeControl = function (control) {
      _this.setState({
        selectedControl: control
      });
    };

    _this.changeScale = function (positive) {
      var scale = _this.state.scale;
      if (!positive && scale <= 1 || positive && scale < 1) {
        if (positive) {
          scale = scale + 0.1;
        } else {
          scale = scale - 0.1;
        }
        scale = Math.round(scale * 10) / 10;
      } else {
        if (positive) {
          scale = scale + 1;
        } else {
          scale = scale - 1;
        }
      }
      if (scale <= 0) {
        return;
      }
      _this.setState({ scale: scale });
    };

    _this.changeOption = function (key, value) {
      var options = _this.state.options;
      options[key] = value;
      _this.setState({ options: options });
    };

    var worker = new Worker("worker.js");
    worker.onmessage = _this.handleWorker;
    worker.postMessage("init");

    _this.state = {
      worker: worker,
      nodes: [],
      selectedControl: _constants.ControlsEnum.pan,
      scale: 1,
      options: {
        showIDs: false
      }
    };
    return _this;
  }

  _createClass(App, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      requestAnimationFrame(this.onFrame);
      this.state.worker.postMessage("run");
    }
  }, {
    key: "render",
    value: function render() {
      return (0, _preact.h)(
        "main",
        null,
        (0, _preact.h)(_canvas2.default, { options: this.state.options, nodes: this.state.nodes, worker: this.state.worker, selectedControl: this.state.selectedControl, scale: this.state.scale }),
        (0, _preact.h)(_controls2.default, { selectedControl: this.state.selectedControl, changeControl: this.changeControl, changeScale: this.changeScale, scale: this.state.scale, options: this.state.options, changeOption: this.changeOption }),
        (0, _preact.h)(_stats2.default, { trueSimulationSpeed: this.state.trueSimulationSpeed })
      );
    }
  }]);

  return App;
}(_preact.Component);

/*<div>Sim speed: <span id="simspeed"></span></div>
                <div><button id="start">Start</button><button id="stop">Stop</button></div>
                <div><input checked id="show-ids" type="checkbox" /> Show node IDs</div>
                <div>From: <input id="from"></input></div>
                <div>To: <input id="to"></input></div>
                <div>Force: <span id="result"></span></div>
                <div><input id="load-data" /><button id="load">Load</button></div>
                <div><input id="save-data" /><button id="save">Save</button></div>*/


exports.default = App;
});

;require.register("js/ui/components/canvas/canvas.js", function(exports, require, module) {"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preact = require("preact");

var _config = require("js/shared/config");

var config = _interopRequireWildcard(_config);

var _helper = require("js/shared/helper");

var helper = _interopRequireWildcard(_helper);

var _vector = require("js/shared/vector");

var _node = require("js/shared/node");

var _constants = require("js/shared/constants");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Canvas = function (_Component) {
    _inherits(Canvas, _Component);

    function Canvas(props) {
        _classCallCheck(this, Canvas);

        var _this = _possibleConstructorReturn(this, (Canvas.__proto__ || Object.getPrototypeOf(Canvas)).call(this, props));

        _this.getUniqueID = function () {
            var i = 0;
            var notunique = true;
            while (notunique) {
                if (!_this.props.nodes.find(function (n) {
                    return n.id === i;
                }) && !_this.state.newNodes.find(function (n) {
                    return n.id === i;
                })) {
                    return i;
                }
                i++;
            }
        };

        _this.interact = function () {
            var c = _this.canvas;
            var nodes = _this.props.nodes;
            var ctx = _this.canvas.getContext("2d");
            c.addEventListener("mousedown", function (e) {
                var rect = c.getBoundingClientRect();
                var mouse = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                var transformedV = new _vector.Vector().load(_this.state.transformed);
                var m = new _vector.Vector(mouse.x, mouse.y);
                var mousePosition = m.subtract(transformedV).divide(_this.props.scale);
                if (_this.props.selectedControl === _constants.ControlsEnum.grab) {
                    var nodes = _this.props.nodes;
                    var min = 20;
                    var selected;
                    for (var i = 0; i < nodes.length; i++) {
                        nodes[i].position = new _vector.Vector().load(nodes[i].position);
                        var distance = nodes[i].position.subtract(m.subtract(transformedV).divide(_this.props.scale)).length();
                        if (!min || distance < min) {
                            selected = nodes[i];
                            min = distance;
                        }
                    }
                    _this.setState({
                        mousePosition: mousePosition
                    });
                    if (selected) {
                        _this.setState({
                            selectedNode: selected
                        });
                    }
                } else if (_this.props.selectedControl === _constants.ControlsEnum.pan) {
                    _this.setState({
                        startCoords: {
                            x: e.pageX - rect.left - _this.state.lastCoords.x,
                            y: e.pageY - rect.top - _this.state.lastCoords.y
                        }
                    });
                } else if (_this.props.selectedControl === _constants.ControlsEnum.anchor) {
                    _this.props.worker.postMessage(["newanchor", { mousePosition: mousePosition }]);
                } else if (_this.props.selectedControl === _constants.ControlsEnum.erase) {
                    var nodes = _this.props.nodes;
                    var min = 5;
                    for (var i = 0; i < nodes.length; i++) {
                        nodes[i].position = new _vector.Vector().load(nodes[i].position);
                        var distance = nodes[i].position.subtract(m.subtract(transformedV).divide(_this.props.scale)).length();
                        if (distance < min) {
                            _this.props.worker.postMessage(["deletenode", { node: nodes[i] }]);
                        }
                    }
                    _this.setState({
                        mousePosition: m.subtract(transformedV)
                    });
                } else if (_this.props.selectedControl === _constants.ControlsEnum.rope) {
                    var node = new _node.Node(mousePosition.x, mousePosition.y, 0, 0, 0, 0, false, [], _this.getUniqueID());
                    var nodes = _this.props.nodes;
                    var min = 5;
                    for (var i = 0; i < nodes.length; i++) {
                        nodes[i].position = new _vector.Vector().load(nodes[i].position);
                        var distance = nodes[i].position.subtract(mousePosition).length();
                        if (distance < min) {
                            node.connectedNodes.push(nodes[i].id);
                            nodes[i].connectedNodes.push(node.id);
                        }
                    }
                    _this.setState({
                        startCoords: {
                            x: node.position.x,
                            y: node.position.y
                        },
                        newNodes: [node]
                    });
                }
                _this.setState({ mousedown: true });
            }, true);
            c.addEventListener("mousemove", function (e) {
                var rect = c.getBoundingClientRect();
                var mouse = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                var transformedV = new _vector.Vector().load(_this.state.transformed);
                var mousePosition = new _vector.Vector(mouse.x, mouse.y).subtract(transformedV).divide(_this.props.scale);
                _this.setState({
                    mousePosition: mousePosition
                });
                if (_this.props.selectedControl === _constants.ControlsEnum.grab) {
                    _this.setState({
                        mousePosition: mousePosition
                    });
                } else if (_this.props.selectedControl === _constants.ControlsEnum.pan) {
                    if (_this.state.mousedown) {
                        _this.setState({
                            transformed: {
                                x: mouse.x - _this.state.startCoords.x,
                                y: mouse.y - _this.state.startCoords.y
                            }
                        });
                    }
                } else if (_this.props.selectedControl === _constants.ControlsEnum.erase) {
                    if (_this.state.mousedown) {
                        var nodes = _this.props.nodes;
                        var min = 5;
                        for (var i = 0; i < nodes.length; i++) {
                            nodes[i].position = new _vector.Vector().load(nodes[i].position);
                            var distance = nodes[i].position.subtract(mousePosition).length();
                            if (distance < min) {
                                _this.props.worker.postMessage(["deletenode", { node: nodes[i] }]);
                            }
                        }
                    }
                } else if (_this.props.selectedControl === _constants.ControlsEnum.rope) {
                    if (_this.state.mousedown) {
                        var startCoordsV = new _vector.Vector().load(_this.state.startCoords);
                        var distance = startCoordsV.subtract(mousePosition).length();
                        if (distance > config.nominalStringLength) {
                            var node = new _node.Node(mousePosition.x, mousePosition.y, 0, 0, 0, 0, false, [], _this.getUniqueID());
                            var newNodes = _this.state.newNodes;
                            var prevNode = newNodes[newNodes.length - 1];
                            prevNode.connectedNodes.push(node.id);
                            node.connectedNodes.push(prevNode.id);
                            newNodes.push(node);
                            _this.setState({
                                newNodes: newNodes,
                                startCoords: {
                                    x: mousePosition.x,
                                    y: mousePosition.y
                                }
                            });
                        }
                    }
                }
            }, true);
            c.addEventListener("mouseup", function (e) {
                var rect = c.getBoundingClientRect();
                var mouse = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                var transformedV = new _vector.Vector().load(_this.state.transformed);
                var m = new _vector.Vector(mouse.x, mouse.y);
                var mousePosition = m.subtract(transformedV).divide(_this.props.scale);
                if (_this.props.selectedControl === _constants.ControlsEnum.grab) {
                    if (_this.state.selectedNode) {
                        _this.props.worker.postMessage(["nomove", { selectedNode: _this.state.selectedNode }]);
                    }
                    _this.setState({ selectedNode: null });
                } else if (_this.props.selectedControl === _constants.ControlsEnum.pan) {
                    var rect = c.getBoundingClientRect();
                    _this.setState({
                        lastCoords: {
                            x: e.pageX - rect.left - _this.state.startCoords.x,
                            y: e.pageY - rect.top - _this.state.startCoords.y
                        },
                        startCoords: null
                    });
                } else if (_this.props.selectedControl === _constants.ControlsEnum.rope) {
                    var node = _this.state.newNodes[_this.state.newNodes.length - 1];
                    var nodes = _this.props.nodes;
                    var min = 5;
                    for (var i = 0; i < nodes.length; i++) {
                        nodes[i].position = new _vector.Vector().load(nodes[i].position);
                        var distance = nodes[i].position.subtract(mousePosition).length();
                        if (distance < min) {
                            node.connectedNodes.push(nodes[i].id);
                            nodes[i].connectedNodes.push(node.id);
                        }
                    }
                    _this.props.worker.postMessage(["addnodes", { nodes: _this.state.newNodes }]);
                    _this.setState({
                        newNodes: [],
                        nodes: nodes.concat(_this.state.newNodes)
                    });
                }
                _this.setState({ mousedown: false });
            }, true);
            window.addEventListener('scroll', function (e) {
                console.log(window.scrollY);
            });
            document.onkeypress = function (e) {
                e = e || window.event;
                console.log(e.keyCode);
            };
        };

        _this.draw = function () {
            var showIDs = _this.props.options.showIDs;
            // Clear and reset canvas
            var ctx = _this.canvas.getContext("2d");
            var nodes = _this.props.nodes;
            ctx.strokeStyle = "rgb(0,0,0)";
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            ctx.restore();
            ctx.setTransform(_this.props.scale, 0, 0, _this.props.scale, _this.state.transformed.x, _this.state.transformed.y);

            // Draw grid
            var gridSize = 10 * config.metre;
            var offsetx = _this.state.transformed.x / _this.props.scale % gridSize;
            var offsety = _this.state.transformed.y / _this.props.scale % gridSize;
            for (var x = 0 - 2 * gridSize; x < _this.canvas.width / _this.props.scale + gridSize; x = x + gridSize) {
                ctx.beginPath();
                ctx.strokeStyle = "#d0d0d0";
                ctx.moveTo(x - _this.state.transformed.x / _this.props.scale + offsetx, 0 - gridSize - _this.state.transformed.y / _this.props.scale + offsety);
                ctx.lineTo(x - _this.state.transformed.x / _this.props.scale + offsetx, _this.canvas.height / _this.props.scale - _this.state.transformed.y / _this.props.scale + offsety + gridSize);
                ctx.stroke();
            }
            for (var y = 0 - 2 * gridSize; y < _this.canvas.height / _this.props.scale + gridSize; y = y + gridSize) {
                ctx.beginPath();
                ctx.strokeStyle = "#d0d0d0";
                ctx.moveTo(0 - gridSize - _this.state.transformed.x / _this.props.scale + offsetx, y - _this.state.transformed.y / _this.props.scale + offsety);
                ctx.lineTo(_this.canvas.width / _this.props.scale - _this.state.transformed.x / _this.props.scale + offsetx + gridSize, y - _this.state.transformed.y / _this.props.scale + offsety);
                ctx.stroke();
            }

            // Draw indicators around cursor if needed
            ctx.strokeStyle = "rgb(0,0,0)";
            if (_this.props.selectedControl === _constants.ControlsEnum.erase) {
                ctx.beginPath();
                ctx.arc(_this.state.mousePosition.x, _this.state.mousePosition.y, 5, 0, 2 * Math.PI);
                ctx.stroke();
            }

            // Draw scale bar
            ctx.beginPath();
            ctx.moveTo(10, 100);
            ctx.lineTo(10, 100 + 10 * config.metre);
            ctx.fillText("10m", 11, 100 + 10 * config.metre / 2);
            ctx.stroke();

            // Draw all lines and nodes
            var drawn = [];
            var drawLine = function drawLine(node, nodes, connectedNodeID) {
                var nodessss = _this.props.nodes;
                var newnodesssss = _this.state.newNodes;
                ctx.beginPath();
                if (node.fixed) {
                    ctx.fillRect(node.position.x - 2, node.position.y - 2, 5, 5);
                } else {
                    ctx.fillRect(node.position.x - 1, node.position.y - 1, 3, 3);
                }if (showIDs) {
                    ctx.fillText(node.id, node.position.x + 1, node.position.y);
                }
                ctx.stroke();
                if (drawn.indexOf(connectedNodeID.toString() + node.id.toString()) < 0) {
                    ctx.beginPath();
                    var connectedNode = helper.getNode(connectedNodeID, nodes);
                    ctx.moveTo(connectedNode.position.x, connectedNode.position.y);
                    ctx.lineTo(node.position.x, node.position.y);
                    drawn.push(node.id.toString() + connectedNode.id.toString());
                    var force = helper.getForce(node, connectedNode);
                    if (force.total >= config.dangerForceMin && force.total < config.dangerForceMax) {
                        var normForce = (force.total - config.dangerForceMin) / (config.dangerForceMax - config.dangerForceMin);
                        var color = normForce * 255;
                        ctx.strokeStyle = "rgb(" + color.toFixed(0) + ", 0, 0)";
                    } else if (force.total >= config.dangerForceMax) {
                        ctx.strokeStyle = "rgb(255, 0, 0)";
                    } else {
                        ctx.strokeStyle = "rgb(0,0,0)";
                    }
                    ctx.stroke();
                }
            };
            nodes.concat(_this.state.newNodes).forEach(function (node) {
                if (node.connectedNodes.length <= 0) {
                    ctx.beginPath();
                    if (node.fixed) {
                        ctx.fillRect(node.position.x - 2, node.position.y - 2, 5, 5);
                    } else {
                        ctx.fillRect(node.position.x - 1, node.position.y - 1, 3, 3);
                    }
                    if (showIDs) {
                        ctx.fillText(node.id, node.position.x + 1, node.position.y);
                    }
                    ctx.stroke();
                }
                node.connectedNodes.forEach(drawLine.bind(_this, node, nodes.concat(_this.state.newNodes)));
            });
        };

        _this.state = {
            mousedown: false,
            selectedNode: null,
            newNodes: [],
            mousePosition: { x: 0, y: 0 },
            startCoords: { x: 0, y: 0 },
            lastCoords: { x: 0, y: 0 },
            transformed: { x: 0, y: 0 }
        };
        return _this;
    }

    _createClass(Canvas, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.interact();
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            this.draw();
            if (this.state.selectedNode) {
                this.props.worker.postMessage(["move", {
                    selectedNode: this.state.selectedNode,
                    mousePosition: this.state.mousePosition
                }]);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            return (0, _preact.h)("canvas", {
                ref: function ref(canvas) {
                    return _this2.canvas = canvas;
                },
                id: "canvas",
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
    }]);

    return Canvas;
}(_preact.Component);

exports.default = Canvas;
});

;require.register("js/ui/components/controls/controls.js", function(exports, require, module) {"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preact = require("preact");

var _constants = require("js/shared/constants.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Controls = function (_Component) {
    _inherits(Controls, _Component);

    function Controls(props) {
        _classCallCheck(this, Controls);

        var _this = _possibleConstructorReturn(this, (Controls.__proto__ || Object.getPrototypeOf(Controls)).call(this, props));

        _this.state = {
            optionsVisible: false
        };
        return _this;
    }

    _createClass(Controls, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            return (0, _preact.h)(
                "div",
                { "class": "controls" },
                (0, _preact.h)(
                    "div",
                    { "class": "buttons has-addons" },
                    (0, _preact.h)(
                        "button",
                        {
                            "class": "button is-small " + (this.props.selectedControl == _constants.ControlsEnum.pan && "is-primary"),
                            onClick: function onClick() {
                                _this2.props.changeControl(_constants.ControlsEnum.pan);
                            } },
                        (0, _preact.h)(
                            "span",
                            { "class": "icon" },
                            (0, _preact.h)("i", { "class": "far fa-hand-paper" })
                        )
                    ),
                    (0, _preact.h)(
                        "button",
                        {
                            "class": "button is-small " + (this.props.selectedControl == _constants.ControlsEnum.grab && "is-primary"),
                            onClick: function onClick() {
                                _this2.props.changeControl(_constants.ControlsEnum.grab);
                            } },
                        (0, _preact.h)(
                            "span",
                            { "class": "icon" },
                            (0, _preact.h)("i", { "class": "far fa-hand-rock" })
                        )
                    ),
                    (0, _preact.h)(
                        "button",
                        {
                            "class": "button is-small " + (this.props.selectedControl == _constants.ControlsEnum.anchor && "is-primary"),
                            onClick: function onClick() {
                                _this2.props.changeControl(_constants.ControlsEnum.anchor);
                            } },
                        (0, _preact.h)(
                            "span",
                            { "class": "icon" },
                            (0, _preact.h)("i", { "class": "fas fa-plus" })
                        )
                    ),
                    (0, _preact.h)(
                        "button",
                        {
                            "class": "button is-small " + (this.props.selectedControl == _constants.ControlsEnum.rope && "is-primary"),
                            onClick: function onClick() {
                                _this2.props.changeControl(_constants.ControlsEnum.rope);
                            } },
                        (0, _preact.h)(
                            "span",
                            { "class": "icon" },
                            (0, _preact.h)("i", { "class": "fas fa-pencil-alt" })
                        )
                    ),
                    (0, _preact.h)(
                        "button",
                        {
                            "class": "button is-small " + (this.props.selectedControl == _constants.ControlsEnum.erase && "is-primary"),
                            onClick: function onClick() {
                                _this2.props.changeControl(_constants.ControlsEnum.erase);
                            } },
                        (0, _preact.h)(
                            "span",
                            { "class": "icon" },
                            (0, _preact.h)("i", { "class": "fas fa-eraser" })
                        )
                    ),
                    (0, _preact.h)(
                        "button",
                        {
                            "class": "button is-small",
                            onClick: function onClick() {
                                _this2.props.changeScale(false);
                            } },
                        (0, _preact.h)(
                            "span",
                            { "class": "icon" },
                            "-"
                        )
                    ),
                    (0, _preact.h)(
                        "button",
                        { "class": "button is-small", disabled: true },
                        this.props.scale
                    ),
                    (0, _preact.h)(
                        "button",
                        {
                            "class": "button is-small",
                            onClick: function onClick() {
                                _this2.props.changeScale(true);
                            } },
                        (0, _preact.h)(
                            "span",
                            { "class": "icon" },
                            "+"
                        )
                    ),
                    (0, _preact.h)(
                        "div",
                        {
                            "class": "dropdown " + (this.state.optionsVisible && "is-active") },
                        (0, _preact.h)(
                            "div",
                            { "class": "dropdown-trigger" },
                            (0, _preact.h)(
                                "button",
                                {
                                    "class": "button is-small",
                                    onClick: function onClick() {
                                        _this2.setState({
                                            optionsVisible: !_this2.state.optionsVisible
                                        });
                                    } },
                                (0, _preact.h)(
                                    "span",
                                    { "class": "icon is-small" },
                                    (0, _preact.h)("i", { "class": "fas fa-cog" })
                                ),
                                " ",
                                (0, _preact.h)(
                                    "span",
                                    { "class": "icon is-small" },
                                    (0, _preact.h)("i", {
                                        "class": "fas fa-angle-down",
                                        "aria-hidden": "true"
                                    })
                                )
                            )
                        ),
                        (0, _preact.h)(
                            "div",
                            {
                                "class": "dropdown-menu",
                                id: "dropdown-menu2",
                                role: "menu" },
                            (0, _preact.h)(
                                "div",
                                { "class": "dropdown-content" },
                                (0, _preact.h)(
                                    "div",
                                    { "class": "dropdown-item" },
                                    (0, _preact.h)(
                                        "label",
                                        { "class": "checkbox" },
                                        (0, _preact.h)("input", { type: "checkbox", onChange: function onChange(e) {
                                                return _this2.props.changeOption('showIDs', e.target.checked);
                                            } }),
                                        "Show IDs"
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);

    return Controls;
}(_preact.Component);

exports.default = Controls;
});

;require.register("js/ui/components/stats/stats.js", function(exports, require, module) {"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preact = require("preact");

var _config = require("js/shared/config");

var config = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Stats = function (_Component) {
    _inherits(Stats, _Component);

    function Stats(props) {
        _classCallCheck(this, Stats);

        var _this = _possibleConstructorReturn(this, (Stats.__proto__ || Object.getPrototypeOf(Stats)).call(this, props));

        _this.state = {
            simSpeeds: new Array(100).fill(config.simulationSpeed),
            calculatedSimSpeed: config.simulationSpeed
        };
        return _this;
    }

    _createClass(Stats, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(props) {
            var simSpeeds = this.state.simSpeeds;
            simSpeeds.pop();
            simSpeeds.unshift(props.trueSimulationSpeed);
            var sum = simSpeeds.reduce(function (a, b) {
                return a + b;
            }, 0);
            this.setState({
                simSpeeds: simSpeeds,
                calculatedSimSpeed: sum / simSpeeds.length
            });
        }
    }, {
        key: "render",
        value: function render() {
            return (0, _preact.h)(
                "div",
                { "class": "stats" },
                (0, _preact.h)(
                    "span",
                    null,
                    this.state.calculatedSimSpeed.toFixed(2),
                    "x"
                )
            );
        }
    }]);

    return Stats;
}(_preact.Component);

exports.default = Stats;
});

;require.register("js/ui/front.js", function(exports, require, module) {'use strict';

var helper = require('js/shared/helper');
var config = require('js/shared/config');
var Vector = require("js/shared/vector").Vector;

document.addEventListener("DOMContentLoaded", function () {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var nodes = [];
    var trueSimulationSpeed = 0;

    var worker = new Worker("worker.js");
    worker.onmessage = function (data) {
        //console.log(data.data)
        nodes = data.data.nodes;
        trueSimulationSpeed = data.data.trueSimulationSpeed;
        draw();
        compute();
        calcSimSpeed();
    };
    worker.postMessage("init");

    document.getElementById("start").addEventListener("click", function () {
        userPause = false;
        worker.postMessage("run");
    });

    var userPause = false;
    document.getElementById("stop").addEventListener("click", function () {
        userPause = true;
        worker.postMessage("pause");
    });

    var showIDs = true;
    document.getElementById("show-ids").addEventListener("click", function () {
        showIDs = document.getElementById("show-ids").checked;
    });

    document.getElementById("load").addEventListener("click", function () {
        var data = document.getElementById("load-data").value;
        worker.postMessage(["load", data]);
    });

    document.getElementById("save").addEventListener("click", function () {
        document.getElementById("save-data").value = btoa(JSON.stringify(nodes));
    });

    var selectedNode;
    var mousePosition;
    var startCoords;
    var lastCoords = { x: 0, y: 0 };
    var transformed = { x: 0, y: 0 };
    c.addEventListener('mousedown', function (e) {
        var rect = c.getBoundingClientRect();
        var mouse = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        var m = new Vector(mouse.x, mouse.y);
        var transformedV = new Vector().load(transformed);
        var min = 5;
        var selected;
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].position = new Vector().load(nodes[i].position);
            var distance = nodes[i].position.subtract(m.subtract(transformedV)).length();
            if (!min || distance < min) {
                selected = nodes[i];
                min = distance;
            }
        }
        mousePosition = m.subtract(transformedV);
        if (selected) {
            selectedNode = selected;
        } else {
            startCoords = { x: e.pageX - rect.left - lastCoords.x, y: e.pageY - rect.top - lastCoords.y };
            //worker.postMessage(["newnode", {mousePosition}]);
        }
    }, true);
    c.addEventListener('mousemove', function (e) {
        if (selectedNode) {
            var rect = c.getBoundingClientRect();
            var mouse = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            var transformedV = new Vector().load(transformed);
            mousePosition = new Vector(mouse.x, mouse.y).subtract(transformedV);
        } else if (startCoords) {
            var rect = c.getBoundingClientRect();
            var mouse = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            transformed = { x: mouse.x - startCoords.x, y: mouse.y - startCoords.y };
            ctx.setTransform(1, 0, 0, 1, transformed.x, transformed.y);
        }
    }, true);
    c.addEventListener('mouseup', function (e) {
        if (selectedNode) {
            worker.postMessage(["nomove", { selectedNode: selectedNode }]);
            selectedNode = undefined;
        } else if (startCoords) {
            var rect = c.getBoundingClientRect();
            lastCoords = { x: e.pageX - rect.left - startCoords.x,
                y: e.pageY - rect.top - startCoords.y };
            startCoords = undefined;
        }
    }, true);

    var simSpeeds = new Array(100);
    simSpeeds.fill(config.simulationSpeed);
    function calcSimSpeed() {
        simSpeeds.pop();
        simSpeeds.unshift(trueSimulationSpeed);
        var sum = simSpeeds.reduce(function (a, b) {
            return a + b;
        }, 0);
        document.getElementById("simspeed").innerText = (sum / simSpeeds.length).toFixed(2) + "x";
    }

    function draw() {
        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.clearRect(0 - transformed.x, 0 - transformed.y, c.width, c.height);
        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.beginPath();
        ctx.moveTo(10, 50);
        ctx.lineTo(10, 50 + 10 * config.metre);
        ctx.fillText("10m", 11, 50 + 10 * config.metre / 2);
        ctx.stroke();
        var drawn = [];
        function drawLine(node, connectedNodeID) {
            ctx.beginPath();
            ctx.fillRect(node.position.x - 1, node.position.y - 1, 3, 3);
            if (showIDs) {
                ctx.fillText(node.id, node.position.x + 1, node.position.y);
            }
            ctx.stroke();
            if (drawn.indexOf(connectedNodeID.toString() + node.id.toString()) < 0) {
                ctx.beginPath();
                var connectedNode = helper.getNode(connectedNodeID, nodes);
                //var midpoint = helper.getMidpoint(node, connectedNode);
                //ctx.fillText("x: " + node.force.x.toFixed(3) + " y: " + node.force.y.toFixed(3) ,midpoint.x,midpoint.y);
                ctx.moveTo(connectedNode.position.x, connectedNode.position.y);
                ctx.lineTo(node.position.x, node.position.y);
                drawn.push(node.id.toString() + connectedNode.id.toString());
                var force = helper.getForce(node, connectedNode);
                if (force.total >= config.dangerForceMin && force.total < config.dangerForceMax) {
                    normForce = (force.total - config.dangerForceMin) / (config.dangerForceMax - config.dangerForceMin);
                    color = normForce * 255;
                    ctx.strokeStyle = "rgb(" + color.toFixed(0) + ", 0, 0)";
                } else if (force.total >= config.dangerForceMax) {
                    ctx.strokeStyle = "rgb(255, 0, 0)";
                } else {
                    ctx.strokeStyle = "rgb(0,0,0)";
                }
                ctx.stroke();
            }
        }
        nodes.forEach(function (node) {
            if (node.connectedNodes.length <= 0) {
                ctx.beginPath();
                ctx.fillRect(node.position.x - 1, node.position.y - 1, 3, 3);
                if (showIDs) {
                    ctx.fillText(node.id, node.position.x + 1, node.position.y);
                }
                ctx.stroke();
            }
            node.connectedNodes.forEach(drawLine.bind(this, node));
        });
        //ctx.stroke();
    }
    function compute() {
        var connected = false;
        function computeNode(node, connectedNodeID) {
            if (parseInt(document.getElementById("to").value) === connectedNodeID) {
                connected = true;
                var connectedNode = helper.getNode(connectedNodeID, nodes);
                var force = helper.getForce(node, connectedNode);
                document.getElementById("result").innerText = force.total.toFixed(3) + "N";
            }
        }
        nodes.forEach(function (node) {
            if (parseInt(document.getElementById("from").value) === node.id) {
                node.connectedNodes.forEach(computeNode.bind(this, node));
            }
        });
        if (!connected) {
            document.getElementById("result").innerText = "Not connected";
        }
    }

    function frameSyncer(timestamp) {
        if (selectedNode) {
            worker.postMessage(["move", { selectedNode: selectedNode, mousePosition: mousePosition }]);
        }
        worker.postMessage("send");
        requestAnimationFrame(frameSyncer);
    }
    requestAnimationFrame(frameSyncer);

    worker.postMessage("run");
});
});

require.alias("preact/dist/preact.js", "preact");require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

'use strict';

/* jshint ignore:start */
(function () {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = window.brunch || {};
  var ar = br['auto-reload'] = br['auto-reload'] || {};
  if (!WebSocket || ar.disabled) return;
  if (window._ar) return;
  window._ar = true;

  var cacheBuster = function cacheBuster(url) {
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'cacheBuster=' + date;
  };

  var browser = navigator.userAgent.toLowerCase();
  var forceRepaint = ar.forceRepaint || browser.indexOf('chrome') > -1;

  var reloaders = {
    page: function page() {
      window.location.reload(true);
    },

    stylesheet: function stylesheet() {
      [].slice.call(document.querySelectorAll('link[rel=stylesheet]')).filter(function (link) {
        var val = link.getAttribute('data-autoreload');
        return link.href && val != 'false';
      }).forEach(function (link) {
        link.href = cacheBuster(link.href);
      });

      // Hack to force page repaint after 25ms.
      if (forceRepaint) setTimeout(function () {
        document.body.offsetHeight;
      }, 25);
    },

    javascript: function javascript() {
      var scripts = [].slice.call(document.querySelectorAll('script'));
      var textScripts = scripts.map(function (script) {
        return script.text;
      }).filter(function (text) {
        return text.length > 0;
      });
      var srcScripts = scripts.filter(function (script) {
        return script.src;
      });

      var loaded = 0;
      var all = srcScripts.length;
      var onLoad = function onLoad() {
        loaded = loaded + 1;
        if (loaded === all) {
          textScripts.forEach(function (script) {
            eval(script);
          });
        }
      };

      srcScripts.forEach(function (script) {
        var src = script.src;
        script.remove();
        var newScript = document.createElement('script');
        newScript.src = cacheBuster(src);
        newScript.async = true;
        newScript.onload = onLoad;
        document.head.appendChild(newScript);
      });
    }
  };
  var port = ar.port || 9485;
  var host = br.server || window.location.hostname || 'localhost';

  var connect = function connect() {
    var connection = new WebSocket('ws://' + host + ':' + port);
    connection.onmessage = function (event) {
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };
    connection.onerror = function () {
      if (connection.readyState) connection.close();
    };
    connection.onclose = function () {
      window.setTimeout(connect, 1000);
    };
  };
  connect();
})();
/* jshint ignore:end */
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCJhcHAvanMvc2hhcmVkL2NvbmZpZy5qcyIsImFwcC9qcy9zaGFyZWQvY29uc3RhbnRzLmpzIiwiYXBwL2pzL3NoYXJlZC9oZWxwZXIuanMiLCJhcHAvanMvc2hhcmVkL25vZGUuanMiLCJhcHAvanMvc2hhcmVkL3ZlY3Rvci5qcyIsImFwcC9qcy9pbml0aWFsaXNlLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvQXBwLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvY2FudmFzL2NhbnZhcy5qcyIsImFwcC9qcy91aS9jb21wb25lbnRzL2NvbnRyb2xzL2NvbnRyb2xzLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvc3RhdHMvc3RhdHMuanMiLCJhcHAvanMvdWkvZnJvbnQuanMiLCJub2RlX21vZHVsZXMvYXV0by1yZWxvYWQtYnJ1bmNoL3ZlbmRvci9hdXRvLXJlbG9hZC5qcyJdLCJuYW1lcyI6WyJtZXRyZSIsIm51bU9mTm9kZXMiLCJub21pbmFsU3RyaW5nTGVuZ3RoIiwic3ByaW5nQ29uc3RhbnQiLCJpbnRlcm5hbFZpc2NvdXNGcmljdGlvbkNvbnN0YW50IiwidmlzY291c0NvbnN0YW50Iiwic2ltdWxhdGlvblNwZWVkIiwibWF4U3RlcCIsImRhbmdlckZvcmNlTWF4IiwiZGFuZ2VyRm9yY2VNaW4iLCJyb3BlV2VpZ2h0UGVyTWV0cmUiLCJyb3BlV2VpZ2h0UGVyTm9kZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJDb250cm9sc0VudW0iLCJPYmplY3QiLCJmcmVlemUiLCJwYW4iLCJncmFiIiwiYW5jaG9yIiwiZXJhc2UiLCJyb3BlIiwiY29uZmlnIiwicmVxdWlyZSIsImdldE5vZGUiLCJpZCIsIm5vZGVzIiwiZmluZCIsIm5vZGUiLCJnZXRMZW5ndGgiLCJub2RlMSIsIm5vZGUyIiwieGRpZmYiLCJNYXRoIiwiYWJzIiwicG9zaXRpb24iLCJ4IiwieWRpZmYiLCJ5Iiwic3FydCIsImdldE1pZHBvaW50IiwiZ2V0QW5nbGVGcm9tSG9yaXpvbnRhbCIsImF0YW4yIiwiZ2V0Rm9yY2UiLCJzdHJpbmdMZW5ndGgiLCJsZW5ndGhEaWZmZXJlbmNlIiwiYW5nbGVGcm9tSG9yaXpvbnRhbCIsInlTcHJpbmdGb3JjZSIsInNpbiIsInhTcHJpbmdGb3JjZSIsImNvcyIsInRvdGFsU3ByaW5nRm9yY2UiLCJ0b3RhbCIsIlZlY3RvciIsInVuaXF1ZWlkIiwiZ2V0SUQiLCJOb2RlIiwidngiLCJ2eSIsImZ4IiwiZnkiLCJmaXhlZCIsImNvbm5lY3RlZE5vZGVzIiwidmVsb2NpdHkiLCJmb3JjZSIsIm5vZGVPYmplY3QiLCJ6IiwicHJvdG90eXBlIiwibG9hZCIsInZlY3RvciIsIm5lZ2F0aXZlIiwiYWRkIiwidiIsInN1YnRyYWN0IiwibXVsdGlwbHkiLCJkaXZpZGUiLCJlcXVhbHMiLCJkb3QiLCJjcm9zcyIsImxlbmd0aCIsInVuaXQiLCJtaW4iLCJtYXgiLCJ0b0FuZ2xlcyIsInRoZXRhIiwicGhpIiwiYXNpbiIsImFuZ2xlVG8iLCJhIiwiYWNvcyIsInRvQXJyYXkiLCJuIiwic2xpY2UiLCJjbG9uZSIsImluaXQiLCJiIiwiYyIsImZyb21BbmdsZXMiLCJyYW5kb21EaXJlY3Rpb24iLCJyYW5kb20iLCJQSSIsImxlcnAiLCJmcmFjdGlvbiIsImZyb21BcnJheSIsImFuZ2xlQmV0d2VlbiIsImRvY3VtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJBcHAiLCJwcm9wcyIsIm9uRnJhbWUiLCJzdGF0ZSIsIndvcmtlciIsInBvc3RNZXNzYWdlIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiaGFuZGxlV29ya2VyIiwic2V0U3RhdGUiLCJkYXRhIiwidHJ1ZVNpbXVsYXRpb25TcGVlZCIsImNoYW5nZUNvbnRyb2wiLCJzZWxlY3RlZENvbnRyb2wiLCJjb250cm9sIiwiY2hhbmdlU2NhbGUiLCJzY2FsZSIsInBvc2l0aXZlIiwicm91bmQiLCJjaGFuZ2VPcHRpb24iLCJrZXkiLCJ2YWx1ZSIsIm9wdGlvbnMiLCJXb3JrZXIiLCJvbm1lc3NhZ2UiLCJzaG93SURzIiwiaGVscGVyIiwiQ2FudmFzIiwiZ2V0VW5pcXVlSUQiLCJpIiwibm90dW5pcXVlIiwibmV3Tm9kZXMiLCJpbnRlcmFjdCIsImNhbnZhcyIsImN0eCIsImdldENvbnRleHQiLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwibW91c2UiLCJlIiwiY2xpZW50WCIsImxlZnQiLCJjbGllbnRZIiwidG9wIiwidHJhbnNmb3JtZWRWIiwidHJhbnNmb3JtZWQiLCJtIiwibW91c2VQb3NpdGlvbiIsInNlbGVjdGVkIiwiZGlzdGFuY2UiLCJzZWxlY3RlZE5vZGUiLCJzdGFydENvb3JkcyIsInBhZ2VYIiwibGFzdENvb3JkcyIsInBhZ2VZIiwicHVzaCIsIm1vdXNlZG93biIsInN0YXJ0Q29vcmRzViIsInByZXZOb2RlIiwiY29uY2F0Iiwid2luZG93IiwiY29uc29sZSIsImxvZyIsInNjcm9sbFkiLCJvbmtleXByZXNzIiwiZXZlbnQiLCJrZXlDb2RlIiwiZHJhdyIsInN0cm9rZVN0eWxlIiwic2F2ZSIsInNldFRyYW5zZm9ybSIsImNsZWFyUmVjdCIsIndpZHRoIiwiaGVpZ2h0IiwicmVzdG9yZSIsImdyaWRTaXplIiwib2Zmc2V0eCIsIm9mZnNldHkiLCJiZWdpblBhdGgiLCJtb3ZlVG8iLCJsaW5lVG8iLCJzdHJva2UiLCJhcmMiLCJmaWxsVGV4dCIsImRyYXduIiwiZHJhd0xpbmUiLCJjb25uZWN0ZWROb2RlSUQiLCJub2Rlc3NzcyIsIm5ld25vZGVzc3NzcyIsImZpbGxSZWN0IiwiaW5kZXhPZiIsInRvU3RyaW5nIiwiY29ubmVjdGVkTm9kZSIsIm5vcm1Gb3JjZSIsImNvbG9yIiwidG9GaXhlZCIsImZvckVhY2giLCJiaW5kIiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwiQ29udHJvbHMiLCJvcHRpb25zVmlzaWJsZSIsInRhcmdldCIsImNoZWNrZWQiLCJTdGF0cyIsInNpbVNwZWVkcyIsIkFycmF5IiwiZmlsbCIsImNhbGN1bGF0ZWRTaW1TcGVlZCIsInBvcCIsInVuc2hpZnQiLCJzdW0iLCJyZWR1Y2UiLCJnZXRFbGVtZW50QnlJZCIsImNvbXB1dGUiLCJjYWxjU2ltU3BlZWQiLCJ1c2VyUGF1c2UiLCJidG9hIiwiSlNPTiIsInN0cmluZ2lmeSIsInVuZGVmaW5lZCIsImlubmVyVGV4dCIsImNvbm5lY3RlZCIsImNvbXB1dGVOb2RlIiwicGFyc2VJbnQiLCJmcmFtZVN5bmNlciIsInRpbWVzdGFtcCIsIldlYlNvY2tldCIsIk1veldlYlNvY2tldCIsImJyIiwiYnJ1bmNoIiwiYXIiLCJkaXNhYmxlZCIsIl9hciIsImNhY2hlQnVzdGVyIiwidXJsIiwiZGF0ZSIsIkRhdGUiLCJub3ciLCJyZXBsYWNlIiwiYnJvd3NlciIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsInRvTG93ZXJDYXNlIiwiZm9yY2VSZXBhaW50IiwicmVsb2FkZXJzIiwicGFnZSIsImxvY2F0aW9uIiwicmVsb2FkIiwic3R5bGVzaGVldCIsImNhbGwiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZmlsdGVyIiwibGluayIsInZhbCIsImdldEF0dHJpYnV0ZSIsImhyZWYiLCJzZXRUaW1lb3V0IiwiYm9keSIsIm9mZnNldEhlaWdodCIsImphdmFzY3JpcHQiLCJzY3JpcHRzIiwidGV4dFNjcmlwdHMiLCJtYXAiLCJzY3JpcHQiLCJ0ZXh0Iiwic3JjU2NyaXB0cyIsInNyYyIsImxvYWRlZCIsImFsbCIsIm9uTG9hZCIsImV2YWwiLCJyZW1vdmUiLCJuZXdTY3JpcHQiLCJjcmVhdGVFbGVtZW50IiwiYXN5bmMiLCJvbmxvYWQiLCJoZWFkIiwiYXBwZW5kQ2hpbGQiLCJwb3J0IiwiaG9zdCIsInNlcnZlciIsImhvc3RuYW1lIiwiY29ubmVjdCIsImNvbm5lY3Rpb24iLCJtZXNzYWdlIiwicmVsb2FkZXIiLCJvbmVycm9yIiwicmVhZHlTdGF0ZSIsImNsb3NlIiwib25jbG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QixJQUF5QyxXQUFwRDs7QUFFQSxNQUFJQyxVQUFVLFNBQVZBLE9BQVUsR0FBVTtBQUN0QixRQUFJQyxhQUFhLElBQUl6RCxTQUFKLENBQWMsVUFBVXFELElBQVYsR0FBaUIsR0FBakIsR0FBdUJELElBQXJDLENBQWpCO0FBQ0FLLGVBQVdoSyxTQUFYLEdBQXVCLFVBQVN5QyxLQUFULEVBQWU7QUFDcEMsVUFBSWtFLEdBQUdDLFFBQVAsRUFBaUI7QUFDakIsVUFBSXFELFVBQVV4SCxNQUFNdkQsSUFBcEI7QUFDQSxVQUFJZ0wsV0FBV3pDLFVBQVV3QyxPQUFWLEtBQXNCeEMsVUFBVUMsSUFBL0M7QUFDQXdDO0FBQ0QsS0FMRDtBQU1BRixlQUFXRyxPQUFYLEdBQXFCLFlBQVU7QUFDN0IsVUFBSUgsV0FBV0ksVUFBZixFQUEyQkosV0FBV0ssS0FBWDtBQUM1QixLQUZEO0FBR0FMLGVBQVdNLE9BQVgsR0FBcUIsWUFBVTtBQUM3QmxJLGFBQU9pRyxVQUFQLENBQWtCMEIsT0FBbEIsRUFBMkIsSUFBM0I7QUFDRCxLQUZEO0FBR0QsR0FkRDtBQWVBQTtBQUNELENBbEZEO0FBbUZBIiwiZmlsZSI6InB1YmxpYy9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbnJlcXVpcmUucmVnaXN0ZXIoXCJwcmVhY3QvZGlzdC9wcmVhY3QuanNcIiwgZnVuY3Rpb24oZXhwb3J0cywgcmVxdWlyZSwgbW9kdWxlKSB7XG4gIHJlcXVpcmUgPSBfX21ha2VSZWxhdGl2ZVJlcXVpcmUocmVxdWlyZSwge30sIFwicHJlYWN0XCIpO1xuICAoZnVuY3Rpb24oKSB7XG4gICAgIWZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBmdW5jdGlvbiBWTm9kZSgpIHt9XG4gICAgZnVuY3Rpb24gaChub2RlTmFtZSwgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIgbGFzdFNpbXBsZSwgY2hpbGQsIHNpbXBsZSwgaSwgY2hpbGRyZW4gPSBFTVBUWV9DSElMRFJFTjtcbiAgICAgICAgZm9yIChpID0gYXJndW1lbnRzLmxlbmd0aDsgaS0tID4gMjsgKSBzdGFjay5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzICYmIG51bGwgIT0gYXR0cmlidXRlcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgaWYgKCFzdGFjay5sZW5ndGgpIHN0YWNrLnB1c2goYXR0cmlidXRlcy5jaGlsZHJlbik7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy5jaGlsZHJlbjtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoc3RhY2subGVuZ3RoKSBpZiAoKGNoaWxkID0gc3RhY2sucG9wKCkpICYmIHZvaWQgMCAhPT0gY2hpbGQucG9wKSBmb3IgKGkgPSBjaGlsZC5sZW5ndGg7IGktLTsgKSBzdGFjay5wdXNoKGNoaWxkW2ldKTsgZWxzZSB7XG4gICAgICAgICAgICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiBjaGlsZCkgY2hpbGQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHNpbXBsZSA9ICdmdW5jdGlvbicgIT0gdHlwZW9mIG5vZGVOYW1lKSBpZiAobnVsbCA9PSBjaGlsZCkgY2hpbGQgPSAnJzsgZWxzZSBpZiAoJ251bWJlcicgPT0gdHlwZW9mIGNoaWxkKSBjaGlsZCA9IFN0cmluZyhjaGlsZCk7IGVsc2UgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBjaGlsZCkgc2ltcGxlID0gITE7XG4gICAgICAgICAgICBpZiAoc2ltcGxlICYmIGxhc3RTaW1wbGUpIGNoaWxkcmVuW2NoaWxkcmVuLmxlbmd0aCAtIDFdICs9IGNoaWxkOyBlbHNlIGlmIChjaGlsZHJlbiA9PT0gRU1QVFlfQ0hJTERSRU4pIGNoaWxkcmVuID0gWyBjaGlsZCBdOyBlbHNlIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgbGFzdFNpbXBsZSA9IHNpbXBsZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcCA9IG5ldyBWTm9kZSgpO1xuICAgICAgICBwLm5vZGVOYW1lID0gbm9kZU5hbWU7XG4gICAgICAgIHAuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgcC5hdHRyaWJ1dGVzID0gbnVsbCA9PSBhdHRyaWJ1dGVzID8gdm9pZCAwIDogYXR0cmlidXRlcztcbiAgICAgICAgcC5rZXkgPSBudWxsID09IGF0dHJpYnV0ZXMgPyB2b2lkIDAgOiBhdHRyaWJ1dGVzLmtleTtcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gb3B0aW9ucy52bm9kZSkgb3B0aW9ucy52bm9kZShwKTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGV4dGVuZChvYmosIHByb3BzKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gcHJvcHMpIG9ialtpXSA9IHByb3BzW2ldO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjbG9uZUVsZW1lbnQodm5vZGUsIHByb3BzKSB7XG4gICAgICAgIHJldHVybiBoKHZub2RlLm5vZGVOYW1lLCBleHRlbmQoZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKSwgcHJvcHMpLCBhcmd1bWVudHMubGVuZ3RoID4gMiA/IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSA6IHZub2RlLmNoaWxkcmVuKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpIHtcbiAgICAgICAgaWYgKCFjb21wb25lbnQuX19kICYmIChjb21wb25lbnQuX19kID0gITApICYmIDEgPT0gaXRlbXMucHVzaChjb21wb25lbnQpKSAob3B0aW9ucy5kZWJvdW5jZVJlbmRlcmluZyB8fCBkZWZlcikocmVyZW5kZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXJlbmRlcigpIHtcbiAgICAgICAgdmFyIHAsIGxpc3QgPSBpdGVtcztcbiAgICAgICAgaXRlbXMgPSBbXTtcbiAgICAgICAgd2hpbGUgKHAgPSBsaXN0LnBvcCgpKSBpZiAocC5fX2QpIHJlbmRlckNvbXBvbmVudChwKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNTYW1lTm9kZVR5cGUobm9kZSwgdm5vZGUsIGh5ZHJhdGluZykge1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlIHx8ICdudW1iZXInID09IHR5cGVvZiB2bm9kZSkgcmV0dXJuIHZvaWQgMCAhPT0gbm9kZS5zcGxpdFRleHQ7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUubm9kZU5hbWUpIHJldHVybiAhbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgJiYgaXNOYW1lZE5vZGUobm9kZSwgdm5vZGUubm9kZU5hbWUpOyBlbHNlIHJldHVybiBoeWRyYXRpbmcgfHwgbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc05hbWVkTm9kZShub2RlLCBub2RlTmFtZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5fX24gPT09IG5vZGVOYW1lIHx8IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0Tm9kZVByb3BzKHZub2RlKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IGV4dGVuZCh7fSwgdm5vZGUuYXR0cmlidXRlcyk7XG4gICAgICAgIHByb3BzLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIHZhciBkZWZhdWx0UHJvcHMgPSB2bm9kZS5ub2RlTmFtZS5kZWZhdWx0UHJvcHM7XG4gICAgICAgIGlmICh2b2lkIDAgIT09IGRlZmF1bHRQcm9wcykgZm9yICh2YXIgaSBpbiBkZWZhdWx0UHJvcHMpIGlmICh2b2lkIDAgPT09IHByb3BzW2ldKSBwcm9wc1tpXSA9IGRlZmF1bHRQcm9wc1tpXTtcbiAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVOb2RlKG5vZGVOYW1lLCBpc1N2Zykge1xuICAgICAgICB2YXIgbm9kZSA9IGlzU3ZnID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5vZGVOYW1lKSA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xuICAgICAgICBub2RlLl9fbiA9IG5vZGVOYW1lO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlKSB7XG4gICAgICAgIHZhciBwYXJlbnROb2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICBpZiAocGFyZW50Tm9kZSkgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0QWNjZXNzb3Iobm9kZSwgbmFtZSwgb2xkLCB2YWx1ZSwgaXNTdmcpIHtcbiAgICAgICAgaWYgKCdjbGFzc05hbWUnID09PSBuYW1lKSBuYW1lID0gJ2NsYXNzJztcbiAgICAgICAgaWYgKCdrZXknID09PSBuYW1lKSA7IGVsc2UgaWYgKCdyZWYnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAob2xkKSBvbGQobnVsbCk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHZhbHVlKG5vZGUpO1xuICAgICAgICB9IGVsc2UgaWYgKCdjbGFzcycgPT09IG5hbWUgJiYgIWlzU3ZnKSBub2RlLmNsYXNzTmFtZSA9IHZhbHVlIHx8ICcnOyBlbHNlIGlmICgnc3R5bGUnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiB2YWx1ZSB8fCAnc3RyaW5nJyA9PSB0eXBlb2Ygb2xkKSBub2RlLnN0eWxlLmNzc1RleHQgPSB2YWx1ZSB8fCAnJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIG9sZCkgZm9yICh2YXIgaSBpbiBvbGQpIGlmICghKGkgaW4gdmFsdWUpKSBub2RlLnN0eWxlW2ldID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB2YWx1ZSkgbm9kZS5zdHlsZVtpXSA9ICdudW1iZXInID09IHR5cGVvZiB2YWx1ZVtpXSAmJiAhMSA9PT0gSVNfTk9OX0RJTUVOU0lPTkFMLnRlc3QoaSkgPyB2YWx1ZVtpXSArICdweCcgOiB2YWx1ZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIG5vZGUuaW5uZXJIVE1MID0gdmFsdWUuX19odG1sIHx8ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKCdvJyA9PSBuYW1lWzBdICYmICduJyA9PSBuYW1lWzFdKSB7XG4gICAgICAgICAgICB2YXIgdXNlQ2FwdHVyZSA9IG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9DYXB0dXJlJC8sICcnKSk7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghb2xkKSBub2RlLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9IGVsc2Ugbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGV2ZW50UHJveHksIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgKG5vZGUuX19sIHx8IChub2RlLl9fbCA9IHt9KSlbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICgnbGlzdCcgIT09IG5hbWUgJiYgJ3R5cGUnICE9PSBuYW1lICYmICFpc1N2ZyAmJiBuYW1lIGluIG5vZGUpIHtcbiAgICAgICAgICAgIHNldFByb3BlcnR5KG5vZGUsIG5hbWUsIG51bGwgPT0gdmFsdWUgPyAnJyA6IHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlIHx8ICExID09PSB2YWx1ZSkgbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgbnMgPSBpc1N2ZyAmJiBuYW1lICE9PSAobmFtZSA9IG5hbWUucmVwbGFjZSgvXnhsaW5rXFw6Py8sICcnKSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSB8fCAhMSA9PT0gdmFsdWUpIGlmIChucykgbm9kZS5yZW1vdmVBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSk7IGVsc2Ugbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7IGVsc2UgaWYgKCdmdW5jdGlvbicgIT0gdHlwZW9mIHZhbHVlKSBpZiAobnMpIG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBuYW1lLnRvTG93ZXJDYXNlKCksIHZhbHVlKTsgZWxzZSBub2RlLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5vZGVbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gICAgZnVuY3Rpb24gZXZlbnRQcm94eShlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbFtlLnR5cGVdKG9wdGlvbnMuZXZlbnQgJiYgb3B0aW9ucy5ldmVudChlKSB8fCBlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZmx1c2hNb3VudHMoKSB7XG4gICAgICAgIHZhciBjO1xuICAgICAgICB3aGlsZSAoYyA9IG1vdW50cy5wb3AoKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJNb3VudCkgb3B0aW9ucy5hZnRlck1vdW50KGMpO1xuICAgICAgICAgICAgaWYgKGMuY29tcG9uZW50RGlkTW91bnQpIGMuY29tcG9uZW50RGlkTW91bnQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBwYXJlbnQsIGNvbXBvbmVudFJvb3QpIHtcbiAgICAgICAgaWYgKCFkaWZmTGV2ZWwrKykge1xuICAgICAgICAgICAgaXNTdmdNb2RlID0gbnVsbCAhPSBwYXJlbnQgJiYgdm9pZCAwICE9PSBwYXJlbnQub3duZXJTVkdFbGVtZW50O1xuICAgICAgICAgICAgaHlkcmF0aW5nID0gbnVsbCAhPSBkb20gJiYgISgnX19wcmVhY3RhdHRyXycgaW4gZG9tKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmV0ID0gaWRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIGNvbXBvbmVudFJvb3QpO1xuICAgICAgICBpZiAocGFyZW50ICYmIHJldC5wYXJlbnROb2RlICE9PSBwYXJlbnQpIHBhcmVudC5hcHBlbmRDaGlsZChyZXQpO1xuICAgICAgICBpZiAoIS0tZGlmZkxldmVsKSB7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSAhMTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50Um9vdCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCkge1xuICAgICAgICB2YXIgb3V0ID0gZG9tLCBwcmV2U3ZnTW9kZSA9IGlzU3ZnTW9kZTtcbiAgICAgICAgaWYgKG51bGwgPT0gdm5vZGUgfHwgJ2Jvb2xlYW4nID09IHR5cGVvZiB2bm9kZSkgdm5vZGUgPSAnJztcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZSB8fCAnbnVtYmVyJyA9PSB0eXBlb2Ygdm5vZGUpIHtcbiAgICAgICAgICAgIGlmIChkb20gJiYgdm9pZCAwICE9PSBkb20uc3BsaXRUZXh0ICYmIGRvbS5wYXJlbnROb2RlICYmICghZG9tLl9jb21wb25lbnQgfHwgY29tcG9uZW50Um9vdCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9tLm5vZGVWYWx1ZSAhPSB2bm9kZSkgZG9tLm5vZGVWYWx1ZSA9IHZub2RlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG4gICAgICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGRvbSwgITApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dC5fX3ByZWFjdGF0dHJfID0gITA7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgICAgIHZhciB2bm9kZU5hbWUgPSB2bm9kZS5ub2RlTmFtZTtcbiAgICAgICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHZub2RlTmFtZSkgcmV0dXJuIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgaXNTdmdNb2RlID0gJ3N2ZycgPT09IHZub2RlTmFtZSA/ICEwIDogJ2ZvcmVpZ25PYmplY3QnID09PSB2bm9kZU5hbWUgPyAhMSA6IGlzU3ZnTW9kZTtcbiAgICAgICAgdm5vZGVOYW1lID0gU3RyaW5nKHZub2RlTmFtZSk7XG4gICAgICAgIGlmICghZG9tIHx8ICFpc05hbWVkTm9kZShkb20sIHZub2RlTmFtZSkpIHtcbiAgICAgICAgICAgIG91dCA9IGNyZWF0ZU5vZGUodm5vZGVOYW1lLCBpc1N2Z01vZGUpO1xuICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgIHdoaWxlIChkb20uZmlyc3RDaGlsZCkgb3V0LmFwcGVuZENoaWxkKGRvbS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG4gICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoZG9tLCAhMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZjID0gb3V0LmZpcnN0Q2hpbGQsIHByb3BzID0gb3V0Ll9fcHJlYWN0YXR0cl8sIHZjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgICBpZiAobnVsbCA9PSBwcm9wcykge1xuICAgICAgICAgICAgcHJvcHMgPSBvdXQuX19wcmVhY3RhdHRyXyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgYSA9IG91dC5hdHRyaWJ1dGVzLCBpID0gYS5sZW5ndGg7IGktLTsgKSBwcm9wc1thW2ldLm5hbWVdID0gYVtpXS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWh5ZHJhdGluZyAmJiB2Y2hpbGRyZW4gJiYgMSA9PT0gdmNoaWxkcmVuLmxlbmd0aCAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgdmNoaWxkcmVuWzBdICYmIG51bGwgIT0gZmMgJiYgdm9pZCAwICE9PSBmYy5zcGxpdFRleHQgJiYgbnVsbCA9PSBmYy5uZXh0U2libGluZykge1xuICAgICAgICAgICAgaWYgKGZjLm5vZGVWYWx1ZSAhPSB2Y2hpbGRyZW5bMF0pIGZjLm5vZGVWYWx1ZSA9IHZjaGlsZHJlblswXTtcbiAgICAgICAgfSBlbHNlIGlmICh2Y2hpbGRyZW4gJiYgdmNoaWxkcmVuLmxlbmd0aCB8fCBudWxsICE9IGZjKSBpbm5lckRpZmZOb2RlKG91dCwgdmNoaWxkcmVuLCBjb250ZXh0LCBtb3VudEFsbCwgaHlkcmF0aW5nIHx8IG51bGwgIT0gcHJvcHMuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwpO1xuICAgICAgICBkaWZmQXR0cmlidXRlcyhvdXQsIHZub2RlLmF0dHJpYnV0ZXMsIHByb3BzKTtcbiAgICAgICAgaXNTdmdNb2RlID0gcHJldlN2Z01vZGU7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlubmVyRGlmZk5vZGUoZG9tLCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBpc0h5ZHJhdGluZykge1xuICAgICAgICB2YXIgaiwgYywgZiwgdmNoaWxkLCBjaGlsZCwgb3JpZ2luYWxDaGlsZHJlbiA9IGRvbS5jaGlsZE5vZGVzLCBjaGlsZHJlbiA9IFtdLCBrZXllZCA9IHt9LCBrZXllZExlbiA9IDAsIG1pbiA9IDAsIGxlbiA9IG9yaWdpbmFsQ2hpbGRyZW4ubGVuZ3RoLCBjaGlsZHJlbkxlbiA9IDAsIHZsZW4gPSB2Y2hpbGRyZW4gPyB2Y2hpbGRyZW4ubGVuZ3RoIDogMDtcbiAgICAgICAgaWYgKDAgIT09IGxlbikgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIF9jaGlsZCA9IG9yaWdpbmFsQ2hpbGRyZW5baV0sIHByb3BzID0gX2NoaWxkLl9fcHJlYWN0YXR0cl8sIGtleSA9IHZsZW4gJiYgcHJvcHMgPyBfY2hpbGQuX2NvbXBvbmVudCA/IF9jaGlsZC5fY29tcG9uZW50Ll9fayA6IHByb3BzLmtleSA6IG51bGw7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBrZXkpIHtcbiAgICAgICAgICAgICAgICBrZXllZExlbisrO1xuICAgICAgICAgICAgICAgIGtleWVkW2tleV0gPSBfY2hpbGQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BzIHx8ICh2b2lkIDAgIT09IF9jaGlsZC5zcGxpdFRleHQgPyBpc0h5ZHJhdGluZyA/IF9jaGlsZC5ub2RlVmFsdWUudHJpbSgpIDogITAgOiBpc0h5ZHJhdGluZykpIGNoaWxkcmVuW2NoaWxkcmVuTGVuKytdID0gX2NoaWxkO1xuICAgICAgICB9XG4gICAgICAgIGlmICgwICE9PSB2bGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IHZsZW47IGkrKykge1xuICAgICAgICAgICAgdmNoaWxkID0gdmNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgY2hpbGQgPSBudWxsO1xuICAgICAgICAgICAgdmFyIGtleSA9IHZjaGlsZC5rZXk7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ZWRMZW4gJiYgdm9pZCAwICE9PSBrZXllZFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkID0ga2V5ZWRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAga2V5ZWRMZW4tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGlsZCAmJiBtaW4gPCBjaGlsZHJlbkxlbikgZm9yIChqID0gbWluOyBqIDwgY2hpbGRyZW5MZW47IGorKykgaWYgKHZvaWQgMCAhPT0gY2hpbGRyZW5bal0gJiYgaXNTYW1lTm9kZVR5cGUoYyA9IGNoaWxkcmVuW2pdLCB2Y2hpbGQsIGlzSHlkcmF0aW5nKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkID0gYztcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltqXSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gY2hpbGRyZW5MZW4gLSAxKSBjaGlsZHJlbkxlbi0tO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSBtaW4pIG1pbisrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGQgPSBpZGlmZihjaGlsZCwgdmNoaWxkLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBmID0gb3JpZ2luYWxDaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGlmIChjaGlsZCAmJiBjaGlsZCAhPT0gZG9tICYmIGNoaWxkICE9PSBmKSBpZiAobnVsbCA9PSBmKSBkb20uYXBwZW5kQ2hpbGQoY2hpbGQpOyBlbHNlIGlmIChjaGlsZCA9PT0gZi5uZXh0U2libGluZykgcmVtb3ZlTm9kZShmKTsgZWxzZSBkb20uaW5zZXJ0QmVmb3JlKGNoaWxkLCBmKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ZWRMZW4pIGZvciAodmFyIGkgaW4ga2V5ZWQpIGlmICh2b2lkIDAgIT09IGtleWVkW2ldKSByZWNvbGxlY3ROb2RlVHJlZShrZXllZFtpXSwgITEpO1xuICAgICAgICB3aGlsZSAobWluIDw9IGNoaWxkcmVuTGVuKSBpZiAodm9pZCAwICE9PSAoY2hpbGQgPSBjaGlsZHJlbltjaGlsZHJlbkxlbi0tXSkpIHJlY29sbGVjdE5vZGVUcmVlKGNoaWxkLCAhMSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsIHVubW91bnRPbmx5KSB7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSBub2RlLl9jb21wb25lbnQ7XG4gICAgICAgIGlmIChjb21wb25lbnQpIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50KTsgZWxzZSB7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBub2RlLl9fcHJlYWN0YXR0cl8gJiYgbm9kZS5fX3ByZWFjdGF0dHJfLnJlZikgbm9kZS5fX3ByZWFjdGF0dHJfLnJlZihudWxsKTtcbiAgICAgICAgICAgIGlmICghMSA9PT0gdW5tb3VudE9ubHkgfHwgbnVsbCA9PSBub2RlLl9fcHJlYWN0YXR0cl8pIHJlbW92ZU5vZGUobm9kZSk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbihub2RlKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLmxhc3RDaGlsZDtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShub2RlLCAhMCk7XG4gICAgICAgICAgICBub2RlID0gbmV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmQXR0cmlidXRlcyhkb20sIGF0dHJzLCBvbGQpIHtcbiAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgIGZvciAobmFtZSBpbiBvbGQpIGlmICgoIWF0dHJzIHx8IG51bGwgPT0gYXR0cnNbbmFtZV0pICYmIG51bGwgIT0gb2xkW25hbWVdKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gdm9pZCAwLCBpc1N2Z01vZGUpO1xuICAgICAgICBmb3IgKG5hbWUgaW4gYXR0cnMpIGlmICghKCdjaGlsZHJlbicgPT09IG5hbWUgfHwgJ2lubmVySFRNTCcgPT09IG5hbWUgfHwgbmFtZSBpbiBvbGQgJiYgYXR0cnNbbmFtZV0gPT09ICgndmFsdWUnID09PSBuYW1lIHx8ICdjaGVja2VkJyA9PT0gbmFtZSA/IGRvbVtuYW1lXSA6IG9sZFtuYW1lXSkpKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gYXR0cnNbbmFtZV0sIGlzU3ZnTW9kZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbGxlY3RDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgICAgIHZhciBuYW1lID0gY29tcG9uZW50LmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgICAgIChjb21wb25lbnRzW25hbWVdIHx8IChjb21wb25lbnRzW25hbWVdID0gW10pKS5wdXNoKGNvbXBvbmVudCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChDdG9yLCBwcm9wcywgY29udGV4dCkge1xuICAgICAgICB2YXIgaW5zdCwgbGlzdCA9IGNvbXBvbmVudHNbQ3Rvci5uYW1lXTtcbiAgICAgICAgaWYgKEN0b3IucHJvdG90eXBlICYmIEN0b3IucHJvdG90eXBlLnJlbmRlcikge1xuICAgICAgICAgICAgaW5zdCA9IG5ldyBDdG9yKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIENvbXBvbmVudC5jYWxsKGluc3QsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc3QgPSBuZXcgQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGluc3QuY29uc3RydWN0b3IgPSBDdG9yO1xuICAgICAgICAgICAgaW5zdC5yZW5kZXIgPSBkb1JlbmRlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGlzdCkgZm9yICh2YXIgaSA9IGxpc3QubGVuZ3RoOyBpLS07ICkgaWYgKGxpc3RbaV0uY29uc3RydWN0b3IgPT09IEN0b3IpIHtcbiAgICAgICAgICAgIGluc3QuX19iID0gbGlzdFtpXS5fX2I7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1JlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRDb21wb25lbnRQcm9wcyhjb21wb25lbnQsIHByb3BzLCBvcHRzLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMDtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuX19yID0gcHJvcHMucmVmKSBkZWxldGUgcHJvcHMucmVmO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX2sgPSBwcm9wcy5rZXkpIGRlbGV0ZSBwcm9wcy5rZXk7XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5iYXNlIHx8IG1vdW50QWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGNvbXBvbmVudC5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19jKSBjb21wb25lbnQuX19jID0gY29tcG9uZW50LmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19wKSBjb21wb25lbnQuX19wID0gY29tcG9uZW50LnByb3BzO1xuICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQuX194ID0gITE7XG4gICAgICAgICAgICBpZiAoMCAhPT0gb3B0cykgaWYgKDEgPT09IG9wdHMgfHwgITEgIT09IG9wdGlvbnMuc3luY0NvbXBvbmVudFVwZGF0ZXMgfHwgIWNvbXBvbmVudC5iYXNlKSByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCAxLCBtb3VudEFsbCk7IGVsc2UgZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IpIGNvbXBvbmVudC5fX3IoY29tcG9uZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCBvcHRzLCBtb3VudEFsbCwgaXNDaGlsZCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIHZhciByZW5kZXJlZCwgaW5zdCwgY2Jhc2UsIHByb3BzID0gY29tcG9uZW50LnByb3BzLCBzdGF0ZSA9IGNvbXBvbmVudC5zdGF0ZSwgY29udGV4dCA9IGNvbXBvbmVudC5jb250ZXh0LCBwcmV2aW91c1Byb3BzID0gY29tcG9uZW50Ll9fcCB8fCBwcm9wcywgcHJldmlvdXNTdGF0ZSA9IGNvbXBvbmVudC5fX3MgfHwgc3RhdGUsIHByZXZpb3VzQ29udGV4dCA9IGNvbXBvbmVudC5fX2MgfHwgY29udGV4dCwgaXNVcGRhdGUgPSBjb21wb25lbnQuYmFzZSwgbmV4dEJhc2UgPSBjb21wb25lbnQuX19iLCBpbml0aWFsQmFzZSA9IGlzVXBkYXRlIHx8IG5leHRCYXNlLCBpbml0aWFsQ2hpbGRDb21wb25lbnQgPSBjb21wb25lbnQuX2NvbXBvbmVudCwgc2tpcCA9ICExO1xuICAgICAgICAgICAgaWYgKGlzVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJldmlvdXNQcm9wcztcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc3RhdGUgPSBwcmV2aW91c1N0YXRlO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gcHJldmlvdXNDb250ZXh0O1xuICAgICAgICAgICAgICAgIGlmICgyICE9PSBvcHRzICYmIGNvbXBvbmVudC5zaG91bGRDb21wb25lbnRVcGRhdGUgJiYgITEgPT09IGNvbXBvbmVudC5zaG91bGRDb21wb25lbnRVcGRhdGUocHJvcHMsIHN0YXRlLCBjb250ZXh0KSkgc2tpcCA9ICEwOyBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZSkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxVcGRhdGUocHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX19wID0gY29tcG9uZW50Ll9fcyA9IGNvbXBvbmVudC5fX2MgPSBjb21wb25lbnQuX19iID0gbnVsbDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX2QgPSAhMTtcbiAgICAgICAgICAgIGlmICghc2tpcCkge1xuICAgICAgICAgICAgICAgIHJlbmRlcmVkID0gY29tcG9uZW50LnJlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KSBjb250ZXh0ID0gZXh0ZW5kKGV4dGVuZCh7fSwgY29udGV4dCksIGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQoKSk7XG4gICAgICAgICAgICAgICAgdmFyIHRvVW5tb3VudCwgYmFzZSwgY2hpbGRDb21wb25lbnQgPSByZW5kZXJlZCAmJiByZW5kZXJlZC5ub2RlTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2hpbGRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkUHJvcHMgPSBnZXROb2RlUHJvcHMocmVuZGVyZWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0ID0gaW5pdGlhbENoaWxkQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdCAmJiBpbnN0LmNvbnN0cnVjdG9yID09PSBjaGlsZENvbXBvbmVudCAmJiBjaGlsZFByb3BzLmtleSA9PSBpbnN0Ll9faykgc2V0Q29tcG9uZW50UHJvcHMoaW5zdCwgY2hpbGRQcm9wcywgMSwgY29udGV4dCwgITEpOyBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvVW5tb3VudCA9IGluc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQuX2NvbXBvbmVudCA9IGluc3QgPSBjcmVhdGVDb21wb25lbnQoY2hpbGRDb21wb25lbnQsIGNoaWxkUHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdC5fX2IgPSBpbnN0Ll9fYiB8fCBuZXh0QmFzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QuX191ID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoaW5zdCwgY2hpbGRQcm9wcywgMCwgY29udGV4dCwgITEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KGluc3QsIDEsIG1vdW50QWxsLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGluc3QuYmFzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYmFzZSA9IGluaXRpYWxCYXNlO1xuICAgICAgICAgICAgICAgICAgICB0b1VubW91bnQgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIGNiYXNlID0gY29tcG9uZW50Ll9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgfHwgMSA9PT0gb3B0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNiYXNlKSBjYmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UgPSBkaWZmKGNiYXNlLCByZW5kZXJlZCwgY29udGV4dCwgbW91bnRBbGwgfHwgIWlzVXBkYXRlLCBpbml0aWFsQmFzZSAmJiBpbml0aWFsQmFzZS5wYXJlbnROb2RlLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluaXRpYWxCYXNlICYmIGJhc2UgIT09IGluaXRpYWxCYXNlICYmIGluc3QgIT09IGluaXRpYWxDaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZVBhcmVudCA9IGluaXRpYWxCYXNlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGFyZW50ICYmIGJhc2UgIT09IGJhc2VQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VQYXJlbnQucmVwbGFjZUNoaWxkKGJhc2UsIGluaXRpYWxCYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdG9Vbm1vdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEJhc2UuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoaW5pdGlhbEJhc2UsICExKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodG9Vbm1vdW50KSB1bm1vdW50Q29tcG9uZW50KHRvVW5tb3VudCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlICYmICFpc0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRSZWYgPSBjb21wb25lbnQsIHQgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICh0ID0gdC5fX3UpIChjb21wb25lbnRSZWYgPSB0KS5iYXNlID0gYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fY29tcG9uZW50ID0gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9IGNvbXBvbmVudFJlZi5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzVXBkYXRlIHx8IG1vdW50QWxsKSBtb3VudHMudW5zaGlmdChjb21wb25lbnQpOyBlbHNlIGlmICghc2tpcCkge1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50RGlkVXBkYXRlKSBjb21wb25lbnQuY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMsIHByZXZpb3VzU3RhdGUsIHByZXZpb3VzQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJVcGRhdGUpIG9wdGlvbnMuYWZ0ZXJVcGRhdGUoY29tcG9uZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsICE9IGNvbXBvbmVudC5fX2gpIHdoaWxlIChjb21wb25lbnQuX19oLmxlbmd0aCkgY29tcG9uZW50Ll9faC5wb3AoKS5jYWxsKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoIWRpZmZMZXZlbCAmJiAhaXNDaGlsZCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBidWlsZENvbXBvbmVudEZyb21WTm9kZShkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICB2YXIgYyA9IGRvbSAmJiBkb20uX2NvbXBvbmVudCwgb3JpZ2luYWxDb21wb25lbnQgPSBjLCBvbGREb20gPSBkb20sIGlzRGlyZWN0T3duZXIgPSBjICYmIGRvbS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lLCBpc093bmVyID0gaXNEaXJlY3RPd25lciwgcHJvcHMgPSBnZXROb2RlUHJvcHModm5vZGUpO1xuICAgICAgICB3aGlsZSAoYyAmJiAhaXNPd25lciAmJiAoYyA9IGMuX191KSkgaXNPd25lciA9IGMuY29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICAgICAgICBpZiAoYyAmJiBpc093bmVyICYmICghbW91bnRBbGwgfHwgYy5fY29tcG9uZW50KSkge1xuICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoYywgcHJvcHMsIDMsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGRvbSA9IGMuYmFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbENvbXBvbmVudCAmJiAhaXNEaXJlY3RPd25lcikge1xuICAgICAgICAgICAgICAgIHVubW91bnRDb21wb25lbnQob3JpZ2luYWxDb21wb25lbnQpO1xuICAgICAgICAgICAgICAgIGRvbSA9IG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjID0gY3JlYXRlQ29tcG9uZW50KHZub2RlLm5vZGVOYW1lLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpZiAoZG9tICYmICFjLl9fYikge1xuICAgICAgICAgICAgICAgIGMuX19iID0gZG9tO1xuICAgICAgICAgICAgICAgIG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICAgICAgaWYgKG9sZERvbSAmJiBkb20gIT09IG9sZERvbSkge1xuICAgICAgICAgICAgICAgIG9sZERvbS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShvbGREb20sICExKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9tO1xuICAgIH1cbiAgICBmdW5jdGlvbiB1bm1vdW50Q29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgICAgICBpZiAob3B0aW9ucy5iZWZvcmVVbm1vdW50KSBvcHRpb25zLmJlZm9yZVVubW91bnQoY29tcG9uZW50KTtcbiAgICAgICAgdmFyIGJhc2UgPSBjb21wb25lbnQuYmFzZTtcbiAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQoKTtcbiAgICAgICAgY29tcG9uZW50LmJhc2UgPSBudWxsO1xuICAgICAgICB2YXIgaW5uZXIgPSBjb21wb25lbnQuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGlubmVyKSB1bm1vdW50Q29tcG9uZW50KGlubmVyKTsgZWxzZSBpZiAoYmFzZSkge1xuICAgICAgICAgICAgaWYgKGJhc2UuX19wcmVhY3RhdHRyXyAmJiBiYXNlLl9fcHJlYWN0YXR0cl8ucmVmKSBiYXNlLl9fcHJlYWN0YXR0cl8ucmVmKG51bGwpO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fYiA9IGJhc2U7XG4gICAgICAgICAgICByZW1vdmVOb2RlKGJhc2UpO1xuICAgICAgICAgICAgY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRyZW4oYmFzZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IpIGNvbXBvbmVudC5fX3IobnVsbCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIENvbXBvbmVudChwcm9wcywgY29udGV4dCkge1xuICAgICAgICB0aGlzLl9fZCA9ICEwO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlIHx8IHt9O1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXIodm5vZGUsIHBhcmVudCwgbWVyZ2UpIHtcbiAgICAgICAgcmV0dXJuIGRpZmYobWVyZ2UsIHZub2RlLCB7fSwgITEsIHBhcmVudCwgITEpO1xuICAgIH1cbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBzdGFjayA9IFtdO1xuICAgIHZhciBFTVBUWV9DSElMRFJFTiA9IFtdO1xuICAgIHZhciBkZWZlciA9ICdmdW5jdGlvbicgPT0gdHlwZW9mIFByb21pc2UgPyBQcm9taXNlLnJlc29sdmUoKS50aGVuLmJpbmQoUHJvbWlzZS5yZXNvbHZlKCkpIDogc2V0VGltZW91dDtcbiAgICB2YXIgSVNfTk9OX0RJTUVOU0lPTkFMID0gL2FjaXR8ZXgoPzpzfGd8bnxwfCQpfHJwaHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkL2k7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdmFyIG1vdW50cyA9IFtdO1xuICAgIHZhciBkaWZmTGV2ZWwgPSAwO1xuICAgIHZhciBpc1N2Z01vZGUgPSAhMTtcbiAgICB2YXIgaHlkcmF0aW5nID0gITE7XG4gICAgdmFyIGNvbXBvbmVudHMgPSB7fTtcbiAgICBleHRlbmQoQ29tcG9uZW50LnByb3RvdHlwZSwge1xuICAgICAgICBzZXRTdGF0ZTogZnVuY3Rpb24oc3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX19zKSB0aGlzLl9fcyA9IGV4dGVuZCh7fSwgcyk7XG4gICAgICAgICAgICBleHRlbmQocywgJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygc3RhdGUgPyBzdGF0ZShzLCB0aGlzLnByb3BzKSA6IHN0YXRlKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgKHRoaXMuX19oID0gdGhpcy5fX2ggfHwgW10pLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgZW5xdWV1ZVJlbmRlcih0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9yY2VVcGRhdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spICh0aGlzLl9faCA9IHRoaXMuX19oIHx8IFtdKS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJlbmRlckNvbXBvbmVudCh0aGlzLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHt9XG4gICAgfSk7XG4gICAgdmFyIHByZWFjdCA9IHtcbiAgICAgICAgaDogaCxcbiAgICAgICAgY3JlYXRlRWxlbWVudDogaCxcbiAgICAgICAgY2xvbmVFbGVtZW50OiBjbG9uZUVsZW1lbnQsXG4gICAgICAgIENvbXBvbmVudDogQ29tcG9uZW50LFxuICAgICAgICByZW5kZXI6IHJlbmRlcixcbiAgICAgICAgcmVyZW5kZXI6IHJlcmVuZGVyLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfTtcbiAgICBpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG1vZHVsZSkgbW9kdWxlLmV4cG9ydHMgPSBwcmVhY3Q7IGVsc2Ugc2VsZi5wcmVhY3QgPSBwcmVhY3Q7XG59KCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QuanMubWFwXG4gIH0pKCk7XG59KTsiLCJ2YXIgbWV0cmUgPSAxMDsgLy9waXhlbHNcbnZhciBudW1PZk5vZGVzID0gNDA7XG52YXIgbm9taW5hbFN0cmluZ0xlbmd0aCA9IDEwOyAvLyBwaXhlbHNcbnZhciBzcHJpbmdDb25zdGFudCA9IDI1O1xudmFyIGludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQgPSA4O1xudmFyIHZpc2NvdXNDb25zdGFudCA9IDAuMDAwMDI7XG52YXIgc2ltdWxhdGlvblNwZWVkID0gNDsgLy8gdGltZXMgcmVhbCB0aW1lXG52YXIgbWF4U3RlcCA9IDUwOyAvLyBtaWxsaXNlY29uZHNcbnZhciBkYW5nZXJGb3JjZU1heCA9IDE1MDsvLzI1MDAwO1xudmFyIGRhbmdlckZvcmNlTWluID0gMDsvLzEwMDAwO1xudmFyIHJvcGVXZWlnaHRQZXJNZXRyZSA9IDE7XG52YXIgcm9wZVdlaWdodFBlck5vZGUgPSBub21pbmFsU3RyaW5nTGVuZ3RoIC8gbWV0cmUgKiByb3BlV2VpZ2h0UGVyTWV0cmU7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1ldHJlLFxuICAgIG51bU9mTm9kZXMsXG4gICAgbm9taW5hbFN0cmluZ0xlbmd0aCxcbiAgICBzcHJpbmdDb25zdGFudCxcbiAgICBpbnRlcm5hbFZpc2NvdXNGcmljdGlvbkNvbnN0YW50LFxuICAgIHZpc2NvdXNDb25zdGFudCxcbiAgICBzaW11bGF0aW9uU3BlZWQsXG4gICAgbWF4U3RlcCxcbiAgICBkYW5nZXJGb3JjZU1heCxcbiAgICBkYW5nZXJGb3JjZU1pbixcbiAgICByb3BlV2VpZ2h0UGVyTWV0cmUsXG4gICAgcm9wZVdlaWdodFBlck5vZGVcbn07XG4iLCJleHBvcnQgY29uc3QgQ29udHJvbHNFbnVtID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgcGFuOiAgICBcInBhblwiLFxuICAgIGdyYWI6ICAgXCJncmFiXCIsXG4gICAgYW5jaG9yOiBcImFuY2hvclwiLFxuICAgIGVyYXNlOiAgXCJlcmFzZVwiLFxuICAgIHJvcGU6ICAgXCJyb3BlXCJcbn0pOyIsImNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2pzL3NoYXJlZC9jb25maWcnKTtcblxuZnVuY3Rpb24gZ2V0Tm9kZShpZCwgbm9kZXMpIHtcbiAgICByZXR1cm4gbm9kZXMuZmluZChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5pZCA9PT0gaWQ7XG4gICAgfSlcbn1cbmZ1bmN0aW9uIGdldExlbmd0aChub2RlMSwgbm9kZTIpIHtcbiAgICB2YXIgeGRpZmYgPSBNYXRoLmFicyhub2RlMS5wb3NpdGlvbi54IC0gbm9kZTIucG9zaXRpb24ueCk7XG4gICAgdmFyIHlkaWZmID0gTWF0aC5hYnMobm9kZTEucG9zaXRpb24ueSAtIG5vZGUyLnBvc2l0aW9uLnkpO1xuICAgIHJldHVybiBNYXRoLnNxcnQoKHhkaWZmICogeGRpZmYpICsgKHlkaWZmICogeWRpZmYpKTtcbn1cbmZ1bmN0aW9uIGdldE1pZHBvaW50KG5vZGUxLCBub2RlMikge1xuICAgIHJldHVybiB7IHg6IChub2RlMS5wb3NpdGlvbi54ICsgbm9kZTIucG9zaXRpb24ueCkgLyAyLCB5OiAobm9kZTEucG9zaXRpb24ueSArIG5vZGUyLnBvc2l0aW9uLnkpIC8gMiB9XG59XG5mdW5jdGlvbiBnZXRBbmdsZUZyb21Ib3Jpem9udGFsKG5vZGUxLCBub2RlMikge1xuICAgIHJldHVybiBNYXRoLmF0YW4yKG5vZGUyLnBvc2l0aW9uLnkgLSBub2RlMS5wb3NpdGlvbi55LCBub2RlMi5wb3NpdGlvbi54IC0gbm9kZTEucG9zaXRpb24ueClcbn1cblxuZnVuY3Rpb24gZ2V0Rm9yY2Uobm9kZTEsIG5vZGUyKSB7XG4gICAgdmFyIHN0cmluZ0xlbmd0aCA9IGdldExlbmd0aChub2RlMSwgbm9kZTIpO1xuICAgIHZhciBsZW5ndGhEaWZmZXJlbmNlID0gc3RyaW5nTGVuZ3RoIC0gY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGg7XG4gICAgdmFyIGFuZ2xlRnJvbUhvcml6b250YWwgPSBnZXRBbmdsZUZyb21Ib3Jpem9udGFsKG5vZGUxLCBub2RlMik7XG4gICAgdmFyIHlTcHJpbmdGb3JjZSA9IE1hdGguc2luKGFuZ2xlRnJvbUhvcml6b250YWwpICogbGVuZ3RoRGlmZmVyZW5jZSAqIGNvbmZpZy5zcHJpbmdDb25zdGFudDtcbiAgICB2YXIgeFNwcmluZ0ZvcmNlID0gTWF0aC5jb3MoYW5nbGVGcm9tSG9yaXpvbnRhbCkgKiBsZW5ndGhEaWZmZXJlbmNlICogY29uZmlnLnNwcmluZ0NvbnN0YW50O1xuICAgIHZhciB0b3RhbFNwcmluZ0ZvcmNlID0gTWF0aC5zcXJ0KCh5U3ByaW5nRm9yY2UqeVNwcmluZ0ZvcmNlKSsoeFNwcmluZ0ZvcmNlK3hTcHJpbmdGb3JjZSkpO1xuICAgIHJldHVybiB7dG90YWw6IHRvdGFsU3ByaW5nRm9yY2UsIHg6IHhTcHJpbmdGb3JjZSwgeTogeVNwcmluZ0ZvcmNlfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRBbmdsZUZyb21Ib3Jpem9udGFsLFxuICAgIGdldEZvcmNlLFxuICAgIGdldExlbmd0aCxcbiAgICBnZXRNaWRwb2ludCxcbiAgICBnZXROb2RlXG59IiwiY29uc3QgVmVjdG9yID0gcmVxdWlyZSgnanMvc2hhcmVkL3ZlY3RvcicpLlZlY3RvcjtcblxudmFyIHVuaXF1ZWlkID0gLTE7XG5mdW5jdGlvbiBnZXRJRCgpIHtcbiAgICB1bmlxdWVpZCArPSAxO1xuICAgIHJldHVybiB1bmlxdWVpZDtcbn1cblxuY2xhc3MgTm9kZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHggPSAwLFxuICAgICAgICB5ID0gMCxcbiAgICAgICAgdnggPSAwLFxuICAgICAgICB2eSA9IDAsXG4gICAgICAgIGZ4ID0gMCxcbiAgICAgICAgZnkgPSAwLFxuICAgICAgICBmaXhlZCA9IGZhbHNlLFxuICAgICAgICBjb25uZWN0ZWROb2RlcyA9IFtdLFxuICAgICAgICBpZFxuICAgICkge1xuICAgICAgICB0aGlzLmlkID0gaWQgPyBpZCA6IGdldElEKCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yKHgsIHkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFZlY3Rvcih2eCwgdnkpO1xuICAgICAgICB0aGlzLmZvcmNlID0gbmV3IFZlY3RvcihmeCwgZnkpO1xuICAgICAgICB0aGlzLmZpeGVkID0gZml4ZWQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkTm9kZXMgPSBjb25uZWN0ZWROb2RlcztcbiAgICB9XG4gICAgZ2V0T2JqZWN0KCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvbixcbiAgICAgICAgICAgIHZlbG9jaXR5OiB0aGlzLnZlbG9jaXR5LFxuICAgICAgICAgICAgZm9yY2U6IHRoaXMuZm9yY2UsXG4gICAgICAgICAgICBmaXhlZDogdGhpcy5maXhlZCxcbiAgICAgICAgICAgIGNvbm5lY3RlZE5vZGVzOiB0aGlzLmNvbm5lY3RlZE5vZGVzXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxvYWRPYmplY3Qobm9kZU9iamVjdCA9IHt9KSB7XG4gICAgICAgIHRoaXMuaWQgPSBub2RlT2JqZWN0LmlkID8gbm9kZU9iamVjdC5pZCA6IHRoaXMuaWQ7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBub2RlT2JqZWN0LnBvc2l0aW9uIHx8IHRoaXMucG9zaXRpb247XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBub2RlT2JqZWN0LnZlbG9jaXR5IHx8IHRoaXMudmVsb2NpdHk7XG4gICAgICAgIHRoaXMuZm9yY2UgPSBub2RlT2JqZWN0LmZvcmNlIHx8IHRoaXMuZm9yY2U7XG4gICAgICAgIHRoaXMuZml4ZWQgPSBub2RlT2JqZWN0LmZpeGVkIHx8IHRoaXMuZml4ZWQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkTm9kZXMgPSBub2RlT2JqZWN0LmNvbm5lY3RlZE5vZGVzIHx8IHRoaXMuY29ubmVjdGVkTm9kZXM7XG4gICAgfVxuICAgIGNvcHlOb2RlKCkge1xuICAgICAgICByZXR1cm4gbmV3IE5vZGUoXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLngsXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnksXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LngsXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnksXG4gICAgICAgICAgICB0aGlzLmZvcmNlLngsXG4gICAgICAgICAgICB0aGlzLmZvcmNlLnksXG4gICAgICAgICAgICB0aGlzLmZpeGVkLFxuICAgICAgICAgICAgdGhpcy5jb25uZWN0ZWROb2RlcyxcbiAgICAgICAgICAgIHRoaXMuaWRcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIE5vZGVcbn07XG4iLCIvLyBQcm92aWRlcyBhIHNpbXBsZSAzRCB2ZWN0b3IgY2xhc3MuIFZlY3RvciBvcGVyYXRpb25zIGNhbiBiZSBkb25lIHVzaW5nIG1lbWJlclxuLy8gZnVuY3Rpb25zLCB3aGljaCByZXR1cm4gbmV3IHZlY3RvcnMsIG9yIHN0YXRpYyBmdW5jdGlvbnMsIHdoaWNoIHJldXNlXG4vLyBleGlzdGluZyB2ZWN0b3JzIHRvIGF2b2lkIGdlbmVyYXRpbmcgZ2FyYmFnZS5cbmZ1bmN0aW9uIFZlY3Rvcih4LCB5LCB6KSB7XG4gIHRoaXMueCA9IHggfHwgMDtcbiAgdGhpcy55ID0geSB8fCAwO1xuICB0aGlzLnogPSB6IHx8IDA7XG59XG5cbi8vICMjIyBJbnN0YW5jZSBNZXRob2RzXG4vLyBUaGUgbWV0aG9kcyBgYWRkKClgLCBgc3VidHJhY3QoKWAsIGBtdWx0aXBseSgpYCwgYW5kIGBkaXZpZGUoKWAgY2FuIGFsbFxuLy8gdGFrZSBlaXRoZXIgYSB2ZWN0b3Igb3IgYSBudW1iZXIgYXMgYW4gYXJndW1lbnQuXG5WZWN0b3IucHJvdG90eXBlID0ge1xuICBsb2FkOiBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih2ZWN0b3IueCB8fCAwLCB2ZWN0b3IueSB8fCAwLCB2ZWN0b3IueiB8fCAwKTtcbiAgfSxcbiAgbmVnYXRpdmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKC10aGlzLngsIC10aGlzLnksIC10aGlzLnopO1xuICB9LFxuICBhZGQ6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKyB2LCB0aGlzLnkgKyB2LCB0aGlzLnogKyB2KTtcbiAgfSxcbiAgc3VidHJhY3Q6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggLSB2LCB0aGlzLnkgLSB2LCB0aGlzLnogLSB2KTtcbiAgfSxcbiAgbXVsdGlwbHk6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKiB2LCB0aGlzLnkgKiB2LCB0aGlzLnogKiB2KTtcbiAgfSxcbiAgZGl2aWRlOiBmdW5jdGlvbih2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBWZWN0b3IpIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAvIHYueCwgdGhpcy55IC8gdi55LCB0aGlzLnogLyB2LnopO1xuICAgIGVsc2UgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gdiwgdGhpcy55IC8gdiwgdGhpcy56IC8gdik7XG4gIH0sXG4gIGVxdWFsczogZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggPT0gdi54ICYmIHRoaXMueSA9PSB2LnkgJiYgdGhpcy56ID09IHYuejtcbiAgfSxcbiAgZG90OiBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHRoaXMueiAqIHYuejtcbiAgfSxcbiAgY3Jvc3M6IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgIHRoaXMueSAqIHYueiAtIHRoaXMueiAqIHYueSxcbiAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcbiAgICAgIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueFxuICAgICk7XG4gIH0sXG4gIGxlbmd0aDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRvdCh0aGlzKSk7XG4gIH0sXG4gIHVuaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRpdmlkZSh0aGlzLmxlbmd0aCgpKTtcbiAgfSxcbiAgbWluOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5taW4odGhpcy54LCB0aGlzLnkpLCB0aGlzLnopO1xuICB9LFxuICBtYXg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLm1heChNYXRoLm1heCh0aGlzLngsIHRoaXMueSksIHRoaXMueik7XG4gIH0sXG4gIHRvQW5nbGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGhldGE6IE1hdGguYXRhbjIodGhpcy56LCB0aGlzLngpLFxuICAgICAgcGhpOiBNYXRoLmFzaW4odGhpcy55IC8gdGhpcy5sZW5ndGgoKSlcbiAgICB9O1xuICB9LFxuICBhbmdsZVRvOiBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIE1hdGguYWNvcyh0aGlzLmRvdChhKSAvICh0aGlzLmxlbmd0aCgpICogYS5sZW5ndGgoKSkpO1xuICB9LFxuICB0b0FycmF5OiBmdW5jdGlvbihuKSB7XG4gICAgcmV0dXJuIFt0aGlzLngsIHRoaXMueSwgdGhpcy56XS5zbGljZSgwLCBuIHx8IDMpO1xuICB9LFxuICBjbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnksIHRoaXMueik7XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgICB0aGlzLnggPSB4OyB0aGlzLnkgPSB5OyB0aGlzLnogPSB6O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG4vLyAjIyMgU3RhdGljIE1ldGhvZHNcbi8vIGBWZWN0b3IucmFuZG9tRGlyZWN0aW9uKClgIHJldHVybnMgYSB2ZWN0b3Igd2l0aCBhIGxlbmd0aCBvZiAxIGFuZCBhXG4vLyBzdGF0aXN0aWNhbGx5IHVuaWZvcm0gZGlyZWN0aW9uLiBgVmVjdG9yLmxlcnAoKWAgcGVyZm9ybXMgbGluZWFyXG4vLyBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlY3RvcnMuXG5WZWN0b3IubmVnYXRpdmUgPSBmdW5jdGlvbihhLCBiKSB7XG4gIGIueCA9IC1hLng7IGIueSA9IC1hLnk7IGIueiA9IC1hLno7XG4gIHJldHVybiBiO1xufTtcblZlY3Rvci5hZGQgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54ICsgYi54OyBjLnkgPSBhLnkgKyBiLnk7IGMueiA9IGEueiArIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54ICsgYjsgYy55ID0gYS55ICsgYjsgYy56ID0gYS56ICsgYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3Iuc3VidHJhY3QgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54IC0gYi54OyBjLnkgPSBhLnkgLSBiLnk7IGMueiA9IGEueiAtIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54IC0gYjsgYy55ID0gYS55IC0gYjsgYy56ID0gYS56IC0gYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3IubXVsdGlwbHkgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54ICogYi54OyBjLnkgPSBhLnkgKiBiLnk7IGMueiA9IGEueiAqIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54ICogYjsgYy55ID0gYS55ICogYjsgYy56ID0gYS56ICogYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3IuZGl2aWRlID0gZnVuY3Rpb24oYSwgYiwgYykge1xuICBpZiAoYiBpbnN0YW5jZW9mIFZlY3RvcikgeyBjLnggPSBhLnggLyBiLng7IGMueSA9IGEueSAvIGIueTsgYy56ID0gYS56IC8gYi56OyB9XG4gIGVsc2UgeyBjLnggPSBhLnggLyBiOyBjLnkgPSBhLnkgLyBiOyBjLnogPSBhLnogLyBiOyB9XG4gIHJldHVybiBjO1xufTtcblZlY3Rvci5jcm9zcyA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgYy54ID0gYS55ICogYi56IC0gYS56ICogYi55O1xuICBjLnkgPSBhLnogKiBiLnggLSBhLnggKiBiLno7XG4gIGMueiA9IGEueCAqIGIueSAtIGEueSAqIGIueDtcbiAgcmV0dXJuIGM7XG59O1xuVmVjdG9yLnVuaXQgPSBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBsZW5ndGggPSBhLmxlbmd0aCgpO1xuICBiLnggPSBhLnggLyBsZW5ndGg7XG4gIGIueSA9IGEueSAvIGxlbmd0aDtcbiAgYi56ID0gYS56IC8gbGVuZ3RoO1xuICByZXR1cm4gYjtcbn07XG5WZWN0b3IuZnJvbUFuZ2xlcyA9IGZ1bmN0aW9uKHRoZXRhLCBwaGkpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5jb3ModGhldGEpICogTWF0aC5jb3MocGhpKSwgTWF0aC5zaW4ocGhpKSwgTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSk7XG59O1xuVmVjdG9yLnJhbmRvbURpcmVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gVmVjdG9yLmZyb21BbmdsZXMoTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyLCBNYXRoLmFzaW4oTWF0aC5yYW5kb20oKSAqIDIgLSAxKSk7XG59O1xuVmVjdG9yLm1pbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5taW4oYS54LCBiLngpLCBNYXRoLm1pbihhLnksIGIueSksIE1hdGgubWluKGEueiwgYi56KSk7XG59O1xuVmVjdG9yLm1heCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5tYXgoYS54LCBiLngpLCBNYXRoLm1heChhLnksIGIueSksIE1hdGgubWF4KGEueiwgYi56KSk7XG59O1xuVmVjdG9yLmxlcnAgPSBmdW5jdGlvbihhLCBiLCBmcmFjdGlvbikge1xuICByZXR1cm4gYi5zdWJ0cmFjdChhKS5tdWx0aXBseShmcmFjdGlvbikuYWRkKGEpO1xufTtcblZlY3Rvci5mcm9tQXJyYXkgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBuZXcgVmVjdG9yKGFbMF0sIGFbMV0sIGFbMl0pO1xufTtcblZlY3Rvci5hbmdsZUJldHdlZW4gPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhLmFuZ2xlVG8oYik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVmVjdG9yXG59IiwiaW1wb3J0IHsgaCwgcmVuZGVyIH0gZnJvbSBcInByZWFjdFwiO1xuaW1wb3J0IEFwcCBmcm9tIFwiLi91aS9jb21wb25lbnRzL0FwcFwiO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgcmVuZGVyKDxBcHAgLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYXBwXCIpKTtcbn0pO1xuIiwiaW1wb3J0IHsgaCwgQ29tcG9uZW50IH0gZnJvbSBcInByZWFjdFwiO1xuaW1wb3J0IENhbnZhcyBmcm9tIFwianMvdWkvY29tcG9uZW50cy9jYW52YXMvY2FudmFzXCI7XG5pbXBvcnQgQ29udHJvbHMgZnJvbSBcImpzL3VpL2NvbXBvbmVudHMvY29udHJvbHMvY29udHJvbHNcIjtcbmltcG9ydCBTdGF0cyBmcm9tIFwianMvdWkvY29tcG9uZW50cy9zdGF0cy9zdGF0c1wiO1xuaW1wb3J0IHsgQ29udHJvbHNFbnVtIH0gZnJvbSBcImpzL3NoYXJlZC9jb25zdGFudHMuanNcIlxuaW1wb3J0ICogYXMgY29uZmlnIGZyb20gXCJqcy9zaGFyZWQvY29uZmlnXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB2YXIgd29ya2VyID0gbmV3IFdvcmtlcihcIndvcmtlci5qc1wiKTtcbiAgICAgICAgd29ya2VyLm9ubWVzc2FnZSA9IHRoaXMuaGFuZGxlV29ya2VyO1xuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJpbml0XCIpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB3b3JrZXIsXG4gICAgICAgICAgICBub2RlczogW10sXG4gICAgICAgICAgICBzZWxlY3RlZENvbnRyb2w6IENvbnRyb2xzRW51bS5wYW4sXG4gICAgICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgc2hvd0lEczogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25GcmFtZSk7XG4gICAgICAgIHRoaXMuc3RhdGUud29ya2VyLnBvc3RNZXNzYWdlKFwicnVuXCIpO1xuICAgIH1cblxuICAgIG9uRnJhbWUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdGUud29ya2VyLnBvc3RNZXNzYWdlKFwic2VuZFwiKTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25GcmFtZSk7XG4gICAgfTtcblxuICAgIGhhbmRsZVdvcmtlciA9IGRhdGEgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG5vZGVzOiBkYXRhLmRhdGEubm9kZXMsXG4gICAgICAgICAgICB0cnVlU2ltdWxhdGlvblNwZWVkOiBkYXRhLmRhdGEudHJ1ZVNpbXVsYXRpb25TcGVlZFxuICAgICAgICB9KTtcbiAgICAgICAgLy9jb21wdXRlKCk7XG4gICAgfTtcblxuICAgIGNoYW5nZUNvbnRyb2wgPSBjb250cm9sID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzZWxlY3RlZENvbnRyb2w6IGNvbnRyb2xcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY2hhbmdlU2NhbGUgPSBwb3NpdGl2ZSA9PiB7XG4gICAgICBsZXQgc2NhbGUgPSB0aGlzLnN0YXRlLnNjYWxlO1xuICAgICAgaWYgKCghcG9zaXRpdmUgJiYgc2NhbGUgPD0gMSkgfHwgKHBvc2l0aXZlICYmIHNjYWxlIDwgMSkgKSB7XG4gICAgICAgIGlmIChwb3NpdGl2ZSkge1xuICAgICAgICAgIHNjYWxlID0gc2NhbGUgKyAwLjFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzY2FsZSA9IHNjYWxlIC0gMC4xXG4gICAgICAgIH1cbiAgICAgICAgc2NhbGUgPSBNYXRoLnJvdW5kKHNjYWxlKjEwKS8xMFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHBvc2l0aXZlKSB7XG4gICAgICAgICAgc2NhbGUgPSBzY2FsZSArIDFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzY2FsZSA9IHNjYWxlIC0gMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc2NhbGUgPD0gMCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NjYWxlfSlcblxuICAgIH1cblxuICAgIGNoYW5nZU9wdGlvbiA9IChrZXksIHZhbHVlKSA9PiB7XG4gICAgICBsZXQgb3B0aW9ucyA9IHRoaXMuc3RhdGUub3B0aW9ucztcbiAgICAgIG9wdGlvbnNba2V5XSA9IHZhbHVlO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7b3B0aW9uc30pXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPG1haW4+XG4gICAgICAgICAgICAgICAgPENhbnZhcyBvcHRpb25zPXt0aGlzLnN0YXRlLm9wdGlvbnN9IG5vZGVzPXt0aGlzLnN0YXRlLm5vZGVzfSB3b3JrZXI9e3RoaXMuc3RhdGUud29ya2VyfSBzZWxlY3RlZENvbnRyb2w9e3RoaXMuc3RhdGUuc2VsZWN0ZWRDb250cm9sfSBzY2FsZT17dGhpcy5zdGF0ZS5zY2FsZX0vPlxuICAgICAgICAgICAgICAgIDxDb250cm9scyBzZWxlY3RlZENvbnRyb2w9e3RoaXMuc3RhdGUuc2VsZWN0ZWRDb250cm9sfSBjaGFuZ2VDb250cm9sPXt0aGlzLmNoYW5nZUNvbnRyb2x9IGNoYW5nZVNjYWxlPXt0aGlzLmNoYW5nZVNjYWxlfSBzY2FsZT17dGhpcy5zdGF0ZS5zY2FsZX0gb3B0aW9ucz17dGhpcy5zdGF0ZS5vcHRpb25zfSBjaGFuZ2VPcHRpb249e3RoaXMuY2hhbmdlT3B0aW9ufS8+XG4gICAgICAgICAgICAgICAgPFN0YXRzIHRydWVTaW11bGF0aW9uU3BlZWQ9e3RoaXMuc3RhdGUudHJ1ZVNpbXVsYXRpb25TcGVlZH0gLz5cbiAgICAgICAgICAgIDwvbWFpbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbi8qPGRpdj5TaW0gc3BlZWQ6IDxzcGFuIGlkPVwic2ltc3BlZWRcIj48L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48YnV0dG9uIGlkPVwic3RhcnRcIj5TdGFydDwvYnV0dG9uPjxidXR0b24gaWQ9XCJzdG9wXCI+U3RvcDwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+PGlucHV0IGNoZWNrZWQgaWQ9XCJzaG93LWlkc1wiIHR5cGU9XCJjaGVja2JveFwiIC8+IFNob3cgbm9kZSBJRHM8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PkZyb206IDxpbnB1dCBpZD1cImZyb21cIj48L2lucHV0PjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+VG86IDxpbnB1dCBpZD1cInRvXCI+PC9pbnB1dD48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PkZvcmNlOiA8c3BhbiBpZD1cInJlc3VsdFwiPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxpbnB1dCBpZD1cImxvYWQtZGF0YVwiIC8+PGJ1dHRvbiBpZD1cImxvYWRcIj5Mb2FkPC9idXR0b24+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48aW5wdXQgaWQ9XCJzYXZlLWRhdGFcIiAvPjxidXR0b24gaWQ9XCJzYXZlXCI+U2F2ZTwvYnV0dG9uPjwvZGl2PiovXG4iLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tIFwicHJlYWN0XCI7XG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcImpzL3NoYXJlZC9jb25maWdcIjtcbmltcG9ydCAqIGFzIGhlbHBlciBmcm9tIFwianMvc2hhcmVkL2hlbHBlclwiO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSBcImpzL3NoYXJlZC92ZWN0b3JcIjtcbmltcG9ydCB7IE5vZGUgfSBmcm9tIFwianMvc2hhcmVkL25vZGVcIjtcbmltcG9ydCB7IENvbnRyb2xzRW51bSB9IGZyb20gXCJqcy9zaGFyZWQvY29uc3RhbnRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbnZhcyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbW91c2Vkb3duOiBmYWxzZSxcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZTogbnVsbCxcbiAgICAgICAgICAgIG5ld05vZGVzOiBbXSxcbiAgICAgICAgICAgIG1vdXNlUG9zaXRpb246IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgc3RhcnRDb29yZHM6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgbGFzdENvb3JkczogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1lZDogeyB4OiAwLCB5OiAwIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuaW50ZXJhY3QoKTtcbiAgICB9XG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXG4gICAgICAgICAgICAgICAgXCJtb3ZlXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZE5vZGU6IHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlLFxuICAgICAgICAgICAgICAgICAgICBtb3VzZVBvc2l0aW9uOiB0aGlzLnN0YXRlLm1vdXNlUG9zaXRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRVbmlxdWVJRCA9ICgpID0+IHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgbm90dW5pcXVlID0gdHJ1ZTtcbiAgICAgICAgd2hpbGUobm90dW5pcXVlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMubm9kZXMuZmluZChuPT5uLmlkID09PSBpKSAmJiAhdGhpcy5zdGF0ZS5uZXdOb2Rlcy5maW5kKG49Pm4uaWQgPT09IGkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW50ZXJhY3QgPSAoKSA9PiB7XG4gICAgICAgIHZhciBjID0gdGhpcy5jYW52YXM7XG4gICAgICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMubm9kZXM7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgYy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgXCJtb3VzZWRvd25cIixcbiAgICAgICAgICAgIGUgPT4ge1xuICAgICAgICAgICAgICAgIHZhciByZWN0ID0gYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICB2YXIgbW91c2UgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IGUuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgeTogZS5jbGllbnRZIC0gcmVjdC50b3BcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZFYgPSBuZXcgVmVjdG9yKCkubG9hZCh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkKTtcbiAgICAgICAgICAgICAgICB2YXIgbSA9IG5ldyBWZWN0b3IobW91c2UueCwgbW91c2UueSk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlUG9zaXRpb24gPSBtLnN1YnRyYWN0KHRyYW5zZm9ybWVkVikuZGl2aWRlKHRoaXMucHJvcHMuc2NhbGUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLmdyYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVzID0gdGhpcy5wcm9wcy5ub2RlcztcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1pbiA9IDIwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLnBvc2l0aW9uID0gbmV3IFZlY3RvcigpLmxvYWQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBub2Rlc1tpXS5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJ0cmFjdChtLnN1YnRyYWN0KHRyYW5zZm9ybWVkVikuZGl2aWRlKHRoaXMucHJvcHMuc2NhbGUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5sZW5ndGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWluIHx8IGRpc3RhbmNlIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4gPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2RlOiBzZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09PSBDb250cm9sc0VudW0ucGFuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDb29yZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBlLnBhZ2VYIC0gcmVjdC5sZWZ0IC0gdGhpcy5zdGF0ZS5sYXN0Q29vcmRzLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZS5wYWdlWSAtIHJlY3QudG9wIC0gdGhpcy5zdGF0ZS5sYXN0Q29vcmRzLnlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLmFuY2hvcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm5ld2FuY2hvclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBtb3VzZVBvc2l0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLmVyYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMubm9kZXM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtaW4gPSA1O1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoKS5sb2FkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gbm9kZXNbaV0ucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3VidHJhY3QobS5zdWJ0cmFjdCh0cmFuc2Zvcm1lZFYpLmRpdmlkZSh0aGlzLnByb3BzLnNjYWxlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubGVuZ3RoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCBtaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVsZXRlbm9kZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5vZGU6IG5vZGVzW2ldIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zaXRpb246IG0uc3VidHJhY3QodHJhbnNmb3JtZWRWKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09PSBDb250cm9sc0VudW0ucm9wZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IG5ldyBOb2RlKG1vdXNlUG9zaXRpb24ueCwgbW91c2VQb3NpdGlvbi55LDAsMCwwLDAsZmFsc2UsW10sdGhpcy5nZXRVbmlxdWVJRCgpKVxuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZXMgPSB0aGlzLnByb3BzLm5vZGVzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWluID0gNTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb24gPSBuZXcgVmVjdG9yKCkubG9hZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IG5vZGVzW2ldLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YnRyYWN0KG1vdXNlUG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmxlbmd0aCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jb25uZWN0ZWROb2Rlcy5wdXNoKG5vZGVzW2ldLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5jb25uZWN0ZWROb2Rlcy5wdXNoKG5vZGUuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDb29yZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBub2RlLnBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogbm9kZS5wb3NpdGlvbi55XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZXM6IFtub2RlXVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vdXNlZG93bjogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICAgIGMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIFwibW91c2Vtb3ZlXCIsXG4gICAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFggLSByZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNmb3JtZWRWID0gbmV3IFZlY3RvcigpLmxvYWQodGhpcy5zdGF0ZS50cmFuc2Zvcm1lZCk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlUG9zaXRpb24gPSBuZXcgVmVjdG9yKG1vdXNlLngsIG1vdXNlLnkpLnN1YnRyYWN0KFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFZcbiAgICAgICAgICAgICAgICApLmRpdmlkZSh0aGlzLnByb3BzLnNjYWxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgbW91c2VQb3NpdGlvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLmdyYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3VzZVBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT09IENvbnRyb2xzRW51bS5wYW4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubW91c2Vkb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBtb3VzZS54IC0gdGhpcy5zdGF0ZS5zdGFydENvb3Jkcy54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBtb3VzZS55IC0gdGhpcy5zdGF0ZS5zdGFydENvb3Jkcy55XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09PSBDb250cm9sc0VudW0uZXJhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubW91c2Vkb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZXMgPSB0aGlzLnByb3BzLm5vZGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1pbiA9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb24gPSBuZXcgVmVjdG9yKCkubG9hZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IG5vZGVzW2ldLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJ0cmFjdChtb3VzZVBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubGVuZ3RoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMud29ya2VyLnBvc3RNZXNzYWdlKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVsZXRlbm9kZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBub2RlOiBub2Rlc1tpXSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT09IENvbnRyb2xzRW51bS5yb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm1vdXNlZG93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXJ0Q29vcmRzViA9IG5ldyBWZWN0b3IoKS5sb2FkKHRoaXMuc3RhdGUuc3RhcnRDb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gc3RhcnRDb29yZHNWLnN1YnRyYWN0KG1vdXNlUG9zaXRpb24pLmxlbmd0aCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IG5ldyBOb2RlKG1vdXNlUG9zaXRpb24ueCwgbW91c2VQb3NpdGlvbi55LDAsMCwwLDAsZmFsc2UsW10sdGhpcy5nZXRVbmlxdWVJRCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Tm9kZXMgPSB0aGlzLnN0YXRlLm5ld05vZGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmV2Tm9kZSA9IG5ld05vZGVzW25ld05vZGVzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZOb2RlLmNvbm5lY3RlZE5vZGVzLnB1c2gobm9kZS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jb25uZWN0ZWROb2Rlcy5wdXNoKHByZXZOb2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDb29yZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IG1vdXNlUG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IG1vdXNlUG9zaXRpb24ueVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgYy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgXCJtb3VzZXVwXCIsXG4gICAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFggLSByZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNmb3JtZWRWID0gbmV3IFZlY3RvcigpLmxvYWQodGhpcy5zdGF0ZS50cmFuc2Zvcm1lZCk7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSBuZXcgVmVjdG9yKG1vdXNlLngsIG1vdXNlLnkpO1xuICAgICAgICAgICAgICAgIHZhciBtb3VzZVBvc2l0aW9uID0gbS5zdWJ0cmFjdCh0cmFuc2Zvcm1lZFYpLmRpdmlkZSh0aGlzLnByb3BzLnNjYWxlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT09IENvbnRyb2xzRW51bS5ncmFiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy53b3JrZXIucG9zdE1lc3NhZ2UoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibm9tb3ZlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzZWxlY3RlZE5vZGU6IHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZE5vZGU6IG51bGwgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLnBhbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvb3Jkczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGUucGFnZVggLSByZWN0LmxlZnQgLSB0aGlzLnN0YXRlLnN0YXJ0Q29vcmRzLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZS5wYWdlWSAtIHJlY3QudG9wIC0gdGhpcy5zdGF0ZS5zdGFydENvb3Jkcy55XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDb29yZHM6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLnJvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGUgPSB0aGlzLnN0YXRlLm5ld05vZGVzW3RoaXMuc3RhdGUubmV3Tm9kZXMubGVuZ3RoIC0gMV1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVzID0gdGhpcy5wcm9wcy5ub2RlcztcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1pbiA9IDU7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLnBvc2l0aW9uID0gbmV3IFZlY3RvcigpLmxvYWQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBub2Rlc1tpXS5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJ0cmFjdChtb3VzZVBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5sZW5ndGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IG1pbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY29ubmVjdGVkTm9kZXMucHVzaChub2Rlc1tpXS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0uY29ubmVjdGVkTm9kZXMucHVzaChub2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXCJhZGRub2Rlc1wiLCB7bm9kZXM6IHRoaXMuc3RhdGUubmV3Tm9kZXN9XSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlczogbm9kZXMuY29uY2F0KHRoaXMuc3RhdGUubmV3Tm9kZXMpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb3VzZWRvd246IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGUgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2cod2luZG93LnNjcm9sbFkpXG4gICAgICAgIH0pXG4gICAgICAgIGRvY3VtZW50Lm9ua2V5cHJlc3MgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgICAgICAgICAgY29uc29sZS5sb2coZS5rZXlDb2RlKVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBkcmF3ID0gKCkgPT4ge1xuICAgICAgICB2YXIgc2hvd0lEcyA9IHRoaXMucHJvcHMub3B0aW9ucy5zaG93SURzO1xuICAgICAgICAvLyBDbGVhciBhbmQgcmVzZXQgY2FudmFzXG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgbGV0IG5vZGVzID0gdGhpcy5wcm9wcy5ub2RlcztcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoMCwwLDApXCI7XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oMSwwLDAsMSwwLDApO1xuICAgICAgICBjdHguY2xlYXJSZWN0KDAsMCwgdGhpcy5jYW52YXMud2lkdGgsXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodClcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgY3R4LnNldFRyYW5zZm9ybShcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc2NhbGUsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc2NhbGUsXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLngsXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnlcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBEcmF3IGdyaWRcbiAgICAgICAgdmFyIGdyaWRTaXplID0gMTAgKiBjb25maWcubWV0cmU7XG4gICAgICAgIHZhciBvZmZzZXR4ID0gKHRoaXMuc3RhdGUudHJhbnNmb3JtZWQueCAvIHRoaXMucHJvcHMuc2NhbGUgKSAlIGdyaWRTaXplO1xuICAgICAgICB2YXIgb2Zmc2V0eSA9ICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnkgLyB0aGlzLnByb3BzLnNjYWxlKSAlIGdyaWRTaXplO1xuICAgICAgICBmb3IgKGxldCB4ID0gMCAtIDIqZ3JpZFNpemU7IHggPCAodGhpcy5jYW52YXMud2lkdGggLyAgdGhpcy5wcm9wcy5zY2FsZSkgKyBncmlkU2l6ZTsgeCA9IHggKyBncmlkU2l6ZSkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCIjZDBkMGQwXCJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oeCAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnggLyB0aGlzLnByb3BzLnNjYWxlICkgKyBvZmZzZXR4LCAwIC0gZ3JpZFNpemUgLSAodGhpcy5zdGF0ZS50cmFuc2Zvcm1lZC55IC8gdGhpcy5wcm9wcy5zY2FsZSkgKyBvZmZzZXR5KTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oeCAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnggLyB0aGlzLnByb3BzLnNjYWxlICkgKyBvZmZzZXR4LCAgKHRoaXMuY2FudmFzLmhlaWdodCAvICB0aGlzLnByb3BzLnNjYWxlKSAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnkgLyB0aGlzLnByb3BzLnNjYWxlKSArIG9mZnNldHkgKyBncmlkU2l6ZSk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKClcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCB5ID0gMCAtIDIqZ3JpZFNpemU7IHkgPCAodGhpcy5jYW52YXMuaGVpZ2h0IC8gIHRoaXMucHJvcHMuc2NhbGUpICsgZ3JpZFNpemU7IHkgPSB5ICsgZ3JpZFNpemUpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiI2QwZDBkMFwiXG4gICAgICAgICAgICBjdHgubW92ZVRvKDAgLSBncmlkU2l6ZSAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnggLyB0aGlzLnByb3BzLnNjYWxlICkgKyBvZmZzZXR4LCB5IC0gKHRoaXMuc3RhdGUudHJhbnNmb3JtZWQueSAvIHRoaXMucHJvcHMuc2NhbGUpICsgb2Zmc2V0eSk7XG4gICAgICAgICAgICBjdHgubGluZVRvKCh0aGlzLmNhbnZhcy53aWR0aCAvICB0aGlzLnByb3BzLnNjYWxlKSAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnggLyB0aGlzLnByb3BzLnNjYWxlICkgKyBvZmZzZXR4ICsgZ3JpZFNpemUseSAtICAodGhpcy5zdGF0ZS50cmFuc2Zvcm1lZC55IC8gdGhpcy5wcm9wcy5zY2FsZSkgKyBvZmZzZXR5KTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHJhdyBpbmRpY2F0b3JzIGFyb3VuZCBjdXJzb3IgaWYgbmVlZGVkXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDAsMCwwKVwiO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT09IENvbnRyb2xzRW51bS5lcmFzZSkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmFyYyhcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm1vdXNlUG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm1vdXNlUG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICA1LFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMiAqIE1hdGguUElcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEcmF3IHNjYWxlIGJhclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oMTAsIDEwMCk7XG4gICAgICAgIGN0eC5saW5lVG8oMTAsIDEwMCArIDEwICogY29uZmlnLm1ldHJlKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiMTBtXCIsIDExLCAxMDAgKyAxMCAqIGNvbmZpZy5tZXRyZSAvIDIpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgLy8gRHJhdyBhbGwgbGluZXMgYW5kIG5vZGVzXG4gICAgICAgIHZhciBkcmF3biA9IFtdO1xuICAgICAgICBsZXQgZHJhd0xpbmUgPSAobm9kZSwgbm9kZXMsIGNvbm5lY3RlZE5vZGVJRCkgPT4ge1xuICAgICAgICAgICAgdmFyIG5vZGVzc3NzID0gdGhpcy5wcm9wcy5ub2Rlc1xuICAgICAgICAgICAgdmFyIG5ld25vZGVzc3NzcyA9IHRoaXMuc3RhdGUubmV3Tm9kZXNcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGlmIChub2RlLmZpeGVkKSB7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG5vZGUucG9zaXRpb24ueCAtIDIsIG5vZGUucG9zaXRpb24ueSAtIDIsIDUsIDUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3Qobm9kZS5wb3NpdGlvbi54IC0gMSwgbm9kZS5wb3NpdGlvbi55IC0gMSwgMywgMyk7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgaWYgKHNob3dJRHMpIHtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQobm9kZS5pZCwgbm9kZS5wb3NpdGlvbi54ICsgMSwgbm9kZS5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBkcmF3bi5pbmRleE9mKGNvbm5lY3RlZE5vZGVJRC50b1N0cmluZygpICsgbm9kZS5pZC50b1N0cmluZygpKSA8XG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0ZWROb2RlID0gaGVscGVyLmdldE5vZGUoY29ubmVjdGVkTm9kZUlELCBub2Rlcyk7XG4gICAgICAgICAgICAgICAgY3R4Lm1vdmVUbyhjb25uZWN0ZWROb2RlLnBvc2l0aW9uLngsIGNvbm5lY3RlZE5vZGUucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyhub2RlLnBvc2l0aW9uLngsIG5vZGUucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgZHJhd24ucHVzaChub2RlLmlkLnRvU3RyaW5nKCkgKyBjb25uZWN0ZWROb2RlLmlkLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIHZhciBmb3JjZSA9IGhlbHBlci5nZXRGb3JjZShub2RlLCBjb25uZWN0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGZvcmNlLnRvdGFsID49IGNvbmZpZy5kYW5nZXJGb3JjZU1pbiAmJlxuICAgICAgICAgICAgICAgICAgICBmb3JjZS50b3RhbCA8IGNvbmZpZy5kYW5nZXJGb3JjZU1heFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9ybUZvcmNlID1cbiAgICAgICAgICAgICAgICAgICAgICAgIChmb3JjZS50b3RhbCAtIGNvbmZpZy5kYW5nZXJGb3JjZU1pbikgL1xuICAgICAgICAgICAgICAgICAgICAgICAgKGNvbmZpZy5kYW5nZXJGb3JjZU1heCAtIGNvbmZpZy5kYW5nZXJGb3JjZU1pbik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2xvciA9IG5vcm1Gb3JjZSAqIDI1NTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoXCIgKyBjb2xvci50b0ZpeGVkKDApICsgXCIsIDAsIDApXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmb3JjZS50b3RhbCA+PSBjb25maWcuZGFuZ2VyRm9yY2VNYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoMjU1LCAwLCAwKVwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDAsMCwwKVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbm9kZXMuY29uY2F0KHRoaXMuc3RhdGUubmV3Tm9kZXMpLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGlmIChub2RlLmNvbm5lY3RlZE5vZGVzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmZpeGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChub2RlLnBvc2l0aW9uLnggLSAyLCBub2RlLnBvc2l0aW9uLnkgLSAyLCA1LCA1KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3Qobm9kZS5wb3NpdGlvbi54IC0gMSwgbm9kZS5wb3NpdGlvbi55IC0gMSwgMywgMyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzaG93SURzKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChub2RlLmlkLCBub2RlLnBvc2l0aW9uLnggKyAxLCBub2RlLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlLmNvbm5lY3RlZE5vZGVzLmZvckVhY2goZHJhd0xpbmUuYmluZCh0aGlzLCBub2RlLCBub2Rlcy5jb25jYXQodGhpcy5zdGF0ZS5uZXdOb2RlcykpKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Y2FudmFzXG4gICAgICAgICAgICAgICAgcmVmPXtjYW52YXMgPT4gKHRoaXMuY2FudmFzID0gY2FudmFzKX1cbiAgICAgICAgICAgICAgICBpZD1cImNhbnZhc1wiXG4gICAgICAgICAgICAgICAgd2lkdGg9e3dpbmRvdy5pbm5lcldpZHRofVxuICAgICAgICAgICAgICAgIGhlaWdodD17d2luZG93LmlubmVySGVpZ2h0fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tIFwicHJlYWN0XCI7XG5pbXBvcnQgeyBDb250cm9sc0VudW0gfSBmcm9tIFwianMvc2hhcmVkL2NvbnN0YW50cy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250cm9scyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgb3B0aW9uc1Zpc2libGU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xzXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbnMgaGFzLWFkZG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbCAke3RoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29udHJvbHNFbnVtLnBhbiAmJiBcImlzLXByaW1hcnlcIn1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2hhbmdlQ29udHJvbChDb250cm9sc0VudW0ucGFuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXIgZmEtaGFuZC1wYXBlclwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbCAke3RoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29udHJvbHNFbnVtLmdyYWIgJiYgXCJpcy1wcmltYXJ5XCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoYW5nZUNvbnRyb2woQ29udHJvbHNFbnVtLmdyYWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhciBmYS1oYW5kLXJvY2tcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BidXR0b24gaXMtc21hbGwgJHt0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRyb2xzRW51bS5hbmNob3IgJiYgXCJpcy1wcmltYXJ5XCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoYW5nZUNvbnRyb2woQ29udHJvbHNFbnVtLmFuY2hvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLXBsdXNcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BidXR0b24gaXMtc21hbGwgJHt0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRyb2xzRW51bS5yb3BlICYmIFwiaXMtcHJpbWFyeVwifWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VDb250cm9sKENvbnRyb2xzRW51bS5yb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXMgZmEtcGVuY2lsLWFsdFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbCAke3RoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29udHJvbHNFbnVtLmVyYXNlICYmIFwiaXMtcHJpbWFyeVwifWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VDb250cm9sKENvbnRyb2xzRW51bS5lcmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLWVyYXNlclwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbGB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VTY2FsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvblwiPi08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPXtgYnV0dG9uIGlzLXNtYWxsYH0gZGlzYWJsZWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5zY2FsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPXtgYnV0dG9uIGlzLXNtYWxsYH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoYW5nZVNjYWxlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb25cIj4rPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2Bkcm9wZG93biAke3RoaXMuc3RhdGUub3B0aW9uc1Zpc2libGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlzLWFjdGl2ZVwifWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRyb3Bkb3duLXRyaWdnZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYnV0dG9uIGlzLXNtYWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1Zpc2libGU6ICF0aGlzLnN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vcHRpb25zVmlzaWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb24gaXMtc21hbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLWNvZ1wiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj57XCIgXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvbiBpcy1zbWFsbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImZhcyBmYS1hbmdsZS1kb3duXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJkcm9wZG93bi1tZW51XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cImRyb3Bkb3duLW1lbnUyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwibWVudVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkcm9wZG93bi1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkcm9wZG93bi1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBvbkNoYW5nZT17ZT0+dGhpcy5wcm9wcy5jaGFuZ2VPcHRpb24oJ3Nob3dJRHMnLCBlLnRhcmdldC5jaGVja2VkKX0vPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNob3cgSURzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGgsIENvbXBvbmVudCB9IGZyb20gXCJwcmVhY3RcIjtcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tIFwianMvc2hhcmVkL2NvbmZpZ1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0cyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2ltU3BlZWRzOiBuZXcgQXJyYXkoMTAwKS5maWxsKGNvbmZpZy5zaW11bGF0aW9uU3BlZWQpLFxuICAgICAgICAgICAgY2FsY3VsYXRlZFNpbVNwZWVkOiBjb25maWcuc2ltdWxhdGlvblNwZWVkXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhwcm9wcykge1xuICAgICAgICBsZXQgc2ltU3BlZWRzID0gdGhpcy5zdGF0ZS5zaW1TcGVlZHM7XG4gICAgICAgIHNpbVNwZWVkcy5wb3AoKTtcbiAgICAgICAgc2ltU3BlZWRzLnVuc2hpZnQocHJvcHMudHJ1ZVNpbXVsYXRpb25TcGVlZCk7XG4gICAgICAgIGxldCBzdW0gPSBzaW1TcGVlZHMucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhICsgYjtcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2ltU3BlZWRzLFxuICAgICAgICAgICAgY2FsY3VsYXRlZFNpbVNwZWVkOiBzdW0gLyBzaW1TcGVlZHMubGVuZ3RoXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RhdHNcIj5cbiAgICAgICAgICAgICAgICA8c3Bhbj57dGhpcy5zdGF0ZS5jYWxjdWxhdGVkU2ltU3BlZWQudG9GaXhlZCgyKX14PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIiwiY29uc3QgaGVscGVyID0gcmVxdWlyZSgnanMvc2hhcmVkL2hlbHBlcicpO1xuY29uc3QgY29uZmlnID0gcmVxdWlyZSgnanMvc2hhcmVkL2NvbmZpZycpO1xuY29uc3QgVmVjdG9yID0gcmVxdWlyZShcImpzL3NoYXJlZC92ZWN0b3JcIikuVmVjdG9yO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgdmFyIGMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKTtcbiAgICB2YXIgY3R4ID0gYy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgdmFyIHRydWVTaW11bGF0aW9uU3BlZWQgPSAwO1xuXG4gICAgdmFyIHdvcmtlciA9IG5ldyBXb3JrZXIoXCJ3b3JrZXIuanNcIik7XG4gICAgd29ya2VyLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhLmRhdGEpXG4gICAgICAgIG5vZGVzID0gZGF0YS5kYXRhLm5vZGVzO1xuICAgICAgICB0cnVlU2ltdWxhdGlvblNwZWVkID0gZGF0YS5kYXRhLnRydWVTaW11bGF0aW9uU3BlZWQ7XG4gICAgICAgIGRyYXcoKTtcbiAgICAgICAgY29tcHV0ZSgpO1xuICAgICAgICBjYWxjU2ltU3BlZWQoKTtcbiAgICB9O1xuICAgIHdvcmtlci5wb3N0TWVzc2FnZShcImluaXRcIik7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdXNlclBhdXNlID0gZmFsc2U7XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcInJ1blwiKTtcbiAgICB9KTtcblxuICAgIHZhciB1c2VyUGF1c2UgPSBmYWxzZTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3BcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB1c2VyUGF1c2UgPSB0cnVlO1xuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJwYXVzZVwiKTtcbiAgICB9KTtcblxuICAgIHZhciBzaG93SURzID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNob3ctaWRzXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2hvd0lEcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hvdy1pZHNcIikuY2hlY2tlZDtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkLWRhdGFcIikudmFsdWU7XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShbXCJsb2FkXCIsIGRhdGFdKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2F2ZS1kYXRhXCIpLnZhbHVlID0gYnRvYShcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KG5vZGVzKVxuICAgICAgICApO1xuICAgIH0pO1xuXG4gICAgdmFyIHNlbGVjdGVkTm9kZTsgXG4gICAgdmFyIG1vdXNlUG9zaXRpb247XG4gICAgdmFyIHN0YXJ0Q29vcmRzO1xuICAgIHZhciBsYXN0Q29vcmRzID0ge3g6MCx5OjB9O1xuICAgIHZhciB0cmFuc2Zvcm1lZCA9IHt4OjAseTowfTtcbiAgICBjLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7XG4gICAgICAgIHZhciByZWN0ID0gYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdmFyIG1vdXNlID0ge1xuICAgICAgICAgIHg6IGUuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgICAgICB5OiBlLmNsaWVudFkgLSByZWN0LnRvcFxuICAgICAgICB9O1xuICAgICAgICB2YXIgbSA9IG5ldyBWZWN0b3IobW91c2UueCwgbW91c2UueSk7XG4gICAgICAgIHZhciB0cmFuc2Zvcm1lZFYgPSBuZXcgVmVjdG9yKCkubG9hZCh0cmFuc2Zvcm1lZCk7XG4gICAgICAgIHZhciBtaW4gPSA1O1xuICAgICAgICB2YXIgc2VsZWN0ZWQ7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5vZGVzW2ldLnBvc2l0aW9uID0gbmV3IFZlY3RvcigpLmxvYWQobm9kZXNbaV0ucG9zaXRpb24pO1xuICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gbm9kZXNbaV0ucG9zaXRpb24uc3VidHJhY3QobS5zdWJ0cmFjdCh0cmFuc2Zvcm1lZFYpKS5sZW5ndGgoKTtcbiAgICAgICAgICAgIGlmICghbWluIHx8IGRpc3RhbmNlIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgICAgICBtaW4gPSBkaXN0YW5jZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBtb3VzZVBvc2l0aW9uID0gbS5zdWJ0cmFjdCh0cmFuc2Zvcm1lZFYpO1xuICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZSA9IHNlbGVjdGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnRDb29yZHMgPSB7eDogZS5wYWdlWCAtIHJlY3QubGVmdCAtIGxhc3RDb29yZHMueCwgeTogZS5wYWdlWSAtIHJlY3QudG9wIC0gbGFzdENvb3Jkcy55fTtcbiAgICAgICAgICAgIC8vd29ya2VyLnBvc3RNZXNzYWdlKFtcIm5ld25vZGVcIiwge21vdXNlUG9zaXRpb259XSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRydWUpO1xuICAgICAgYy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB2YXIgbW91c2UgPSB7XG4gICAgICAgICAgICAgICAgeDogZS5jbGllbnRYIC0gcmVjdC5sZWZ0LFxuICAgICAgICAgICAgICAgIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybWVkViA9IG5ldyBWZWN0b3IoKS5sb2FkKHRyYW5zZm9ybWVkKTtcbiAgICAgICAgICAgIG1vdXNlUG9zaXRpb24gPSBuZXcgVmVjdG9yKG1vdXNlLngsIG1vdXNlLnkpLnN1YnRyYWN0KHRyYW5zZm9ybWVkVik7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhcnRDb29yZHMpIHtcbiAgICAgICAgICAgIHZhciByZWN0ID0gYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHZhciBtb3VzZSA9IHtcbiAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFggLSByZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgeTogZS5jbGllbnRZIC0gcmVjdC50b3BcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0cmFuc2Zvcm1lZCA9IHt4OiAgbW91c2UueCAtIHN0YXJ0Q29vcmRzLngsIHk6IG1vdXNlLnkgLSBzdGFydENvb3Jkcy55fTtcbiAgICAgICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgdHJhbnNmb3JtZWQueCwgdHJhbnNmb3JtZWQueSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRydWUpO1xuICAgICAgYy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFtcIm5vbW92ZVwiLCB7c2VsZWN0ZWROb2RlfV0pO1xuICAgICAgICAgICAgc2VsZWN0ZWROb2RlID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0Q29vcmRzKSB7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBsYXN0Q29vcmRzID0ge3g6IGUucGFnZVggLSByZWN0LmxlZnQgLSBzdGFydENvb3Jkcy54LFxuICAgICAgICAgICAgeTogZS5wYWdlWSAtIHJlY3QudG9wIC0gc3RhcnRDb29yZHMueX07XG4gICAgICAgICAgICBzdGFydENvb3JkcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfSwgdHJ1ZSk7XG5cbiAgICB2YXIgc2ltU3BlZWRzID0gbmV3IEFycmF5KDEwMCk7XG4gICAgc2ltU3BlZWRzLmZpbGwoY29uZmlnLnNpbXVsYXRpb25TcGVlZCk7XG4gICAgZnVuY3Rpb24gY2FsY1NpbVNwZWVkKCkge1xuICAgICAgICBzaW1TcGVlZHMucG9wKCk7XG4gICAgICAgIHNpbVNwZWVkcy51bnNoaWZ0KHRydWVTaW11bGF0aW9uU3BlZWQpO1xuICAgICAgICB2YXIgc3VtID0gc2ltU3BlZWRzLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgICAgIH0sIDApO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNpbXNwZWVkXCIpLmlubmVyVGV4dCA9XG4gICAgICAgICAgICAoc3VtIC8gc2ltU3BlZWRzLmxlbmd0aCkudG9GaXhlZCgyKSArIFwieFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDAsMCwwKVwiO1xuICAgICAgICBjdHguY2xlYXJSZWN0KDAgLSB0cmFuc2Zvcm1lZC54LCAwIC0gdHJhbnNmb3JtZWQueSwgYy53aWR0aCwgYy5oZWlnaHQpO1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYigwLDAsMClcIjtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKDEwLCA1MCk7XG4gICAgICAgIGN0eC5saW5lVG8oMTAsIDUwICsgMTAgKiBjb25maWcubWV0cmUpO1xuICAgICAgICBjdHguZmlsbFRleHQoXCIxMG1cIiwgMTEsIDUwICsgMTAgKiBjb25maWcubWV0cmUgLyAyKTtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB2YXIgZHJhd24gPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gZHJhd0xpbmUobm9kZSwgY29ubmVjdGVkTm9kZUlEKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3Qobm9kZS5wb3NpdGlvbi54IC0gMSwgbm9kZS5wb3NpdGlvbi55IC0gMSwgMywgMyk7XG4gICAgICAgICAgICBpZiAoc2hvd0lEcykge1xuICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChub2RlLmlkLCBub2RlLnBvc2l0aW9uLnggKyAxLCBub2RlLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGRyYXduLmluZGV4T2YoY29ubmVjdGVkTm9kZUlELnRvU3RyaW5nKCkgKyBub2RlLmlkLnRvU3RyaW5nKCkpIDxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbm5lY3RlZE5vZGUgPSBoZWxwZXIuZ2V0Tm9kZShjb25uZWN0ZWROb2RlSUQsIG5vZGVzKTtcbiAgICAgICAgICAgICAgICAvL3ZhciBtaWRwb2ludCA9IGhlbHBlci5nZXRNaWRwb2ludChub2RlLCBjb25uZWN0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICAvL2N0eC5maWxsVGV4dChcIng6IFwiICsgbm9kZS5mb3JjZS54LnRvRml4ZWQoMykgKyBcIiB5OiBcIiArIG5vZGUuZm9yY2UueS50b0ZpeGVkKDMpICxtaWRwb2ludC54LG1pZHBvaW50LnkpO1xuICAgICAgICAgICAgICAgIGN0eC5tb3ZlVG8oY29ubmVjdGVkTm9kZS5wb3NpdGlvbi54LCBjb25uZWN0ZWROb2RlLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8obm9kZS5wb3NpdGlvbi54LCBub2RlLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIGRyYXduLnB1c2gobm9kZS5pZC50b1N0cmluZygpICsgY29ubmVjdGVkTm9kZS5pZC50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB2YXIgZm9yY2UgPSBoZWxwZXIuZ2V0Rm9yY2Uobm9kZSwgY29ubmVjdGVkTm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBmb3JjZS50b3RhbCA+PSBjb25maWcuZGFuZ2VyRm9yY2VNaW4gJiZcbiAgICAgICAgICAgICAgICAgICAgZm9yY2UudG90YWwgPCBjb25maWcuZGFuZ2VyRm9yY2VNYXhcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgbm9ybUZvcmNlID1cbiAgICAgICAgICAgICAgICAgICAgICAgIChmb3JjZS50b3RhbCAtIGNvbmZpZy5kYW5nZXJGb3JjZU1pbikgL1xuICAgICAgICAgICAgICAgICAgICAgICAgKGNvbmZpZy5kYW5nZXJGb3JjZU1heCAtIGNvbmZpZy5kYW5nZXJGb3JjZU1pbik7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yID0gbm9ybUZvcmNlICogMjU1O1xuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYihcIiArIGNvbG9yLnRvRml4ZWQoMCkgKyBcIiwgMCwgMClcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZvcmNlLnRvdGFsID49IGNvbmZpZy5kYW5nZXJGb3JjZU1heCkge1xuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYigyNTUsIDAsIDApXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoMCwwLDApXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChub2RlLmNvbm5lY3RlZE5vZGVzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChub2RlLnBvc2l0aW9uLnggLSAxLCBub2RlLnBvc2l0aW9uLnkgLSAxLCAzLCAzKTtcbiAgICAgICAgICAgICAgICBpZiAoc2hvd0lEcykge1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQobm9kZS5pZCwgbm9kZS5wb3NpdGlvbi54ICsgMSwgbm9kZS5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZS5jb25uZWN0ZWROb2Rlcy5mb3JFYWNoKGRyYXdMaW5lLmJpbmQodGhpcywgbm9kZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9jdHguc3Ryb2tlKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbXB1dGUoKSB7XG4gICAgICAgIHZhciBjb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgZnVuY3Rpb24gY29tcHV0ZU5vZGUobm9kZSwgY29ubmVjdGVkTm9kZUlEKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b1wiKS52YWx1ZSkgPT09XG4gICAgICAgICAgICAgICAgY29ubmVjdGVkTm9kZUlEXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0ZWROb2RlID0gaGVscGVyLmdldE5vZGUoY29ubmVjdGVkTm9kZUlELCBub2Rlcyk7XG4gICAgICAgICAgICAgICAgdmFyIGZvcmNlID0gaGVscGVyLmdldEZvcmNlKG5vZGUsIGNvbm5lY3RlZE5vZGUpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0XCIpLmlubmVyVGV4dCA9XG4gICAgICAgICAgICAgICAgICAgIGZvcmNlLnRvdGFsLnRvRml4ZWQoMykgKyBcIk5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZyb21cIikudmFsdWUpID09PSBub2RlLmlkKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5jb25uZWN0ZWROb2Rlcy5mb3JFYWNoKGNvbXB1dGVOb2RlLmJpbmQodGhpcywgbm9kZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFjb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0XCIpLmlubmVyVGV4dCA9IFwiTm90IGNvbm5lY3RlZFwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZnJhbWVTeW5jZXIodGltZXN0YW1wKSB7XG4gICAgICAgIGlmIChzZWxlY3RlZE5vZGUpIHtcbiAgICAgICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShbXCJtb3ZlXCIsIHtzZWxlY3RlZE5vZGUsIG1vdXNlUG9zaXRpb259XSlcbiAgICAgICAgfVxuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJzZW5kXCIpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWVTeW5jZXIpO1xuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWVTeW5jZXIpO1xuXG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwicnVuXCIpO1xufSk7XG4iLCIvKiBqc2hpbnQgaWdub3JlOnN0YXJ0ICovXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBXZWJTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0IHx8IHdpbmRvdy5Nb3pXZWJTb2NrZXQ7XG4gIHZhciBiciA9IHdpbmRvdy5icnVuY2ggPSAod2luZG93LmJydW5jaCB8fCB7fSk7XG4gIHZhciBhciA9IGJyWydhdXRvLXJlbG9hZCddID0gKGJyWydhdXRvLXJlbG9hZCddIHx8IHt9KTtcbiAgaWYgKCFXZWJTb2NrZXQgfHwgYXIuZGlzYWJsZWQpIHJldHVybjtcbiAgaWYgKHdpbmRvdy5fYXIpIHJldHVybjtcbiAgd2luZG93Ll9hciA9IHRydWU7XG5cbiAgdmFyIGNhY2hlQnVzdGVyID0gZnVuY3Rpb24odXJsKXtcbiAgICB2YXIgZGF0ZSA9IE1hdGgucm91bmQoRGF0ZS5ub3coKSAvIDEwMDApLnRvU3RyaW5nKCk7XG4gICAgdXJsID0gdXJsLnJlcGxhY2UoLyhcXCZ8XFxcXD8pY2FjaGVCdXN0ZXI9XFxkKi8sICcnKTtcbiAgICByZXR1cm4gdXJsICsgKHVybC5pbmRleE9mKCc/JykgPj0gMCA/ICcmJyA6ICc/JykgKydjYWNoZUJ1c3Rlcj0nICsgZGF0ZTtcbiAgfTtcblxuICB2YXIgYnJvd3NlciA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbiAgdmFyIGZvcmNlUmVwYWludCA9IGFyLmZvcmNlUmVwYWludCB8fCBicm93c2VyLmluZGV4T2YoJ2Nocm9tZScpID4gLTE7XG5cbiAgdmFyIHJlbG9hZGVycyA9IHtcbiAgICBwYWdlOiBmdW5jdGlvbigpe1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICB9LFxuXG4gICAgc3R5bGVzaGVldDogZnVuY3Rpb24oKXtcbiAgICAgIFtdLnNsaWNlXG4gICAgICAgIC5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbcmVsPXN0eWxlc2hlZXRdJykpXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24obGluaykge1xuICAgICAgICAgIHZhciB2YWwgPSBsaW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1hdXRvcmVsb2FkJyk7XG4gICAgICAgICAgcmV0dXJuIGxpbmsuaHJlZiAmJiB2YWwgIT0gJ2ZhbHNlJztcbiAgICAgICAgfSlcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obGluaykge1xuICAgICAgICAgIGxpbmsuaHJlZiA9IGNhY2hlQnVzdGVyKGxpbmsuaHJlZik7XG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBIYWNrIHRvIGZvcmNlIHBhZ2UgcmVwYWludCBhZnRlciAyNW1zLlxuICAgICAgaWYgKGZvcmNlUmVwYWludCkgc2V0VGltZW91dChmdW5jdGlvbigpIHsgZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQ7IH0sIDI1KTtcbiAgICB9LFxuXG4gICAgamF2YXNjcmlwdDogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBzY3JpcHRzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHQnKSk7XG4gICAgICB2YXIgdGV4dFNjcmlwdHMgPSBzY3JpcHRzLm1hcChmdW5jdGlvbihzY3JpcHQpIHsgcmV0dXJuIHNjcmlwdC50ZXh0IH0pLmZpbHRlcihmdW5jdGlvbih0ZXh0KSB7IHJldHVybiB0ZXh0Lmxlbmd0aCA+IDAgfSk7XG4gICAgICB2YXIgc3JjU2NyaXB0cyA9IHNjcmlwdHMuZmlsdGVyKGZ1bmN0aW9uKHNjcmlwdCkgeyByZXR1cm4gc2NyaXB0LnNyYyB9KTtcblxuICAgICAgdmFyIGxvYWRlZCA9IDA7XG4gICAgICB2YXIgYWxsID0gc3JjU2NyaXB0cy5sZW5ndGg7XG4gICAgICB2YXIgb25Mb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxvYWRlZCA9IGxvYWRlZCArIDE7XG4gICAgICAgIGlmIChsb2FkZWQgPT09IGFsbCkge1xuICAgICAgICAgIHRleHRTY3JpcHRzLmZvckVhY2goZnVuY3Rpb24oc2NyaXB0KSB7IGV2YWwoc2NyaXB0KTsgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3JjU2NyaXB0c1xuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihzY3JpcHQpIHtcbiAgICAgICAgICB2YXIgc3JjID0gc2NyaXB0LnNyYztcbiAgICAgICAgICBzY3JpcHQucmVtb3ZlKCk7XG4gICAgICAgICAgdmFyIG5ld1NjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgIG5ld1NjcmlwdC5zcmMgPSBjYWNoZUJ1c3RlcihzcmMpO1xuICAgICAgICAgIG5ld1NjcmlwdC5hc3luYyA9IHRydWU7XG4gICAgICAgICAgbmV3U2NyaXB0Lm9ubG9hZCA9IG9uTG9hZDtcbiAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKG5ld1NjcmlwdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgdmFyIHBvcnQgPSBhci5wb3J0IHx8IDk0ODU7XG4gIHZhciBob3N0ID0gYnIuc2VydmVyIHx8IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSB8fCAnbG9jYWxob3N0JztcblxuICB2YXIgY29ubmVjdCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNvbm5lY3Rpb24gPSBuZXcgV2ViU29ja2V0KCd3czovLycgKyBob3N0ICsgJzonICsgcG9ydCk7XG4gICAgY29ubmVjdGlvbi5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCl7XG4gICAgICBpZiAoYXIuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgIHZhciBtZXNzYWdlID0gZXZlbnQuZGF0YTtcbiAgICAgIHZhciByZWxvYWRlciA9IHJlbG9hZGVyc1ttZXNzYWdlXSB8fCByZWxvYWRlcnMucGFnZTtcbiAgICAgIHJlbG9hZGVyKCk7XG4gICAgfTtcbiAgICBjb25uZWN0aW9uLm9uZXJyb3IgPSBmdW5jdGlvbigpe1xuICAgICAgaWYgKGNvbm5lY3Rpb24ucmVhZHlTdGF0ZSkgY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgIH07XG4gICAgY29ubmVjdGlvbi5vbmNsb3NlID0gZnVuY3Rpb24oKXtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNvbm5lY3QsIDEwMDApO1xuICAgIH07XG4gIH07XG4gIGNvbm5lY3QoKTtcbn0pKCk7XG4vKiBqc2hpbnQgaWdub3JlOmVuZCAqL1xuIl19