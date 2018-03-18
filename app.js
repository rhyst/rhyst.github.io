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

        _this.getMouseScreenPosition = function (mouseevent) {
            var rect = _this.canvas.getBoundingClientRect();
            var mouse = {
                x: mouseevent.clientX - rect.left,
                y: mouseevent.clientY - rect.top
            };
            return new _vector.Vector(mouse.x, mouse.y);
        };

        _this.getMouseCanvasPosition = function (mouseevent) {
            var m = _this.getMouseScreenPosition(mouseevent);
            return m.subtract(_this.state.transform.translate).divide(_this.props.scale);
        };

        _this.getNearestNode = function (position, radius, nodes) {
            var nearestNodes = _this.getNearestNodes(position, radius, nodes);
            return nearestNodes.length > 0 ? nearestNodes[0] : null;
        };

        _this.getNearestNodes = function (position, radius, nodes) {
            var nearby = [];
            nodes.forEach(function (node) {
                var nodePosition = new _vector.Vector().load(node.position);
                var distance = nodePosition.subtract(position).length();
                if (distance < radius) {
                    nearby.push({ node: node, distance: distance });
                }
            });
            return nearby.sort(function (a, b) {
                return a - b;
            }).map(function (n) {
                return n.node;
            });
        };

        _this.interact = function () {
            var c = _this.canvas;
            var nodes = _this.props.nodes;
            var ctx = _this.canvas.getContext("2d");
            c.addEventListener("mousedown", function (e) {
                var rect = c.getBoundingClientRect();
                var mousePosition = _this.state.mousePosition;
                _this.setState({ mousedown: true });
                switch (_this.props.selectedControl) {
                    case _constants.ControlsEnum.grab:
                        var selectedNode = _this.getNearestNode(mousePosition, 20, _this.props.nodes);
                        _this.setState({
                            selectedNode: selectedNode
                        });
                        break;
                    case _constants.ControlsEnum.pan:
                        _this.setState({
                            startCoords: _this.getMouseScreenPosition(e).subtract(_this.state.transform.translate)
                        });
                        break;
                    case _constants.ControlsEnum.anchor:
                        _this.props.worker.postMessage(["newanchor", { mousePosition: mousePosition }]);
                        break;
                    case _constants.ControlsEnum.erase:
                        var nearestNodes = _this.getNearestNodes(mousePosition, 5, _this.props.nodes);
                        nearestNodes.forEach(function (node) {
                            _this.props.worker.postMessage(["deletenode", { node: node }]);
                        });
                        break;
                    case _constants.ControlsEnum.rope:
                        var node = new _node.Node(mousePosition.x, mousePosition.y, 0, 0, 0, 0, false, [], _this.getUniqueID());
                        var nearestNode = _this.getNearestNode(mousePosition, 5, _this.props.nodes);
                        if (nearestNode) {
                            node.connectedNodes.push(nearestNode.id);
                            nearestNode.connectedNodes.push(node.id);
                        }
                        _this.setState({
                            startCoords: new _vector.Vector(node.position.x, node.position.y),
                            newNodes: [node]
                        });
                        break;
                }
            }, true);
            c.addEventListener("mousemove", function (e) {
                var mouse = _this.getMouseScreenPosition(e);
                var mousePosition = _this.getMouseCanvasPosition(e);
                _this.setState({
                    mousePosition: mousePosition
                });
                switch (_this.props.selectedControl) {
                    case _constants.ControlsEnum.grab:
                        // Only uses updated mousePosition
                        break;
                    case _constants.ControlsEnum.pan:
                        if (_this.state.mousedown) {
                            _this.setState({
                                transform: {
                                    translate: new _vector.Vector(mouse.x, mouse.y).subtract(_this.state.startCoords),
                                    scale: _this.state.transform.scale
                                }
                            });
                        }
                        break;
                    case _constants.ControlsEnum.erase:
                        if (_this.state.mousedown) {
                            var nearestNodes = _this.getNearestNodes(mousePosition, 5, _this.props.nodes);
                            nearestNodes.forEach(function (node) {
                                _this.props.worker.postMessage(["deletenode", { node: node }]);
                            });
                        }
                        break;
                    case _constants.ControlsEnum.rope:
                        if (_this.state.mousedown) {
                            var distance = _this.state.startCoords.subtract(mousePosition).length();
                            if (distance > config.nominalStringLength) {
                                var node = new _node.Node(mousePosition.x, mousePosition.y, 0, 0, 0, 0, false, [], _this.getUniqueID());
                                var newNodes = _this.state.newNodes;
                                var prevNode = newNodes[newNodes.length - 1];
                                prevNode.connectedNodes.push(node.id);
                                node.connectedNodes.push(prevNode.id);
                                newNodes.push(node);
                                _this.setState({
                                    newNodes: newNodes,
                                    startCoords: new _vector.Vector(mousePosition.x, mousePosition.y)
                                });
                            }
                        }
                        break;
                }
            }, true);
            c.addEventListener("mouseup", function (e) {
                var mousePosition = _this.state.mousePosition;
                _this.setState({ mousedown: false });
                switch (_this.props.selectedControl) {
                    case _constants.ControlsEnum.grab:
                        if (_this.state.selectedNode) {
                            _this.props.worker.postMessage(["nomove", { selectedNode: _this.state.selectedNode }]);
                        }
                        _this.setState({ selectedNode: null });
                        break;
                    case _constants.ControlsEnum.pan:
                        _this.setState({
                            startCoords: null
                        });
                        break;
                    case _constants.ControlsEnum.rope:
                        var node = _this.state.newNodes[_this.state.newNodes.length - 1];
                        var _nodes = _this.props.nodes;
                        var nearestNode = _this.getNearestNode(mousePosition, 5, _nodes);
                        if (nearestNode) {
                            node.connectedNodes.push(nearestNode.id);
                            _nodes = _this.props.nodes.map(function (n) {
                                if (n.id === nearestNode.id) {
                                    n.connectedNodes.push(node.id);
                                }
                                return n;
                            });
                        }
                        _this.props.worker.postMessage(["addnodes", { nodes: _this.state.newNodes }]);
                        _this.setState({
                            newNodes: [],
                            nodes: _nodes.concat(_this.state.newNodes)
                        });
                        break;
                }
            }, true);
            /*
            document.onkeypress = function(e) {
                e = e || window.event;
                console.log(e.keyCode);
            };*/
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
            //ctx.translate(this.canvas.width/2, this.canvas.height/2);
            ctx.setTransform(_this.props.scale, 0, 0, _this.props.scale, _this.state.transform.translate.x, _this.state.transform.translate.y);
            //ctx.translate(-this.canvas.width/2, -this.canvas.height/2);

            // Draw grid
            var gridSize = 10 * config.metre;
            var offsetx = _this.state.transform.translate.x / _this.props.scale % gridSize;
            var offsety = _this.state.transform.translate.y / _this.props.scale % gridSize;
            for (var x = 0 - 2 * gridSize; x < _this.canvas.width / _this.props.scale + gridSize; x = x + gridSize) {
                ctx.beginPath();
                ctx.strokeStyle = "#d0d0d0";
                ctx.moveTo(x - _this.state.transform.translate.x / _this.props.scale + offsetx, 0 - gridSize - _this.state.transform.translate.y / _this.props.scale + offsety);
                ctx.lineTo(x - _this.state.transform.translate.x / _this.props.scale + offsetx, _this.canvas.height / _this.props.scale - _this.state.transform.translate.y / _this.props.scale + offsety + gridSize);
                ctx.stroke();
            }
            for (var y = 0 - 2 * gridSize; y < _this.canvas.height / _this.props.scale + gridSize; y = y + gridSize) {
                ctx.beginPath();
                ctx.strokeStyle = "#d0d0d0";
                ctx.moveTo(0 - gridSize - _this.state.transform.translate.x / _this.props.scale + offsetx, y - _this.state.transform.translate.y / _this.props.scale + offsety);
                ctx.lineTo(_this.canvas.width / _this.props.scale - _this.state.transform.translate.x / _this.props.scale + offsetx + gridSize, y - _this.state.transform.translate.y / _this.props.scale + offsety);
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
                }
                if (showIDs) {
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
            mousePosition: new _vector.Vector(0, 0),
            startCoords: new _vector.Vector(0, 0),
            lastCoords: new _vector.Vector(0, 0),
            transform: {
                translate: new _vector.Vector(0, 0),
                scale: new _vector.Vector(0, 0)
            }
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

;require.alias("preact/dist/preact.js", "preact");require.register("___globals___", function(exports, require, module) {
  
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCJhcHAvanMvc2hhcmVkL2NvbmZpZy5qcyIsImFwcC9qcy9zaGFyZWQvY29uc3RhbnRzLmpzIiwiYXBwL2pzL3NoYXJlZC9oZWxwZXIuanMiLCJhcHAvanMvc2hhcmVkL25vZGUuanMiLCJhcHAvanMvc2hhcmVkL3ZlY3Rvci5qcyIsImFwcC9qcy9pbml0aWFsaXNlLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvQXBwLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvY2FudmFzL2NhbnZhcy5qcyIsImFwcC9qcy91aS9jb21wb25lbnRzL2NvbnRyb2xzL2NvbnRyb2xzLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvbG9hZC1tb2RhbC9sb2FkLW1vZGFsLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvc2F2ZS1tb2RhbC9zYXZlLW1vZGFsLmpzIiwiYXBwL2pzL3VpL2NvbXBvbmVudHMvc3RhdHMvc3RhdHMuanMiLCJub2RlX21vZHVsZXMvYXV0by1yZWxvYWQtYnJ1bmNoL3ZlbmRvci9hdXRvLXJlbG9hZC5qcyJdLCJuYW1lcyI6WyJtZXRyZSIsIm51bU9mTm9kZXMiLCJub21pbmFsU3RyaW5nTGVuZ3RoIiwic3ByaW5nQ29uc3RhbnQiLCJpbnRlcm5hbFZpc2NvdXNGcmljdGlvbkNvbnN0YW50IiwidmlzY291c0NvbnN0YW50Iiwic2ltdWxhdGlvblNwZWVkIiwibWF4U3RlcCIsImRhbmdlckZvcmNlTWF4IiwiZGFuZ2VyRm9yY2VNaW4iLCJyb3BlV2VpZ2h0UGVyTWV0cmUiLCJyb3BlV2VpZ2h0UGVyTm9kZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJDb250cm9sc0VudW0iLCJPYmplY3QiLCJmcmVlemUiLCJwYW4iLCJncmFiIiwiYW5jaG9yIiwiZXJhc2UiLCJyb3BlIiwicGF1c2UiLCJjb25maWciLCJyZXF1aXJlIiwiZ2V0Tm9kZSIsImlkIiwibm9kZXMiLCJmaW5kIiwibm9kZSIsImdldExlbmd0aCIsIm5vZGUxIiwibm9kZTIiLCJ4ZGlmZiIsIk1hdGgiLCJhYnMiLCJwb3NpdGlvbiIsIngiLCJ5ZGlmZiIsInkiLCJzcXJ0IiwiZ2V0TWlkcG9pbnQiLCJnZXRBbmdsZUZyb21Ib3Jpem9udGFsIiwiYXRhbjIiLCJnZXRGb3JjZSIsInN0cmluZ0xlbmd0aCIsImxlbmd0aERpZmZlcmVuY2UiLCJhbmdsZUZyb21Ib3Jpem9udGFsIiwieVNwcmluZ0ZvcmNlIiwic2luIiwieFNwcmluZ0ZvcmNlIiwiY29zIiwidG90YWxTcHJpbmdGb3JjZSIsInRvdGFsIiwiVmVjdG9yIiwidW5pcXVlaWQiLCJnZXRJRCIsIk5vZGUiLCJ2eCIsInZ5IiwiZngiLCJmeSIsImZpeGVkIiwiY29ubmVjdGVkTm9kZXMiLCJ2ZWxvY2l0eSIsImZvcmNlIiwibm9kZU9iamVjdCIsInoiLCJwcm90b3R5cGUiLCJsb2FkIiwidmVjdG9yIiwibmVnYXRpdmUiLCJhZGQiLCJ2Iiwic3VidHJhY3QiLCJtdWx0aXBseSIsImRpdmlkZSIsImVxdWFscyIsImRvdCIsImNyb3NzIiwibGVuZ3RoIiwidW5pdCIsIm1pbiIsIm1heCIsInRvQW5nbGVzIiwidGhldGEiLCJwaGkiLCJhc2luIiwiYW5nbGVUbyIsImEiLCJhY29zIiwidG9BcnJheSIsIm4iLCJzbGljZSIsImNsb25lIiwiaW5pdCIsImIiLCJjIiwiZnJvbUFuZ2xlcyIsInJhbmRvbURpcmVjdGlvbiIsInJhbmRvbSIsIlBJIiwibGVycCIsImZyYWN0aW9uIiwiZnJvbUFycmF5IiwiYW5nbGVCZXR3ZWVuIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwicXVlcnlTZWxlY3RvciIsIkFwcCIsInByb3BzIiwib25GcmFtZSIsInN0YXRlIiwid29ya2VyIiwicG9zdE1lc3NhZ2UiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJoYW5kbGVXb3JrZXIiLCJzZXRTdGF0ZSIsImRhdGEiLCJ0cnVlU2ltdWxhdGlvblNwZWVkIiwiY2hhbmdlQ29udHJvbCIsInNlbGVjdGVkQ29udHJvbCIsImNvbnRyb2wiLCJjaGFuZ2VTY2FsZSIsInNjYWxlIiwicG9zaXRpdmUiLCJyb3VuZCIsImNoYW5nZU9wdGlvbiIsImtleSIsInZhbHVlIiwib3B0aW9ucyIsInNhdmUiLCJzYXZlRGF0YSIsImJ0b2EiLCJKU09OIiwic3RyaW5naWZ5Iiwic2F2ZU1vZGFsVmlzaWJsZSIsIldvcmtlciIsIm9ubWVzc2FnZSIsInNob3dJRHMiLCJsb2FkTW9kYWxWaXNpYmxlIiwiaGVscGVyIiwiQ2FudmFzIiwiZ2V0VW5pcXVlSUQiLCJpIiwibm90dW5pcXVlIiwibmV3Tm9kZXMiLCJnZXRNb3VzZVNjcmVlblBvc2l0aW9uIiwicmVjdCIsImNhbnZhcyIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIm1vdXNlIiwibW91c2VldmVudCIsImNsaWVudFgiLCJsZWZ0IiwiY2xpZW50WSIsInRvcCIsImdldE1vdXNlQ2FudmFzUG9zaXRpb24iLCJtIiwidHJhbnNmb3JtIiwidHJhbnNsYXRlIiwiZ2V0TmVhcmVzdE5vZGUiLCJyYWRpdXMiLCJuZWFyZXN0Tm9kZXMiLCJnZXROZWFyZXN0Tm9kZXMiLCJuZWFyYnkiLCJmb3JFYWNoIiwibm9kZVBvc2l0aW9uIiwiZGlzdGFuY2UiLCJwdXNoIiwic29ydCIsIm1hcCIsImludGVyYWN0IiwiY3R4IiwiZ2V0Q29udGV4dCIsIm1vdXNlUG9zaXRpb24iLCJtb3VzZWRvd24iLCJzZWxlY3RlZE5vZGUiLCJzdGFydENvb3JkcyIsImUiLCJuZWFyZXN0Tm9kZSIsInByZXZOb2RlIiwiY29uY2F0IiwiZHJhdyIsInN0cm9rZVN0eWxlIiwic2V0VHJhbnNmb3JtIiwiY2xlYXJSZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJyZXN0b3JlIiwiZ3JpZFNpemUiLCJvZmZzZXR4Iiwib2Zmc2V0eSIsImJlZ2luUGF0aCIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsImFyYyIsImZpbGxUZXh0IiwiZHJhd24iLCJkcmF3TGluZSIsImNvbm5lY3RlZE5vZGVJRCIsIm5vZGVzc3NzIiwibmV3bm9kZXNzc3NzIiwiZmlsbFJlY3QiLCJpbmRleE9mIiwidG9TdHJpbmciLCJjb25uZWN0ZWROb2RlIiwibm9ybUZvcmNlIiwiY29sb3IiLCJ0b0ZpeGVkIiwiYmluZCIsImxhc3RDb29yZHMiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJDb250cm9scyIsIm9wdGlvbnNWaXNpYmxlIiwicGF1c2VkIiwidGFyZ2V0IiwiY2hlY2tlZCIsIkxvYWRNb2RhbCIsImxvYWREYXRhIiwibG9hZGVkIiwic3VjY2VzcyIsInNldERhdGEiLCJ2aXNpYmxlIiwiY2xvc2UiLCJTYXZlTW9kYWwiLCJjb3B5IiwicmFuZ2UiLCJjcmVhdGVSYW5nZSIsInNlbGVjdE5vZGUiLCJpbnB1dCIsImdldFNlbGVjdGlvbiIsImFkZFJhbmdlIiwic3VjY2Vzc2Z1bCIsImV4ZWNDb21tYW5kIiwibXNnIiwiY29waWVkIiwiZXJyIiwicmVtb3ZlQWxsUmFuZ2VzIiwiU3RhdHMiLCJzaW1TcGVlZHMiLCJBcnJheSIsImZpbGwiLCJjYWxjdWxhdGVkU2ltU3BlZWQiLCJwb3AiLCJ1bnNoaWZ0Iiwic3VtIiwicmVkdWNlIiwiV2ViU29ja2V0IiwiTW96V2ViU29ja2V0IiwiYnIiLCJicnVuY2giLCJhciIsImRpc2FibGVkIiwiX2FyIiwiY2FjaGVCdXN0ZXIiLCJ1cmwiLCJkYXRlIiwiRGF0ZSIsIm5vdyIsInJlcGxhY2UiLCJicm93c2VyIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwidG9Mb3dlckNhc2UiLCJmb3JjZVJlcGFpbnQiLCJyZWxvYWRlcnMiLCJwYWdlIiwibG9jYXRpb24iLCJyZWxvYWQiLCJzdHlsZXNoZWV0IiwiY2FsbCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmaWx0ZXIiLCJsaW5rIiwidmFsIiwiZ2V0QXR0cmlidXRlIiwiaHJlZiIsInNldFRpbWVvdXQiLCJib2R5Iiwib2Zmc2V0SGVpZ2h0IiwiamF2YXNjcmlwdCIsInNjcmlwdHMiLCJ0ZXh0U2NyaXB0cyIsInNjcmlwdCIsInRleHQiLCJzcmNTY3JpcHRzIiwic3JjIiwiYWxsIiwib25Mb2FkIiwiZXZhbCIsInJlbW92ZSIsIm5ld1NjcmlwdCIsImNyZWF0ZUVsZW1lbnQiLCJhc3luYyIsIm9ubG9hZCIsImhlYWQiLCJhcHBlbmRDaGlsZCIsInBvcnQiLCJob3N0Iiwic2VydmVyIiwiaG9zdG5hbWUiLCJjb25uZWN0IiwiY29ubmVjdGlvbiIsImV2ZW50IiwibWVzc2FnZSIsInJlbG9hZGVyIiwib25lcnJvciIsInJlYWR5U3RhdGUiLCJvbmNsb3NlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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V0ssVUFBZixFQUEyQkwsV0FBVy9FLEtBQVg7QUFDNUIsS0FGRDtBQUdBK0UsZUFBV00sT0FBWCxHQUFxQixZQUFVO0FBQzdCbkcsYUFBT29FLFVBQVAsQ0FBa0J3QixPQUFsQixFQUEyQixJQUEzQjtBQUNELEtBRkQ7QUFHRCxHQWREO0FBZUFBO0FBQ0QsQ0FsRkQ7QUFtRkEiLCJmaWxlIjoicHVibGljL2FwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxucmVxdWlyZS5yZWdpc3RlcihcInByZWFjdC9kaXN0L3ByZWFjdC5qc1wiLCBmdW5jdGlvbihleHBvcnRzLCByZXF1aXJlLCBtb2R1bGUpIHtcbiAgcmVxdWlyZSA9IF9fbWFrZVJlbGF0aXZlUmVxdWlyZShyZXF1aXJlLCB7fSwgXCJwcmVhY3RcIik7XG4gIChmdW5jdGlvbigpIHtcbiAgICAhZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGZ1bmN0aW9uIFZOb2RlKCkge31cbiAgICBmdW5jdGlvbiBoKG5vZGVOYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHZhciBsYXN0U2ltcGxlLCBjaGlsZCwgc2ltcGxlLCBpLCBjaGlsZHJlbiA9IEVNUFRZX0NISUxEUkVOO1xuICAgICAgICBmb3IgKGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpLS0gPiAyOyApIHN0YWNrLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMgJiYgbnVsbCAhPSBhdHRyaWJ1dGVzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoIXN0YWNrLmxlbmd0aCkgc3RhY2sucHVzaChhdHRyaWJ1dGVzLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLmNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIGlmICgoY2hpbGQgPSBzdGFjay5wb3AoKSkgJiYgdm9pZCAwICE9PSBjaGlsZC5wb3ApIGZvciAoaSA9IGNoaWxkLmxlbmd0aDsgaS0tOyApIHN0YWNrLnB1c2goY2hpbGRbaV0pOyBlbHNlIHtcbiAgICAgICAgICAgIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIGNoaWxkKSBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoc2ltcGxlID0gJ2Z1bmN0aW9uJyAhPSB0eXBlb2Ygbm9kZU5hbWUpIGlmIChudWxsID09IGNoaWxkKSBjaGlsZCA9ICcnOyBlbHNlIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgY2hpbGQpIGNoaWxkID0gU3RyaW5nKGNoaWxkKTsgZWxzZSBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIGNoaWxkKSBzaW1wbGUgPSAhMTtcbiAgICAgICAgICAgIGlmIChzaW1wbGUgJiYgbGFzdFNpbXBsZSkgY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0gMV0gKz0gY2hpbGQ7IGVsc2UgaWYgKGNoaWxkcmVuID09PSBFTVBUWV9DSElMRFJFTikgY2hpbGRyZW4gPSBbIGNoaWxkIF07IGVsc2UgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgICAgICBsYXN0U2ltcGxlID0gc2ltcGxlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwID0gbmV3IFZOb2RlKCk7XG4gICAgICAgIHAubm9kZU5hbWUgPSBub2RlTmFtZTtcbiAgICAgICAgcC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICBwLmF0dHJpYnV0ZXMgPSBudWxsID09IGF0dHJpYnV0ZXMgPyB2b2lkIDAgOiBhdHRyaWJ1dGVzO1xuICAgICAgICBwLmtleSA9IG51bGwgPT0gYXR0cmlidXRlcyA/IHZvaWQgMCA6IGF0dHJpYnV0ZXMua2V5O1xuICAgICAgICBpZiAodm9pZCAwICE9PSBvcHRpb25zLnZub2RlKSBvcHRpb25zLnZub2RlKHApO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZXh0ZW5kKG9iaiwgcHJvcHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwcm9wcykgb2JqW2ldID0gcHJvcHNbaV07XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNsb25lRWxlbWVudCh2bm9kZSwgcHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIGgodm5vZGUubm9kZU5hbWUsIGV4dGVuZChleHRlbmQoe30sIHZub2RlLmF0dHJpYnV0ZXMpLCBwcm9wcyksIGFyZ3VtZW50cy5sZW5ndGggPiAyID8gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogdm5vZGUuY2hpbGRyZW4pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2QgJiYgKGNvbXBvbmVudC5fX2QgPSAhMCkgJiYgMSA9PSBpdGVtcy5wdXNoKGNvbXBvbmVudCkpIChvcHRpb25zLmRlYm91bmNlUmVuZGVyaW5nIHx8IGRlZmVyKShyZXJlbmRlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcmVuZGVyKCkge1xuICAgICAgICB2YXIgcCwgbGlzdCA9IGl0ZW1zO1xuICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICB3aGlsZSAocCA9IGxpc3QucG9wKCkpIGlmIChwLl9fZCkgcmVuZGVyQ29tcG9uZW50KHApO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1NhbWVOb2RlVHlwZShub2RlLCB2bm9kZSwgaHlkcmF0aW5nKSB7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUgfHwgJ251bWJlcicgPT0gdHlwZW9mIHZub2RlKSByZXR1cm4gdm9pZCAwICE9PSBub2RlLnNwbGl0VGV4dDtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZS5ub2RlTmFtZSkgcmV0dXJuICFub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciAmJiBpc05hbWVkTm9kZShub2RlLCB2bm9kZS5ub2RlTmFtZSk7IGVsc2UgcmV0dXJuIGh5ZHJhdGluZyB8fCBub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzTmFtZWROb2RlKG5vZGUsIG5vZGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBub2RlLl9fbiA9PT0gbm9kZU5hbWUgfHwgbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROb2RlUHJvcHModm5vZGUpIHtcbiAgICAgICAgdmFyIHByb3BzID0gZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKTtcbiAgICAgICAgcHJvcHMuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGRlZmF1bHRQcm9wcyA9IHZub2RlLm5vZGVOYW1lLmRlZmF1bHRQcm9wcztcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gZGVmYXVsdFByb3BzKSBmb3IgKHZhciBpIGluIGRlZmF1bHRQcm9wcykgaWYgKHZvaWQgMCA9PT0gcHJvcHNbaV0pIHByb3BzW2ldID0gZGVmYXVsdFByb3BzW2ldO1xuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZU5vZGUobm9kZU5hbWUsIGlzU3ZnKSB7XG4gICAgICAgIHZhciBub2RlID0gaXNTdmcgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbm9kZU5hbWUpIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlTmFtZSk7XG4gICAgICAgIG5vZGUuX19uID0gbm9kZU5hbWU7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgICAgdmFyIHBhcmVudE5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIGlmIChwYXJlbnROb2RlKSBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRBY2Nlc3Nvcihub2RlLCBuYW1lLCBvbGQsIHZhbHVlLCBpc1N2Zykge1xuICAgICAgICBpZiAoJ2NsYXNzTmFtZScgPT09IG5hbWUpIG5hbWUgPSAnY2xhc3MnO1xuICAgICAgICBpZiAoJ2tleScgPT09IG5hbWUpIDsgZWxzZSBpZiAoJ3JlZicgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmIChvbGQpIG9sZChudWxsKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgdmFsdWUobm9kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoJ2NsYXNzJyA9PT0gbmFtZSAmJiAhaXNTdmcpIG5vZGUuY2xhc3NOYW1lID0gdmFsdWUgfHwgJyc7IGVsc2UgaWYgKCdzdHlsZScgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgJ3N0cmluZycgPT0gdHlwZW9mIHZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiBvbGQpIG5vZGUuc3R5bGUuY3NzVGV4dCA9IHZhbHVlIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmICdvYmplY3QnID09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICgnc3RyaW5nJyAhPSB0eXBlb2Ygb2xkKSBmb3IgKHZhciBpIGluIG9sZCkgaWYgKCEoaSBpbiB2YWx1ZSkpIG5vZGUuc3R5bGVbaV0gPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSBub2RlLnN0eWxlW2ldID0gJ251bWJlcicgPT0gdHlwZW9mIHZhbHVlW2ldICYmICExID09PSBJU19OT05fRElNRU5TSU9OQUwudGVzdChpKSA/IHZhbHVlW2ldICsgJ3B4JyA6IHZhbHVlW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCdkYW5nZXJvdXNseVNldElubmVySFRNTCcgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgbm9kZS5pbm5lckhUTUwgPSB2YWx1ZS5fX2h0bWwgfHwgJyc7XG4gICAgICAgIH0gZWxzZSBpZiAoJ28nID09IG5hbWVbMF0gJiYgJ24nID09IG5hbWVbMV0pIHtcbiAgICAgICAgICAgIHZhciB1c2VDYXB0dXJlID0gbmFtZSAhPT0gKG5hbWUgPSBuYW1lLnJlcGxhY2UoL0NhcHR1cmUkLywgJycpKTtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvbGQpIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBldmVudFByb3h5LCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIH0gZWxzZSBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICAobm9kZS5fX2wgfHwgKG5vZGUuX19sID0ge30pKVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKCdsaXN0JyAhPT0gbmFtZSAmJiAndHlwZScgIT09IG5hbWUgJiYgIWlzU3ZnICYmIG5hbWUgaW4gbm9kZSkge1xuICAgICAgICAgICAgc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgbnVsbCA9PSB2YWx1ZSA/ICcnIDogdmFsdWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUgfHwgITEgPT09IHZhbHVlKSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBucyA9IGlzU3ZnICYmIG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9eeGxpbmtcXDo/LywgJycpKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlIHx8ICExID09PSB2YWx1ZSkgaWYgKG5zKSBub2RlLnJlbW92ZUF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgbmFtZS50b0xvd2VyQ2FzZSgpKTsgZWxzZSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTsgZWxzZSBpZiAoJ2Z1bmN0aW9uJyAhPSB0eXBlb2YgdmFsdWUpIGlmIChucykgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSwgdmFsdWUpOyBlbHNlIG5vZGUuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRQcm9wZXJ0eShub2RlLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbm9kZVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgICBmdW5jdGlvbiBldmVudFByb3h5KGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19sW2UudHlwZV0ob3B0aW9ucy5ldmVudCAmJiBvcHRpb25zLmV2ZW50KGUpIHx8IGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmbHVzaE1vdW50cygpIHtcbiAgICAgICAgdmFyIGM7XG4gICAgICAgIHdoaWxlIChjID0gbW91bnRzLnBvcCgpKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hZnRlck1vdW50KSBvcHRpb25zLmFmdGVyTW91bnQoYyk7XG4gICAgICAgICAgICBpZiAoYy5jb21wb25lbnREaWRNb3VudCkgYy5jb21wb25lbnREaWRNb3VudCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIHBhcmVudCwgY29tcG9uZW50Um9vdCkge1xuICAgICAgICBpZiAoIWRpZmZMZXZlbCsrKSB7XG4gICAgICAgICAgICBpc1N2Z01vZGUgPSBudWxsICE9IHBhcmVudCAmJiB2b2lkIDAgIT09IHBhcmVudC5vd25lclNWR0VsZW1lbnQ7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSBudWxsICE9IGRvbSAmJiAhKCdfX3ByZWFjdGF0dHJfJyBpbiBkb20pO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXQgPSBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCk7XG4gICAgICAgIGlmIChwYXJlbnQgJiYgcmV0LnBhcmVudE5vZGUgIT09IHBhcmVudCkgcGFyZW50LmFwcGVuZENoaWxkKHJldCk7XG4gICAgICAgIGlmICghLS1kaWZmTGV2ZWwpIHtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9ICExO1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnRSb290KSBmbHVzaE1vdW50cygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBjb21wb25lbnRSb290KSB7XG4gICAgICAgIHZhciBvdXQgPSBkb20sIHByZXZTdmdNb2RlID0gaXNTdmdNb2RlO1xuICAgICAgICBpZiAobnVsbCA9PSB2bm9kZSB8fCAnYm9vbGVhbicgPT0gdHlwZW9mIHZub2RlKSB2bm9kZSA9ICcnO1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlIHx8ICdudW1iZXInID09IHR5cGVvZiB2bm9kZSkge1xuICAgICAgICAgICAgaWYgKGRvbSAmJiB2b2lkIDAgIT09IGRvbS5zcGxpdFRleHQgJiYgZG9tLnBhcmVudE5vZGUgJiYgKCFkb20uX2NvbXBvbmVudCB8fCBjb21wb25lbnRSb290KSkge1xuICAgICAgICAgICAgICAgIGlmIChkb20ubm9kZVZhbHVlICE9IHZub2RlKSBkb20ubm9kZVZhbHVlID0gdm5vZGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoZG9tLCAhMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0Ll9fcHJlYWN0YXR0cl8gPSAhMDtcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZub2RlTmFtZSA9IHZub2RlLm5vZGVOYW1lO1xuICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygdm5vZGVOYW1lKSByZXR1cm4gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICBpc1N2Z01vZGUgPSAnc3ZnJyA9PT0gdm5vZGVOYW1lID8gITAgOiAnZm9yZWlnbk9iamVjdCcgPT09IHZub2RlTmFtZSA/ICExIDogaXNTdmdNb2RlO1xuICAgICAgICB2bm9kZU5hbWUgPSBTdHJpbmcodm5vZGVOYW1lKTtcbiAgICAgICAgaWYgKCFkb20gfHwgIWlzTmFtZWROb2RlKGRvbSwgdm5vZGVOYW1lKSkge1xuICAgICAgICAgICAgb3V0ID0gY3JlYXRlTm9kZSh2bm9kZU5hbWUsIGlzU3ZnTW9kZSk7XG4gICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRvbS5maXJzdENoaWxkKSBvdXQuYXBwZW5kQ2hpbGQoZG9tLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShkb20sICEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZmMgPSBvdXQuZmlyc3RDaGlsZCwgcHJvcHMgPSBvdXQuX19wcmVhY3RhdHRyXywgdmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChudWxsID09IHByb3BzKSB7XG4gICAgICAgICAgICBwcm9wcyA9IG91dC5fX3ByZWFjdGF0dHJfID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBhID0gb3V0LmF0dHJpYnV0ZXMsIGkgPSBhLmxlbmd0aDsgaS0tOyApIHByb3BzW2FbaV0ubmFtZV0gPSBhW2ldLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaHlkcmF0aW5nICYmIHZjaGlsZHJlbiAmJiAxID09PSB2Y2hpbGRyZW4ubGVuZ3RoICYmICdzdHJpbmcnID09IHR5cGVvZiB2Y2hpbGRyZW5bMF0gJiYgbnVsbCAhPSBmYyAmJiB2b2lkIDAgIT09IGZjLnNwbGl0VGV4dCAmJiBudWxsID09IGZjLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICBpZiAoZmMubm9kZVZhbHVlICE9IHZjaGlsZHJlblswXSkgZmMubm9kZVZhbHVlID0gdmNoaWxkcmVuWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKHZjaGlsZHJlbiAmJiB2Y2hpbGRyZW4ubGVuZ3RoIHx8IG51bGwgIT0gZmMpIGlubmVyRGlmZk5vZGUob3V0LCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBoeWRyYXRpbmcgfHwgbnVsbCAhPSBwcm9wcy5kYW5nZXJvdXNseVNldElubmVySFRNTCk7XG4gICAgICAgIGRpZmZBdHRyaWJ1dGVzKG91dCwgdm5vZGUuYXR0cmlidXRlcywgcHJvcHMpO1xuICAgICAgICBpc1N2Z01vZGUgPSBwcmV2U3ZnTW9kZTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5uZXJEaWZmTm9kZShkb20sIHZjaGlsZHJlbiwgY29udGV4dCwgbW91bnRBbGwsIGlzSHlkcmF0aW5nKSB7XG4gICAgICAgIHZhciBqLCBjLCBmLCB2Y2hpbGQsIGNoaWxkLCBvcmlnaW5hbENoaWxkcmVuID0gZG9tLmNoaWxkTm9kZXMsIGNoaWxkcmVuID0gW10sIGtleWVkID0ge30sIGtleWVkTGVuID0gMCwgbWluID0gMCwgbGVuID0gb3JpZ2luYWxDaGlsZHJlbi5sZW5ndGgsIGNoaWxkcmVuTGVuID0gMCwgdmxlbiA9IHZjaGlsZHJlbiA/IHZjaGlsZHJlbi5sZW5ndGggOiAwO1xuICAgICAgICBpZiAoMCAhPT0gbGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2NoaWxkID0gb3JpZ2luYWxDaGlsZHJlbltpXSwgcHJvcHMgPSBfY2hpbGQuX19wcmVhY3RhdHRyXywga2V5ID0gdmxlbiAmJiBwcm9wcyA/IF9jaGlsZC5fY29tcG9uZW50ID8gX2NoaWxkLl9jb21wb25lbnQuX19rIDogcHJvcHMua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGtleWVkTGVuKys7XG4gICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IF9jaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcHMgfHwgKHZvaWQgMCAhPT0gX2NoaWxkLnNwbGl0VGV4dCA/IGlzSHlkcmF0aW5nID8gX2NoaWxkLm5vZGVWYWx1ZS50cmltKCkgOiAhMCA6IGlzSHlkcmF0aW5nKSkgY2hpbGRyZW5bY2hpbGRyZW5MZW4rK10gPSBfY2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKDAgIT09IHZsZW4pIGZvciAodmFyIGkgPSAwOyBpIDwgdmxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2Y2hpbGQgPSB2Y2hpbGRyZW5baV07XG4gICAgICAgICAgICBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICB2YXIga2V5ID0gdmNoaWxkLmtleTtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXllZExlbiAmJiB2b2lkIDAgIT09IGtleWVkW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSBrZXllZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICBrZXllZFtrZXldID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICBrZXllZExlbi0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoaWxkICYmIG1pbiA8IGNoaWxkcmVuTGVuKSBmb3IgKGogPSBtaW47IGogPCBjaGlsZHJlbkxlbjsgaisrKSBpZiAodm9pZCAwICE9PSBjaGlsZHJlbltqXSAmJiBpc1NhbWVOb2RlVHlwZShjID0gY2hpbGRyZW5bal0sIHZjaGlsZCwgaXNIeWRyYXRpbmcpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQgPSBjO1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2pdID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSBjaGlsZHJlbkxlbiAtIDEpIGNoaWxkcmVuTGVuLS07XG4gICAgICAgICAgICAgICAgaWYgKGogPT09IG1pbikgbWluKys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZCA9IGlkaWZmKGNoaWxkLCB2Y2hpbGQsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGYgPSBvcmlnaW5hbENoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKGNoaWxkICYmIGNoaWxkICE9PSBkb20gJiYgY2hpbGQgIT09IGYpIGlmIChudWxsID09IGYpIGRvbS5hcHBlbmRDaGlsZChjaGlsZCk7IGVsc2UgaWYgKGNoaWxkID09PSBmLm5leHRTaWJsaW5nKSByZW1vdmVOb2RlKGYpOyBlbHNlIGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIGYpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXllZExlbikgZm9yICh2YXIgaSBpbiBrZXllZCkgaWYgKHZvaWQgMCAhPT0ga2V5ZWRbaV0pIHJlY29sbGVjdE5vZGVUcmVlKGtleWVkW2ldLCAhMSk7XG4gICAgICAgIHdoaWxlIChtaW4gPD0gY2hpbGRyZW5MZW4pIGlmICh2b2lkIDAgIT09IChjaGlsZCA9IGNoaWxkcmVuW2NoaWxkcmVuTGVuLS1dKSkgcmVjb2xsZWN0Tm9kZVRyZWUoY2hpbGQsICExKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVjb2xsZWN0Tm9kZVRyZWUobm9kZSwgdW5tb3VudE9ubHkpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IG5vZGUuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGNvbXBvbmVudCkgdW5tb3VudENvbXBvbmVudChjb21wb25lbnQpOyBlbHNlIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IG5vZGUuX19wcmVhY3RhdHRyXyAmJiBub2RlLl9fcHJlYWN0YXR0cl8ucmVmKSBub2RlLl9fcHJlYWN0YXR0cl8ucmVmKG51bGwpO1xuICAgICAgICAgICAgaWYgKCExID09PSB1bm1vdW50T25seSB8fCBudWxsID09IG5vZGUuX19wcmVhY3RhdHRyXykgcmVtb3ZlTm9kZShub2RlKTtcbiAgICAgICAgICAgIHJlbW92ZUNoaWxkcmVuKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuKG5vZGUpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUubGFzdENoaWxkO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBub2RlLnByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsICEwKTtcbiAgICAgICAgICAgIG5vZGUgPSBuZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmZBdHRyaWJ1dGVzKGRvbSwgYXR0cnMsIG9sZCkge1xuICAgICAgICB2YXIgbmFtZTtcbiAgICAgICAgZm9yIChuYW1lIGluIG9sZCkgaWYgKCghYXR0cnMgfHwgbnVsbCA9PSBhdHRyc1tuYW1lXSkgJiYgbnVsbCAhPSBvbGRbbmFtZV0pIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSB2b2lkIDAsIGlzU3ZnTW9kZSk7XG4gICAgICAgIGZvciAobmFtZSBpbiBhdHRycykgaWYgKCEoJ2NoaWxkcmVuJyA9PT0gbmFtZSB8fCAnaW5uZXJIVE1MJyA9PT0gbmFtZSB8fCBuYW1lIGluIG9sZCAmJiBhdHRyc1tuYW1lXSA9PT0gKCd2YWx1ZScgPT09IG5hbWUgfHwgJ2NoZWNrZWQnID09PSBuYW1lID8gZG9tW25hbWVdIDogb2xkW25hbWVdKSkpIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSBhdHRyc1tuYW1lXSwgaXNTdmdNb2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgKGNvbXBvbmVudHNbbmFtZV0gfHwgKGNvbXBvbmVudHNbbmFtZV0gPSBbXSkpLnB1c2goY29tcG9uZW50KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KEN0b3IsIHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBpbnN0LCBsaXN0ID0gY29tcG9uZW50c1tDdG9yLm5hbWVdO1xuICAgICAgICBpZiAoQ3Rvci5wcm90b3R5cGUgJiYgQ3Rvci5wcm90b3R5cGUucmVuZGVyKSB7XG4gICAgICAgICAgICBpbnN0ID0gbmV3IEN0b3IocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgQ29tcG9uZW50LmNhbGwoaW5zdCwgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5zdCA9IG5ldyBDb21wb25lbnQocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaW5zdC5jb25zdHJ1Y3RvciA9IEN0b3I7XG4gICAgICAgICAgICBpbnN0LnJlbmRlciA9IGRvUmVuZGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0KSBmb3IgKHZhciBpID0gbGlzdC5sZW5ndGg7IGktLTsgKSBpZiAobGlzdFtpXS5jb25zdHJ1Y3RvciA9PT0gQ3Rvcikge1xuICAgICAgICAgICAgaW5zdC5fX2IgPSBsaXN0W2ldLl9fYjtcbiAgICAgICAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3Q7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldENvbXBvbmVudFByb3BzKGNvbXBvbmVudCwgcHJvcHMsIG9wdHMsIGNvbnRleHQsIG1vdW50QWxsKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IgPSBwcm9wcy5yZWYpIGRlbGV0ZSBwcm9wcy5yZWY7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fayA9IHByb3BzLmtleSkgZGVsZXRlIHByb3BzLmtleTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50LmJhc2UgfHwgbW91bnRBbGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykgY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gY29tcG9uZW50LmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2MpIGNvbXBvbmVudC5fX2MgPSBjb21wb25lbnQuY29udGV4dDtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3ApIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQucHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMTtcbiAgICAgICAgICAgIGlmICgwICE9PSBvcHRzKSBpZiAoMSA9PT0gb3B0cyB8fCAhMSAhPT0gb3B0aW9ucy5zeW5jQ29tcG9uZW50VXBkYXRlcyB8fCAhY29tcG9uZW50LmJhc2UpIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIDEsIG1vdW50QWxsKTsgZWxzZSBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fcikgY29tcG9uZW50Ll9fcihjb21wb25lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIG9wdHMsIG1vdW50QWxsLCBpc0NoaWxkKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgdmFyIHJlbmRlcmVkLCBpbnN0LCBjYmFzZSwgcHJvcHMgPSBjb21wb25lbnQucHJvcHMsIHN0YXRlID0gY29tcG9uZW50LnN0YXRlLCBjb250ZXh0ID0gY29tcG9uZW50LmNvbnRleHQsIHByZXZpb3VzUHJvcHMgPSBjb21wb25lbnQuX19wIHx8IHByb3BzLCBwcmV2aW91c1N0YXRlID0gY29tcG9uZW50Ll9fcyB8fCBzdGF0ZSwgcHJldmlvdXNDb250ZXh0ID0gY29tcG9uZW50Ll9fYyB8fCBjb250ZXh0LCBpc1VwZGF0ZSA9IGNvbXBvbmVudC5iYXNlLCBuZXh0QmFzZSA9IGNvbXBvbmVudC5fX2IsIGluaXRpYWxCYXNlID0gaXNVcGRhdGUgfHwgbmV4dEJhc2UsIGluaXRpYWxDaGlsZENvbXBvbmVudCA9IGNvbXBvbmVudC5fY29tcG9uZW50LCBza2lwID0gITE7XG4gICAgICAgICAgICBpZiAoaXNVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcmV2aW91c1Byb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHByZXZpb3VzU3RhdGU7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBwcmV2aW91c0NvbnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKDIgIT09IG9wdHMgJiYgY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZSAmJiAhMSA9PT0gY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpKSBza2lwID0gITA7IGVsc2UgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQuX19zID0gY29tcG9uZW50Ll9fYyA9IGNvbXBvbmVudC5fX2IgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fZCA9ICExO1xuICAgICAgICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyZWQgPSBjb21wb25lbnQucmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQpIGNvbnRleHQgPSBleHRlbmQoZXh0ZW5kKHt9LCBjb250ZXh0KSwgY29tcG9uZW50LmdldENoaWxkQ29udGV4dCgpKTtcbiAgICAgICAgICAgICAgICB2YXIgdG9Vbm1vdW50LCBiYXNlLCBjaGlsZENvbXBvbmVudCA9IHJlbmRlcmVkICYmIHJlbmRlcmVkLm5vZGVOYW1lO1xuICAgICAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBjaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRQcm9wcyA9IGdldE5vZGVQcm9wcyhyZW5kZXJlZCk7XG4gICAgICAgICAgICAgICAgICAgIGluc3QgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0ICYmIGluc3QuY29uc3RydWN0b3IgPT09IGNoaWxkQ29tcG9uZW50ICYmIGNoaWxkUHJvcHMua2V5ID09IGluc3QuX19rKSBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAxLCBjb250ZXh0LCAhMSk7IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Vbm1vdW50ID0gaW5zdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fY29tcG9uZW50ID0gaW5zdCA9IGNyZWF0ZUNvbXBvbmVudChjaGlsZENvbXBvbmVudCwgY2hpbGRQcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Ll9fYiA9IGluc3QuX19iIHx8IG5leHRCYXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdC5fX3UgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAwLCBjb250ZXh0LCAhMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJDb21wb25lbnQoaW5zdCwgMSwgbW91bnRBbGwsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBiYXNlID0gaW5zdC5iYXNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNiYXNlID0gaW5pdGlhbEJhc2U7XG4gICAgICAgICAgICAgICAgICAgIHRvVW5tb3VudCA9IGluaXRpYWxDaGlsZENvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvVW5tb3VudCkgY2Jhc2UgPSBjb21wb25lbnQuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsQmFzZSB8fCAxID09PSBvcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2Jhc2UpIGNiYXNlLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGRpZmYoY2Jhc2UsIHJlbmRlcmVkLCBjb250ZXh0LCBtb3VudEFsbCB8fCAhaXNVcGRhdGUsIGluaXRpYWxCYXNlICYmIGluaXRpYWxCYXNlLnBhcmVudE5vZGUsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgJiYgYmFzZSAhPT0gaW5pdGlhbEJhc2UgJiYgaW5zdCAhPT0gaW5pdGlhbENoaWxkQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlUGFyZW50ID0gaW5pdGlhbEJhc2UucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VQYXJlbnQgJiYgYmFzZSAhPT0gYmFzZVBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhcmVudC5yZXBsYWNlQ2hpbGQoYmFzZSwgaW5pdGlhbEJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0b1VubW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShpbml0aWFsQmFzZSwgITEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIHVubW91bnRDb21wb25lbnQodG9Vbm1vdW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuYmFzZSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UgJiYgIWlzQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudFJlZiA9IGNvbXBvbmVudCwgdCA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHQgPSB0Ll9fdSkgKGNvbXBvbmVudFJlZiA9IHQpLmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl9jb21wb25lbnQgPSBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX2NvbXBvbmVudENvbnN0cnVjdG9yID0gY29tcG9uZW50UmVmLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNVcGRhdGUgfHwgbW91bnRBbGwpIG1vdW50cy51bnNoaWZ0KGNvbXBvbmVudCk7IGVsc2UgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUpIGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wcywgcHJldmlvdXNTdGF0ZSwgcHJldmlvdXNDb250ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5hZnRlclVwZGF0ZSkgb3B0aW9ucy5hZnRlclVwZGF0ZShjb21wb25lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgIT0gY29tcG9uZW50Ll9faCkgd2hpbGUgKGNvbXBvbmVudC5fX2gubGVuZ3RoKSBjb21wb25lbnQuX19oLnBvcCgpLmNhbGwoY29tcG9uZW50KTtcbiAgICAgICAgICAgIGlmICghZGlmZkxldmVsICYmICFpc0NoaWxkKSBmbHVzaE1vdW50cygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKSB7XG4gICAgICAgIHZhciBjID0gZG9tICYmIGRvbS5fY29tcG9uZW50LCBvcmlnaW5hbENvbXBvbmVudCA9IGMsIG9sZERvbSA9IGRvbSwgaXNEaXJlY3RPd25lciA9IGMgJiYgZG9tLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWUsIGlzT3duZXIgPSBpc0RpcmVjdE93bmVyLCBwcm9wcyA9IGdldE5vZGVQcm9wcyh2bm9kZSk7XG4gICAgICAgIHdoaWxlIChjICYmICFpc093bmVyICYmIChjID0gYy5fX3UpKSBpc093bmVyID0gYy5jb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgICAgIGlmIChjICYmIGlzT3duZXIgJiYgKCFtb3VudEFsbCB8fCBjLl9jb21wb25lbnQpKSB7XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMywgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9yaWdpbmFsQ29tcG9uZW50ICYmICFpc0RpcmVjdE93bmVyKSB7XG4gICAgICAgICAgICAgICAgdW5tb3VudENvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgZG9tID0gb2xkRG9tID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMgPSBjcmVhdGVDb21wb25lbnQodm5vZGUubm9kZU5hbWUsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChkb20gJiYgIWMuX19iKSB7XG4gICAgICAgICAgICAgICAgYy5fX2IgPSBkb207XG4gICAgICAgICAgICAgICAgb2xkRG9tID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGMsIHByb3BzLCAxLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBkb20gPSBjLmJhc2U7XG4gICAgICAgICAgICBpZiAob2xkRG9tICYmIGRvbSAhPT0gb2xkRG9tKSB7XG4gICAgICAgICAgICAgICAgb2xkRG9tLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKG9sZERvbSwgITEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkb207XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmJlZm9yZVVubW91bnQpIG9wdGlvbnMuYmVmb3JlVW5tb3VudChjb21wb25lbnQpO1xuICAgICAgICB2YXIgYmFzZSA9IGNvbXBvbmVudC5iYXNlO1xuICAgICAgICBjb21wb25lbnQuX194ID0gITA7XG4gICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsVW5tb3VudCgpO1xuICAgICAgICBjb21wb25lbnQuYmFzZSA9IG51bGw7XG4gICAgICAgIHZhciBpbm5lciA9IGNvbXBvbmVudC5fY29tcG9uZW50O1xuICAgICAgICBpZiAoaW5uZXIpIHVubW91bnRDb21wb25lbnQoaW5uZXIpOyBlbHNlIGlmIChiYXNlKSB7XG4gICAgICAgICAgICBpZiAoYmFzZS5fX3ByZWFjdGF0dHJfICYmIGJhc2UuX19wcmVhY3RhdHRyXy5yZWYpIGJhc2UuX19wcmVhY3RhdHRyXy5yZWYobnVsbCk7XG4gICAgICAgICAgICBjb21wb25lbnQuX19iID0gYmFzZTtcbiAgICAgICAgICAgIHJlbW92ZU5vZGUoYmFzZSk7XG4gICAgICAgICAgICBjb2xsZWN0Q29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihiYXNlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tcG9uZW50Ll9fcikgY29tcG9uZW50Ll9fcihudWxsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX19kID0gITA7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUgfHwge307XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlcih2bm9kZSwgcGFyZW50LCBtZXJnZSkge1xuICAgICAgICByZXR1cm4gZGlmZihtZXJnZSwgdm5vZGUsIHt9LCAhMSwgcGFyZW50LCAhMSk7XG4gICAgfVxuICAgIHZhciBvcHRpb25zID0ge307XG4gICAgdmFyIHN0YWNrID0gW107XG4gICAgdmFyIEVNUFRZX0NISUxEUkVOID0gW107XG4gICAgdmFyIGRlZmVyID0gJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgUHJvbWlzZSA/IFByb21pc2UucmVzb2x2ZSgpLnRoZW4uYmluZChQcm9taXNlLnJlc29sdmUoKSkgOiBzZXRUaW1lb3V0O1xuICAgIHZhciBJU19OT05fRElNRU5TSU9OQUwgPSAvYWNpdHxleCg/OnN8Z3xufHB8JCl8cnBofG93c3xtbmN8bnR3fGluZVtjaF18em9vfF5vcmQvaTtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB2YXIgbW91bnRzID0gW107XG4gICAgdmFyIGRpZmZMZXZlbCA9IDA7XG4gICAgdmFyIGlzU3ZnTW9kZSA9ICExO1xuICAgIHZhciBoeWRyYXRpbmcgPSAhMTtcbiAgICB2YXIgY29tcG9uZW50cyA9IHt9O1xuICAgIGV4dGVuZChDb21wb25lbnQucHJvdG90eXBlLCB7XG4gICAgICAgIHNldFN0YXRlOiBmdW5jdGlvbihzdGF0ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBzID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fX3MpIHRoaXMuX19zID0gZXh0ZW5kKHt9LCBzKTtcbiAgICAgICAgICAgIGV4dGVuZChzLCAnZnVuY3Rpb24nID09IHR5cGVvZiBzdGF0ZSA/IHN0YXRlKHMsIHRoaXMucHJvcHMpIDogc3RhdGUpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSAodGhpcy5fX2ggPSB0aGlzLl9faCB8fCBbXSkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICBlbnF1ZXVlUmVuZGVyKHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBmb3JjZVVwZGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgKHRoaXMuX19oID0gdGhpcy5fX2ggfHwgW10pLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KHRoaXMsIDIpO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge31cbiAgICB9KTtcbiAgICB2YXIgcHJlYWN0ID0ge1xuICAgICAgICBoOiBoLFxuICAgICAgICBjcmVhdGVFbGVtZW50OiBoLFxuICAgICAgICBjbG9uZUVsZW1lbnQ6IGNsb25lRWxlbWVudCxcbiAgICAgICAgQ29tcG9uZW50OiBDb21wb25lbnQsXG4gICAgICAgIHJlbmRlcjogcmVuZGVyLFxuICAgICAgICByZXJlbmRlcjogcmVyZW5kZXIsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9O1xuICAgIGlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2YgbW9kdWxlKSBtb2R1bGUuZXhwb3J0cyA9IHByZWFjdDsgZWxzZSBzZWxmLnByZWFjdCA9IHByZWFjdDtcbn0oKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByZWFjdC5qcy5tYXBcbiAgfSkoKTtcbn0pOyIsInZhciBtZXRyZSA9IDEwOyAvL3BpeGVsc1xudmFyIG51bU9mTm9kZXMgPSA0MDtcbnZhciBub21pbmFsU3RyaW5nTGVuZ3RoID0gMTA7IC8vIHBpeGVsc1xudmFyIHNwcmluZ0NvbnN0YW50ID0gMjU7XG52YXIgaW50ZXJuYWxWaXNjb3VzRnJpY3Rpb25Db25zdGFudCA9IDg7XG52YXIgdmlzY291c0NvbnN0YW50ID0gMC4wMDAwMjtcbnZhciBzaW11bGF0aW9uU3BlZWQgPSA0OyAvLyB0aW1lcyByZWFsIHRpbWVcbnZhciBtYXhTdGVwID0gNTA7IC8vIG1pbGxpc2Vjb25kc1xudmFyIGRhbmdlckZvcmNlTWF4ID0gMTUwOy8vMjUwMDA7XG52YXIgZGFuZ2VyRm9yY2VNaW4gPSAwOy8vMTAwMDA7XG52YXIgcm9wZVdlaWdodFBlck1ldHJlID0gMTtcbnZhciByb3BlV2VpZ2h0UGVyTm9kZSA9IG5vbWluYWxTdHJpbmdMZW5ndGggLyBtZXRyZSAqIHJvcGVXZWlnaHRQZXJNZXRyZTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWV0cmUsXG4gICAgbnVtT2ZOb2RlcyxcbiAgICBub21pbmFsU3RyaW5nTGVuZ3RoLFxuICAgIHNwcmluZ0NvbnN0YW50LFxuICAgIGludGVybmFsVmlzY291c0ZyaWN0aW9uQ29uc3RhbnQsXG4gICAgdmlzY291c0NvbnN0YW50LFxuICAgIHNpbXVsYXRpb25TcGVlZCxcbiAgICBtYXhTdGVwLFxuICAgIGRhbmdlckZvcmNlTWF4LFxuICAgIGRhbmdlckZvcmNlTWluLFxuICAgIHJvcGVXZWlnaHRQZXJNZXRyZSxcbiAgICByb3BlV2VpZ2h0UGVyTm9kZVxufTtcbiIsImV4cG9ydCBjb25zdCBDb250cm9sc0VudW0gPSBPYmplY3QuZnJlZXplKHtcbiAgICBwYW46ICAgIFwicGFuXCIsXG4gICAgZ3JhYjogICBcImdyYWJcIixcbiAgICBhbmNob3I6IFwiYW5jaG9yXCIsXG4gICAgZXJhc2U6ICBcImVyYXNlXCIsXG4gICAgcm9wZTogICBcInJvcGVcIixcbiAgICBwYXVzZTogIFwicGF1c2VcIixcbn0pOyIsImNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJ2pzL3NoYXJlZC9jb25maWcnKTtcblxuZnVuY3Rpb24gZ2V0Tm9kZShpZCwgbm9kZXMpIHtcbiAgICByZXR1cm4gbm9kZXMuZmluZChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5pZCA9PT0gaWQ7XG4gICAgfSlcbn1cbmZ1bmN0aW9uIGdldExlbmd0aChub2RlMSwgbm9kZTIpIHtcbiAgICB2YXIgeGRpZmYgPSBNYXRoLmFicyhub2RlMS5wb3NpdGlvbi54IC0gbm9kZTIucG9zaXRpb24ueCk7XG4gICAgdmFyIHlkaWZmID0gTWF0aC5hYnMobm9kZTEucG9zaXRpb24ueSAtIG5vZGUyLnBvc2l0aW9uLnkpO1xuICAgIHJldHVybiBNYXRoLnNxcnQoKHhkaWZmICogeGRpZmYpICsgKHlkaWZmICogeWRpZmYpKTtcbn1cbmZ1bmN0aW9uIGdldE1pZHBvaW50KG5vZGUxLCBub2RlMikge1xuICAgIHJldHVybiB7IHg6IChub2RlMS5wb3NpdGlvbi54ICsgbm9kZTIucG9zaXRpb24ueCkgLyAyLCB5OiAobm9kZTEucG9zaXRpb24ueSArIG5vZGUyLnBvc2l0aW9uLnkpIC8gMiB9XG59XG5mdW5jdGlvbiBnZXRBbmdsZUZyb21Ib3Jpem9udGFsKG5vZGUxLCBub2RlMikge1xuICAgIHJldHVybiBNYXRoLmF0YW4yKG5vZGUyLnBvc2l0aW9uLnkgLSBub2RlMS5wb3NpdGlvbi55LCBub2RlMi5wb3NpdGlvbi54IC0gbm9kZTEucG9zaXRpb24ueClcbn1cblxuZnVuY3Rpb24gZ2V0Rm9yY2Uobm9kZTEsIG5vZGUyKSB7XG4gICAgdmFyIHN0cmluZ0xlbmd0aCA9IGdldExlbmd0aChub2RlMSwgbm9kZTIpO1xuICAgIHZhciBsZW5ndGhEaWZmZXJlbmNlID0gc3RyaW5nTGVuZ3RoIC0gY29uZmlnLm5vbWluYWxTdHJpbmdMZW5ndGg7XG4gICAgdmFyIGFuZ2xlRnJvbUhvcml6b250YWwgPSBnZXRBbmdsZUZyb21Ib3Jpem9udGFsKG5vZGUxLCBub2RlMik7XG4gICAgdmFyIHlTcHJpbmdGb3JjZSA9IE1hdGguc2luKGFuZ2xlRnJvbUhvcml6b250YWwpICogbGVuZ3RoRGlmZmVyZW5jZSAqIGNvbmZpZy5zcHJpbmdDb25zdGFudDtcbiAgICB2YXIgeFNwcmluZ0ZvcmNlID0gTWF0aC5jb3MoYW5nbGVGcm9tSG9yaXpvbnRhbCkgKiBsZW5ndGhEaWZmZXJlbmNlICogY29uZmlnLnNwcmluZ0NvbnN0YW50O1xuICAgIHZhciB0b3RhbFNwcmluZ0ZvcmNlID0gTWF0aC5zcXJ0KCh5U3ByaW5nRm9yY2UqeVNwcmluZ0ZvcmNlKSsoeFNwcmluZ0ZvcmNlK3hTcHJpbmdGb3JjZSkpO1xuICAgIHJldHVybiB7dG90YWw6IHRvdGFsU3ByaW5nRm9yY2UsIHg6IHhTcHJpbmdGb3JjZSwgeTogeVNwcmluZ0ZvcmNlfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRBbmdsZUZyb21Ib3Jpem9udGFsLFxuICAgIGdldEZvcmNlLFxuICAgIGdldExlbmd0aCxcbiAgICBnZXRNaWRwb2ludCxcbiAgICBnZXROb2RlXG59IiwiY29uc3QgVmVjdG9yID0gcmVxdWlyZSgnanMvc2hhcmVkL3ZlY3RvcicpLlZlY3RvcjtcblxudmFyIHVuaXF1ZWlkID0gLTE7XG5mdW5jdGlvbiBnZXRJRCgpIHtcbiAgICB1bmlxdWVpZCArPSAxO1xuICAgIHJldHVybiB1bmlxdWVpZDtcbn1cblxuY2xhc3MgTm9kZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHggPSAwLFxuICAgICAgICB5ID0gMCxcbiAgICAgICAgdnggPSAwLFxuICAgICAgICB2eSA9IDAsXG4gICAgICAgIGZ4ID0gMCxcbiAgICAgICAgZnkgPSAwLFxuICAgICAgICBmaXhlZCA9IGZhbHNlLFxuICAgICAgICBjb25uZWN0ZWROb2RlcyA9IFtdLFxuICAgICAgICBpZFxuICAgICkge1xuICAgICAgICB0aGlzLmlkID0gaWQgPyBpZCA6IGdldElEKCk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjdG9yKHgsIHkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFZlY3Rvcih2eCwgdnkpO1xuICAgICAgICB0aGlzLmZvcmNlID0gbmV3IFZlY3RvcihmeCwgZnkpO1xuICAgICAgICB0aGlzLmZpeGVkID0gZml4ZWQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkTm9kZXMgPSBjb25uZWN0ZWROb2RlcztcbiAgICB9XG4gICAgZ2V0T2JqZWN0KCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICAgICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvbixcbiAgICAgICAgICAgIHZlbG9jaXR5OiB0aGlzLnZlbG9jaXR5LFxuICAgICAgICAgICAgZm9yY2U6IHRoaXMuZm9yY2UsXG4gICAgICAgICAgICBmaXhlZDogdGhpcy5maXhlZCxcbiAgICAgICAgICAgIGNvbm5lY3RlZE5vZGVzOiB0aGlzLmNvbm5lY3RlZE5vZGVzXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxvYWRPYmplY3Qobm9kZU9iamVjdCA9IHt9KSB7XG4gICAgICAgIHRoaXMuaWQgPSBub2RlT2JqZWN0LmlkID8gbm9kZU9iamVjdC5pZCA6IHRoaXMuaWQ7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBub2RlT2JqZWN0LnBvc2l0aW9uIHx8IHRoaXMucG9zaXRpb247XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSBub2RlT2JqZWN0LnZlbG9jaXR5IHx8IHRoaXMudmVsb2NpdHk7XG4gICAgICAgIHRoaXMuZm9yY2UgPSBub2RlT2JqZWN0LmZvcmNlIHx8IHRoaXMuZm9yY2U7XG4gICAgICAgIHRoaXMuZml4ZWQgPSBub2RlT2JqZWN0LmZpeGVkIHx8IHRoaXMuZml4ZWQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkTm9kZXMgPSBub2RlT2JqZWN0LmNvbm5lY3RlZE5vZGVzIHx8IHRoaXMuY29ubmVjdGVkTm9kZXM7XG4gICAgfVxuICAgIGNvcHlOb2RlKCkge1xuICAgICAgICByZXR1cm4gbmV3IE5vZGUoXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLngsXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnksXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LngsXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnksXG4gICAgICAgICAgICB0aGlzLmZvcmNlLngsXG4gICAgICAgICAgICB0aGlzLmZvcmNlLnksXG4gICAgICAgICAgICB0aGlzLmZpeGVkLFxuICAgICAgICAgICAgdGhpcy5jb25uZWN0ZWROb2RlcyxcbiAgICAgICAgICAgIHRoaXMuaWRcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIE5vZGVcbn07XG4iLCIvLyBQcm92aWRlcyBhIHNpbXBsZSAzRCB2ZWN0b3IgY2xhc3MuIFZlY3RvciBvcGVyYXRpb25zIGNhbiBiZSBkb25lIHVzaW5nIG1lbWJlclxuLy8gZnVuY3Rpb25zLCB3aGljaCByZXR1cm4gbmV3IHZlY3RvcnMsIG9yIHN0YXRpYyBmdW5jdGlvbnMsIHdoaWNoIHJldXNlXG4vLyBleGlzdGluZyB2ZWN0b3JzIHRvIGF2b2lkIGdlbmVyYXRpbmcgZ2FyYmFnZS5cbmZ1bmN0aW9uIFZlY3Rvcih4LCB5LCB6KSB7XG4gIHRoaXMueCA9IHggfHwgMDtcbiAgdGhpcy55ID0geSB8fCAwO1xuICB0aGlzLnogPSB6IHx8IDA7XG59XG5cbi8vICMjIyBJbnN0YW5jZSBNZXRob2RzXG4vLyBUaGUgbWV0aG9kcyBgYWRkKClgLCBgc3VidHJhY3QoKWAsIGBtdWx0aXBseSgpYCwgYW5kIGBkaXZpZGUoKWAgY2FuIGFsbFxuLy8gdGFrZSBlaXRoZXIgYSB2ZWN0b3Igb3IgYSBudW1iZXIgYXMgYW4gYXJndW1lbnQuXG5WZWN0b3IucHJvdG90eXBlID0ge1xuICBsb2FkOiBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih2ZWN0b3IueCB8fCAwLCB2ZWN0b3IueSB8fCAwLCB2ZWN0b3IueiB8fCAwKTtcbiAgfSxcbiAgbmVnYXRpdmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yKC10aGlzLngsIC10aGlzLnksIC10aGlzLnopO1xuICB9LFxuICBhZGQ6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKyB2LCB0aGlzLnkgKyB2LCB0aGlzLnogKyB2KTtcbiAgfSxcbiAgc3VidHJhY3Q6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggLSB2LCB0aGlzLnkgLSB2LCB0aGlzLnogLSB2KTtcbiAgfSxcbiAgbXVsdGlwbHk6IGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFZlY3RvcikgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueik7XG4gICAgZWxzZSByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKiB2LCB0aGlzLnkgKiB2LCB0aGlzLnogKiB2KTtcbiAgfSxcbiAgZGl2aWRlOiBmdW5jdGlvbih2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBWZWN0b3IpIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAvIHYueCwgdGhpcy55IC8gdi55LCB0aGlzLnogLyB2LnopO1xuICAgIGVsc2UgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gdiwgdGhpcy55IC8gdiwgdGhpcy56IC8gdik7XG4gIH0sXG4gIGVxdWFsczogZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggPT0gdi54ICYmIHRoaXMueSA9PSB2LnkgJiYgdGhpcy56ID09IHYuejtcbiAgfSxcbiAgZG90OiBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHRoaXMueiAqIHYuejtcbiAgfSxcbiAgY3Jvc3M6IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgIHRoaXMueSAqIHYueiAtIHRoaXMueiAqIHYueSxcbiAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcbiAgICAgIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueFxuICAgICk7XG4gIH0sXG4gIGxlbmd0aDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRvdCh0aGlzKSk7XG4gIH0sXG4gIHVuaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRpdmlkZSh0aGlzLmxlbmd0aCgpKTtcbiAgfSxcbiAgbWluOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5taW4odGhpcy54LCB0aGlzLnkpLCB0aGlzLnopO1xuICB9LFxuICBtYXg6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLm1heChNYXRoLm1heCh0aGlzLngsIHRoaXMueSksIHRoaXMueik7XG4gIH0sXG4gIHRvQW5nbGVzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGhldGE6IE1hdGguYXRhbjIodGhpcy56LCB0aGlzLngpLFxuICAgICAgcGhpOiBNYXRoLmFzaW4odGhpcy55IC8gdGhpcy5sZW5ndGgoKSlcbiAgICB9O1xuICB9LFxuICBhbmdsZVRvOiBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIE1hdGguYWNvcyh0aGlzLmRvdChhKSAvICh0aGlzLmxlbmd0aCgpICogYS5sZW5ndGgoKSkpO1xuICB9LFxuICB0b0FycmF5OiBmdW5jdGlvbihuKSB7XG4gICAgcmV0dXJuIFt0aGlzLngsIHRoaXMueSwgdGhpcy56XS5zbGljZSgwLCBuIHx8IDMpO1xuICB9LFxuICBjbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54LCB0aGlzLnksIHRoaXMueik7XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgICB0aGlzLnggPSB4OyB0aGlzLnkgPSB5OyB0aGlzLnogPSB6O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG4vLyAjIyMgU3RhdGljIE1ldGhvZHNcbi8vIGBWZWN0b3IucmFuZG9tRGlyZWN0aW9uKClgIHJldHVybnMgYSB2ZWN0b3Igd2l0aCBhIGxlbmd0aCBvZiAxIGFuZCBhXG4vLyBzdGF0aXN0aWNhbGx5IHVuaWZvcm0gZGlyZWN0aW9uLiBgVmVjdG9yLmxlcnAoKWAgcGVyZm9ybXMgbGluZWFyXG4vLyBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlY3RvcnMuXG5WZWN0b3IubmVnYXRpdmUgPSBmdW5jdGlvbihhLCBiKSB7XG4gIGIueCA9IC1hLng7IGIueSA9IC1hLnk7IGIueiA9IC1hLno7XG4gIHJldHVybiBiO1xufTtcblZlY3Rvci5hZGQgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54ICsgYi54OyBjLnkgPSBhLnkgKyBiLnk7IGMueiA9IGEueiArIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54ICsgYjsgYy55ID0gYS55ICsgYjsgYy56ID0gYS56ICsgYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3Iuc3VidHJhY3QgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54IC0gYi54OyBjLnkgPSBhLnkgLSBiLnk7IGMueiA9IGEueiAtIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54IC0gYjsgYy55ID0gYS55IC0gYjsgYy56ID0gYS56IC0gYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3IubXVsdGlwbHkgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gIGMgPSBjID8gYyA6IG5ldyBWZWN0b3IoKTtcbiAgaWYgKGIgaW5zdGFuY2VvZiBWZWN0b3IpIHsgYy54ID0gYS54ICogYi54OyBjLnkgPSBhLnkgKiBiLnk7IGMueiA9IGEueiAqIGIuejsgfVxuICBlbHNlIHsgYy54ID0gYS54ICogYjsgYy55ID0gYS55ICogYjsgYy56ID0gYS56ICogYjsgfVxuICByZXR1cm4gYztcbn07XG5WZWN0b3IuZGl2aWRlID0gZnVuY3Rpb24oYSwgYiwgYykge1xuICBpZiAoYiBpbnN0YW5jZW9mIFZlY3RvcikgeyBjLnggPSBhLnggLyBiLng7IGMueSA9IGEueSAvIGIueTsgYy56ID0gYS56IC8gYi56OyB9XG4gIGVsc2UgeyBjLnggPSBhLnggLyBiOyBjLnkgPSBhLnkgLyBiOyBjLnogPSBhLnogLyBiOyB9XG4gIHJldHVybiBjO1xufTtcblZlY3Rvci5jcm9zcyA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgYy54ID0gYS55ICogYi56IC0gYS56ICogYi55O1xuICBjLnkgPSBhLnogKiBiLnggLSBhLnggKiBiLno7XG4gIGMueiA9IGEueCAqIGIueSAtIGEueSAqIGIueDtcbiAgcmV0dXJuIGM7XG59O1xuVmVjdG9yLnVuaXQgPSBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBsZW5ndGggPSBhLmxlbmd0aCgpO1xuICBiLnggPSBhLnggLyBsZW5ndGg7XG4gIGIueSA9IGEueSAvIGxlbmd0aDtcbiAgYi56ID0gYS56IC8gbGVuZ3RoO1xuICByZXR1cm4gYjtcbn07XG5WZWN0b3IuZnJvbUFuZ2xlcyA9IGZ1bmN0aW9uKHRoZXRhLCBwaGkpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5jb3ModGhldGEpICogTWF0aC5jb3MocGhpKSwgTWF0aC5zaW4ocGhpKSwgTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKSk7XG59O1xuVmVjdG9yLnJhbmRvbURpcmVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gVmVjdG9yLmZyb21BbmdsZXMoTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyLCBNYXRoLmFzaW4oTWF0aC5yYW5kb20oKSAqIDIgLSAxKSk7XG59O1xuVmVjdG9yLm1pbiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5taW4oYS54LCBiLngpLCBNYXRoLm1pbihhLnksIGIueSksIE1hdGgubWluKGEueiwgYi56KSk7XG59O1xuVmVjdG9yLm1heCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIG5ldyBWZWN0b3IoTWF0aC5tYXgoYS54LCBiLngpLCBNYXRoLm1heChhLnksIGIueSksIE1hdGgubWF4KGEueiwgYi56KSk7XG59O1xuVmVjdG9yLmxlcnAgPSBmdW5jdGlvbihhLCBiLCBmcmFjdGlvbikge1xuICByZXR1cm4gYi5zdWJ0cmFjdChhKS5tdWx0aXBseShmcmFjdGlvbikuYWRkKGEpO1xufTtcblZlY3Rvci5mcm9tQXJyYXkgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBuZXcgVmVjdG9yKGFbMF0sIGFbMV0sIGFbMl0pO1xufTtcblZlY3Rvci5hbmdsZUJldHdlZW4gPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhLmFuZ2xlVG8oYik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVmVjdG9yXG59IiwiaW1wb3J0IHsgaCwgcmVuZGVyIH0gZnJvbSBcInByZWFjdFwiO1xuaW1wb3J0IEFwcCBmcm9tIFwiLi91aS9jb21wb25lbnRzL0FwcFwiO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgcmVuZGVyKDxBcHAgLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYXBwXCIpKTtcbn0pO1xuIiwiaW1wb3J0IHsgaCwgQ29tcG9uZW50IH0gZnJvbSBcInByZWFjdFwiO1xuaW1wb3J0IENhbnZhcyBmcm9tIFwianMvdWkvY29tcG9uZW50cy9jYW52YXMvY2FudmFzXCI7XG5pbXBvcnQgQ29udHJvbHMgZnJvbSBcImpzL3VpL2NvbXBvbmVudHMvY29udHJvbHMvY29udHJvbHNcIjtcbmltcG9ydCBTdGF0cyBmcm9tIFwianMvdWkvY29tcG9uZW50cy9zdGF0cy9zdGF0c1wiO1xuaW1wb3J0IFNhdmVNb2RhbCBmcm9tIFwianMvdWkvY29tcG9uZW50cy9zYXZlLW1vZGFsL3NhdmUtbW9kYWxcIjtcbmltcG9ydCBMb2FkTW9kYWwgZnJvbSBcImpzL3VpL2NvbXBvbmVudHMvbG9hZC1tb2RhbC9sb2FkLW1vZGFsXCI7XG5pbXBvcnQgeyBDb250cm9sc0VudW0gfSBmcm9tIFwianMvc2hhcmVkL2NvbnN0YW50cy5qc1wiXG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcImpzL3NoYXJlZC9jb25maWdcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHZhciB3b3JrZXIgPSBuZXcgV29ya2VyKFwid29ya2VyLmpzXCIpO1xuICAgICAgICB3b3JrZXIub25tZXNzYWdlID0gdGhpcy5oYW5kbGVXb3JrZXI7XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShcImluaXRcIik7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHdvcmtlcixcbiAgICAgICAgICAgIG5vZGVzOiBbXSxcbiAgICAgICAgICAgIHNlbGVjdGVkQ29udHJvbDogQ29udHJvbHNFbnVtLnBhbixcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBzaG93SURzOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNhdmVEYXRhOiBudWxsLFxuICAgICAgICAgICAgc2F2ZU1vZGFsVmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICBsb2FkTW9kYWxWaXNpYmxlOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkZyYW1lKTtcbiAgICAgICAgdGhpcy5zdGF0ZS53b3JrZXIucG9zdE1lc3NhZ2UoXCJydW5cIik7XG4gICAgfVxuXG4gICAgb25GcmFtZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zdGF0ZS53b3JrZXIucG9zdE1lc3NhZ2UoXCJzZW5kXCIpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkZyYW1lKTtcbiAgICB9O1xuXG4gICAgaGFuZGxlV29ya2VyID0gZGF0YSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbm9kZXM6IGRhdGEuZGF0YS5ub2RlcyxcbiAgICAgICAgICAgIHRydWVTaW11bGF0aW9uU3BlZWQ6IGRhdGEuZGF0YS50cnVlU2ltdWxhdGlvblNwZWVkXG4gICAgICAgIH0pO1xuICAgICAgICAvL2NvbXB1dGUoKTtcbiAgICB9O1xuXG4gICAgY2hhbmdlQ29udHJvbCA9IGNvbnRyb2wgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNlbGVjdGVkQ29udHJvbDogY29udHJvbFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjaGFuZ2VTY2FsZSA9IHBvc2l0aXZlID0+IHtcbiAgICAgIGxldCBzY2FsZSA9IHRoaXMuc3RhdGUuc2NhbGU7XG4gICAgICBpZiAoKCFwb3NpdGl2ZSAmJiBzY2FsZSA8PSAxKSB8fCAocG9zaXRpdmUgJiYgc2NhbGUgPCAxKSApIHtcbiAgICAgICAgaWYgKHBvc2l0aXZlKSB7XG4gICAgICAgICAgc2NhbGUgPSBzY2FsZSArIDAuMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNjYWxlID0gc2NhbGUgLSAwLjFcbiAgICAgICAgfVxuICAgICAgICBzY2FsZSA9IE1hdGgucm91bmQoc2NhbGUqMTApLzEwXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocG9zaXRpdmUpIHtcbiAgICAgICAgICBzY2FsZSA9IHNjYWxlICsgMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNjYWxlID0gc2NhbGUgLSAxXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzY2FsZSA8PSAwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2NhbGV9KVxuXG4gICAgfVxuXG4gICAgY2hhbmdlT3B0aW9uID0gKGtleSwgdmFsdWUpID0+IHtcbiAgICAgIGxldCBvcHRpb25zID0gdGhpcy5zdGF0ZS5vcHRpb25zO1xuICAgICAgb3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICB0aGlzLnNldFN0YXRlKHtvcHRpb25zfSlcbiAgICB9XG5cbiAgICBzYXZlID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNhdmVEYXRhOmJ0b2EoSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5ub2RlcykpLFxuICAgICAgICBzYXZlTW9kYWxWaXNpYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxtYWluPlxuICAgICAgICAgICAgICAgIDxDYW52YXMgb3B0aW9ucz17dGhpcy5zdGF0ZS5vcHRpb25zfSBub2Rlcz17dGhpcy5zdGF0ZS5ub2Rlc30gd29ya2VyPXt0aGlzLnN0YXRlLndvcmtlcn0gc2VsZWN0ZWRDb250cm9sPXt0aGlzLnN0YXRlLnNlbGVjdGVkQ29udHJvbH0gc2NhbGU9e3RoaXMuc3RhdGUuc2NhbGV9Lz5cbiAgICAgICAgICAgICAgICA8Q29udHJvbHMgd29ya2VyPXt0aGlzLnN0YXRlLndvcmtlcn0gc2VsZWN0ZWRDb250cm9sPXt0aGlzLnN0YXRlLnNlbGVjdGVkQ29udHJvbH0gY2hhbmdlQ29udHJvbD17dGhpcy5jaGFuZ2VDb250cm9sfSBjaGFuZ2VTY2FsZT17dGhpcy5jaGFuZ2VTY2FsZX0gc2NhbGU9e3RoaXMuc3RhdGUuc2NhbGV9IG9wdGlvbnM9e3RoaXMuc3RhdGUub3B0aW9uc30gY2hhbmdlT3B0aW9uPXt0aGlzLmNoYW5nZU9wdGlvbn0gc2F2ZT17dGhpcy5zYXZlfSBsb2FkPXsoKT0+dGhpcy5zZXRTdGF0ZSh7bG9hZE1vZGFsVmlzaWJsZTp0cnVlfSl9Lz5cbiAgICAgICAgICAgICAgICA8U3RhdHMgdHJ1ZVNpbXVsYXRpb25TcGVlZD17dGhpcy5zdGF0ZS50cnVlU2ltdWxhdGlvblNwZWVkfSAvPlxuICAgICAgICAgICAgICAgIDxTYXZlTW9kYWwgdmlzaWJsZT17dGhpcy5zdGF0ZS5zYXZlTW9kYWxWaXNpYmxlfSBzYXZlRGF0YT17dGhpcy5zdGF0ZS5zYXZlRGF0YX0gY2xvc2U9eygpPT50aGlzLnNldFN0YXRlKHtzYXZlTW9kYWxWaXNpYmxlOmZhbHNlfSl9Lz5cbiAgICAgICAgICAgICAgICA8TG9hZE1vZGFsIHZpc2libGU9e3RoaXMuc3RhdGUubG9hZE1vZGFsVmlzaWJsZX0gd29ya2VyPXt0aGlzLnN0YXRlLndvcmtlcn0gY2xvc2U9eygpPT50aGlzLnNldFN0YXRlKHtsb2FkTW9kYWxWaXNpYmxlOmZhbHNlfSl9Lz5cbiAgICAgICAgICAgIDwvbWFpbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbi8qPGRpdj5TaW0gc3BlZWQ6IDxzcGFuIGlkPVwic2ltc3BlZWRcIj48L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48YnV0dG9uIGlkPVwic3RhcnRcIj5TdGFydDwvYnV0dG9uPjxidXR0b24gaWQ9XCJzdG9wXCI+U3RvcDwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+PGlucHV0IGNoZWNrZWQgaWQ9XCJzaG93LWlkc1wiIHR5cGU9XCJjaGVja2JveFwiIC8+IFNob3cgbm9kZSBJRHM8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PkZyb206IDxpbnB1dCBpZD1cImZyb21cIj48L2lucHV0PjwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+VG86IDxpbnB1dCBpZD1cInRvXCI+PC9pbnB1dD48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PkZvcmNlOiA8c3BhbiBpZD1cInJlc3VsdFwiPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxpbnB1dCBpZD1cImxvYWQtZGF0YVwiIC8+PGJ1dHRvbiBpZD1cImxvYWRcIj5Mb2FkPC9idXR0b24+PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj48aW5wdXQgaWQ9XCJzYXZlLWRhdGFcIiAvPjxidXR0b24gaWQ9XCJzYXZlXCI+U2F2ZTwvYnV0dG9uPjwvZGl2PiovXG4iLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tIFwicHJlYWN0XCI7XG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcImpzL3NoYXJlZC9jb25maWdcIjtcbmltcG9ydCAqIGFzIGhlbHBlciBmcm9tIFwianMvc2hhcmVkL2hlbHBlclwiO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSBcImpzL3NoYXJlZC92ZWN0b3JcIjtcbmltcG9ydCB7IE5vZGUgfSBmcm9tIFwianMvc2hhcmVkL25vZGVcIjtcbmltcG9ydCB7IENvbnRyb2xzRW51bSB9IGZyb20gXCJqcy9zaGFyZWQvY29uc3RhbnRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbnZhcyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbW91c2Vkb3duOiBmYWxzZSxcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZTogbnVsbCxcbiAgICAgICAgICAgIG5ld05vZGVzOiBbXSxcbiAgICAgICAgICAgIG1vdXNlUG9zaXRpb246IG5ldyBWZWN0b3IoMCwgMCksXG4gICAgICAgICAgICBzdGFydENvb3JkczogbmV3IFZlY3RvcigwLCAwKSxcbiAgICAgICAgICAgIGxhc3RDb29yZHM6IG5ldyBWZWN0b3IoMCwgMCksXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGU6IG5ldyBWZWN0b3IoMCwgMCksXG4gICAgICAgICAgICAgICAgc2NhbGU6IG5ldyBWZWN0b3IoMCwgMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5pbnRlcmFjdCgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy53b3JrZXIucG9zdE1lc3NhZ2UoW1xuICAgICAgICAgICAgICAgIFwibW92ZVwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWROb2RlOiB0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgbW91c2VQb3NpdGlvbjogdGhpcy5zdGF0ZS5tb3VzZVBvc2l0aW9uXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRVbmlxdWVJRCA9ICgpID0+IHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgbm90dW5pcXVlID0gdHJ1ZTtcbiAgICAgICAgd2hpbGUgKG5vdHVuaXF1ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLm5vZGVzLmZpbmQobiA9PiBuLmlkID09PSBpKSAmJiAhdGhpcy5zdGF0ZS5uZXdOb2Rlcy5maW5kKG4gPT4gbi5pZCA9PT0gaSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBnZXRNb3VzZVNjcmVlblBvc2l0aW9uID0gbW91c2VldmVudCA9PiB7XG4gICAgICAgIHZhciByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHZhciBtb3VzZSA9IHtcbiAgICAgICAgICAgIHg6IG1vdXNlZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgICAgICAgIHk6IG1vdXNlZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yKG1vdXNlLngsIG1vdXNlLnkpO1xuICAgIH07XG5cbiAgICBnZXRNb3VzZUNhbnZhc1Bvc2l0aW9uID0gbW91c2VldmVudCA9PiB7XG4gICAgICAgIHZhciBtID0gdGhpcy5nZXRNb3VzZVNjcmVlblBvc2l0aW9uKG1vdXNlZXZlbnQpO1xuICAgICAgICByZXR1cm4gbS5zdWJ0cmFjdCh0aGlzLnN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUpLmRpdmlkZSh0aGlzLnByb3BzLnNjYWxlKTtcbiAgICB9O1xuXG4gICAgZ2V0TmVhcmVzdE5vZGUgPSAocG9zaXRpb24sIHJhZGl1cywgbm9kZXMpID0+IHtcbiAgICAgICAgbGV0IG5lYXJlc3ROb2RlcyA9IHRoaXMuZ2V0TmVhcmVzdE5vZGVzKHBvc2l0aW9uLCByYWRpdXMsIG5vZGVzKTtcbiAgICAgICAgcmV0dXJuIG5lYXJlc3ROb2Rlcy5sZW5ndGggPiAwID8gbmVhcmVzdE5vZGVzWzBdIDogbnVsbDtcbiAgICB9O1xuXG4gICAgZ2V0TmVhcmVzdE5vZGVzID0gKHBvc2l0aW9uLCByYWRpdXMsIG5vZGVzKSA9PiB7XG4gICAgICAgIGxldCBuZWFyYnkgPSBbXTtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICAgIGxldCBub2RlUG9zaXRpb24gPSBuZXcgVmVjdG9yKCkubG9hZChub2RlLnBvc2l0aW9uKTtcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IG5vZGVQb3NpdGlvbi5zdWJ0cmFjdChwb3NpdGlvbikubGVuZ3RoKCk7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCByYWRpdXMpIHtcbiAgICAgICAgICAgICAgICBuZWFyYnkucHVzaCh7IG5vZGUsIGRpc3RhbmNlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5lYXJieVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm1hcChuID0+IG4ubm9kZSk7XG4gICAgfTtcblxuICAgIGludGVyYWN0ID0gKCkgPT4ge1xuICAgICAgICB2YXIgYyA9IHRoaXMuY2FudmFzO1xuICAgICAgICB2YXIgbm9kZXMgPSB0aGlzLnByb3BzLm5vZGVzO1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIGMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIFwibW91c2Vkb3duXCIsXG4gICAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlUG9zaXRpb24gPSB0aGlzLnN0YXRlLm1vdXNlUG9zaXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vdXNlZG93bjogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQ29udHJvbHNFbnVtLmdyYWI6XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWROb2RlID0gdGhpcy5nZXROZWFyZXN0Tm9kZShtb3VzZVBvc2l0aW9uLCAyMCwgdGhpcy5wcm9wcy5ub2Rlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZE5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQ29udHJvbHNFbnVtLnBhbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0Q29vcmRzOiB0aGlzLmdldE1vdXNlU2NyZWVuUG9zaXRpb24oZSkuc3VidHJhY3QodGhpcy5zdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBDb250cm9sc0VudW0uYW5jaG9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy53b3JrZXIucG9zdE1lc3NhZ2UoW1wibmV3YW5jaG9yXCIsIHsgbW91c2VQb3NpdGlvbiB9XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBDb250cm9sc0VudW0uZXJhc2U6XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmVhcmVzdE5vZGVzID0gdGhpcy5nZXROZWFyZXN0Tm9kZXMobW91c2VQb3NpdGlvbiwgNSwgdGhpcy5wcm9wcy5ub2Rlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZWFyZXN0Tm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXCJkZWxldGVub2RlXCIsIHsgbm9kZTogbm9kZSB9XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIENvbnRyb2xzRW51bS5yb3BlOlxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGUgPSBuZXcgTm9kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3VzZVBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VQb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRVbmlxdWVJRCgpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5lYXJlc3ROb2RlID0gdGhpcy5nZXROZWFyZXN0Tm9kZShtb3VzZVBvc2l0aW9uLCA1LCB0aGlzLnByb3BzLm5vZGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZWFyZXN0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY29ubmVjdGVkTm9kZXMucHVzaChuZWFyZXN0Tm9kZS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmVhcmVzdE5vZGUuY29ubmVjdGVkTm9kZXMucHVzaChub2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0Q29vcmRzOiBuZXcgVmVjdG9yKG5vZGUucG9zaXRpb24ueCwgbm9kZS5wb3NpdGlvbi55KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlczogW25vZGVdXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICAgIGMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIFwibW91c2Vtb3ZlXCIsXG4gICAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbW91c2UgPSB0aGlzLmdldE1vdXNlU2NyZWVuUG9zaXRpb24oZSk7XG4gICAgICAgICAgICAgICAgdmFyIG1vdXNlUG9zaXRpb24gPSB0aGlzLmdldE1vdXNlQ2FudmFzUG9zaXRpb24oZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zaXRpb25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQ29udHJvbHNFbnVtLmdyYWI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IHVzZXMgdXBkYXRlZCBtb3VzZVBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBDb250cm9sc0VudW0ucGFuOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubW91c2Vkb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlOiBuZXcgVmVjdG9yKG1vdXNlLngsIG1vdXNlLnkpLnN1YnRyYWN0KHRoaXMuc3RhdGUuc3RhcnRDb29yZHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGU6IHRoaXMuc3RhdGUudHJhbnNmb3JtLnNjYWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIENvbnRyb2xzRW51bS5lcmFzZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm1vdXNlZG93bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZWFyZXN0Tm9kZXMgPSB0aGlzLmdldE5lYXJlc3ROb2Rlcyhtb3VzZVBvc2l0aW9uLCA1LCB0aGlzLnByb3BzLm5vZGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZWFyZXN0Tm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy53b3JrZXIucG9zdE1lc3NhZ2UoW1wiZGVsZXRlbm9kZVwiLCB7IG5vZGU6IG5vZGUgfV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQ29udHJvbHNFbnVtLnJvcGU6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5tb3VzZWRvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnN0YXRlLnN0YXJ0Q29vcmRzLnN1YnRyYWN0KG1vdXNlUG9zaXRpb24pLmxlbmd0aCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+IGNvbmZpZy5ub21pbmFsU3RyaW5nTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBub2RlID0gbmV3IE5vZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3VzZVBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3VzZVBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0VW5pcXVlSUQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Tm9kZXMgPSB0aGlzLnN0YXRlLm5ld05vZGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJldk5vZGUgPSBuZXdOb2Rlc1tuZXdOb2Rlcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldk5vZGUuY29ubmVjdGVkTm9kZXMucHVzaChub2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jb25uZWN0ZWROb2Rlcy5wdXNoKHByZXZOb2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0Q29vcmRzOiBuZXcgVmVjdG9yKG1vdXNlUG9zaXRpb24ueCwgbW91c2VQb3NpdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgICBjLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICBcIm1vdXNldXBcIixcbiAgICAgICAgICAgIGUgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBtb3VzZVBvc2l0aW9uID0gdGhpcy5zdGF0ZS5tb3VzZVBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb3VzZWRvd246IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBDb250cm9sc0VudW0uZ3JhYjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMud29ya2VyLnBvc3RNZXNzYWdlKFtcIm5vbW92ZVwiLCB7IHNlbGVjdGVkTm9kZTogdGhpcy5zdGF0ZS5zZWxlY3RlZE5vZGUgfV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkTm9kZTogbnVsbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIENvbnRyb2xzRW51bS5wYW46XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydENvb3JkczogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBDb250cm9sc0VudW0ucm9wZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBub2RlID0gdGhpcy5zdGF0ZS5uZXdOb2Rlc1t0aGlzLnN0YXRlLm5ld05vZGVzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGVzID0gdGhpcy5wcm9wcy5ub2RlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZWFyZXN0Tm9kZSA9IHRoaXMuZ2V0TmVhcmVzdE5vZGUobW91c2VQb3NpdGlvbiwgNSwgbm9kZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5lYXJlc3ROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jb25uZWN0ZWROb2Rlcy5wdXNoKG5lYXJlc3ROb2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlcyA9IHRoaXMucHJvcHMubm9kZXMubWFwKG4gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobi5pZCA9PT0gbmVhcmVzdE5vZGUuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4uY29ubmVjdGVkTm9kZXMucHVzaChub2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMud29ya2VyLnBvc3RNZXNzYWdlKFtcImFkZG5vZGVzXCIsIHsgbm9kZXM6IHRoaXMuc3RhdGUubmV3Tm9kZXMgfV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzOiBub2Rlcy5jb25jYXQodGhpcy5zdGF0ZS5uZXdOb2RlcylcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgLypcbiAgICAgICAgZG9jdW1lbnQub25rZXlwcmVzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XG4gICAgICAgIH07Ki9cbiAgICB9O1xuXG4gICAgZHJhdyA9ICgpID0+IHtcbiAgICAgICAgdmFyIHNob3dJRHMgPSB0aGlzLnByb3BzLm9wdGlvbnMuc2hvd0lEcztcbiAgICAgICAgLy8gQ2xlYXIgYW5kIHJlc2V0IGNhbnZhc1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIGxldCBub2RlcyA9IHRoaXMucHJvcHMubm9kZXM7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDAsMCwwKVwiO1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICAvL2N0eC50cmFuc2xhdGUodGhpcy5jYW52YXMud2lkdGgvMiwgdGhpcy5jYW52YXMuaGVpZ2h0LzIpO1xuICAgICAgICBjdHguc2V0VHJhbnNmb3JtKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5zY2FsZSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5zY2FsZSxcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudHJhbnNmb3JtLnRyYW5zbGF0ZS54LFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnlcbiAgICAgICAgKTtcbiAgICAgICAgLy9jdHgudHJhbnNsYXRlKC10aGlzLmNhbnZhcy53aWR0aC8yLCAtdGhpcy5jYW52YXMuaGVpZ2h0LzIpO1xuXG4gICAgICAgIC8vIERyYXcgZ3JpZFxuICAgICAgICB2YXIgZ3JpZFNpemUgPSAxMCAqIGNvbmZpZy5tZXRyZTtcbiAgICAgICAgdmFyIG9mZnNldHggPSAodGhpcy5zdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnggLyB0aGlzLnByb3BzLnNjYWxlKSAlIGdyaWRTaXplO1xuICAgICAgICB2YXIgb2Zmc2V0eSA9ICh0aGlzLnN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSAvIHRoaXMucHJvcHMuc2NhbGUpICUgZ3JpZFNpemU7XG4gICAgICAgIGZvciAobGV0IHggPSAwIC0gMiAqIGdyaWRTaXplOyB4IDwgdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLnByb3BzLnNjYWxlICsgZ3JpZFNpemU7IHggPSB4ICsgZ3JpZFNpemUpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiI2QwZDBkMFwiO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyhcbiAgICAgICAgICAgICAgICB4IC0gdGhpcy5zdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnggLyB0aGlzLnByb3BzLnNjYWxlICsgb2Zmc2V0eCxcbiAgICAgICAgICAgICAgICAwIC0gZ3JpZFNpemUgLSB0aGlzLnN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSAvIHRoaXMucHJvcHMuc2NhbGUgKyBvZmZzZXR5XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhcbiAgICAgICAgICAgICAgICB4IC0gdGhpcy5zdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnggLyB0aGlzLnByb3BzLnNjYWxlICsgb2Zmc2V0eCxcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgLyB0aGlzLnByb3BzLnNjYWxlIC1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnkgLyB0aGlzLnByb3BzLnNjYWxlICtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eSArXG4gICAgICAgICAgICAgICAgICAgIGdyaWRTaXplXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IHkgPSAwIC0gMiAqIGdyaWRTaXplOyB5IDwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gdGhpcy5wcm9wcy5zY2FsZSArIGdyaWRTaXplOyB5ID0geSArIGdyaWRTaXplKSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcIiNkMGQwZDBcIjtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oXG4gICAgICAgICAgICAgICAgMCAtIGdyaWRTaXplIC0gdGhpcy5zdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnggLyB0aGlzLnByb3BzLnNjYWxlICsgb2Zmc2V0eCxcbiAgICAgICAgICAgICAgICB5IC0gdGhpcy5zdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnkgLyB0aGlzLnByb3BzLnNjYWxlICsgb2Zmc2V0eVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLnByb3BzLnNjYWxlIC1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS50cmFuc2Zvcm0udHJhbnNsYXRlLnggLyB0aGlzLnByb3BzLnNjYWxlICtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eCArXG4gICAgICAgICAgICAgICAgICAgIGdyaWRTaXplLFxuICAgICAgICAgICAgICAgIHkgLSB0aGlzLnN0YXRlLnRyYW5zZm9ybS50cmFuc2xhdGUueSAvIHRoaXMucHJvcHMuc2NhbGUgKyBvZmZzZXR5XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHJhdyBpbmRpY2F0b3JzIGFyb3VuZCBjdXJzb3IgaWYgbmVlZGVkXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDAsMCwwKVwiO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZENvbnRyb2wgPT09IENvbnRyb2xzRW51bS5lcmFzZSkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmFyYyh0aGlzLnN0YXRlLm1vdXNlUG9zaXRpb24ueCwgdGhpcy5zdGF0ZS5tb3VzZVBvc2l0aW9uLnksIDUsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERyYXcgc2NhbGUgYmFyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygxMCwgMTAwKTtcbiAgICAgICAgY3R4LmxpbmVUbygxMCwgMTAwICsgMTAgKiBjb25maWcubWV0cmUpO1xuICAgICAgICBjdHguZmlsbFRleHQoXCIxMG1cIiwgMTEsIDEwMCArIDEwICogY29uZmlnLm1ldHJlIC8gMik7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICAvLyBEcmF3IGFsbCBsaW5lcyBhbmQgbm9kZXNcbiAgICAgICAgdmFyIGRyYXduID0gW107XG4gICAgICAgIGxldCBkcmF3TGluZSA9IChub2RlLCBub2RlcywgY29ubmVjdGVkTm9kZUlEKSA9PiB7XG4gICAgICAgICAgICB2YXIgbm9kZXNzc3MgPSB0aGlzLnByb3BzLm5vZGVzO1xuICAgICAgICAgICAgdmFyIG5ld25vZGVzc3NzcyA9IHRoaXMuc3RhdGUubmV3Tm9kZXM7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBpZiAobm9kZS5maXhlZCkge1xuICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChub2RlLnBvc2l0aW9uLnggLSAyLCBub2RlLnBvc2l0aW9uLnkgLSAyLCA1LCA1KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG5vZGUucG9zaXRpb24ueCAtIDEsIG5vZGUucG9zaXRpb24ueSAtIDEsIDMsIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNob3dJRHMpIHtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQobm9kZS5pZCwgbm9kZS5wb3NpdGlvbi54ICsgMSwgbm9kZS5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIGlmIChkcmF3bi5pbmRleE9mKGNvbm5lY3RlZE5vZGVJRC50b1N0cmluZygpICsgbm9kZS5pZC50b1N0cmluZygpKSA8IDApIHtcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbm5lY3RlZE5vZGUgPSBoZWxwZXIuZ2V0Tm9kZShjb25uZWN0ZWROb2RlSUQsIG5vZGVzKTtcbiAgICAgICAgICAgICAgICBjdHgubW92ZVRvKGNvbm5lY3RlZE5vZGUucG9zaXRpb24ueCwgY29ubmVjdGVkTm9kZS5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKG5vZGUucG9zaXRpb24ueCwgbm9kZS5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgICAgICBkcmF3bi5wdXNoKG5vZGUuaWQudG9TdHJpbmcoKSArIGNvbm5lY3RlZE5vZGUuaWQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgdmFyIGZvcmNlID0gaGVscGVyLmdldEZvcmNlKG5vZGUsIGNvbm5lY3RlZE5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChmb3JjZS50b3RhbCA+PSBjb25maWcuZGFuZ2VyRm9yY2VNaW4gJiYgZm9yY2UudG90YWwgPCBjb25maWcuZGFuZ2VyRm9yY2VNYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vcm1Gb3JjZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAoZm9yY2UudG90YWwgLSBjb25maWcuZGFuZ2VyRm9yY2VNaW4pIC8gKGNvbmZpZy5kYW5nZXJGb3JjZU1heCAtIGNvbmZpZy5kYW5nZXJGb3JjZU1pbik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2xvciA9IG5vcm1Gb3JjZSAqIDI1NTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoXCIgKyBjb2xvci50b0ZpeGVkKDApICsgXCIsIDAsIDApXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmb3JjZS50b3RhbCA+PSBjb25maWcuZGFuZ2VyRm9yY2VNYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2IoMjU1LCAwLCAwKVwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiKDAsMCwwKVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIG5vZGVzLmNvbmNhdCh0aGlzLnN0YXRlLm5ld05vZGVzKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKG5vZGUuY29ubmVjdGVkTm9kZXMubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZml4ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG5vZGUucG9zaXRpb24ueCAtIDIsIG5vZGUucG9zaXRpb24ueSAtIDIsIDUsIDUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdChub2RlLnBvc2l0aW9uLnggLSAxLCBub2RlLnBvc2l0aW9uLnkgLSAxLCAzLCAzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNob3dJRHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KG5vZGUuaWQsIG5vZGUucG9zaXRpb24ueCArIDEsIG5vZGUucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUuY29ubmVjdGVkTm9kZXMuZm9yRWFjaChkcmF3TGluZS5iaW5kKHRoaXMsIG5vZGUsIG5vZGVzLmNvbmNhdCh0aGlzLnN0YXRlLm5ld05vZGVzKSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxjYW52YXNcbiAgICAgICAgICAgICAgICByZWY9e2NhbnZhcyA9PiAodGhpcy5jYW52YXMgPSBjYW52YXMpfVxuICAgICAgICAgICAgICAgIGlkPVwiY2FudmFzXCJcbiAgICAgICAgICAgICAgICB3aWR0aD17d2luZG93LmlubmVyV2lkdGh9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXt3aW5kb3cuaW5uZXJIZWlnaHR9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGgsIENvbXBvbmVudCB9IGZyb20gXCJwcmVhY3RcIjtcbmltcG9ydCB7IENvbnRyb2xzRW51bSB9IGZyb20gXCJqcy9zaGFyZWQvY29uc3RhbnRzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyb2xzIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICBwYXVzZWQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xzXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbnMgaGFzLWFkZG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbCAke3RoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29udHJvbHNFbnVtLnBhbiAmJiBcImlzLXByaW1hcnlcIn1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2hhbmdlQ29udHJvbChDb250cm9sc0VudW0ucGFuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXIgZmEtaGFuZC1wYXBlclwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbCAke3RoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29udHJvbHNFbnVtLmdyYWIgJiYgXCJpcy1wcmltYXJ5XCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoYW5nZUNvbnRyb2woQ29udHJvbHNFbnVtLmdyYWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhciBmYS1oYW5kLXJvY2tcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BidXR0b24gaXMtc21hbGwgJHt0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRyb2xzRW51bS5hbmNob3IgJiYgXCJpcy1wcmltYXJ5XCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoYW5nZUNvbnRyb2woQ29udHJvbHNFbnVtLmFuY2hvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLXBsdXNcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BidXR0b24gaXMtc21hbGwgJHt0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRyb2xzRW51bS5yb3BlICYmIFwiaXMtcHJpbWFyeVwifWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VDb250cm9sKENvbnRyb2xzRW51bS5yb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXMgZmEtcGVuY2lsLWFsdFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbCAke3RoaXMucHJvcHMuc2VsZWN0ZWRDb250cm9sID09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29udHJvbHNFbnVtLmVyYXNlICYmIFwiaXMtcHJpbWFyeVwifWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VDb250cm9sKENvbnRyb2xzRW51bS5lcmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLWVyYXNlclwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGJ1dHRvbiBpcy1zbWFsbGB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGFuZ2VTY2FsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvblwiPi08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPXtgYnV0dG9uIGlzLXNtYWxsYH0gZGlzYWJsZWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5zY2FsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPXtgYnV0dG9uIGlzLXNtYWxsYH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoYW5nZVNjYWxlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb25cIj4rPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BidXR0b24gaXMtc21hbGwgJHt0aGlzLnByb3BzLnNlbGVjdGVkQ29udHJvbCA9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRyb2xzRW51bS5wYXVzZSAmJiBcImlzLXByaW1hcnlcIn1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMud29ya2VyLnBvc3RNZXNzYWdlKHRoaXMuc3RhdGUucGF1c2VkID8gXCJydW5cIiA6IFwicGF1c2VcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtwYXVzZWQ6ICF0aGlzLnN0YXRlLnBhdXNlZH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz17YGZhcyAkeyB0aGlzLnN0YXRlLnBhdXNlZCA/ICdmYS1wbGF5JzonZmEtcGF1c2UnfWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz17YGRyb3Bkb3duICR7dGhpcy5zdGF0ZS5vcHRpb25zVmlzaWJsZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaXMtYWN0aXZlXCJ9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZHJvcGRvd24tdHJpZ2dlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJidXR0b24gaXMtc21hbGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zVmlzaWJsZTogIXRoaXMuc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9wdGlvbnNWaXNpYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaWNvbiBpcy1zbWFsbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXMgZmEtY29nXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPntcIiBcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uIGlzLXNtYWxsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiZmFzIGZhLWFuZ2xlLWRvd25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImRyb3Bkb3duLW1lbnVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwiZHJvcGRvd24tbWVudTJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJtZW51XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRyb3Bkb3duLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRyb3Bkb3duLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG9uQ2hhbmdlPXtlPT50aGlzLnByb3BzLmNoYW5nZU9wdGlvbignc2hvd0lEcycsIGUudGFyZ2V0LmNoZWNrZWQpfS8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2hvdyBJRHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImRyb3Bkb3duLWl0ZW1cIiBvbkNsaWNrPXt0aGlzLnByb3BzLnNhdmV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2F2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiIG9uQ2xpY2s9e3RoaXMucHJvcHMubG9hZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2FkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGgsIENvbXBvbmVudCB9IGZyb20gXCJwcmVhY3RcIjtcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tIFwianMvc2hhcmVkL2NvbmZpZ1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2FkTW9kYWwgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGxvYWRlZDogZmFsc2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWREYXRhOiAnJ1xuICAgICAgICB9O1xuICAgIH1cbiAgICBsb2FkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLndvcmtlci5wb3N0TWVzc2FnZShbXCJsb2FkXCIsIHRoaXMuc3RhdGUubG9hZERhdGFdKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkZWQ6IHRydWUsXG4gICAgICAgICAgICBzdWNjZXNzOnRydWVcbiAgICAgICAgfSlcbiAgICB9O1xuICAgIHNldERhdGEgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtsb2FkRGF0YTplLnRhcmdldC52YWx1ZX0pXG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9e2Btb2RhbCAke3RoaXMucHJvcHMudmlzaWJsZSAmJiBcImlzLWFjdGl2ZVwifWB9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1iYWNrZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY2FyZFwiPlxuICAgICAgICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwibW9kYWwtY2FyZC1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cIm1vZGFsLWNhcmQtdGl0bGVcIj5TYXZlPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImRlbGV0ZVwiIGFyaWEtbGFiZWw9XCJjbG9zZVwiIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2xvc2V9Lz5cbiAgICAgICAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwibW9kYWwtY2FyZC1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQYXN0ZSB5b3VyIGNvZGUgYmVsb3cgdG8gbG9hZCB0aGUgc2ltdWxhdGlvbiBzdGF0ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkIGhhcy1hZGRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRyb2xcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHRoaXMuc2V0RGF0YShlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udHJvbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMubG9hZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uIGlzLXNtYWxsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLWRvd25sb2FkXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUubG9hZGVkICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5zdWNjZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIkxvYWRlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcImxvYWQgZmFpbGVkXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGgsIENvbXBvbmVudCB9IGZyb20gXCJwcmVhY3RcIjtcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tIFwianMvc2hhcmVkL2NvbmZpZ1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTYXZlTW9kYWwgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNvcGllZDogZmFsc2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBjb3B5ID0gKCkgPT4ge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICByYW5nZS5zZWxlY3ROb2RlKHRoaXMuaW5wdXQpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHN1Y2Nlc3NmdWwgPSBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XG4gICAgICAgICAgICB2YXIgbXNnID0gc3VjY2Vzc2Z1bCA/IFwic3VjY2Vzc2Z1bFwiIDogXCJ1bnN1Y2Nlc3NmdWxcIjtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNvcGllZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBjb3BpZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICB9O1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9e2Btb2RhbCAke3RoaXMucHJvcHMudmlzaWJsZSAmJiBcImlzLWFjdGl2ZVwifWB9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1iYWNrZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY2FyZFwiPlxuICAgICAgICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzPVwibW9kYWwtY2FyZC1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cIm1vZGFsLWNhcmQtdGl0bGVcIj5TYXZlPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImRlbGV0ZVwiIGFyaWEtbGFiZWw9XCJjbG9zZVwiIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2xvc2V9Lz5cbiAgICAgICAgICAgICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwibW9kYWwtY2FyZC1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb3B5IHRoZSBjb2RlIGJlbG93IHRvIHNhdmUgdGhlIGN1cnJlbnQgc3RhdGUgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHNpbXVsYXRpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZCBoYXMtYWRkb25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e2lucHV0ID0+ICh0aGlzLmlucHV0ID0gaW5wdXQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkT25seVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnNhdmVEYXRhfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250cm9sXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5jb3B5fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImljb24gaXMtc21hbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXMgZmEtY29weVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmNvcGllZCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuc3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJDb3BpZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogXCJDb3B5IGZhaWxlZFwifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBoLCBDb21wb25lbnQgfSBmcm9tIFwicHJlYWN0XCI7XG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcImpzL3NoYXJlZC9jb25maWdcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHMgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNpbVNwZWVkczogbmV3IEFycmF5KDEwMCkuZmlsbChjb25maWcuc2ltdWxhdGlvblNwZWVkKSxcbiAgICAgICAgICAgIGNhbGN1bGF0ZWRTaW1TcGVlZDogY29uZmlnLnNpbXVsYXRpb25TcGVlZFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMpIHtcbiAgICAgICAgbGV0IHNpbVNwZWVkcyA9IHRoaXMuc3RhdGUuc2ltU3BlZWRzO1xuICAgICAgICBzaW1TcGVlZHMucG9wKCk7XG4gICAgICAgIHNpbVNwZWVkcy51bnNoaWZ0KHByb3BzLnRydWVTaW11bGF0aW9uU3BlZWQpO1xuICAgICAgICBsZXQgc3VtID0gc2ltU3BlZWRzLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgICAgIH0sIDApO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNpbVNwZWVkcyxcbiAgICAgICAgICAgIGNhbGN1bGF0ZWRTaW1TcGVlZDogc3VtIC8gc2ltU3BlZWRzLmxlbmd0aFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0YXRzXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4+e3RoaXMuc3RhdGUuY2FsY3VsYXRlZFNpbVNwZWVkLnRvRml4ZWQoMil9eDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiIsIi8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbihmdW5jdGlvbigpIHtcbiAgdmFyIFdlYlNvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQgfHwgd2luZG93Lk1veldlYlNvY2tldDtcbiAgdmFyIGJyID0gd2luZG93LmJydW5jaCA9ICh3aW5kb3cuYnJ1bmNoIHx8IHt9KTtcbiAgdmFyIGFyID0gYnJbJ2F1dG8tcmVsb2FkJ10gPSAoYnJbJ2F1dG8tcmVsb2FkJ10gfHwge30pO1xuICBpZiAoIVdlYlNvY2tldCB8fCBhci5kaXNhYmxlZCkgcmV0dXJuO1xuICBpZiAod2luZG93Ll9hcikgcmV0dXJuO1xuICB3aW5kb3cuX2FyID0gdHJ1ZTtcblxuICB2YXIgY2FjaGVCdXN0ZXIgPSBmdW5jdGlvbih1cmwpe1xuICAgIHZhciBkYXRlID0gTWF0aC5yb3VuZChEYXRlLm5vdygpIC8gMTAwMCkudG9TdHJpbmcoKTtcbiAgICB1cmwgPSB1cmwucmVwbGFjZSgvKFxcJnxcXFxcPyljYWNoZUJ1c3Rlcj1cXGQqLywgJycpO1xuICAgIHJldHVybiB1cmwgKyAodXJsLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArJ2NhY2hlQnVzdGVyPScgKyBkYXRlO1xuICB9O1xuXG4gIHZhciBicm93c2VyID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuICB2YXIgZm9yY2VSZXBhaW50ID0gYXIuZm9yY2VSZXBhaW50IHx8IGJyb3dzZXIuaW5kZXhPZignY2hyb21lJykgPiAtMTtcblxuICB2YXIgcmVsb2FkZXJzID0ge1xuICAgIHBhZ2U6IGZ1bmN0aW9uKCl7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKHRydWUpO1xuICAgIH0sXG5cbiAgICBzdHlsZXNoZWV0OiBmdW5jdGlvbigpe1xuICAgICAgW10uc2xpY2VcbiAgICAgICAgLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGlua1tyZWw9c3R5bGVzaGVldF0nKSlcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgdmFyIHZhbCA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLWF1dG9yZWxvYWQnKTtcbiAgICAgICAgICByZXR1cm4gbGluay5ocmVmICYmIHZhbCAhPSAnZmFsc2UnO1xuICAgICAgICB9KVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgbGluay5ocmVmID0gY2FjaGVCdXN0ZXIobGluay5ocmVmKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIC8vIEhhY2sgdG8gZm9yY2UgcGFnZSByZXBhaW50IGFmdGVyIDI1bXMuXG4gICAgICBpZiAoZm9yY2VSZXBhaW50KSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodDsgfSwgMjUpO1xuICAgIH0sXG5cbiAgICBqYXZhc2NyaXB0OiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHNjcmlwdHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdCcpKTtcbiAgICAgIHZhciB0ZXh0U2NyaXB0cyA9IHNjcmlwdHMubWFwKGZ1bmN0aW9uKHNjcmlwdCkgeyByZXR1cm4gc2NyaXB0LnRleHQgfSkuZmlsdGVyKGZ1bmN0aW9uKHRleHQpIHsgcmV0dXJuIHRleHQubGVuZ3RoID4gMCB9KTtcbiAgICAgIHZhciBzcmNTY3JpcHRzID0gc2NyaXB0cy5maWx0ZXIoZnVuY3Rpb24oc2NyaXB0KSB7IHJldHVybiBzY3JpcHQuc3JjIH0pO1xuXG4gICAgICB2YXIgbG9hZGVkID0gMDtcbiAgICAgIHZhciBhbGwgPSBzcmNTY3JpcHRzLmxlbmd0aDtcbiAgICAgIHZhciBvbkxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbG9hZGVkID0gbG9hZGVkICsgMTtcbiAgICAgICAgaWYgKGxvYWRlZCA9PT0gYWxsKSB7XG4gICAgICAgICAgdGV4dFNjcmlwdHMuZm9yRWFjaChmdW5jdGlvbihzY3JpcHQpIHsgZXZhbChzY3JpcHQpOyB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzcmNTY3JpcHRzXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKHNjcmlwdCkge1xuICAgICAgICAgIHZhciBzcmMgPSBzY3JpcHQuc3JjO1xuICAgICAgICAgIHNjcmlwdC5yZW1vdmUoKTtcbiAgICAgICAgICB2YXIgbmV3U2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgbmV3U2NyaXB0LnNyYyA9IGNhY2hlQnVzdGVyKHNyYyk7XG4gICAgICAgICAgbmV3U2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICAgICAgICBuZXdTY3JpcHQub25sb2FkID0gb25Mb2FkO1xuICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobmV3U2NyaXB0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9O1xuICB2YXIgcG9ydCA9IGFyLnBvcnQgfHwgOTQ4NTtcbiAgdmFyIGhvc3QgPSBici5zZXJ2ZXIgfHwgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lIHx8ICdsb2NhbGhvc3QnO1xuXG4gIHZhciBjb25uZWN0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgY29ubmVjdGlvbiA9IG5ldyBXZWJTb2NrZXQoJ3dzOi8vJyArIGhvc3QgKyAnOicgKyBwb3J0KTtcbiAgICBjb25uZWN0aW9uLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIGlmIChhci5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgdmFyIG1lc3NhZ2UgPSBldmVudC5kYXRhO1xuICAgICAgdmFyIHJlbG9hZGVyID0gcmVsb2FkZXJzW21lc3NhZ2VdIHx8IHJlbG9hZGVycy5wYWdlO1xuICAgICAgcmVsb2FkZXIoKTtcbiAgICB9O1xuICAgIGNvbm5lY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoY29ubmVjdGlvbi5yZWFkeVN0YXRlKSBjb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgfTtcbiAgICBjb25uZWN0aW9uLm9uY2xvc2UgPSBmdW5jdGlvbigpe1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoY29ubmVjdCwgMTAwMCk7XG4gICAgfTtcbiAgfTtcbiAgY29ubmVjdCgpO1xufSkoKTtcbi8qIGpzaGludCBpZ25vcmU6ZW5kICovXG4iXX0=