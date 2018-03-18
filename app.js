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

var _saveModal = require("js/ui/components/save-modal/save-modal");

var _saveModal2 = _interopRequireDefault(_saveModal);

var _loadModal = require("js/ui/components/load-modal/load-modal");

var _loadModal2 = _interopRequireDefault(_loadModal);

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

    _this.save = function () {
      _this.setState({
        saveData: btoa(JSON.stringify(_this.state.nodes)),
        saveModalVisible: true
      });
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
      },
      saveData: null,
      saveModalVisible: false,
      loadModalVisible: false
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
      var _this2 = this;

      return (0, _preact.h)(
        "main",
        null,
        (0, _preact.h)(_canvas2.default, { options: this.state.options, nodes: this.state.nodes, worker: this.state.worker, selectedControl: this.state.selectedControl, scale: this.state.scale }),
        (0, _preact.h)(_controls2.default, { worker: this.state.worker, selectedControl: this.state.selectedControl, changeControl: this.changeControl, changeScale: this.changeScale, scale: this.state.scale, options: this.state.options, changeOption: this.changeOption, save: this.save, load: function load() {
            return _this2.setState({ loadModalVisible: true });
          } }),
        (0, _preact.h)(_stats2.default, { trueSimulationSpeed: this.state.trueSimulationSpeed }),
        (0, _preact.h)(_saveModal2.default, { visible: this.state.saveModalVisible, saveData: this.state.saveData, close: function close() {
            return _this2.setState({ saveModalVisible: false });
          } }),
        (0, _preact.h)(_loadModal2.default, { visible: this.state.loadModalVisible, worker: this.state.worker, close: function close() {
            return _this2.setState({ loadModalVisible: false });
          } })
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
            optionsVisible: false,
            paused: false
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
                        "button",
                        {
                            "class": "button is-small " + (this.props.selectedControl == _constants.ControlsEnum.pause && "is-primary"),
                            onClick: function onClick() {
                                _this2.props.worker.postMessage(_this2.state.paused ? "run" : "pause");
                                _this2.setState({ paused: !_this2.state.paused });
                            } },
                        (0, _preact.h)(
                            "span",
                            { "class": "icon" },
                            (0, _preact.h)("i", { "class": "fas " + (this.state.paused ? 'fa-play' : 'fa-pause') })
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
                                ),
                                (0, _preact.h)(
                                    "a",
                                    { "class": "dropdown-item", onClick: this.props.save },
                                    "Save"
                                ),
                                (0, _preact.h)(
                                    "a",
                                    { "class": "dropdown-item", onClick: this.props.load },
                                    "Load"
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

;require.register("js/ui/components/load-modal/load-modal.js", function(exports, require, module) {"use strict";

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

var LoadModal = function (_Component) {
    _inherits(LoadModal, _Component);

    function LoadModal(props) {
        _classCallCheck(this, LoadModal);

        var _this = _possibleConstructorReturn(this, (LoadModal.__proto__ || Object.getPrototypeOf(LoadModal)).call(this, props));

        _this.load = function () {
            _this.props.worker.postMessage(["load", _this.state.loadData]);
            _this.setState({
                loaded: true,
                success: true
            });
        };

        _this.setData = function (e) {
            _this.setState({ loadData: e.target.value });
        };

        _this.state = {
            loaded: false,
            success: false,
            loadData: ''
        };
        return _this;
    }

    _createClass(LoadModal, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            return (0, _preact.h)(
                "div",
                { "class": "modal " + (this.props.visible && "is-active") },
                (0, _preact.h)("div", { "class": "modal-background" }),
                (0, _preact.h)(
                    "div",
                    { "class": "modal-card" },
                    (0, _preact.h)(
                        "header",
                        { "class": "modal-card-head" },
                        (0, _preact.h)(
                            "p",
                            { "class": "modal-card-title" },
                            "Save"
                        ),
                        (0, _preact.h)("button", { "class": "delete", "aria-label": "close", onClick: this.props.close })
                    ),
                    (0, _preact.h)(
                        "section",
                        { "class": "modal-card-body" },
                        (0, _preact.h)(
                            "div",
                            { "class": "content" },
                            (0, _preact.h)(
                                "p",
                                null,
                                "Paste your code below to load the simulation state."
                            ),
                            (0, _preact.h)(
                                "div",
                                { "class": "field has-addons" },
                                (0, _preact.h)(
                                    "div",
                                    { "class": "control" },
                                    (0, _preact.h)("input", {
                                        "class": "input",
                                        type: "text",
                                        onChange: function onChange(e) {
                                            return _this2.setData(e);
                                        }
                                    })
                                ),
                                (0, _preact.h)(
                                    "div",
                                    { "class": "control" },
                                    (0, _preact.h)(
                                        "button",
                                        { "class": "button", onClick: this.load },
                                        (0, _preact.h)(
                                            "span",
                                            { "class": "icon is-small" },
                                            (0, _preact.h)("i", { "class": "fas fa-download" })
                                        )
                                    )
                                )
                            ),
                            this.state.loaded && (0, _preact.h)(
                                "p",
                                null,
                                this.state.success ? "Loaded" : "load failed"
                            )
                        )
                    )
                )
            );
        }
    }]);

    return LoadModal;
}(_preact.Component);

exports.default = LoadModal;
});

;require.register("js/ui/components/save-modal/save-modal.js", function(exports, require, module) {"use strict";

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

var SaveModal = function (_Component) {
    _inherits(SaveModal, _Component);

    function SaveModal(props) {
        _classCallCheck(this, SaveModal);

        var _this = _possibleConstructorReturn(this, (SaveModal.__proto__ || Object.getPrototypeOf(SaveModal)).call(this, props));

        _this.copy = function () {
            var range = document.createRange();
            range.selectNode(_this.input);
            window.getSelection().addRange(range);
            try {
                var successful = document.execCommand("copy");
                var msg = successful ? "successful" : "unsuccessful";
                _this.setState({
                    copied: true,
                    success: true
                });
            } catch (err) {
                _this.setState({
                    copied: true,
                    success: false
                });
            }
            window.getSelection().removeAllRanges();
        };

        _this.state = {
            copied: false,
            success: false
        };
        return _this;
    }

    _createClass(SaveModal, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            return (0, _preact.h)(
                "div",
                { "class": "modal " + (this.props.visible && "is-active") },
                (0, _preact.h)("div", { "class": "modal-background" }),
                (0, _preact.h)(
                    "div",
                    { "class": "modal-card" },
                    (0, _preact.h)(
                        "header",
                        { "class": "modal-card-head" },
                        (0, _preact.h)(
                            "p",
                            { "class": "modal-card-title" },
                            "Save"
                        ),
                        (0, _preact.h)("button", { "class": "delete", "aria-label": "close", onClick: this.props.close })
                    ),
                    (0, _preact.h)(
                        "section",
                        { "class": "modal-card-body" },
                        (0, _preact.h)(
                            "div",
                            { "class": "content" },
                            (0, _preact.h)(
                                "p",
                                null,
                                "Copy the code below to save the current state of the simulation."
                            ),
                            (0, _preact.h)(
                                "div",
                                { "class": "field has-addons" },
                                (0, _preact.h)(
                                    "div",
                                    { "class": "control" },
                                    (0, _preact.h)("input", {
                                        ref: function ref(input) {
                                            return _this2.input = input;
                                        },
                                        "class": "input",
                                        type: "text",
                                        readOnly: true,
                                        value: this.props.saveData
                                    })
                                ),
                                (0, _preact.h)(
                                    "div",
                                    { "class": "control" },
                                    (0, _preact.h)(
                                        "button",
                                        { "class": "button", onClick: this.copy },
                                        (0, _preact.h)(
                                            "span",
                                            { "class": "icon is-small" },
                                            (0, _preact.h)("i", { "class": "fas fa-copy" })
                                        )
                                    )
                                )
                            ),
                            this.state.copied && (0, _preact.h)(
                                "p",
                                null,
                                this.state.success ? "Copied" : "Copy failed"
                            )
                        )
                    )
                )
            );
        }
    }]);

    return SaveModal;
}(_preact.Component);

exports.default = SaveModal;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCJhcHAvanMvc2hhcmVkL2NvbmZpZy5qcyIsImFwcC9qcy9zaGFyZWQvY29uc3RhbnRzLmpzIiwiYXBwL2pzL3NoYXJlZC9oZWxwZXIuanMiLCJhcHAvanMvc2hhcmVkL25vZGUuanMiLCJhcHAvanMvc2hhcmVkL3ZlY3Rvci5qcyIsImFwcC9qcy9pbml0aWFsaXNlLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvQXBwLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvY2FudmFzL2NhbnZhcy5qcyIsImFwcC9qcy91aS9jb21wb25lbnRzL2NvbnRyb2xzL2NvbnRyb2xzLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvbG9hZC1tb2RhbC9sb2FkLW1vZGFsLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvc2F2ZS1tb2RhbC9zYXZlLW1vZGFsLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvc3RhdHMvc3RhdHMuanMiLCJhcHAvanMvdWkvZnJvbnQuanMiLCJub2RlX21vZHVsZXMvYXV0by1yZWxvYWQtYnJ1bmNoL3ZlbmRvci9hdXRvLXJlbG9hZC5qcyJdLCJuYW1lcyI6WyJtZXRyZSIsIm51bU9mTm9kZXMiLCJub21pbmFsU3RyaW5nTGVuZ3RoIiwic3ByaW5nQ29uc3RhbnQiLCJpbnRlcm5hbFZpc2NvdXNGcmljdGlvbkNvbnN0YW50IiwidmlzY291c0NvbnN0YW50Iiwic2ltdWxhdGlvblNwZWVkIiwibWF4U3RlcCIsImRhbmdlckZvcmNlTWF4IiwiZGFuZ2VyRm9yY2VNaW4iLCJyb3BlV2VpZ2h0UGVyTWV0cmUiLCJyb3BlV2VpZ2h0UGVyTm9kZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJDb250cm9sc0VudW0iLCJPYmplY3QiLCJmcmVlemUiLCJwYW4iLCJncmFiIiwiYW5jaG9yIiwiZXJhc2UiLCJyb3BlIiwicGF1c2UiLCJjb25maWciLCJyZXF1aXJlIiwiZ2V0Tm9kZSIsImlkIiwibm9kZXMiLCJmaW5kIiwibm9kZSIsImdldExlbmd0aCIsIm5vZGUxIiwibm9kZTIiLCJ4ZGlmZiIsIk1hdGgiLCJhYnMiLCJwb3NpdGlvbiIsIngiLCJ5ZGlmZiIsInkiLCJzcXJ0IiwiZ2V0TWlkcG9pbnQiLCJnZXRBbmdsZUZyb21Ib3Jpem9udGFsIiwiYXRhbjIiLCJnZXRGb3JjZSIsInN0cmluZ0xlbmd0aCIsImxlbmd0aERpZmZlcmVuY2UiLCJhbmdsZUZyb21Ib3Jpem9udGFsIiwieVNwcmluZ0ZvcmNlIiwic2luIiwieFNwcmluZ0ZvcmNlIiwiY29zIiwidG90YWxTcHJpbmdGb3JjZSIsInRvdGFsIiwiVmVjdG9yIiwidW5pcXVlaWQiLCJnZXRJRCIsIk5vZGUiLCJ2eCIsInZ5IiwiZngiLCJmeSIsImZpeGVkIiwiY29ubmVjdGVkTm9kZXMiLCJ2ZWxvY2l0eSIsImZvcmNlIiwibm9kZU9iamVjdCIsInoiLCJwcm90b3R5cGUiLCJsb2FkIiwidmVjdG9yIiwibmVnYXRpdmUiLCJhZGQiLCJ2Iiwic3VidHJhY3QiLCJtdWx0aXBseSIsImRpdmlkZSIsImVxdWFscyIsImRvdCIsImNyb3NzIiwibGVuZ3RoIiwidW5pdCIsIm1pbiIsIm1heCIsInRvQW5nbGVzIiwidGhldGEiLCJwaGkiLCJhc2luIiwiYW5nbGVUbyIsImEiLCJhY29zIiwidG9BcnJheSIsIm4iLCJzbGljZSIsImNsb25lIiwiaW5pdCIsImIiLCJjIiwiZnJvbUFuZ2xlcyIsInJhbmRvbURpcmVjdGlvbiIsInJhbmRvbSIsIlBJIiwibGVycCIsImZyYWN0aW9uIiwiZnJvbUFycmF5IiwiYW5nbGVCZXR3ZWVuIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwicXVlcnlTZWxlY3RvciIsIkFwcCIsInByb3BzIiwib25GcmFtZSIsInN0YXRlIiwid29ya2VyIiwicG9zdE1lc3NhZ2UiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJoYW5kbGVXb3JrZXIiLCJzZXRTdGF0ZSIsImRhdGEiLCJ0cnVlU2ltdWxhdGlvblNwZWVkIiwiY2hhbmdlQ29udHJvbCIsInNlbGVjdGVkQ29udHJvbCIsImNvbnRyb2wiLCJjaGFuZ2VTY2FsZSIsInNjYWxlIiwicG9zaXRpdmUiLCJyb3VuZCIsImNoYW5nZU9wdGlvbiIsImtleSIsInZhbHVlIiwib3B0aW9ucyIsInNhdmUiLCJzYXZlRGF0YSIsImJ0b2EiLCJKU09OIiwic3RyaW5naWZ5Iiwic2F2ZU1vZGFsVmlzaWJsZSIsIldvcmtlciIsIm9ubWVzc2FnZSIsInNob3dJRHMiLCJsb2FkTW9kYWxWaXNpYmxlIiwiaGVscGVyIiwiQ2FudmFzIiwiZ2V0VW5pcXVlSUQiLCJpIiwibm90dW5pcXVlIiwibmV3Tm9kZXMiLCJpbnRlcmFjdCIsImNhbnZhcyIsImN0eCIsImdldENvbnRleHQiLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwibW91c2UiLCJlIiwiY2xpZW50WCIsImxlZnQiLCJjbGllbnRZIiwidG9wIiwidHJhbnNmb3JtZWRWIiwidHJhbnNmb3JtZWQiLCJtIiwibW91c2VQb3NpdGlvbiIsInNlbGVjdGVkIiwiZGlzdGFuY2UiLCJzZWxlY3RlZE5vZGUiLCJzdGFydENvb3JkcyIsInBhZ2VYIiwibGFzdENvb3JkcyIsInBhZ2VZIiwicHVzaCIsIm1vdXNlZG93biIsInN0YXJ0Q29vcmRzViIsInByZXZOb2RlIiwiY29uY2F0Iiwid2luZG93IiwiY29uc29sZSIsImxvZyIsInNjcm9sbFkiLCJvbmtleXByZXNzIiwiZXZlbnQiLCJrZXlDb2RlIiwiZHJhdyIsInN0cm9rZVN0eWxlIiwic2V0VHJhbnNmb3JtIiwiY2xlYXJSZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJyZXN0b3JlIiwiZ3JpZFNpemUiLCJvZmZzZXR4Iiwib2Zmc2V0eSIsImJlZ2luUGF0aCIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsImFyYyIsImZpbGxUZXh0IiwiZHJhd24iLCJkcmF3TGluZSIsImNvbm5lY3RlZE5vZGVJRCIsIm5vZGVzc3NzIiwibmV3bm9kZXNzc3NzIiwiZmlsbFJlY3QiLCJpbmRleE9mIiwidG9TdHJpbmciLCJjb25uZWN0ZWROb2RlIiwibm9ybUZvcmNlIiwiY29sb3IiLCJ0b0ZpeGVkIiwiZm9yRWFjaCIsImJpbmQiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJDb250cm9scyIsIm9wdGlvbnNWaXNpYmxlIiwicGF1c2VkIiwidGFyZ2V0IiwiY2hlY2tlZCIsIkxvYWRNb2RhbCIsImxvYWREYXRhIiwibG9hZGVkIiwic3VjY2VzcyIsInNldERhdGEiLCJ2aXNpYmxlIiwiY2xvc2UiLCJTYXZlTW9kYWwiLCJjb3B5IiwicmFuZ2UiLCJjcmVhdGVSYW5nZSIsInNlbGVjdE5vZGUiLCJpbnB1dCIsImdldFNlbGVjdGlvbiIsImFkZFJhbmdlIiwic3VjY2Vzc2Z1bCIsImV4ZWNDb21tYW5kIiwibXNnIiwiY29waWVkIiwiZXJyIiwicmVtb3ZlQWxsUmFuZ2VzIiwiU3RhdHMiLCJzaW1TcGVlZHMiLCJBcnJheSIsImZpbGwiLCJjYWxjdWxhdGVkU2ltU3BlZWQiLCJwb3AiLCJ1bnNoaWZ0Iiwic3VtIiwicmVkdWNlIiwiZ2V0RWxlbWVudEJ5SWQiLCJjb21wdXRlIiwiY2FsY1NpbVNwZWVkIiwidXNlclBhdXNlIiwidW5kZWZpbmVkIiwiaW5uZXJUZXh0IiwiY29ubmVjdGVkIiwiY29tcHV0ZU5vZGUiLCJwYXJzZUludCIsImZyYW1lU3luY2VyIiwidGltZXN0YW1wIiwiV2ViU29ja2V0IiwiTW96V2ViU29ja2V0IiwiYnIiLCJicnVuY2giLCJhciIsImRpc2FibGVkIiwiX2FyIiwiY2FjaGVCdXN0ZXIiLCJ1cmwiLCJkYXRlIiwiRGF0ZSIsIm5vdyIsInJlcGxhY2UiLCJicm93c2VyIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwidG9Mb3dlckNhc2UiLCJmb3JjZVJlcGFpbnQiLCJyZWxvYWRlcnMiLCJwYWdlIiwibG9jYXRpb24iLCJyZWxvYWQiLCJzdHlsZXNoZWV0IiwiY2FsbCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmaWx0ZXIiLCJsaW5rIiwidmFsIiwiZ2V0QXR0cmlidXRlIiwiaHJlZiIsInNldFRpbWVvdXQiLCJib2R5Iiwib2Zmc2V0SGVpZ2h0IiwiamF2YXNjcmlwdCIsInNjcmlwdHMiLCJ0ZXh0U2NyaXB0cyIsIm1hcCIsInNjcmlwdCIsInRleHQiLCJzcmNTY3JpcHRzIiwic3JjIiwiYWxsIiwib25Mb2FkIiwiZXZhbCIsInJlbW92ZSIsIm5ld1NjcmlwdCIsImNyZWF0ZUVsZW1lbnQiLCJhc3luYyIsIm9ubG9hZCIsImhlYWQiLCJhcHBlbmRDaGlsZCIsInBvcnQiLCJob3N0Iiwic2VydmVyIiwiaG9zdG5hbWUiLCJjb25uZWN0IiwiY29ubmVjdGlvbiIsIm1lc3NhZ2UiLCJyZWxvYWRlciIsIm9uZXJyb3IiLCJyZWFkeVN0YXRlIiwib25jbG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdaQSxJQUFJQSxRQUFRLEVBQVosQyxDQUFnQjtBQUNoQixJQUFJQyxhQUFhLEVBQWpCO0FBQ0EsSUFBSUMsc0JBQXNCLEVBQTFCLEMsQ0FBOEI7QUFDOUIsSUFBSUMsaUJBQWlCLEVBQXJCO0FBQ0EsSUFBSUMsa0NBQWtDLENBQXRD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QTBCTCxTQUExQjtBQUNELE9BVEg7QUFVRDtBQTVDYSxHQUFoQjtBQThDQSxNQUFJTSxPQUFPL0MsR0FBRytDLElBQUgsSUFBVyxJQUF0QjtBQUNBLE1BQUlDLE9BQU9sRCxHQUFHbUQsTUFBSCxJQUFhMUksT0FBT3lHLFFBQVAsQ0FBZ0JrQyxRQUE3QixJQUF5QyxXQUFwRDs7QUFFQSxNQUFJQyxVQUFVLFNBQVZBLE9BQVUsR0FBVTtBQUN0QixRQUFJQyxhQUFhLElBQUl4RCxTQUFKLENBQWMsVUFBVW9ELElBQVYsR0FBaUIsR0FBakIsR0FBdUJELElBQXJDLENBQWpCO0FBQ0FLLGVBQVdsTCxTQUFYLEdBQXVCLFVBQVMwQyxLQUFULEVBQWU7QUFDcEMsVUFBSW9GLEdBQUdDLFFBQVAsRUFBaUI7QUFDakIsVUFBSW9ELFVBQVV6SSxNQUFNOUQsSUFBcEI7QUFDQSxVQUFJd00sV0FBV3hDLFVBQVV1QyxPQUFWLEtBQXNCdkMsVUFBVUMsSUFBL0M7QUFDQXVDO0FBQ0QsS0FMRDtBQU1BRixlQUFXRyxPQUFYLEdBQXFCLFlBQVU7QUFDN0IsVUFBSUgsV0FBV0ksVUFBZixFQUEyQkosV0FBVzNGLEtBQVg7QUFDNUIsS0FGRDtBQUdBMkYsZUFBV0ssT0FBWCxHQUFxQixZQUFVO0FBQzdCbEosYUFBT21ILFVBQVAsQ0FBa0J5QixPQUFsQixFQUEyQixJQUEzQjtBQUNELEtBRkQ7QUFHRCxHQWREO0FBZUFBO0FBQ0QsQ0FsRkQ7QUFtRkEiLCJmaWxlIjoicHVibGljL2FwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxucmVxdWlyZS5yZWdpc3RlcihcInByZWFjdC9kaXN0L3ByZWFjdC5qc1wiLCBmdW5jdGlvbihleHBvcnRzLCByZXF1aXJlLCBtb2R1bGUpIHtcbiAgcmVxdWlyZSA9IF9fbWFrZVJlbGF0aXZlUmVxdWlyZShyZXF1aXJlLCB7fSwgXCJwcmVhY3RcIik7XG4gIChmdW5jdGlvbigpIHtcbiAgICAhZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGZ1bmN0aW9uIFZOb2RlKCkge31cbiAgICBmdW5jdGlvbiBoKG5vZGVOYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHZhciBsYXN0U2ltcGxlLCBjaGlsZCwgc2ltcGxlLCBpLCBjaGlsZHJlbiA9IEVNUFRZX0NISUxEUkVOO1xuICAgICAgICBmb3IgKGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpLS0gPiAyOyApIHN0YWNrLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMgJiYgbnVsbCAhPSBhdHRyaWJ1dGVzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoIXN0YWNrLmxlbmd0aCkgc3RhY2sucHVzaChhdHRyaWJ1dGVzLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLmNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIGlmICgoY2hpbGQgPSBzdGFjay5wb3AoKSkgJiYgdm9pZCAwICE9PSBjaGlsZC5wb3ApIGZvciAoaSA9IGNoaWxkLmxlbmd0aDsgaS0tOyApIHN0YWNrLnB1c2goY2hpbGRbaV0pOyBlbHNlIHtcbiAgICAgICAgICAgIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIGNoaWxkKSBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoc2ltcGxlID0gJ2Z1bmN0aW9uJyAhPSB0eXBlb2Ygbm9kZU5hbWUpIGlmIChudWxsID09IGNoaWxkKSBjaGlsZCA9ICcnOyBlbHNlIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgY2hpbGQpIGNoaWxkID0gU3RyaW5nKGNoaWxkKTsgZWxzZSBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIGNoaWxkKSBzaW1wbGUgPSAhMTtcbiAgICAgICAgICAgIGlmIChzaW1wbGUgJiYgbGFzdFNpbXBsZSkgY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0gMV0gKz0gY2hpbGQ7IGVsc2UgaWYgKGNoaWxkcmVuID09PSBFTVBUWV9DSElMRFJFTikgY2hpbGRyZW4gPSBbIGNoaWxkIF07IGVsc2UgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgICAgICBsYXN0U2ltcGxlID0gc2ltcGxlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwID0gbmV3IFZOb2RlKCk7XG4gICAgICAgIHAubm9kZU5hbWUgPSBub2RlTmFtZTtcbiAgICAgICAgcC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICBwLmF0dHJpYnV0ZXMgPSBudWxsID09IGF0dHJpYnV0ZXMgPyB2b2lkIDAgOiBhdHRyaWJ1dGVzO1xuICAgICAgICBwLmtleSA9IG51bGwgPT0gYXR0cmlidXRlcyA/IHZvaWQgMCA6IGF0dHJpYnV0ZXMua2V5O1xuICAgICAgICBpZiAodm9pZCAwICE9PSBvcHRpb25zLnZub2RlKSBvcHRpb25zLnZub2RlKHApO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZXh0ZW5kKG9iaiwgcHJvcHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwcm9wcykgb2JqW2ldID0gcHJvcHNbaV07XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNsb25lRWxlbWVudCh2bm9kZSwgcHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIGgodm5vZGUubm9kZU5hbWUsIGV4dGVuZChleHRlbmQoe30sIHZub2RlLmF0dHJpYnV0ZXMpLCBwcm9wcyksIGFyZ3VtZW50cy5sZW5ndGggPiAyID8gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogdm5vZGUuY2hpbGRyZW4pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2QgJiYgKGNvbXBvbmVudC5fX2QgPSAhMCkgJiYgMSA9PSBpdGVtcy5wdXNoKGNvbXBvbmVudCkpIChvcHRpb25zLmRlYm91bmNlUmVuZGVyaW5nIHx8IGRlZmVyKShyZXJlbmRlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcmVuZGVyKCkge1xuICAgICAgICB2YXIgcCwgbGlzdCA9IGl0ZW1zO1xuICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICB3aGlsZSAocCA9IGxpc3QucG9wKCkpIGlmIChwLl9fZCkgcmVuZGVyQ29tcG9uZW50KHApO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1NhbWVOb2RlVHlwZShub2RlLCB2bm9kZSwgaHlkcmF0aW5nKSB7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUgfHwgJ251bWJlcicgPT0gdHlwZW9mIHZub2RlKSByZXR1cm4gdm9pZCAwICE9PSBub2RlLnNwbGl0VGV4dDtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZS5ub2RlTmFtZSkgcmV0dXJuICFub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciAmJiBpc05hbWVkTm9kZShub2RlLCB2bm9kZS5ub2RlTmFtZSk7IGVsc2UgcmV0dXJuIGh5ZHJhdGluZyB8fCBub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzTmFtZWROb2RlKG5vZGUsIG5vZGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBub2RlLl9fbiA9PT0gbm9kZU5hbWUgfHwgbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROb2RlUHJvcHModm5vZGUpIHtcbiAgICAgICAgdmFyIHByb3BzID0gZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKTtcbiAgICAgICAgcHJvcHMuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGRlZmF1bHRQcm9wcyA9IHZub2RlLm5vZGVOYW1lLmRlZmF1bHRQcm9wcztcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gZGVmYXVsdFByb3BzKSBmb3IgKHZhciBpIGluIGRlZmF1bHRQcm9wcykgaWYgKHZvaWQgMCA9PT0gcHJvcHNbaV0pIHByb3BzW2ldID0gZGVmYXVsdFByb3BzW2ldO1xuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZU5vZGUobm9kZU5hbWUsIGlzU3ZnKSB7XG4gICAgICAgIHZhciBub2RlID0gaXNTdmcgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbm9kZU5hbWUpIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlTmFtZSk7XG4gICAgICAgIG5vZGUuX19uID0gbm9kZU5hbWU7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgICAgdmFyIHBhcmVudE5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIGlmIChwYXJlbnROb2RlKSBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRBY2Nlc3Nvcihub2RlLCBuYW1lLCBvbGQsIHZhbHVlLCBpc1N2Zykge1xuICAgICAgICBpZiAoJ2NsYXNzTmFtZScgPT09IG5hbWUpIG5hbWUgPSAnY2xhc3MnO1xuICAgICAgICBpZiAoJ2tleScgPT09IG5hbWUpIDsgZWxzZSBpZiAoJ3JlZicgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmIChvbGQpIG9sZChudWxsKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgdmFsdWUobm9kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoJ2NsYXNzJyA9PT0gbmFtZSAmJiAhaXNTdmcpIG5vZGUuY2xhc3NOYW1lID0gdmFsdWUgfHwgJyc7IGVsc2UgaWYgKCdzdHlsZScgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgJ3N0cmluZycgPT0gdHlwZW9mIHZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiBvbGQpIG5vZGUuc3R5bGUuY3NzVGV4dCA9IHZhbHVlIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmICdvYmplY3QnID09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICgnc3RyaW5nJyAhPSB0eXBlb2Ygb2xkKSBmb3IgKHZhciBpIGluIG9sZCkgaWYgKCEoaSBpbiB2YWx1ZSkpIG5vZGUuc3R5bGVbaV0gPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSBub2RlLnN0eWxlW2ldID0gJ251bWJlcicgPT0gdHlwZW9mIHZhbHVlW2ldICYmICExID09PSBJU19OT05fRElNRU5TSU9OQUwudGVzdChpKSA/IHZhbHVlW2ldICsgJ3B4JyA6IHZhbHVlW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCdkYW5nZXJvdXNseVNldElubmVySFRNTCcgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgbm9kZS5pbm5lckhUTUwgPSB2YWx1ZS5fX2h0bWwgfHwgJyc7XG4gICAgICAgIH0gZWxzZSBpZiAoJ28nID09IG5hbWVbMF0gJiYgJ24nID09IG5hbWVbMV0pIHtcbiAgICAgICAgICAgIHZhciB1c2VDYXB0dXJlID0gbmFtZSAhPT0gKG5hbWUgPSBuYW1lLnJlcGxhY2UoL0NhcHR1cmUkLywgJycpKTtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvbGQpIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBldmVudFByb3h5LCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIH0gZWxzZSBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICAobm9kZS5fX2wgfHwgKG5vZGUuX19sID0ge30pKVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKCdsaXN0JyAhPT0gbmFtZSAmJiAndHlwZScgIT09IG5hbWUgJiYgIWlzU3ZnICYmIG5hbWUgaW4gbm9kZSkge1xuICAgICAgICAgICAgc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgbnVsbCA9PSB2YWx1ZSA/ICcnIDogdmFsdWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUgfHwgITEgPT09IHZhbHVlKSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBucyA9IGlzU3ZnICYmIG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9eeGxpbmtcXDo/LywgJycpKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlIHx8ICExID09PSB2YWx1ZSkgaWYgKG5zKSBub2RlLnJlbW92ZUF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgbmFtZS50b0xvd2VyQ2FzZSgpKTsgZWxzZSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTsgZWxzZSBpZiAoJ2Z1bmN0aW9uJyAhPSB0eXBlb2YgdmFsdWUpIGlmIChucykgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSwgdmFsdWUpOyBlbHNlIG5vZGUuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRQcm9wZXJ0eShub2RlLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbm9kZVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgICBmdW5jdGlvbiBldmVudFByb3h5KGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19sW2UudHlwZV0ob3B0aW9ucy5ldmVudCAmJiBvcHRpb25zLmV2ZW50KGUpIHx8IGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmbHVzaE1vdW50cygpIHtcbiAgICAgICAgdmFyIGM7XG4gICAgICAgIHdoaWxlIChjID0gbW91bnRzLnBvcCgpKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hZnRlck1vdW50KSBvcHRpb25zLmFmdGVyTW91bnQoYyk7XG4gICAgICAgICAgICBpZiAoYy5jb21wb25lbnREaWRNb3VudCkgYy5jb21wb25lbnREaWRNb3VudCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIHBhcmVudCwgY29tcG9uZW50Um9vdCkge1xuICAgICAgICBpZiAoIWRpZmZMZXZlbCsrKSB7XG4gICAgICAgICAgICBpc1N2Z01vZGUgPSBudWxsICE9IHBhcmVudCAmJiB2b2lkIDAgIT09IHBhcmVudC5vd25lclNWR0VsZW1lbnQ7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSBudWxsICE9IGRvbSAmJiAhKCdfX3ByZWFjdGF0dHJfJyBpbiBkb20pO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXQgPSBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCk7XG4gICAgICAgIGlmIChwYXJlbnQgJiYgcmV0LnBhcmVudE5vZGUgIT09IHBhcmVudCkgcGFyZW50LmFwcGVuZENoaWxkKHJldCk7XG4gICAgICAgIGlmICghLS1kaWZmTGV2ZWwpIHtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9ICExO1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnRSb290KSBmbHVzaE1vdW50cygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBjb21wb25lbnRSb290KSB7XG4gICAgICAgIHZhciBvdXQgPSBkb20sIHByZXZTdmdNb2RlID0gaXNTdmdNb2RlO1xuICAgICAgICBpZiAobnVsbCA9PSB2bm9kZSB8fCAnYm9vbGVhbicgPT0gdHlwZW9mIHZub2RlKSB2bm9kZSA9ICcnO1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlIHx8ICdudW1iZXInID09IHR5cGVvZiB2bm9kZSkge1xuICAgICAgICAgICAgaWYgKGRvbSAmJiB2b2lkIDAgIT09IGRvbS5zcGxpdFRleHQgJiYgZG9tLnBhcmVudE5vZGUgJiYgKCFkb20uX2NvbXBvbmVudCB8fCBjb21wb25lbnRSb290KSkge1xuICAgICAgICAgICAgICAgIGlmIChkb20ubm9kZVZhbHVlICE9IHZub2RlKSBkb20ubm9kZVZhbHVlID0gdm5vZGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoZG9tLCAhMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0Ll9fcHJlYWN0YXR0cl8gPSAhMDtcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZub2RlTmFtZSA9IHZub2RlLm5vZGVOYW1lO1xuICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygdm5vZGVOYW1lKSByZXR1cm4gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICBpc1N2Z01vZGUgPSAnc3ZnJyA9PT0gdm5vZGVOYW1lID8gITAgOiAnZm9yZWlnbk9iamVjdCcgPT09IHZub2RlTmFtZSA/ICExIDogaXNTdmdNb2RlO1xuICAgICAgICB2bm9kZU5hbWUgPSBTdHJpbmcodm5vZGVOYW1lKTtcbiAgICAgICAgaWYgKCFkb20gfHwgIWlzTmFtZWROb2RlKGRvbSwgdm5vZGVOYW1lKSkge1xuICAgICAgICAgICAgb3V0ID0gY3JlYXRlTm9kZSh2bm9kZU5hbWUsIGlzU3ZnTW9kZSk7XG4gICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRvbS5maXJzdENoaWxkKSBvdXQuYXBwZW5kQ2hpbGQoZG9tLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShkb20sICEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZmMgPSBvdXQuZmlyc3RDaGlsZCwgcHJvcHMgPSBvdXQuX19wcmVhY3RhdHRyXywgdmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChudWxsID09IHByb3BzKSB7XG4gICAgICAgICAgICBwcm9wcyA9IG91dC5fX3ByZWFjdGF0dHJfID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBhID0gb3V0LmF0dHJpYnV0ZXMsIGkgPSBhLmxlbmd0aDsgaS0tOyApIHByb3BzW2FbaV0ubmFtZV0gPSBhW2ldLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaHlkcmF0aW5nICYmIHZjaGlsZHJlbiAmJiAxID09PSB2Y2hpbGRyZW4ubGVuZ3RoICYmICdzdHJpbmcnID09IHR5cGVvZiB2Y2hpbGRyZW5bMF0gJiYgbnVsbCAhPSBmYyAmJiB2b2lkIDAgIT09IGZjLnNwbGl0VGV4dCAmJiBudWxsID09IGZjLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICBpZiAoZmMubm9kZVZhbHVlICE9IHZjaGlsZHJlblswXSkgZmMubm9kZVZhbHVlID0gdmNoaWxkcmVuWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKHZjaGlsZHJlbiAmJiB2Y2hpbGRyZW4ubGVuZ3RoIHx8IG51bGwgIT0gZmMpIGlubmVyRGlmZk5vZGUob3V0LCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBoeWRyYXRpbmcgfHwgbnVsbCAhPSBwcm9wcy5kYW5nZXJvdXNseVNldElubmVySFRNTCk7XG4gICAgICAgIGRpZmZBdHRyaWJ1dGVzKG91dCwgdm5vZGUuYXR0cmlidXRlcywgcHJvcHMpO1xuICAgICAgICBpc1N2Z01vZGUgPSBwcmV2U3ZnTW9kZTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5uZXJEaWZmTm9kZShkb20sIHZjaGlsZHJlbiwgY29udGV4dCwgbW91bnRBbGwsIGlzSHlkcmF0aW5nKSB7XG4gICAgICAgIHZhciBqLCBjLCBmLCB2Y2hpbGQsIGNoaWxkLCBvcmlnaW5hbENoaWxkcmVuID0gZG9tLmNoaWxkTm9kZXMsIGNoaWxkcmVuID0gW10sIGtleWVkID0ge30sIGtleWVkTGVuID0gMCwgbWluID0gMCwgbGVuID0gb3JpZ2luYWxDaGlsZHJlbi5sZW5ndGgsIGNoaWxkcmVuTGVuID0gMCwgdmxlbiA9IHZjaGlsZHJlbiA/IHZjaGlsZHJlbi5sZW5ndGggOiAwO1xuICAgICAgICBpZiAoMCAhPT0gbGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2NoaWxkID0gb3JpZ2luYWxDaGlsZHJlbltpXSwgcHJvcHMgPSBfY2hpbGQuX19wcmVhY3RhdHRyXywga2V5ID0gdmxlbiAmJiBwcm9wcyA/IF9jaGlsZC5fY29tcG9uZW50ID8gX2NoaWxkLl9jb21wb25lbnQuX19rIDogcHJvcHMua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGtleWVkTGVuKys7XG4gICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IF9jaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcHMgfHwgKHZvaWQgMCAhPT0gX2NoaWxkLnNwbGl0VGV4dCA/IGlzSHlkcmF0aW5nID8gX2NoaWxkLm5vZGVWYWx1ZS50cmltKCkgOiAhMCA6IGlzSHlkcmF0aW5nKSkgY2hpbGRyZW5bY2hpbGRyZW5MZW4rK10gPSBfY2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKDAgIT09IHZsZW4pIGZvciAodmFyIGkgPSAwOyBpIDwgdmxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2Y2hpbGQgPSB2Y2hpbGRyZW5baV07XG4gICAgICAgICAgICBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICB2YXIga2V5ID0gdmNoaWxkLmtleTtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXllZExlbiAmJiB2b2lkIDAgIT09IGtleWVkW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSBrZXllZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICBrZXllZFtrZXldID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICBrZXllZExlbi0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoaWxkICYmIG1pbiA8IGNoaWxkcmVuTGVuKSBmb3IgKGogPSBtaW47IGogPCBjaGlsZHJlbkxlbjsgaisrKSBpZiAodm9pZCAwICE9PSBjaGlsZHJlbltqXSAmJiBpc1NhbWVOb2RlVHlwZShjID0gY2hpbGRyZW5bal0sIHZjaGlsZCwgaXNIeWRyYXRpbmcpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQgPSBjO1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2pdID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSBjaGlsZHJlbkxlbiAtIDEpIGNoaWxkcmVuTGVuLS07XG4gICAgICAgICAgICAgICAgaWYgKGogPT09IG1pbikgbWluKys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZCA9IGlkaWZmKGNoaWxkLCB2Y2hpbGQsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGYgPSBvcmlnaW5hbENoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKGNoaWxkICYmIGNoaWxkICE9PSBkb20gJiYgY2hpbGQgIT09IGYpIGlmIChudWxsID09IGYpIGRvbS5hcHBlbmRDaGlsZChjaGlsZCk7IGVsc2UgaWYgKGNoaWxkID09PSBmLm5leHRTaWJsaW5nKSByZW1vdmVOb2RlKGYpOyBlbHNlIGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIGYpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXllZExlbikgZm9yICh2YXIgaSBpbiBrZXllZCkgaWYgKHZvaWQgMCAhPT0ga2V5ZWRbaV0pIHJlY29sbGVjdE5vZGVUcmVlKGtleWVkW2ldLCAhMSk7XG4gICAgICAgIHdoaWxlIChtaW4gPD0gY2hpbGRyZW5MZW4pIGlmICh2b2lkIDAgIT09IChjaGlsZCA9IGNoaWxkcmVuW2NoaWxkcmVuTGVuLS1dKSkgcmVjb2xsZWN0Tm9kZVRyZWUoY2hpbGQsICExKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVjb2xsZWN0Tm9kZVRyZWUobm9kZSwgdW5tb3VudE9ubHkpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IG5vZGUuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGNvbXBvbmVudCkgdW5tb3VudENvbXBvbmVudChjb21wb25lbnQpOyBlbHNlIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IG5vZGUuX19wcmVhY3RhdHRyXyAmJiBub2RlLl9fcHJlYWN0YXR0cl8ucmVmKSBub2RlLl9fcHJlYWN0YXR0cl8ucmVmKG51bGwpO1xuICAgICAgICAgICAgaWYgKCExID09PSB1bm1vdW50T25seSB8fCBudWxsID09IG5vZGUuX19wcmVhY3RhdHRyXykgcmVtb3ZlTm9kZShub2RlKTtcbiAgICAgICAgICAgIHJlbW92ZUNoaWxkcmVuKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuKG5vZGUpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUubGFzdENoaWxkO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBub2RlLnByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsICEwKTtcbiAgICAgICAgICAgIG5vZGUgPSBuZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmZBdHRyaWJ1dGVzKGRvbSwgYXR0cnMsIG9sZCkge1xuICAgICAgICB2YXIgbmFtZTtcbiAgICAgICAgZm9yIChuYW1lIGluIG9sZCkgaWYgKCghYXR0cnMgfHwgbnVsbCA9PSBhdHRyc1tuYW1lXSkgJiYgbnVsbCAhPSBvbGRbbmFtZV0pIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSB2b2lkIDAsIGlzU3ZnTW9kZSk7XG4gICAgICAgIGZvciAobmFtZSBpbiBhdHRycykgaWYgKCEoJ2NoaWxkcmVuJyA9PT0gbmFtZSB8fCAnaW5uZXJIVE1MJyA9PT0gbmFtZSB8fCBuYW1lIGluIG9sZCAmJiBhdHRyc1tuYW1lXSA9PT0gKCd2YWx1ZScgPT09IG5hbWUgfHwgJ2NoZWNrZWQnID09PSBuYW1lID8gZG9tW25hbWVdIDogb2xkW25hbWVdKSkpIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSBhdHRyc1tuYW1lXSwgaXNTdmdNb2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgKGNvbXBvbmVudHNbbmFtZV0gfHwgKGNvbXBvbmVudHNbbmFtZV0gPSBbXSkpLnB1c2goY29tcG9uZW50KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KEN0b3IsIHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBpbnN0LCBsaXN0ID0gY29tcG9uZW50c1tDdG9yLm5hbWVdO1xuICAgICAgICBpZiAoQ3Rvci5wcm90b3R5cGUgJiYgQ3Rvci5wcm90b3R5cGUucmVuZGVyKSB7XG4gICAgICAgICAgICBpbnN0ID0gbmV3IEN0b3IocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgQ29tcG9uZW50LmNhbGwoaW5zdCwgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5zdCA9IG5ldyBDb21wb25lbnQocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaW5zdC5jb25zdHJ1Y3RvciA9IEN0b3I7XG4gICAgICAgICAgICBpbnN0LnJlbmRlciA9IGRvUmVuZGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0KSBmb3IgKHZhciBpID0gbGlzdC5sZW5ndGg7IGktLTsgKSBpZiAobGlzdFtpXS5jb25zdHJ1Y3RvciA9PT0gQ3Rvcikge1xuICAgICAgICAgICAgaW5zdC5fX2IgPSBsaXN0W2ldLl9fYjtcbiAgICAgICAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3Q7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldENvbXBvbmVudFByb3BzKGNvbXBvbmVudCwgcHJvcHMsIG9wdHMsIGNvbnRleHQsIG1vdW50QWxsKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IgPSBwcm9wcy5yZWYpIGRlbGV0ZSBwcm9wcy5yZWY7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fayA9IHByb3BzLmtleSkgZGVsZXRlIHByb3BzLmtleTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50LmJhc2UgfHwgbW91bnRBbGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykgY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gY29tcG9uZW50LmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2MpIGNvbXBvbmVudC5fX2MgPSBjb21wb25lbnQuY29udGV4dDtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3ApIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQucHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMTtcbiAgICAgICAgICAgIGlmICgwICE9PSBvcHRzKSBpZiAoMSA9PT0gb3B0cyB8fCAhMSAhPT0gb3B0aW9ucy5zeW5jQ29tcG9uZW50VXBkYXRlcyB8fCAhY29tcG9uZW50LmJhc2UpIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIDEsIG1vdW50QWxsKTsgZWxzZSBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fcikgY29tcG9uZW50Ll9fcihjb21wb25lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIG9wdHMsIG1vdW50QWxsLCBpc0NoaWxkKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgdmFyIHJlbmRlcmVkLCBpbnN0LCBjYmFzZSwgcHJvcHMgPSBjb21wb25lbnQucHJvcHMsIHN0YXRlID0gY29tcG9uZW50LnN0YXRlLCBjb250ZXh0ID0gY29tcG9uZW50LmNvbnRleHQsIHByZXZpb3VzUHJvcHMgPSBjb21wb25lbnQuX19wIHx8IHByb3BzLCBwcmV2aW91c1N0YXRlID0gY29tcG9uZW50Ll9fcyB8fCBzdGF0ZSwgcHJldmlvdXNDb250ZXh0ID0gY29tcG9uZW50Ll9fYyB8fCBjb250ZXh0LCBpc1VwZGF0ZSA9IGNvbXBvbmVudC5iYXNlLCBuZXh0QmFzZSA9IGNvbXBvbmVudC5fX2IsIGluaXRpYWxCYXNlID0gaXNVcGRhdGUgfHwgbmV4dEJhc2UsIGluaXRpYWxDaGlsZENvbXBvbmVudCA9IGNvbXBvbmVudC5fY29tcG9uZW50LCBza2lwID0gITE7XG4gICAgICAgICAgICBpZiAoaXNVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcmV2aW91c1Byb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHByZXZpb3VzU3RhdGU7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBwcmV2aW91c0NvbnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKDIgIT09IG9wdHMgJiYgY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZSAmJiAhMSA9PT0gY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpKSBza2lwID0gITA7IGVsc2UgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQuX19zID0gY29tcG9uZW50Ll9fYyA9IGNvbXBvbmVudC5fX2IgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fZCA9ICExO1xuICAgICAgICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyZWQgPSBjb21wb25lbnQucmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQpIGNvbnRleHQgPSBleHRlbmQoZXh0ZW5kKHt9LCBjb250ZXh0KSwgY29tcG9uZW50LmdldENoaWxkQ29udGV4dCgpKTtcbiAgICAgICAgICAgICAgICB2YXIgdG9Vbm1vdW50LCBiYXNlLCBjaGlsZENvbXBvbmVudCA9IHJlbmRlcmVkICYmIHJlbmRlcmVkLm5vZGVOYW1lO1xuICAgICAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBjaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRQcm9wcyA9IGdldE5vZGVQcm9wcyhyZW5kZXJlZCk7XG4gICAgICAgICAgICAgICAgICAgIGluc3QgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0ICYmIGluc3QuY29uc3RydWN0b3IgPT09IGNoaWxkQ29tcG9uZW50ICYmIGNoaWxkUHJvcHMua2V5ID09IGluc3QuX19rKSBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAxLCBjb250ZXh0LCAhMSk7IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Vbm1vdW50ID0gaW5zdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fY29tcG9uZW50ID0gaW5zdCA9IGNyZWF0ZUNvbXBvbmVudChjaGlsZENvbXBvbmVudCwgY2hpbGRQcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Ll9fYiA9IGluc3QuX19iIHx8IG5leHRCYXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdC5fX3UgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAwLCBjb250ZXh0LCAhMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJDb21wb25lbnQoaW5zdCwgMSwgbW91bnRBbGwsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBiYXNlID0gaW5zdC5iYXNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNiYXNlID0gaW5pdGlhbEJhc2U7XG4gICAgICAgICAgICAgICAgICAgIHRvVW5tb3VudCA9IGluaXRpYWxDaGlsZENvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvVW5tb3VudCkgY2Jhc2UgPSBjb21wb25lbnQuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsQmFzZSB8fCAxID09PSBvcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2Jhc2UpIGNiYXNlLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGRpZmYoY2Jhc2UsIHJlbmRlcmVkLCBjb250ZXh0LCBtb3VudEFsbCB8fCAhaXNVcGRhdGUsIGluaXRpYWxCYXNlICYmIGluaXRpYWxCYXNlLnBhcmVudE5vZGUsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgJiYgYmFzZSAhPT0gaW5pdGlhbEJhc2UgJiYgaW5zdCAhPT0gaW5pdGlhbENoaWxkQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlUGFyZW50ID0gaW5pdGlhbEJhc2UucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VQYXJlbnQgJiYgYmFzZSAhPT0gYmFzZVBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhcmVudC5yZXBsYWNlQ2hpbGQoYmFzZSwgaW5pdGlhbEJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0b1VubW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShpbml0aWFsQmFzZSwgITEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIHVubW91bnRDb21wb25lbnQodG9Vbm1vdW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuYmFzZSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UgJiYgIWlzQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudFJlZiA9IGNvbXBvbmVudCwgdCA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHQgPSB0Ll9fdSkgKGNvbXBvbmVudFJlZiA9IHQpLmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl9jb21wb25lbnQgPSBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX2NvbXBvbmVudENvbnN0cnVjdG9yID0gY29tcG9uZW50UmVmLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNVcGRhdGUgfHwgbW91bnRBbGwpIG1vdW50cy51bnNoaWZ0KGNvbXBvbmVudCk7IGVsc2UgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUpIGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wcywgcHJldmlvdXNTdGF0ZSwgcHJldmlvdXNDb250ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5hZnRlclVwZGF0ZSkgb3B0aW9ucy5hZnRlclVwZGF0ZShjb21wb25lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgIT0gY29tcG9uZW50Ll9faCkgd2hpbGUgKGNvbXBvbmVudC5fX2gubGVuZ3RoKSBjb21wb25lbnQuX19oLnBvcCgpLmNhbGwoY29tcG9uZW50KTtcbiAgICAgICAgICAgIGlmICghZGlmZkxldmVsICYmICFpc0NoaWxkKSBmbHVzaE1vdW50cygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKSB7XG4gICAgICAgIHZhciBjID0gZG9tICYmIGRvbS5fY29tcG9uZW50LCBvcmlnaW5hbENvbXBvbmVudCA9IGMsIG9sZERvbSA9IGRvbSwgaXNEaXJlY3RPd25lciA9IGMgJiYgZG9tLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWUsIGlzT3duZXIgPSBpc0RpcmVjdE93bmVyLCBwcm9wcyA9IGdldE5vZGVQcm9wcyh2bm9kZSk7XG4gICAgICAgIHdoaWxlIChjICYmICFpc093bmVyICYmIChjID0gYy5fX3UpKSBpc093bmVyID0gYy5jb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgICAgIGlmIChjICYmIGlzT3duZXIgJiYgKCFtb3VudEFsbCB8fCBjLl9jb21wb25lbnQpKSB7XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMywgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9yaWdpbmFsQ29tcG9uZW50ICYmICFpc0RpcmVjdE93bmVyKSB7XG4gICAgICAgICAgICAgICAgdW5tb3VudENvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgZG9tID0gb2xkRG9tID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMgPSBjcmVhdGVDb21wb25lbnQodm5vZGUubm9kZU5hbWUsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChkb20gJiYgIWMuX19iKSB7XG4gICAgICAgICAgICAgICAgYy5fX2IgPSBkb207XG4gICAgICAgICAgICAgICAgb2xkRG9tID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGMsIHByb3BzLCAxLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBkb20gPSBjLmJhc2U7XG4gICAgICAgICAgICBpZiAob2xkRG9tICYmIGRvbSAhPT0gb2xkRG9tKSB7XG4gICAgICAgICAgICAgICAgb2xkRG9tLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKG9sZERvbSwgITEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkb207XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmJlZm9yZVVubW91bnQpIG9wdGlvbnMuYmVmb3JlVW5tb3VudChjb21wb25lbnQpO1xuICAgICAgICB2YXIgYmFzZSA9IGNvbXBvbmVudC5iYXNlO1xuICAgICAgICBjb21wb25lbnQuX194ID0gITA7XG4gICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsVW5tb3VudCgpO1xuICAgICAgICBjb21wb25lbnQuYmFzZSA9IG51bGw7XG4gICAgICAgIHZhciBpbm5lciA9IGNvbXBvbmVudC5fY29tcG9uZW50O1xuICAgICAgICBpZiAoaW5uZXIpIHVubW91bnRDb21wb25lbnQoaW5uZXIpOyBlbHNlIGlmIChiYXNlKSB7XG4gICAgICAgICAgICBpZiAoYmFzZS5fX3ByZWFjdGF0dHJfICYmIGJhc2UuX19wcmVhY3RhdHRyXy5yZWYpIGJhc2UuX19wcmVhY3RhdHRyXy5yZWYobnVsbCk7XG4gICAgICAgICAgICBjb21wb25lbnQuX19iID0gYmFzZTtcbiAgICAgICAgICAgIHJlbW92ZU5vZGUoYmFzZSk7XG4gICAgICAgICAgICBjb2xsZWN0Q29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihiYXNlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tcG9uZW50Ll9fcikgY29tcG9uZW50Ll9fcihudWxsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX19kID0gITA7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUgfHwge307XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlcih2bm9kZSwgcGFyZW50LCBtZXJnZSkge1xuICAgICAgICByZXR1cm4gZGlmZihtZXJnZSwgdm5vZGUsIHt9LCAhMSwgcGFyZW50LCAhMSk7XG4gICAgfVxuICAgIHZhciBvcHRpb25zID0ge307XG4gICAgdmFyIHN0YWNrID0gW107XG4gICAgdmFyIEVNUFRZX0NISUxEUkVOID0gW107XG4gICAgdmFyIGRlZmVyID0gJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgUHJvbWlzZSA/IFByb21pc2UucmVzb2x2ZSgpLnRoZW4uYmluZChQcm9taXNlLnJlc29sdmUoKSkgOiBzZXRUaW1lb3V0O1xuICAgIHZhciBJU19OT05fRElNRU5TSU9OQUwgPSAvYWNpdHxleCg/OnN8Z3xufHB8JCl8cnBofG93c3xtbmN8bnR3fGluZVtjaF18em9vfF5vcmQvaTtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB2YXIgbW91bnRzID0gW107XG4gICAgdmFyIGRpZmZMZXZlbCA9IDA7XG4gICAgdmFyIGlzU3ZnTW9kZSA9ICExO1xuICAgIHZhciBoeWRyYXRpbmcgPSAhMTtcbiAgICB2YXIgY29tcG9uZW50cyA9IHt9O1xuICAgIGV4dGVuZChDb21wb25lbnQucHJvdG90eXBlLCB7XG4gICAgICAgIHNldFN0YXRlOiBmdW5jdGlvbihzdGF0ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBzID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fX3MpIHRoaXMuX19zID0gZXh0ZW5kKHt9LCBzKTtcbiAgICAgICAgICAgIGV4dGVuZChzLCAnZnVuY3Rpb24nID09IHR5cGVvZiBzdGF0ZSA/IHN0YXRlKHMsIHRoaXMucHJvcHMpIDogc3RhdGUpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSAodGhpcy5fX2ggPSB0aGlzLl9faCB8fCBbXSkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICBlbnF1ZXVlUmVuZGVyKHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBmb3JjZVVwZGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgKHRoaXMuX19oID0gdGhpcy5fX2ggfHwgW10pLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KHRoaXMsIDIpO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge31cbiAgICB9KTtcbiAgICB2YXIgcHJlYWN0ID0ge1xuICAgICAgICBoOiBoLFxuICAgICAgICBjcmVhdGVFbGVtZW50OiBoLFxuICAgICAgICBjbG9uZUVsZW1lbnQ6IGNsb25lRWxlbWVudCxcbiAgICAgICAgQ29tcG9uZW50OiBDb21wb25lbnQsXG4gICAgICAgIHJlbmRlcjogcmVuZGVyLFxuICAgICAgICByZXJlbmRlcjogcmVyZW5kZXIsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9O1xuICAgIGlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2YgbW9kdWxlKSBtb2R1bGUuZXhwb3J0cyA9IHByZWFjdDsgZWxzZSBzZWxmLnByZWFjdCA9IHByZWFjdDtcbn0oKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByZWFjdC5qcy5tYXBcbiAgfSkoKTtcbn0pOyIsInZhciBtZXRyZSA9IDEwOyAvL3BpeGVsc1xudmFyIG51bU9mTm9kZXMgPSA0MDtcbnZhciBub21pbmFsU3RyaW5nTGVuZ3RoID0gMTA7IC8vIHBpeGVsc1xudmFyIHNwcmluZ0NvbnN0YW50ID0gMjU7XG52YXIgaW50ZXJuYWxWaXNjb3VzRnJpY3Rpb25Db25zdGFudCA9IDg7XG52YXIgdmlzY291c0NvbnN0YW50ID0gMC4wMDAwMjtcbnZhciBzaW11bGF0aW9uU3BlZWQgPSA0OyAvLyB0aW1lcyByZWFsIHRpbWVcbnZhciBtYXhTdGVwID0gNTA7IC8vIG1pbGxpc2Vjb25kc1xudmFyIGRhbmdlckZvcmNlTWF4ID0gMTUwOy8vMjUwMDA7XG52YXIgZGFuZ2VyRm9yY2VNaW4gPSAwOy8vMTAwMDA7XG52YXIgcm9wZVdlaWdodFBlck1ldHJlID0gMTtcbnZhciByb3BlV2VpZ2h0UGVyTm9kZSA9IG5vbWluYWxTdHJpbmdMZW5ndGggLyBtZXRyZSAqIHJvcGVXZWlnaHRQZXJNZXRyZTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWV0cmUsXG4gICAgbnVtT2ZOb2RlcyxcbiAgICBub21pbmFsU3RyaW5nTGVuZ3RoLFxuICAgIHNwcmluZ0NvbnN0YW50LFxuICAgIGludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQsXG4gICAgdmlzY291c0NvbnN0YW50LFxuICAgIHNpbXVsYXRpb25TcGVlZCxcbiAgICBtYXhTdGVwLFxuICAgIGRhbmdlckZvcmNlTWF4LFxuICAgIGRhbmdlckZvcmNlTWluLFxuICAgIHJvcGVXZWlnaHRQZXJNZXRyZSxcbiAgICByb3BlV2VpZ2h0UGVyTm9kZVxufTtcbiIsImV4cG9ydCBjb25zdCBDb250cm9sc0VudW0gPSBPYmplY3QuZnJlZXplKHtcbiAgICBwYW46ICAgIFwicGFuXCIsXG4gICAgZ3JhYjogICBcImdyYWJcIixcbiAgICBhbmNob3I6IFwiYW5jaG9yXCIsXG4gICAgZXJhc2U6ICBcImVyYXNlXCIsXG4gICAgcm9wZTogICBcInJvcGVcIixcbiAgICBwYXVzZTogIFwicGF1c2VcIixcbn0pOyIsImNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2pzL3NoYXJlZC9jb25maWcnKTtcblxuZnVuY3Rpb24gZ2V0Tm9kZShpZCwgbm9kZXMpIHtcbiAgICByZXR1cm4gbm9kZXMuZmluZChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5pZCA9PT0gaWQ7XG4gICAgfSlcbn1cbmZ1bmN0aW9uIGdldExlbmd0aChub2RlMSwgbm9kZTIpIHtcbiAgICB2YXIgeGRpZmYgPSBNYXRoLmFicyhub2RlMS5wb3NpdGlvbi54IC0gbm9kZTIucG9zaXRpb24ueCk7XG4gICAgdmFyIHlkaWZmID0gTWF0aC5hYnMobm9kZTEucG9zaXRpb24ueSAtIG5vZGUyLnBvc2l0aW9uLnkpO1xuICAgIHJldHVybiBNYXRoLnNxcnQoKHhkaWZmICogeGRpZmYpICsgKHlkaWZmICogeWRpZmYpKTtcbn1cbmZ1bmN0aW9uIGdldE1pZHBvaW50KG5vZGUxLCBub2RlMikge1xuICAgIHJldHVybiB7IHg6IChub2RlMS5wb3NpdGlvbi54ICsgbm9kZTIucG9zaXRpb24ueCkgLyAyLCB5OiAobm9kZTEucG9zaXRpb24ueSArIG5vZGUyLnBvc2l0aW9uLnkpIC8gMiB9XG59XG5mdW5jdGlvbiBnZXRBbmdsZUZyb21Ib3Jpem9udGFsKG5vZGUxLCBub2RlMikge1xuICAgIHJldHVybiBNYXRoLmF0YW4yKG5vZGUyLnBvc2l0aW9uLnkgLSBub2RlMS5wb3NpdGlvbi55LCBub2RlMi5wb3NpdGlvbi54IC0gbm9kZTEucG9zaXRpb24ueClcbn1cblxuZnVuY3Rpb24gZ2V0Rm9yY2Uobm9kZTEsIG5vZGUyKSB7XG4gICAgdmFyIHN0cmluZ0xlbmd0aCA9IGdldExlbmd0aChub2RlMSwgbm9kZTIpO1xuICAgIHZhciBsZW5ndGhEaWZmZXJlbmNlID0gc3RyaW5nTGVuZ3RoIC0gY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGg7XG4gICAgdmFyIGFuZ2xlRnJvbUhvcml6b250YWwgPSBnZXRBbmdsZUZyb21Ib3Jpem9udGFsKG5vZGUxLCBub2RlMik7XG4gICAgdmFyIHlTcHJpbmdGb3JjZSA9IE1hdGguc2luKGFuZ2xlRnJvbUhvcml6b250YWwpICogbGVuZ3RoRGlmZmVyZW5jZSAqIGNvbmZpZy5zcHJpbmdDb25zdGFudDtcbiAgICB2YXIgeFNwcmluZ0ZvcmNlID0gTWF0aC5jb3MoYW5nbGVGcm9tSG9yaXpvbnRhbCkgKiBsZW5ndGhEaWZmZXJlbmNlICogY29uZmlnLnNwcmluZ0NvbnN0YW50O1xuICAgIHZhciB0b3RhbFNwcmluZ0ZvcmNlID0gTWF0aC5zcXJ0KCh5U3ByaW5nRm9yY2UqeVNwcmluZ0ZvcmNlKSsoeFNwcmluZ0ZvcmNlK3hTcHJpbmdGb3JjZSkpO1xuICAgIHJldHVybiB7dG90YWw6IHRvdGFsU3ByaW5nRm9yY2UsIHg6IHhTcHJpbmdGb3JjZSwgeTogeVNwcmluZ0ZvcmNlfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRBbmdsZUZyb21Ib3Jpem9udGFsLFxuICAgIGdldEZvcmNlLFxuICAgIGdldExlbmd0aCxcbiAgICBnZXRNaWRwb2ludCxcbiAgICBnZXROb2RlXG59IiwiY29uc3QgVmVjdG9yID0gcmVxdWlyZSgnanMvc2hhcmVkL3ZlY3RvcicpLlZlY3RvcjtcblxudmFyIHVuaXF1ZWlkID0gLTE7XG5mdW5jdGlvbiBnZXRJRCgpIHtcbiAgICB1bmlxdWVpZCArPSAxO1xuICAgIHJldHVybiB1bmlxdWVpZDtcbn1cblxuY2xhc3MgTm9kZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHggPSAwLFxuICAgICAgICB5ID0gMCxcbiAgICAgICAgdnggPSAwLFxuICAgICAgICB2eSA9IDAsXG4gICAgICAgIGZ4ID0gMCxcbiAgICAgICAgZnkgPSAwLFxuICAgICAgICBmaXhlZCA9IGZhbHNlLFxuICAgICAgICBjb25uZWN0ZWROb2RlcyA9IFtdLFxuICAgICAgICBpZFxuICAgICkge1xuICAgICAgICB0aGlzLmlkID0gaWQgPyBpZCA6IGdldElEKCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yKHgsIHkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFZlY3Rvcih2eCwgdnkpO1xuICAgICAgICB0aGlzLmZvcmNlID0gbmV3IFZlY3RvcihmeCwgZnkpO1xuICAgICAgICB0aGlzLmZpeGVkID0gZml4ZWQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkTm9kZXMgPSBjb25uZWN0ZWROb2RlcztcbiAgICB9XG4gICAgZ2V0T2JqZWN0KCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvbixcbiAgICAgICAgICAgIHZlbG9jaXR5OiB0aGlzLnZlbG9jaXR5LFxuICAgICAgICAgICAgZm9yY2U6IHRoaXMuZm9yY2UsXG4gICAgICAgICAgICBmaXhlZDogdGhpcy5maXhlZCxcbiAgICAgICAgICAgIGNvbm5lY3RlZE5vZGVzOiB0aGlzLmNvbm5lY3RlZE5vZGVzXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxvYWRPYmplY3Qobm9kZU9iamVjdCA9IHt9KSB7XG4gICAgICAgIHRoaXMuaWQgPSBub2RlT2JqZWN0LmlkID8gbm9kZU9iamVjdC5pZCA6IHRoaXMuaWQ7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBub2RlT2JqZWN0LnBvc2l0aW9uIHx8IHRoaXMucG9zaXRpb247XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBub2RlT2JqZWN0LnZlbG9jaXR5IHx8IHRoaXMudmVsb2NpdHk7XG4gICAgICAgIHRoaXMuZm9yY2UgPSBub2RlT2JqZWN0LmZvcmNlIHx8IHRoaXMuZm9yY2U7XG4gICAgICAgIHRoaXMuZml4ZWQgPSBub2RlT2JqZWN0LmZpeGVkIHx8IHRoaXMuZml4ZWQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkTm9kZXMgPSBub2RlT2JqZWN0LmNvbm5lY3RlZE5vZGVzIHx8IHRoaXMuY29ubmVjdGVkTm9kZXM7XG4gICAgfVxuICAgIGNvcHlOb2RlKCkge1xuICAgICAgICByZXR1cm4gbmV3IE5vZGUoXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLngsXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnksXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LngsXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnksXG4gICAgICAgICAgICB0aGlzLmZvcmNlLngsXG4gICAgICAgICAgICB0aGlzLmZvcmNlLnksXG4gICAgICAgICAgICB0aGlzLmZpeGVkLFxuICAgICAgICAgICAgdGhpcy5jb25uZWN0ZWROb2RlcyxcbiAgICAgICAgICAgIHRoaXMuaWRcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIE5vZGVcbn07XG4iLCIvLyBQcm92aWRlcyBhIHNpbXBsZSAzRCB2ZWN0b3IgY2xhc3MuIFZlY3RvciBvcGVyYXRpb25zIGNhbiBiZSBkb25lIHVzaW5nIG1lbWJlclxuLy8gZnVuY3Rpb25zLCB3aGljaCByZXR1cm4gbmV3IHZlY3RvcnMsIG9yIHN0YXRpYyBmdW5jdGlvbnMsIHdoaWNoIHJldXNlXG4vLyBleGlzdGluZyB2ZWN0b3JzIHRvIGF2b2lkIGdlbmVyYXRpbmcgZ2FyYmFnZS5cbmZ1bmN0aW9uIFZlY3Rvcih4LCB5LCB6KSB7XG4gIHRoaXMueCA9IHggfHwgMDtcbiAgdGhpcy55ID0geSB8fCAwO1xuICB0aGlzLnogPSB6IHx8IDA7XG59XG5cbi8vICMjIyBJbnN0YW5jZSBNZXRob2RzXG4vLyBUaGUgbWV0aG9kcyBgYWRkKClgLCBgc3VidHJhY3QoKWAsIGBtdWx0aXBseSgpYCwgYW5kIGBkaXZpZGUoKWAgY2FuIGFsbFxuLy8gdGFrZSBlaXRoZXIgYSB2ZWN0b3Igb3IgYSBudW1iZXIgYXMgYW4gYXJndW1lbnQuXG5WZWN0b3IucHJvdG90eXBlID0ge1xuICBsb2FkOiBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih2ZWN0b3IueCB8fCAwLCB2ZWN0b3IueSB8fCAwLCB2ZWN0b3IueiB8fCAwKTtcbiAgfSxcbiAgbmVnYXRpdmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKC10aGlzLngsIC10aGlzLnksIC10aGlzLnopO1xuICB9LFxuICBhZGQ6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKyB2LCB0aGlzLnkgKyB2LCB0aGlzLnogKyB2KTtcbiAgfSxcbiAgc3VidHJhY3Q6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggLSB2LCB0aGlzLnkgLSB2LCB0aGlzLnogLSB2KTtcbiAgfSxcbiAgbXVsdGlwbHk6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKiB2LCB0aGlzLnkgKiB2LCB0aGlzLnogKiB2KTtcbiAgfSxcbiAgZGl2aWRlOiBmdW5jdGlvbih2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBWZWN0b3IpIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAvIHYueCwgdGhpcy55IC8gdi55LCB0aGlzLnogLyB2LnopO1xuICAgIGVsc2UgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gdiwgdGhpcy55IC8gdiwgdGhpcy56IC8gdik7XG4gIH0sXG4gIGVxdWFsczogZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggPT0gdi54ICYmIHRoaXMueSA9PSB2LnkgJiYgdGhpcy56ID09IHYuejtcbiAgfSxcbiAgZG90OiBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHRoaXMueiAqIHYuejtcbiAgfSxcbiAgY3Jvc3M6IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgIHRoaXMueSAqIHYueiAtIHRoaXMueiAqIHYueSxcbiAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcbiAgICAgIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueFxuICAgICk7XG4gIH0sXG4gIGxlbmd0aDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRvdCh0aGlzKSk7XG4gIH0sXG4gIHVuaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRpdmlkZSh0aGlzLmxlbmd0aCgpKTtcbiAgfSxcbiAgbWluOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5taW4odGhpcy54LCB0aGlzLnkpLCB0aGlzLnopO1xuICB9LFxuICBtYXg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLm1heChNYXRoLm1heCh0aGlzLngsIHRoaXMueSksIHRoaXMueik7XG4gIH0sXG4gIHRvQW5nbGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGhldGE6IE1hdGguYXRhbjIodGhpcy56LCB0aGlzLngpLFxuICAgICAgcGhpOiBNYXRoLmFzaW4odGhpcy55IC8gdGhpcy5sZW5ndGgoKSlcbiAgICB9O1xuICB9LFxuICBhbmdsZVRvOiBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIE1hdGguYWNvcyh0aGlzLmRvdChhKSAvICh0aGlzLmxlbmd0aCgpICogYS5sZW5ndGgoKSkpO1xuICB9LFxuICB0b0FycmF5OiBmdW5jdGlvbihuKSB7XG4gICAgcmV0dXJuIFt0aGlzLngsIHRoaXMueSwgdGhpcy56XS5zbGljZSgwLCBuIHx8IDMpO1xuICB9LFxuICBjbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnksIHRoaXMueik7XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgICB0aGlzLnggPSB4OyB0aGlzLnkgPSB5OyB0aGlzLnogPSB6O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG4vLyAjIyMgU3RhdGljIE1ldGhvZHNcbi8vIGBWZWN0b3IucmFuZG9tRGlyZWN0aW9uKClgIHJldHVybnMgYSB2ZWN0b3Igd2l0aCBhIGxlbmd0aCBvZiAxIGFuZCBhXG4vLyBzdGF0aXN0aWNhbGx5IHVuaWZvcm0gZGlyZWN0aW9uLiBgVmVjdG9yLmxlcnAoKWAgcGVyZm9ybXMgbGluZWFyXG4vLyBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlY3RvcnMuXG5WZWN0b3IubmVnYXRpdmUgPSBmdW5jdGlvbihhLCBiKSB7XG4gIGIueCA9IC1hLng7IGIueSA9IC1hLnk7IGIueiA9IC1hLno7XG4gIHJldHVybiBiO1xufTtcblZlY3Rvci5hZGQgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54ICsgYi54OyBjLnkgPSBhLnkgKyBiLnk7IGMueiA9IGEueiArIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54ICsgYjsgYy55ID0gYS55ICsgYjsgYy56ID0gYS56ICsgYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3Iuc3VidHJhY3QgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54IC0gYi54OyBjLnkgPSBhLnkgLSBiLnk7IGMueiA9IGEueiAtIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54IC0gYjsgYy55ID0gYS55IC0gYjsgYy56ID0gYS56IC0gYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3IubXVsdGlwbHkgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54ICogYi54OyBjLnkgPSBhLnkgKiBiLnk7IGMueiA9IGEueiAqIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54ICogYjsgYy55ID0gYS55ICogYjsgYy56ID0gYS56ICogYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3IuZGl2aWRlID0gZnVuY3Rpb24oYSwgYiwgYykge1xuICBpZiAoYiBpbnN0YW5jZW9mIFZlY3RvcikgeyBjLnggPSBhLnggLyBiLng7IGMueSA9IGEueSAvIGIueTsgYy56ID0gYS56IC8gYi56OyB9XG4gIGVsc2UgeyBjLnggPSBhLnggLyBiOyBjLnkgPSBhLnkgLyBiOyBjLnogPSBhLnogLyBiOyB9XG4gIHJldHVybiBjO1xufTtcblZlY3Rvci5jcm9zcyA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgYy54ID0gYS55ICogYi56IC0gYS56ICogYi55O1xuICBjLnkgPSBhLnogKiBiLnggLSBhLnggKiBiLno7XG4gIGMueiA9IGEueCAqIGIueSAtIGEueSAqIGIueDtcbiAgcmV0dXJuIGM7XG59O1xuVmVjdG9yLnVuaXQgPSBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBsZW5ndGggPSBhLmxlbmd0aCgpO1xuICBiLnggPSBhLnggLyBsZW5ndGg7XG4gIGIueSA9IGEueSAvIGxlbmd0aDtcbiAgYi56ID0gYS56IC8gbGVuZ3RoO1xuICByZXR1cm4gYjtcbn07XG5WZWN0b3IuZnJvbUFuZ2xlcyA9IGZ1bmN0aW9uKHRoZXRhLCBwaGkpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5jb3ModGhldGEpICogTWF0aC5jb3MocGhpKSwgTWF0aC5zaW4ocGhpKSwgTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSk7XG59O1xuVmVjdG9yLnJhbmRvbURpcmVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gVmVjdG9yLmZyb21BbmdsZXMoTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyLCBNYXRoLmFzaW4oTWF0aC5yYW5kb20oKSAqIDIgLSAxKSk7XG59O1xuVmVjdG9yLm1pbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5taW4oYS54LCBiLngpLCBNYXRoLm1pbihhLnksIGIueSksIE1hdGgubWluKGEueiwgYi56KSk7XG59O1xuVmVjdG9yLm1heCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5tYXgoYS54LCBiLngpLCBNYXRoLm1heChhLnksIGIueSksIE1hdGgubWF4KGEueiwgYi56KSk7XG59O1xuVmVjdG9yLmxlcnAgPSBmdW5jdGlvbihhLCBiLCBmcmFjdGlvbikge1xuICByZXR1cm4gYi5zdWJ0cmFjdChhKS5tdWx0aXBseShmcmFjdGlvbikuYWRkKGEpO1xufTtcblZlY3Rvci5mcm9tQXJyYXkgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBuZXcgVmVjdG9yKGFbMF0sIGFbMV0sIGFbMl0pO1xufTtcblZlY3Rvci5hbmdsZUJldHdlZW4gPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhLmFuZ2xlVG8oYik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVmVjdG9yXG59IiwiaW1wb3J0IHsgaCwgcmVuZGVyIH0gZnJvbSBcInByZWFjdFwiO1xuaW1wb3J0IEFwcCBmcm9tIFwiLi91aS9jb21wb25lbnRzL0FwcFwiO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgcmVuZGVyKDxBcHAgLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYXBwXCIpKTtcbn0pO1xuIiwiaW1wb3J0IHsgaCwgQ29tcG9uZW50IH0gZnJvbSBcInByZWFjdFwiO1xuaW1wb3J0IENhbnZhcyBmcm9tIFwianMvdWkvY29tcG9uZW50cy9jYW52YXMvY2FudmFzXCI7XG5pbXBvcnQgQ29udHJvbHMgZnJvbSBcImpzL3VpL2NvbXBvbmVudHMvY29udHJvbHMvY29udHJvbHNcIjtcbmltcG9ydCBTdGF0cyBmcm9tIFwianMvdWkvY29tcG9uZW50cy9zdGF0cy9zdGF0c1wiO1xuaW1wb3J0IFNhdmVNb2RhbCBmcm9tIFwianMvdWkvY29tcG9uZW50cy9zYXZlLW1vZGFsL3NhdmUtbW9kYWxcIjtcbmltcG9ydCBMb2FkTW9kYWwgZnJvbSBcImpzL3VpL2NvbXBvbmVudHMvbG9hZC1tb2RhbC9sb2FkLW1vZGFsXCI7XG5pbXBvcnQgeyBDb250cm9sc0VudW0gfSBmcm9tIFwianMvc2hhcmVkL2NvbnN0YW50cy5qc1wiXG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcImpzL3NoYXJlZC9jb25maWdcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHZhciB3b3JrZXIgPSBuZXcgV29ya2VyKFwid29ya2VyLmpzXCIpO1xuICAgICAgICB3b3JrZXIub25tZXNzYWdlID0gdGhpcy5oYW5kbGVXb3JrZXI7XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcImluaXRcIik7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHdvcmtlcixcbiAgICAgICAgICAgIG5vZGVzOiBbXSxcbiAgICAgICAgICAgIHNlbGVjdGVkQ29udHJvbDogQ29udHJvbHNFbnVtLnBhbixcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBzaG93SURzOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNhdmVEYXRhOiBudWxsLFxuICAgICAgICAgICAgc2F2ZU1vZGFsVmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICBsb2FkTW9kYWxWaXNpYmxlOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkZyYW1lKTtcbiAgICAgICAgdGhpcy5zdGF0ZS53b3JrZXIucG9zdE1lc3NhZ2UoXCJydW5cIik7XG4gICAgfVxuXG4gICAgb25GcmFtZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zdGF0ZS53b3JrZXIucG9zdE1lc3NhZ2UoXCJzZW5kXCIpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkZyYW1lKTtcbiAgICB9O1xuXG4gICAgaGFuZGxlV29ya2VyID0gZGF0YSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbm9kZXM6IGRhdGEuZGF0YS5ub2RlcyxcbiAgICAgICAgICAgIHRydWVTaW11bGF0aW9uU3BlZWQ6IGRhdGEuZGF0YS50cnVlU2ltdWxhdGlvblNwZWVkXG4gICAgICAgIH0pO1xuICAgICAgICAvL2NvbXB1dGUoKTtcbiAgICB9O1xuXG4gICAgY2hhbmdlQ29udHJvbCA9IGNvbnRyb2wgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNlbGVjdGVkQ29udHJvbDogY29udHJvbFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjaGFuZ2VTY2FsZSA9IHBvc2l0aXZlID0+IHtcbiAgICAgIGxldCBzY2FsZSA9IHRoaXMuc3RhdGUuc2NhbGU7XG4gICAgICBpZiAoKCFwb3NpdGl2ZSAmJiBzY2FsZSA8PSAxKSB8fCAocG9zaXRpdmUgJiYgc2NhbGUgPCAxKSApIHtcbiAgICAgICAgaWYgKHBvc2l0aXZlKSB7XG4gICAgICAgICAgc2NhbGUgPSBzY2FsZSArIDAuMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNjYWxlID0gc2NhbGUgLSAwLjFcbiAgICAgICAgfVxuICAgICAgICBzY2FsZSA9IE1hdGgucm91bmQoc2NhbGUqMTApLzEwXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocG9zaXRpdmUpIHtcbiAgICAgICAgICBzY2FsZSA9IHNjYWxlICsgMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNjYWxlID0gc2NhbGUgLSAxXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzY2FsZSA8PSAwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2NhbGV9KVxuXG4gICAgfVxuXG4gICAgY2hhbmdlT3B0aW9uID0gKGtleSwgdmFsdWUpID0+IHtcbiAgICAgIGxldCBvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zO1xuICAgICAgb3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICB0aGlzLnNldFN0YXRlKHtvcHRpb25zfSlcbiAgICB9XG5cbiAgICBzYXZlID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNhdmVEYXRhOmJ0b2EoSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5ub2RlcykpLFxuICAgICAgICBzYXZlTW9kYWxWaXNpYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxtYWluPlxuICAgICAgICAgICAgICAgIDxDYW52YXMgb3B0aW9ucz17dGhpcy5zdGF0ZS5vcHRpb25zfSBub2Rlcz17dGhpcy5zdGF0ZS5ub2Rlc30gd29ya2VyPXt0aGlzLnN0YXRlLndvcmtlcn0gc2VsZWN0ZWRDb250cm9sPXt0aGlzLnN0YXRlLnNlbGVjdGVkQ29udHJvbH0gc2NhbGU9e3RoaXMuc3RhdGUuc2NhbGV9Lz5cbiAgICAgICAgICAgICAgICA8Q29udHJvbHMgd29ya2VyPXt0aGlzLnN0YXRlLndvcmtlcn0gc2VsZWN0ZWRDb250cm9sPXt0aGlzLnN0YXRlLnNlbGVjdGVkQ29udHJvbH0gY2hhbmdlQ29udHJvbD17dGhpcy5jaGFuZ2VDb250cm9sfSBjaGFuZ2VTY2FsZT17dGhpcy5jaGFuZ2VTY2FsZX0gc2NhbGU9e3RoaXMuc3RhdGUuc2NhbGV9IG9wdGlvbnM9e3RoaXMuc3RhdGUub3B0aW9uc30gY2hhbmdlT3B0aW9uPXt0aGlzLmNoYW5nZU9wdGlvbn0gc2F2ZT17dGhpcy5zYXZlfSBsb2FkPXsoKT0+dGhpcy5zZXRTdGF0ZSh7bG9hZE1vZGFsVmlzaWJsZTp0cnVlfSl9Lz5cbiAgICAgICAgICAgICAgICA8U3RhdHMgdHJ1ZVNpbXVsYXRpb25TcGVlZD17dGhpcy5zdGF0ZS50cnVlU2ltdWxhdGlvblNwZWVkfSAvPlxuICAgICAgICAgICAgICAgIDxTYXZlTW9kYWwgdmlzaWJsZT17dGhpcy5zdGF0ZS5zYXZlTW9kYWxWaXNpYmxlfSBzYXZlRGF0YT17dGhpcy5zdGF0ZS5zYXZlRGF0YX0gY2xvc2U9eygpPT50aGlzLnNldFN0YXRlKHtzYXZlTW9kYWxWaXNpYmxlOmZhbHNlfSl9Lz5cbiAgICAgICAgICAgICAgICA8TG9hZE1vZGFsIHZpc2libGU9e3RoaXMuc3RhdGUubG9hZE1vZGFsVmlzaWJsZX0gd29ya2VyPXt0aGlzLnN0YXRlLndvcmtlcn0gY2xvc2U9eygpPT50aGlzLnNldFN0YXRlKHtsb2FkTW9kYWxWaXNpYmxlOmZhbHNlfSl9Lz5cbiAgICAgICAgICAgIDwvbWFpbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbi8qPGRpdj5TaW0gc3BlZWQ6IDxzcGFuIGlkPVwic2ltc3BlZWRcIj48L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48YnV0dG9uIGlkPVwic3RhcnRcIj5TdGFydDwvYnV0dG9uPjxidXR0b24gaWQ9XCJzdG9wXCI+U3RvcDwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+PGlucHV0IGNoZWNrZWQgaWQ9XCJzaG93LWlkc1wiIHR5cGU9XCJjaGVja2JveFwiIC8+IFNob3cgbm9kZSBJRHM8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PkZyb206IDxpbnB1dCBpZD1cImZyb21cIj48L2lucHV0PjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+VG86IDxpbnB1dCBpZD1cInRvXCI+PC9pbnB1dD48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PkZvcmNlOiA8c3BhbiBpZD1cInJlc3VsdFwiPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxpbnB1dCBpZD1cImxvYWQtZGF0YVwiIC8+PGJ1dHRvbiBpZD1cImxvYWRcIj5Mb2FkPC9idXR0b24+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48aW5wdXQgaWQ9XCJzYXZlLWRhdGFcIiAvPjxidXR0b24gaWQ9XCJzYXZlXCI+U2F2ZTwvYnV0dG9uPjwvZGl2PiovXG4iLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tIFwicHJlYWN0XCI7XG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcImpzL3NoYXJlZC9jb25maWdcIjtcbmltcG9ydCAqIGFzIGhlbHBlciBmcm9tIFwianMvc2hhcmVkL2hlbHBlclwiO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSBcImpzL3NoYXJlZC92ZWN0b3JcIjtcbmltcG9ydCB7IE5vZGUgfSBmcm9tIFwianMvc2hhcmVkL25vZGVcIjtcbmltcG9ydCB7IENvbnRyb2xzRW51bSB9IGZyb20gXCJqcy9zaGFyZWQvY29uc3RhbnRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbnZhcyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbW91c2Vkb3duOiBmYWxzZSxcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZTogbnVsbCxcbiAgICAgICAgICAgIG5ld05vZGVzOiBbXSxcbiAgICAgICAgICAgIG1vdXNlUG9zaXRpb246IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgc3RhcnRDb29yZHM6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgbGFzdENvb3JkczogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1lZDogeyB4OiAwLCB5OiAwIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuaW50ZXJhY3QoKTtcbiAgICB9XG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXG4gICAgICAgICAgICAgICAgXCJtb3ZlXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZE5vZGU6IHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlLFxuICAgICAgICAgICAgICAgICAgICBtb3VzZVBvc2l0aW9uOiB0aGlzLnN0YXRlLm1vdXNlUG9zaXRpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRVbmlxdWVJRCA9ICgpID0+IHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgbm90dW5pcXVlID0gdHJ1ZTtcbiAgICAgICAgd2hpbGUobm90dW5pcXVlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMubm9kZXMuZmluZChuPT5uLmlkID09PSBpKSAmJiAhdGhpcy5zdGF0ZS5uZXdOb2Rlcy5maW5kKG49Pm4uaWQgPT09IGkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW50ZXJhY3QgPSAoKSA9PiB7XG4gICAgICAgIHZhciBjID0gdGhpcy5jYW52YXM7XG4gICAgICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMubm9kZXM7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgYy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgXCJtb3VzZWRvd25cIixcbiAgICAgICAgICAgIGUgPT4ge1xuICAgICAgICAgICAgICAgIHZhciByZWN0ID0gYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICB2YXIgbW91c2UgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IGUuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgeTogZS5jbGllbnRZIC0gcmVjdC50b3BcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZFYgPSBuZXcgVmVjdG9yKCkubG9hZCh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkKTtcbiAgICAgICAgICAgICAgICB2YXIgbSA9IG5ldyBWZWN0b3IobW91c2UueCwgbW91c2UueSk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlUG9zaXRpb24gPSBtLnN1YnRyYWN0KHRyYW5zZm9ybWVkVikuZGl2aWRlKHRoaXMucHJvcHMuc2NhbGUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLmdyYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVzID0gdGhpcy5wcm9wcy5ub2RlcztcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1pbiA9IDIwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLnBvc2l0aW9uID0gbmV3IFZlY3RvcigpLmxvYWQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBub2Rlc1tpXS5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJ0cmFjdChtLnN1YnRyYWN0KHRyYW5zZm9ybWVkVikuZGl2aWRlKHRoaXMucHJvcHMuc2NhbGUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5sZW5ndGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWluIHx8IGRpc3RhbmNlIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4gPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2RlOiBzZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09PSBDb250cm9sc0VudW0ucGFuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDb29yZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBlLnBhZ2VYIC0gcmVjdC5sZWZ0IC0gdGhpcy5zdGF0ZS5sYXN0Q29vcmRzLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZS5wYWdlWSAtIHJlY3QudG9wIC0gdGhpcy5zdGF0ZS5sYXN0Q29vcmRzLnlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLmFuY2hvcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm5ld2FuY2hvclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBtb3VzZVBvc2l0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLmVyYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMubm9kZXM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtaW4gPSA1O1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5wb3NpdGlvbiA9IG5ldyBWZWN0b3IoKS5sb2FkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gbm9kZXNbaV0ucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3VidHJhY3QobS5zdWJ0cmFjdCh0cmFuc2Zvcm1lZFYpLmRpdmlkZSh0aGlzLnByb3BzLnNjYWxlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubGVuZ3RoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCBtaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVsZXRlbm9kZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5vZGU6IG5vZGVzW2ldIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zaXRpb246IG0uc3VidHJhY3QodHJhbnNmb3JtZWRWKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09PSBDb250cm9sc0VudW0ucm9wZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IG5ldyBOb2RlKG1vdXNlUG9zaXRpb24ueCwgbW91c2VQb3NpdGlvbi55LDAsMCwwLDAsZmFsc2UsW10sdGhpcy5nZXRVbmlxdWVJRCgpKVxuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZXMgPSB0aGlzLnByb3BzLm5vZGVzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWluID0gNTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb24gPSBuZXcgVmVjdG9yKCkubG9hZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IG5vZGVzW2ldLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YnRyYWN0KG1vdXNlUG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmxlbmd0aCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jb25uZWN0ZWROb2Rlcy5wdXNoKG5vZGVzW2ldLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5jb25uZWN0ZWROb2Rlcy5wdXNoKG5vZGUuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDb29yZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBub2RlLnBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogbm9kZS5wb3NpdGlvbi55XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZXM6IFtub2RlXVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vdXNlZG93bjogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICAgIGMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIFwibW91c2Vtb3ZlXCIsXG4gICAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFggLSByZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNmb3JtZWRWID0gbmV3IFZlY3RvcigpLmxvYWQodGhpcy5zdGF0ZS50cmFuc2Zvcm1lZCk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlUG9zaXRpb24gPSBuZXcgVmVjdG9yKG1vdXNlLngsIG1vdXNlLnkpLnN1YnRyYWN0KFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFZcbiAgICAgICAgICAgICAgICApLmRpdmlkZSh0aGlzLnByb3BzLnNjYWxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgbW91c2VQb3NpdGlvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLmdyYWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3VzZVBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT09IENvbnRyb2xzRW51bS5wYW4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubW91c2Vkb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBtb3VzZS54IC0gdGhpcy5zdGF0ZS5zdGFydENvb3Jkcy54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBtb3VzZS55IC0gdGhpcy5zdGF0ZS5zdGFydENvb3Jkcy55XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09PSBDb250cm9sc0VudW0uZXJhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubW91c2Vkb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZXMgPSB0aGlzLnByb3BzLm5vZGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1pbiA9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb24gPSBuZXcgVmVjdG9yKCkubG9hZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IG5vZGVzW2ldLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJ0cmFjdChtb3VzZVBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubGVuZ3RoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMud29ya2VyLnBvc3RNZXNzYWdlKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVsZXRlbm9kZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBub2RlOiBub2Rlc1tpXSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT09IENvbnRyb2xzRW51bS5yb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm1vdXNlZG93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXJ0Q29vcmRzViA9IG5ldyBWZWN0b3IoKS5sb2FkKHRoaXMuc3RhdGUuc3RhcnRDb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gc3RhcnRDb29yZHNWLnN1YnRyYWN0KG1vdXNlUG9zaXRpb24pLmxlbmd0aCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IG5ldyBOb2RlKG1vdXNlUG9zaXRpb24ueCwgbW91c2VQb3NpdGlvbi55LDAsMCwwLDAsZmFsc2UsW10sdGhpcy5nZXRVbmlxdWVJRCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Tm9kZXMgPSB0aGlzLnN0YXRlLm5ld05vZGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcmV2Tm9kZSA9IG5ld05vZGVzW25ld05vZGVzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZOb2RlLmNvbm5lY3RlZE5vZGVzLnB1c2gobm9kZS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jb25uZWN0ZWROb2Rlcy5wdXNoKHByZXZOb2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDb29yZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IG1vdXNlUG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IG1vdXNlUG9zaXRpb24ueVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgYy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgXCJtb3VzZXVwXCIsXG4gICAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFggLSByZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNmb3JtZWRWID0gbmV3IFZlY3RvcigpLmxvYWQodGhpcy5zdGF0ZS50cmFuc2Zvcm1lZCk7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSBuZXcgVmVjdG9yKG1vdXNlLngsIG1vdXNlLnkpO1xuICAgICAgICAgICAgICAgIHZhciBtb3VzZVBvc2l0aW9uID0gbS5zdWJ0cmFjdCh0cmFuc2Zvcm1lZFYpLmRpdmlkZSh0aGlzLnByb3BzLnNjYWxlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT09IENvbnRyb2xzRW51bS5ncmFiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy53b3JrZXIucG9zdE1lc3NhZ2UoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibm9tb3ZlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzZWxlY3RlZE5vZGU6IHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZE5vZGU6IG51bGwgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLnBhbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvb3Jkczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGUucGFnZVggLSByZWN0LmxlZnQgLSB0aGlzLnN0YXRlLnN0YXJ0Q29vcmRzLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogZS5wYWdlWSAtIHJlY3QudG9wIC0gdGhpcy5zdGF0ZS5zdGFydENvb3Jkcy55XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDb29yZHM6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PT0gQ29udHJvbHNFbnVtLnJvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGUgPSB0aGlzLnN0YXRlLm5ld05vZGVzW3RoaXMuc3RhdGUubmV3Tm9kZXMubGVuZ3RoIC0gMV1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVzID0gdGhpcy5wcm9wcy5ub2RlcztcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1pbiA9IDU7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLnBvc2l0aW9uID0gbmV3IFZlY3RvcigpLmxvYWQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBub2Rlc1tpXS5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJ0cmFjdChtb3VzZVBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5sZW5ndGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IG1pbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY29ubmVjdGVkTm9kZXMucHVzaChub2Rlc1tpXS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0uY29ubmVjdGVkTm9kZXMucHVzaChub2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXCJhZGRub2Rlc1wiLCB7bm9kZXM6IHRoaXMuc3RhdGUubmV3Tm9kZXN9XSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlczogbm9kZXMuY29uY2F0KHRoaXMuc3RhdGUubmV3Tm9kZXMpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb3VzZWRvd246IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGUgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2cod2luZG93LnNjcm9sbFkpXG4gICAgICAgIH0pXG4gICAgICAgIGRvY3VtZW50Lm9ua2V5cHJlc3MgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgICAgICAgICAgY29uc29sZS5sb2coZS5rZXlDb2RlKVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBkcmF3ID0gKCkgPT4ge1xuICAgICAgICB2YXIgc2hvd0lEcyA9IHRoaXMucHJvcHMub3B0aW9ucy5zaG93SURzO1xuICAgICAgICAvLyBDbGVhciBhbmQgcmVzZXQgY2FudmFzXG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgbGV0IG5vZGVzID0gdGhpcy5wcm9wcy5ub2RlcztcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoMCwwLDApXCI7XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oMSwwLDAsMSwwLDApO1xuICAgICAgICBjdHguY2xlYXJSZWN0KDAsMCwgdGhpcy5jYW52YXMud2lkdGgsXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodClcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgY3R4LnNldFRyYW5zZm9ybShcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc2NhbGUsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc2NhbGUsXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLngsXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnlcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBEcmF3IGdyaWRcbiAgICAgICAgdmFyIGdyaWRTaXplID0gMTAgKiBjb25maWcubWV0cmU7XG4gICAgICAgIHZhciBvZmZzZXR4ID0gKHRoaXMuc3RhdGUudHJhbnNmb3JtZWQueCAvIHRoaXMucHJvcHMuc2NhbGUgKSAlIGdyaWRTaXplO1xuICAgICAgICB2YXIgb2Zmc2V0eSA9ICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnkgLyB0aGlzLnByb3BzLnNjYWxlKSAlIGdyaWRTaXplO1xuICAgICAgICBmb3IgKGxldCB4ID0gMCAtIDIqZ3JpZFNpemU7IHggPCAodGhpcy5jYW52YXMud2lkdGggLyAgdGhpcy5wcm9wcy5zY2FsZSkgKyBncmlkU2l6ZTsgeCA9IHggKyBncmlkU2l6ZSkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCIjZDBkMGQwXCJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oeCAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnggLyB0aGlzLnByb3BzLnNjYWxlICkgKyBvZmZzZXR4LCAwIC0gZ3JpZFNpemUgLSAodGhpcy5zdGF0ZS50cmFuc2Zvcm1lZC55IC8gdGhpcy5wcm9wcy5zY2FsZSkgKyBvZmZzZXR5KTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oeCAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnggLyB0aGlzLnByb3BzLnNjYWxlICkgKyBvZmZzZXR4LCAgKHRoaXMuY2FudmFzLmhlaWdodCAvICB0aGlzLnByb3BzLnNjYWxlKSAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnkgLyB0aGlzLnByb3BzLnNjYWxlKSArIG9mZnNldHkgKyBncmlkU2l6ZSk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKClcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCB5ID0gMCAtIDIqZ3JpZFNpemU7IHkgPCAodGhpcy5jYW52YXMuaGVpZ2h0IC8gIHRoaXMucHJvcHMuc2NhbGUpICsgZ3JpZFNpemU7IHkgPSB5ICsgZ3JpZFNpemUpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiI2QwZDBkMFwiXG4gICAgICAgICAgICBjdHgubW92ZVRvKDAgLSBncmlkU2l6ZSAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnggLyB0aGlzLnByb3BzLnNjYWxlICkgKyBvZmZzZXR4LCB5IC0gKHRoaXMuc3RhdGUudHJhbnNmb3JtZWQueSAvIHRoaXMucHJvcHMuc2NhbGUpICsgb2Zmc2V0eSk7XG4gICAgICAgICAgICBjdHgubGluZVRvKCh0aGlzLmNhbnZhcy53aWR0aCAvICB0aGlzLnByb3BzLnNjYWxlKSAtICh0aGlzLnN0YXRlLnRyYW5zZm9ybWVkLnggLyB0aGlzLnByb3BzLnNjYWxlICkgKyBvZmZzZXR4ICsgZ3JpZFNpemUseSAtICAodGhpcy5zdGF0ZS50cmFuc2Zvcm1lZC55IC8gdGhpcy5wcm9wcy5zY2FsZSkgKyBvZmZzZXR5KTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHJhdyBpbmRpY2F0b3JzIGFyb3VuZCBjdXJzb3IgaWYgbmVlZGVkXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDAsMCwwKVwiO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT09IENvbnRyb2xzRW51bS5lcmFzZSkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmFyYyhcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm1vdXNlUG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm1vdXNlUG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICA1LFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMiAqIE1hdGguUElcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEcmF3IHNjYWxlIGJhclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oMTAsIDEwMCk7XG4gICAgICAgIGN0eC5saW5lVG8oMTAsIDEwMCArIDEwICogY29uZmlnLm1ldHJlKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiMTBtXCIsIDExLCAxMDAgKyAxMCAqIGNvbmZpZy5tZXRyZSAvIDIpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgLy8gRHJhdyBhbGwgbGluZXMgYW5kIG5vZGVzXG4gICAgICAgIHZhciBkcmF3biA9IFtdO1xuICAgICAgICBsZXQgZHJhd0xpbmUgPSAobm9kZSwgbm9kZXMsIGNvbm5lY3RlZE5vZGVJRCkgPT4ge1xuICAgICAgICAgICAgdmFyIG5vZGVzc3NzID0gdGhpcy5wcm9wcy5ub2Rlc1xuICAgICAgICAgICAgdmFyIG5ld25vZGVzc3NzcyA9IHRoaXMuc3RhdGUubmV3Tm9kZXNcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGlmIChub2RlLmZpeGVkKSB7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG5vZGUucG9zaXRpb24ueCAtIDIsIG5vZGUucG9zaXRpb24ueSAtIDIsIDUsIDUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3Qobm9kZS5wb3NpdGlvbi54IC0gMSwgbm9kZS5wb3NpdGlvbi55IC0gMSwgMywgMyk7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgaWYgKHNob3dJRHMpIHtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQobm9kZS5pZCwgbm9kZS5wb3NpdGlvbi54ICsgMSwgbm9kZS5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBkcmF3bi5pbmRleE9mKGNvbm5lY3RlZE5vZGVJRC50b1N0cmluZygpICsgbm9kZS5pZC50b1N0cmluZygpKSA8XG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0ZWROb2RlID0gaGVscGVyLmdldE5vZGUoY29ubmVjdGVkTm9kZUlELCBub2Rlcyk7XG4gICAgICAgICAgICAgICAgY3R4Lm1vdmVUbyhjb25uZWN0ZWROb2RlLnBvc2l0aW9uLngsIGNvbm5lY3RlZE5vZGUucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyhub2RlLnBvc2l0aW9uLngsIG5vZGUucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgZHJhd24ucHVzaChub2RlLmlkLnRvU3RyaW5nKCkgKyBjb25uZWN0ZWROb2RlLmlkLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIHZhciBmb3JjZSA9IGhlbHBlci5nZXRGb3JjZShub2RlLCBjb25uZWN0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGZvcmNlLnRvdGFsID49IGNvbmZpZy5kYW5nZXJGb3JjZU1pbiAmJlxuICAgICAgICAgICAgICAgICAgICBmb3JjZS50b3RhbCA8IGNvbmZpZy5kYW5nZXJGb3JjZU1heFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9ybUZvcmNlID1cbiAgICAgICAgICAgICAgICAgICAgICAgIChmb3JjZS50b3RhbCAtIGNvbmZpZy5kYW5nZXJGb3JjZU1pbikgL1xuICAgICAgICAgICAgICAgICAgICAgICAgKGNvbmZpZy5kYW5nZXJGb3JjZU1heCAtIGNvbmZpZy5kYW5nZXJGb3JjZU1pbik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2xvciA9IG5vcm1Gb3JjZSAqIDI1NTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoXCIgKyBjb2xvci50b0ZpeGVkKDApICsgXCIsIDAsIDApXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmb3JjZS50b3RhbCA+PSBjb25maWcuZGFuZ2VyRm9yY2VNYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoMjU1LCAwLCAwKVwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDAsMCwwKVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbm9kZXMuY29uY2F0KHRoaXMuc3RhdGUubmV3Tm9kZXMpLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGlmIChub2RlLmNvbm5lY3RlZE5vZGVzLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmZpeGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChub2RlLnBvc2l0aW9uLnggLSAyLCBub2RlLnBvc2l0aW9uLnkgLSAyLCA1LCA1KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3Qobm9kZS5wb3NpdGlvbi54IC0gMSwgbm9kZS5wb3NpdGlvbi55IC0gMSwgMywgMyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzaG93SURzKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChub2RlLmlkLCBub2RlLnBvc2l0aW9uLnggKyAxLCBub2RlLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlLmNvbm5lY3RlZE5vZGVzLmZvckVhY2goZHJhd0xpbmUuYmluZCh0aGlzLCBub2RlLCBub2Rlcy5jb25jYXQodGhpcy5zdGF0ZS5uZXdOb2RlcykpKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Y2FudmFzXG4gICAgICAgICAgICAgICAgcmVmPXtjYW52YXMgPT4gKHRoaXMuY2FudmFzID0gY2FudmFzKX1cbiAgICAgICAgICAgICAgICBpZD1cImNhbnZhc1wiXG4gICAgICAgICAgICAgICAgd2lkdGg9e3dpbmRvdy5pbm5lcldpZHRofVxuICAgICAgICAgICAgICAgIGhlaWdodD17d2luZG93LmlubmVySGVpZ2h0fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tIFwicHJlYWN0XCI7XG5pbXBvcnQgeyBDb250cm9sc0VudW0gfSBmcm9tIFwianMvc2hhcmVkL2NvbnN0YW50cy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250cm9scyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgb3B0aW9uc1Zpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgcGF1c2VkOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sc1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b25zIGhhcy1hZGRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BidXR0b24gaXMtc21hbGwgJHt0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRyb2xzRW51bS5wYW4gJiYgXCJpcy1wcmltYXJ5XCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoYW5nZUNvbnRyb2woQ29udHJvbHNFbnVtLnBhbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFyIGZhLWhhbmQtcGFwZXJcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BidXR0b24gaXMtc21hbGwgJHt0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRyb2xzRW51bS5ncmFiICYmIFwiaXMtcHJpbWFyeVwifWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VDb250cm9sKENvbnRyb2xzRW51bS5ncmFiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXIgZmEtaGFuZC1yb2NrXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPXtgYnV0dG9uIGlzLXNtYWxsICR7dGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb250cm9sc0VudW0uYW5jaG9yICYmIFwiaXMtcHJpbWFyeVwifWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VDb250cm9sKENvbnRyb2xzRW51bS5hbmNob3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhcyBmYS1wbHVzXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPXtgYnV0dG9uIGlzLXNtYWxsICR7dGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb250cm9sc0VudW0ucm9wZSAmJiBcImlzLXByaW1hcnlcIn1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2hhbmdlQ29udHJvbChDb250cm9sc0VudW0ucm9wZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLXBlbmNpbC1hbHRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BidXR0b24gaXMtc21hbGwgJHt0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRyb2xzRW51bS5lcmFzZSAmJiBcImlzLXByaW1hcnlcIn1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2hhbmdlQ29udHJvbChDb250cm9sc0VudW0uZXJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhcyBmYS1lcmFzZXJcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BidXR0b24gaXMtc21hbGxgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2hhbmdlU2NhbGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb25cIj4tPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbGB9IGRpc2FibGVkPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMuc2NhbGV9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbGB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VTY2FsZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uXCI+Kzwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPXtgYnV0dG9uIGlzLXNtYWxsICR7dGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb250cm9sc0VudW0ucGF1c2UgJiYgXCJpcy1wcmltYXJ5XCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZSh0aGlzLnN0YXRlLnBhdXNlZCA/IFwicnVuXCIgOiBcInBhdXNlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGF1c2VkOiAhdGhpcy5zdGF0ZS5wYXVzZWR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9e2BmYXMgJHsgdGhpcy5zdGF0ZS5wYXVzZWQgPyAnZmEtcGxheSc6J2ZhLXBhdXNlJ31gfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2Bkcm9wZG93biAke3RoaXMuc3RhdGUub3B0aW9uc1Zpc2libGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlzLWFjdGl2ZVwifWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRyb3Bkb3duLXRyaWdnZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYnV0dG9uIGlzLXNtYWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1Zpc2libGU6ICF0aGlzLnN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vcHRpb25zVmlzaWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb24gaXMtc21hbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLWNvZ1wiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj57XCIgXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvbiBpcy1zbWFsbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImZhcyBmYS1hbmdsZS1kb3duXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJkcm9wZG93bi1tZW51XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cImRyb3Bkb3duLW1lbnUyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwibWVudVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkcm9wZG93bi1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkcm9wZG93bi1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJjaGVja2JveFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBvbkNoYW5nZT17ZT0+dGhpcy5wcm9wcy5jaGFuZ2VPcHRpb24oJ3Nob3dJRHMnLCBlLnRhcmdldC5jaGVja2VkKX0vPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNob3cgSURzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJkcm9wZG93bi1pdGVtXCIgb25DbGljaz17dGhpcy5wcm9wcy5zYXZlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNhdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImRyb3Bkb3duLWl0ZW1cIiBvbkNsaWNrPXt0aGlzLnByb3BzLmxvYWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTG9hZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tIFwicHJlYWN0XCI7XG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcImpzL3NoYXJlZC9jb25maWdcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9hZE1vZGFsIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBsb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBsb2FkRGF0YTogJydcbiAgICAgICAgfTtcbiAgICB9XG4gICAgbG9hZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy53b3JrZXIucG9zdE1lc3NhZ2UoW1wibG9hZFwiLCB0aGlzLnN0YXRlLmxvYWREYXRhXSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGVkOiB0cnVlLFxuICAgICAgICAgICAgc3VjY2Vzczp0cnVlXG4gICAgICAgIH0pXG4gICAgfTtcbiAgICBzZXREYXRhID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bG9hZERhdGE6ZS50YXJnZXQudmFsdWV9KVxuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPXtgbW9kYWwgJHt0aGlzLnByb3BzLnZpc2libGUgJiYgXCJpcy1hY3RpdmVcIn1gfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtYmFja2dyb3VuZFwiIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNhcmRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cIm1vZGFsLWNhcmQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJtb2RhbC1jYXJkLXRpdGxlXCI+U2F2ZTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxldGVcIiBhcmlhLWxhYmVsPVwiY2xvc2VcIiBvbkNsaWNrPXt0aGlzLnByb3BzLmNsb3NlfS8+XG4gICAgICAgICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cIm1vZGFsLWNhcmQtYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUGFzdGUgeW91ciBjb2RlIGJlbG93IHRvIGxvYWQgdGhlIHNpbXVsYXRpb24gc3RhdGUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBoYXMtYWRkb25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB0aGlzLnNldERhdGEoZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLmxvYWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvbiBpcy1zbWFsbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhcyBmYS1kb3dubG9hZFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmxvYWRlZCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuc3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJMb2FkZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogXCJsb2FkIGZhaWxlZFwifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tIFwicHJlYWN0XCI7XG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcImpzL3NoYXJlZC9jb25maWdcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2F2ZU1vZGFsIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBjb3BpZWQ6IGZhbHNlLFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29weSA9ICgpID0+IHtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZSh0aGlzLmlucHV0KTtcbiAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHJhbmdlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBzdWNjZXNzZnVsID0gZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjb3B5XCIpO1xuICAgICAgICAgICAgdmFyIG1zZyA9IHN1Y2Nlc3NmdWwgPyBcInN1Y2Nlc3NmdWxcIiA6IFwidW5zdWNjZXNzZnVsXCI7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBjb3BpZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY29waWVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgfTtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPXtgbW9kYWwgJHt0aGlzLnByb3BzLnZpc2libGUgJiYgXCJpcy1hY3RpdmVcIn1gfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtYmFja2dyb3VuZFwiIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNhcmRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGhlYWRlciBjbGFzcz1cIm1vZGFsLWNhcmQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJtb2RhbC1jYXJkLXRpdGxlXCI+U2F2ZTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxldGVcIiBhcmlhLWxhYmVsPVwiY2xvc2VcIiBvbkNsaWNrPXt0aGlzLnByb3BzLmNsb3NlfS8+XG4gICAgICAgICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz1cIm1vZGFsLWNhcmQtYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29weSB0aGUgY29kZSBiZWxvdyB0byBzYXZlIHRoZSBjdXJyZW50IHN0YXRlIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBzaW11bGF0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGQgaGFzLWFkZG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXtpbnB1dCA9PiAodGhpcy5pbnB1dCA9IGlucHV0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy5zYXZlRGF0YX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMuY29weX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uIGlzLXNtYWxsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLWNvcHlcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5jb3BpZWQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLnN1Y2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiQ29waWVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiQ29weSBmYWlsZWRcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgaCwgQ29tcG9uZW50IH0gZnJvbSBcInByZWFjdFwiO1xuaW1wb3J0ICogYXMgY29uZmlnIGZyb20gXCJqcy9zaGFyZWQvY29uZmlnXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaW1TcGVlZHM6IG5ldyBBcnJheSgxMDApLmZpbGwoY29uZmlnLnNpbXVsYXRpb25TcGVlZCksXG4gICAgICAgICAgICBjYWxjdWxhdGVkU2ltU3BlZWQ6IGNvbmZpZy5zaW11bGF0aW9uU3BlZWRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzKSB7XG4gICAgICAgIGxldCBzaW1TcGVlZHMgPSB0aGlzLnN0YXRlLnNpbVNwZWVkcztcbiAgICAgICAgc2ltU3BlZWRzLnBvcCgpO1xuICAgICAgICBzaW1TcGVlZHMudW5zaGlmdChwcm9wcy50cnVlU2ltdWxhdGlvblNwZWVkKTtcbiAgICAgICAgbGV0IHN1bSA9IHNpbVNwZWVkcy5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgICAgICB9LCAwKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaW1TcGVlZHMsXG4gICAgICAgICAgICBjYWxjdWxhdGVkU2ltU3BlZWQ6IHN1bSAvIHNpbVNwZWVkcy5sZW5ndGhcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdGF0c1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuPnt0aGlzLnN0YXRlLmNhbGN1bGF0ZWRTaW1TcGVlZC50b0ZpeGVkKDIpfXg8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJjb25zdCBoZWxwZXIgPSByZXF1aXJlKCdqcy9zaGFyZWQvaGVscGVyJyk7XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCdqcy9zaGFyZWQvY29uZmlnJyk7XG5jb25zdCBWZWN0b3IgPSByZXF1aXJlKFwianMvc2hhcmVkL3ZlY3RvclwiKS5WZWN0b3I7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICB2YXIgYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpO1xuICAgIHZhciBjdHggPSBjLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICB2YXIgdHJ1ZVNpbXVsYXRpb25TcGVlZCA9IDA7XG5cbiAgICB2YXIgd29ya2VyID0gbmV3IFdvcmtlcihcIndvcmtlci5qc1wiKTtcbiAgICB3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEuZGF0YSlcbiAgICAgICAgbm9kZXMgPSBkYXRhLmRhdGEubm9kZXM7XG4gICAgICAgIHRydWVTaW11bGF0aW9uU3BlZWQgPSBkYXRhLmRhdGEudHJ1ZVNpbXVsYXRpb25TcGVlZDtcbiAgICAgICAgZHJhdygpO1xuICAgICAgICBjb21wdXRlKCk7XG4gICAgICAgIGNhbGNTaW1TcGVlZCgpO1xuICAgIH07XG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKFwiaW5pdFwiKTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB1c2VyUGF1c2UgPSBmYWxzZTtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFwicnVuXCIpO1xuICAgIH0pO1xuXG4gICAgdmFyIHVzZXJQYXVzZSA9IGZhbHNlO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHVzZXJQYXVzZSA9IHRydWU7XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcInBhdXNlXCIpO1xuICAgIH0pO1xuXG4gICAgdmFyIHNob3dJRHMgPSB0cnVlO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hvdy1pZHNcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaG93SURzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaG93LWlkc1wiKS5jaGVja2VkO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWQtZGF0YVwiKS52YWx1ZTtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFtcImxvYWRcIiwgZGF0YV0pO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzYXZlLWRhdGFcIikudmFsdWUgPSBidG9hKFxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkobm9kZXMpXG4gICAgICAgICk7XG4gICAgfSk7XG5cbiAgICB2YXIgc2VsZWN0ZWROb2RlOyBcbiAgICB2YXIgbW91c2VQb3NpdGlvbjtcbiAgICB2YXIgc3RhcnRDb29yZHM7XG4gICAgdmFyIGxhc3RDb29yZHMgPSB7eDowLHk6MH07XG4gICAgdmFyIHRyYW5zZm9ybWVkID0ge3g6MCx5OjB9O1xuICAgIGMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHtcbiAgICAgICAgdmFyIHJlY3QgPSBjLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB2YXIgbW91c2UgPSB7XG4gICAgICAgICAgeDogZS5jbGllbnRYIC0gcmVjdC5sZWZ0LFxuICAgICAgICAgIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wXG4gICAgICAgIH07XG4gICAgICAgIHZhciBtID0gbmV3IFZlY3Rvcihtb3VzZS54LCBtb3VzZS55KTtcbiAgICAgICAgdmFyIHRyYW5zZm9ybWVkViA9IG5ldyBWZWN0b3IoKS5sb2FkKHRyYW5zZm9ybWVkKTtcbiAgICAgICAgdmFyIG1pbiA9IDU7XG4gICAgICAgIHZhciBzZWxlY3RlZDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbm9kZXNbaV0ucG9zaXRpb24gPSBuZXcgVmVjdG9yKCkubG9hZChub2Rlc1tpXS5wb3NpdGlvbik7XG4gICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBub2Rlc1tpXS5wb3NpdGlvbi5zdWJ0cmFjdChtLnN1YnRyYWN0KHRyYW5zZm9ybWVkVikpLmxlbmd0aCgpO1xuICAgICAgICAgICAgaWYgKCFtaW4gfHwgZGlzdGFuY2UgPCBtaW4pIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgICAgIG1pbiA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1vdXNlUG9zaXRpb24gPSBtLnN1YnRyYWN0KHRyYW5zZm9ybWVkVik7XG4gICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICAgc2VsZWN0ZWROb2RlID0gc2VsZWN0ZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGFydENvb3JkcyA9IHt4OiBlLnBhZ2VYIC0gcmVjdC5sZWZ0IC0gbGFzdENvb3Jkcy54LCB5OiBlLnBhZ2VZIC0gcmVjdC50b3AgLSBsYXN0Q29vcmRzLnl9O1xuICAgICAgICAgICAgLy93b3JrZXIucG9zdE1lc3NhZ2UoW1wibmV3bm9kZVwiLCB7bW91c2VQb3NpdGlvbn1dKTtcbiAgICAgICAgfVxuICAgICAgfSwgdHJ1ZSk7XG4gICAgICBjLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICAgIGlmIChzZWxlY3RlZE5vZGUpIHtcbiAgICAgICAgICAgIHZhciByZWN0ID0gYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHZhciBtb3VzZSA9IHtcbiAgICAgICAgICAgICAgICB4OiBlLmNsaWVudFggLSByZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgeTogZS5jbGllbnRZIC0gcmVjdC50b3BcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtZWRWID0gbmV3IFZlY3RvcigpLmxvYWQodHJhbnNmb3JtZWQpO1xuICAgICAgICAgICAgbW91c2VQb3NpdGlvbiA9IG5ldyBWZWN0b3IobW91c2UueCwgbW91c2UueSkuc3VidHJhY3QodHJhbnNmb3JtZWRWKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydENvb3Jkcykge1xuICAgICAgICAgICAgdmFyIHJlY3QgPSBjLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdmFyIG1vdXNlID0ge1xuICAgICAgICAgICAgICAgIHg6IGUuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgICAgICAgICAgICB5OiBlLmNsaWVudFkgLSByZWN0LnRvcFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRyYW5zZm9ybWVkID0ge3g6ICBtb3VzZS54IC0gc3RhcnRDb29yZHMueCwgeTogbW91c2UueSAtIHN0YXJ0Q29vcmRzLnl9O1xuICAgICAgICAgICAgY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCB0cmFuc2Zvcm1lZC54LCB0cmFuc2Zvcm1lZC55KTtcbiAgICAgICAgfVxuICAgICAgfSwgdHJ1ZSk7XG4gICAgICBjLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZSkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2UoW1wibm9tb3ZlXCIsIHtzZWxlY3RlZE5vZGV9XSk7XG4gICAgICAgICAgICBzZWxlY3RlZE5vZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhcnRDb29yZHMpIHtcbiAgICAgICAgICAgIHZhciByZWN0ID0gYy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGxhc3RDb29yZHMgPSB7eDogZS5wYWdlWCAtIHJlY3QubGVmdCAtIHN0YXJ0Q29vcmRzLngsXG4gICAgICAgICAgICB5OiBlLnBhZ2VZIC0gcmVjdC50b3AgLSBzdGFydENvb3Jkcy55fTtcbiAgICAgICAgICAgIHN0YXJ0Q29vcmRzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9LCB0cnVlKTtcblxuICAgIHZhciBzaW1TcGVlZHMgPSBuZXcgQXJyYXkoMTAwKTtcbiAgICBzaW1TcGVlZHMuZmlsbChjb25maWcuc2ltdWxhdGlvblNwZWVkKTtcbiAgICBmdW5jdGlvbiBjYWxjU2ltU3BlZWQoKSB7XG4gICAgICAgIHNpbVNwZWVkcy5wb3AoKTtcbiAgICAgICAgc2ltU3BlZWRzLnVuc2hpZnQodHJ1ZVNpbXVsYXRpb25TcGVlZCk7XG4gICAgICAgIHZhciBzdW0gPSBzaW1TcGVlZHMucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhICsgYjtcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2ltc3BlZWRcIikuaW5uZXJUZXh0ID1cbiAgICAgICAgICAgIChzdW0gLyBzaW1TcGVlZHMubGVuZ3RoKS50b0ZpeGVkKDIpICsgXCJ4XCI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoMCwwLDApXCI7XG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCAtIHRyYW5zZm9ybWVkLngsIDAgLSB0cmFuc2Zvcm1lZC55LCBjLndpZHRoLCBjLmhlaWdodCk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDAsMCwwKVwiO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oMTAsIDUwKTtcbiAgICAgICAgY3R4LmxpbmVUbygxMCwgNTAgKyAxMCAqIGNvbmZpZy5tZXRyZSk7XG4gICAgICAgIGN0eC5maWxsVGV4dChcIjEwbVwiLCAxMSwgNTAgKyAxMCAqIGNvbmZpZy5tZXRyZSAvIDIpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIHZhciBkcmF3biA9IFtdO1xuICAgICAgICBmdW5jdGlvbiBkcmF3TGluZShub2RlLCBjb25uZWN0ZWROb2RlSUQpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdChub2RlLnBvc2l0aW9uLnggLSAxLCBub2RlLnBvc2l0aW9uLnkgLSAxLCAzLCAzKTtcbiAgICAgICAgICAgIGlmIChzaG93SURzKSB7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KG5vZGUuaWQsIG5vZGUucG9zaXRpb24ueCArIDEsIG5vZGUucG9zaXRpb24ueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgZHJhd24uaW5kZXhPZihjb25uZWN0ZWROb2RlSUQudG9TdHJpbmcoKSArIG5vZGUuaWQudG9TdHJpbmcoKSkgPFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGVkTm9kZSA9IGhlbHBlci5nZXROb2RlKGNvbm5lY3RlZE5vZGVJRCwgbm9kZXMpO1xuICAgICAgICAgICAgICAgIC8vdmFyIG1pZHBvaW50ID0gaGVscGVyLmdldE1pZHBvaW50KG5vZGUsIGNvbm5lY3RlZE5vZGUpO1xuICAgICAgICAgICAgICAgIC8vY3R4LmZpbGxUZXh0KFwieDogXCIgKyBub2RlLmZvcmNlLngudG9GaXhlZCgzKSArIFwiIHk6IFwiICsgbm9kZS5mb3JjZS55LnRvRml4ZWQoMykgLG1pZHBvaW50LngsbWlkcG9pbnQueSk7XG4gICAgICAgICAgICAgICAgY3R4Lm1vdmVUbyhjb25uZWN0ZWROb2RlLnBvc2l0aW9uLngsIGNvbm5lY3RlZE5vZGUucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyhub2RlLnBvc2l0aW9uLngsIG5vZGUucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgZHJhd24ucHVzaChub2RlLmlkLnRvU3RyaW5nKCkgKyBjb25uZWN0ZWROb2RlLmlkLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIHZhciBmb3JjZSA9IGhlbHBlci5nZXRGb3JjZShub2RlLCBjb25uZWN0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGZvcmNlLnRvdGFsID49IGNvbmZpZy5kYW5nZXJGb3JjZU1pbiAmJlxuICAgICAgICAgICAgICAgICAgICBmb3JjZS50b3RhbCA8IGNvbmZpZy5kYW5nZXJGb3JjZU1heFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBub3JtRm9yY2UgPVxuICAgICAgICAgICAgICAgICAgICAgICAgKGZvcmNlLnRvdGFsIC0gY29uZmlnLmRhbmdlckZvcmNlTWluKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICAoY29uZmlnLmRhbmdlckZvcmNlTWF4IC0gY29uZmlnLmRhbmdlckZvcmNlTWluKTtcbiAgICAgICAgICAgICAgICAgICAgY29sb3IgPSBub3JtRm9yY2UgKiAyNTU7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKFwiICsgY29sb3IudG9GaXhlZCgwKSArIFwiLCAwLCAwKVwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZm9yY2UudG90YWwgPj0gY29uZmlnLmRhbmdlckZvcmNlTWF4KSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDI1NSwgMCwgMClcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYigwLDAsMClcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuY29ubmVjdGVkTm9kZXMubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG5vZGUucG9zaXRpb24ueCAtIDEsIG5vZGUucG9zaXRpb24ueSAtIDEsIDMsIDMpO1xuICAgICAgICAgICAgICAgIGlmIChzaG93SURzKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChub2RlLmlkLCBub2RlLnBvc2l0aW9uLnggKyAxLCBub2RlLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlLmNvbm5lY3RlZE5vZGVzLmZvckVhY2goZHJhd0xpbmUuYmluZCh0aGlzLCBub2RlKSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvL2N0eC5zdHJva2UoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29tcHV0ZSgpIHtcbiAgICAgICAgdmFyIGNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBjb21wdXRlTm9kZShub2RlLCBjb25uZWN0ZWROb2RlSUQpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvXCIpLnZhbHVlKSA9PT1cbiAgICAgICAgICAgICAgICBjb25uZWN0ZWROb2RlSURcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIGNvbm5lY3RlZE5vZGUgPSBoZWxwZXIuZ2V0Tm9kZShjb25uZWN0ZWROb2RlSUQsIG5vZGVzKTtcbiAgICAgICAgICAgICAgICB2YXIgZm9yY2UgPSBoZWxwZXIuZ2V0Rm9yY2Uobm9kZSwgY29ubmVjdGVkTm9kZSk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRcIikuaW5uZXJUZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgZm9yY2UudG90YWwudG9GaXhlZCgzKSArIFwiTlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgaWYgKHBhcnNlSW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnJvbVwiKS52YWx1ZSkgPT09IG5vZGUuaWQpIHtcbiAgICAgICAgICAgICAgICBub2RlLmNvbm5lY3RlZE5vZGVzLmZvckVhY2goY29tcHV0ZU5vZGUuYmluZCh0aGlzLCBub2RlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWNvbm5lY3RlZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN1bHRcIikuaW5uZXJUZXh0ID0gXCJOb3QgY29ubmVjdGVkXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmcmFtZVN5bmNlcih0aW1lc3RhbXApIHtcbiAgICAgICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKFtcIm1vdmVcIiwge3NlbGVjdGVkTm9kZSwgbW91c2VQb3NpdGlvbn1dKVxuICAgICAgICB9XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcInNlbmRcIik7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVN5bmNlcik7XG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVN5bmNlcik7XG5cbiAgICB3b3JrZXIucG9zdE1lc3NhZ2UoXCJydW5cIik7XG59KTtcbiIsIi8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbihmdW5jdGlvbigpIHtcbiAgdmFyIFdlYlNvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQgfHwgd2luZG93Lk1veldlYlNvY2tldDtcbiAgdmFyIGJyID0gd2luZG93LmJydW5jaCA9ICh3aW5kb3cuYnJ1bmNoIHx8IHt9KTtcbiAgdmFyIGFyID0gYnJbJ2F1dG8tcmVsb2FkJ10gPSAoYnJbJ2F1dG8tcmVsb2FkJ10gfHwge30pO1xuICBpZiAoIVdlYlNvY2tldCB8fCBhci5kaXNhYmxlZCkgcmV0dXJuO1xuICBpZiAod2luZG93Ll9hcikgcmV0dXJuO1xuICB3aW5kb3cuX2FyID0gdHJ1ZTtcblxuICB2YXIgY2FjaGVCdXN0ZXIgPSBmdW5jdGlvbih1cmwpe1xuICAgIHZhciBkYXRlID0gTWF0aC5yb3VuZChEYXRlLm5vdygpIC8gMTAwMCkudG9TdHJpbmcoKTtcbiAgICB1cmwgPSB1cmwucmVwbGFjZSgvKFxcJnxcXFxcPyljYWNoZUJ1c3Rlcj1cXGQqLywgJycpO1xuICAgIHJldHVybiB1cmwgKyAodXJsLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArJ2NhY2hlQnVzdGVyPScgKyBkYXRlO1xuICB9O1xuXG4gIHZhciBicm93c2VyID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuICB2YXIgZm9yY2VSZXBhaW50ID0gYXIuZm9yY2VSZXBhaW50IHx8IGJyb3dzZXIuaW5kZXhPZignY2hyb21lJykgPiAtMTtcblxuICB2YXIgcmVsb2FkZXJzID0ge1xuICAgIHBhZ2U6IGZ1bmN0aW9uKCl7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKHRydWUpO1xuICAgIH0sXG5cbiAgICBzdHlsZXNoZWV0OiBmdW5jdGlvbigpe1xuICAgICAgW10uc2xpY2VcbiAgICAgICAgLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGlua1tyZWw9c3R5bGVzaGVldF0nKSlcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgdmFyIHZhbCA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLWF1dG9yZWxvYWQnKTtcbiAgICAgICAgICByZXR1cm4gbGluay5ocmVmICYmIHZhbCAhPSAnZmFsc2UnO1xuICAgICAgICB9KVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgbGluay5ocmVmID0gY2FjaGVCdXN0ZXIobGluay5ocmVmKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIC8vIEhhY2sgdG8gZm9yY2UgcGFnZSByZXBhaW50IGFmdGVyIDI1bXMuXG4gICAgICBpZiAoZm9yY2VSZXBhaW50KSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodDsgfSwgMjUpO1xuICAgIH0sXG5cbiAgICBqYXZhc2NyaXB0OiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHNjcmlwdHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdCcpKTtcbiAgICAgIHZhciB0ZXh0U2NyaXB0cyA9IHNjcmlwdHMubWFwKGZ1bmN0aW9uKHNjcmlwdCkgeyByZXR1cm4gc2NyaXB0LnRleHQgfSkuZmlsdGVyKGZ1bmN0aW9uKHRleHQpIHsgcmV0dXJuIHRleHQubGVuZ3RoID4gMCB9KTtcbiAgICAgIHZhciBzcmNTY3JpcHRzID0gc2NyaXB0cy5maWx0ZXIoZnVuY3Rpb24oc2NyaXB0KSB7IHJldHVybiBzY3JpcHQuc3JjIH0pO1xuXG4gICAgICB2YXIgbG9hZGVkID0gMDtcbiAgICAgIHZhciBhbGwgPSBzcmNTY3JpcHRzLmxlbmd0aDtcbiAgICAgIHZhciBvbkxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbG9hZGVkID0gbG9hZGVkICsgMTtcbiAgICAgICAgaWYgKGxvYWRlZCA9PT0gYWxsKSB7XG4gICAgICAgICAgdGV4dFNjcmlwdHMuZm9yRWFjaChmdW5jdGlvbihzY3JpcHQpIHsgZXZhbChzY3JpcHQpOyB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzcmNTY3JpcHRzXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKHNjcmlwdCkge1xuICAgICAgICAgIHZhciBzcmMgPSBzY3JpcHQuc3JjO1xuICAgICAgICAgIHNjcmlwdC5yZW1vdmUoKTtcbiAgICAgICAgICB2YXIgbmV3U2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgbmV3U2NyaXB0LnNyYyA9IGNhY2hlQnVzdGVyKHNyYyk7XG4gICAgICAgICAgbmV3U2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICAgICAgICBuZXdTY3JpcHQub25sb2FkID0gb25Mb2FkO1xuICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobmV3U2NyaXB0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9O1xuICB2YXIgcG9ydCA9IGFyLnBvcnQgfHwgOTQ4NTtcbiAgdmFyIGhvc3QgPSBici5zZXJ2ZXIgfHwgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lIHx8ICdsb2NhbGhvc3QnO1xuXG4gIHZhciBjb25uZWN0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgY29ubmVjdGlvbiA9IG5ldyBXZWJTb2NrZXQoJ3dzOi8vJyArIGhvc3QgKyAnOicgKyBwb3J0KTtcbiAgICBjb25uZWN0aW9uLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIGlmIChhci5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgdmFyIG1lc3NhZ2UgPSBldmVudC5kYXRhO1xuICAgICAgdmFyIHJlbG9hZGVyID0gcmVsb2FkZXJzW21lc3NhZ2VdIHx8IHJlbG9hZGVycy5wYWdlO1xuICAgICAgcmVsb2FkZXIoKTtcbiAgICB9O1xuICAgIGNvbm5lY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoY29ubmVjdGlvbi5yZWFkeVN0YXRlKSBjb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgfTtcbiAgICBjb25uZWN0aW9uLm9uY2xvc2UgPSBmdW5jdGlvbigpe1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoY29ubmVjdCwgMTAwMCk7XG4gICAgfTtcbiAgfTtcbiAgY29ubmVjdCgpO1xufSkoKTtcbi8qIGpzaGludCBpZ25vcmU6ZW5kICovXG4iXX0=