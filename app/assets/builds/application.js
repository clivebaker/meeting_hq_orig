(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __reExport = (target, module, copyDefault, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toESM = (module, isNodeMode) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // node_modules/@rails/actioncable/src/adapters.js
  var adapters_default;
  var init_adapters = __esm({
    "node_modules/@rails/actioncable/src/adapters.js"() {
      adapters_default = {
        logger: self.console,
        WebSocket: self.WebSocket
      };
    }
  });

  // node_modules/@rails/actioncable/src/logger.js
  var logger_default;
  var init_logger = __esm({
    "node_modules/@rails/actioncable/src/logger.js"() {
      init_adapters();
      logger_default = {
        log(...messages) {
          if (this.enabled) {
            messages.push(Date.now());
            adapters_default.logger.log("[ActionCable]", ...messages);
          }
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection_monitor.js
  var now, secondsSince, ConnectionMonitor, connection_monitor_default;
  var init_connection_monitor = __esm({
    "node_modules/@rails/actioncable/src/connection_monitor.js"() {
      init_logger();
      now = () => new Date().getTime();
      secondsSince = (time) => (now() - time) / 1e3;
      ConnectionMonitor = class {
        constructor(connection) {
          this.visibilityDidChange = this.visibilityDidChange.bind(this);
          this.connection = connection;
          this.reconnectAttempts = 0;
        }
        start() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            addEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
          }
        }
        stop() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            removeEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log("ConnectionMonitor stopped");
          }
        }
        isRunning() {
          return this.startedAt && !this.stoppedAt;
        }
        recordPing() {
          this.pingedAt = now();
        }
        recordConnect() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          logger_default.log("ConnectionMonitor recorded connect");
        }
        recordDisconnect() {
          this.disconnectedAt = now();
          logger_default.log("ConnectionMonitor recorded disconnect");
        }
        startPolling() {
          this.stopPolling();
          this.poll();
        }
        stopPolling() {
          clearTimeout(this.pollTimeout);
        }
        poll() {
          this.pollTimeout = setTimeout(() => {
            this.reconnectIfStale();
            this.poll();
          }, this.getPollInterval());
        }
        getPollInterval() {
          const { staleThreshold, reconnectionBackoffRate } = this.constructor;
          const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
          const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
          const jitter = jitterMax * Math.random();
          return staleThreshold * 1e3 * backoff * (1 + jitter);
        }
        reconnectIfStale() {
          if (this.connectionIsStale()) {
            logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
            } else {
              logger_default.log("ConnectionMonitor reopening");
              this.connection.reopen();
            }
          }
        }
        get refreshedAt() {
          return this.pingedAt ? this.pingedAt : this.startedAt;
        }
        connectionIsStale() {
          return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
        }
        disconnectedRecently() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        }
        visibilityDidChange() {
          if (document.visibilityState === "visible") {
            setTimeout(() => {
              if (this.connectionIsStale() || !this.connection.isOpen()) {
                logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                this.connection.reopen();
              }
            }, 200);
          }
        }
      };
      ConnectionMonitor.staleThreshold = 6;
      ConnectionMonitor.reconnectionBackoffRate = 0.15;
      connection_monitor_default = ConnectionMonitor;
    }
  });

  // node_modules/@rails/actioncable/src/internal.js
  var internal_default;
  var init_internal = __esm({
    "node_modules/@rails/actioncable/src/internal.js"() {
      internal_default = {
        "message_types": {
          "welcome": "welcome",
          "disconnect": "disconnect",
          "ping": "ping",
          "confirmation": "confirm_subscription",
          "rejection": "reject_subscription"
        },
        "disconnect_reasons": {
          "unauthorized": "unauthorized",
          "invalid_request": "invalid_request",
          "server_restart": "server_restart"
        },
        "default_mount_path": "/cable",
        "protocols": [
          "actioncable-v1-json",
          "actioncable-unsupported"
        ]
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection.js
  var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
  var init_connection = __esm({
    "node_modules/@rails/actioncable/src/connection.js"() {
      init_adapters();
      init_connection_monitor();
      init_internal();
      init_logger();
      ({ message_types, protocols } = internal_default);
      supportedProtocols = protocols.slice(0, protocols.length - 1);
      indexOf = [].indexOf;
      Connection = class {
        constructor(consumer2) {
          this.open = this.open.bind(this);
          this.consumer = consumer2;
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new connection_monitor_default(this);
          this.disconnected = true;
        }
        send(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        }
        open() {
          if (this.isActive()) {
            logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
            return false;
          } else {
            logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`);
            if (this.webSocket) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new adapters_default.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        }
        close({ allowReconnect } = { allowReconnect: true }) {
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return this.webSocket.close();
          }
        }
        reopen() {
          logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error2) {
              logger_default.log("Failed to reopen WebSocket", error2);
            } finally {
              logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        }
        getProtocol() {
          if (this.webSocket) {
            return this.webSocket.protocol;
          }
        }
        isOpen() {
          return this.isState("open");
        }
        isActive() {
          return this.isState("open", "connecting");
        }
        isProtocolSupported() {
          return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
        }
        isState(...states) {
          return indexOf.call(states, this.getState()) >= 0;
        }
        getState() {
          if (this.webSocket) {
            for (let state in adapters_default.WebSocket) {
              if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
                return state.toLowerCase();
              }
            }
          }
          return null;
        }
        installEventHandlers() {
          for (let eventName in this.events) {
            const handler = this.events[eventName].bind(this);
            this.webSocket[`on${eventName}`] = handler;
          }
        }
        uninstallEventHandlers() {
          for (let eventName in this.events) {
            this.webSocket[`on${eventName}`] = function() {
            };
          }
        }
      };
      Connection.reopenDelay = 500;
      Connection.prototype.events = {
        message(event) {
          if (!this.isProtocolSupported()) {
            return;
          }
          const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
          switch (type) {
            case message_types.welcome:
              this.monitor.recordConnect();
              return this.subscriptions.reload();
            case message_types.disconnect:
              logger_default.log(`Disconnecting. Reason: ${reason}`);
              return this.close({ allowReconnect: reconnect });
            case message_types.ping:
              return this.monitor.recordPing();
            case message_types.confirmation:
              this.subscriptions.confirmSubscription(identifier);
              return this.subscriptions.notify(identifier, "connected");
            case message_types.rejection:
              return this.subscriptions.reject(identifier);
            default:
              return this.subscriptions.notify(identifier, "received", message);
          }
        },
        open() {
          logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
          this.disconnected = false;
          if (!this.isProtocolSupported()) {
            logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
            return this.close({ allowReconnect: false });
          }
        },
        close(event) {
          logger_default.log("WebSocket onclose event");
          if (this.disconnected) {
            return;
          }
          this.disconnected = true;
          this.monitor.recordDisconnect();
          return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
        },
        error() {
          logger_default.log("WebSocket onerror event");
        }
      };
      connection_default = Connection;
    }
  });

  // node_modules/@rails/actioncable/src/subscription.js
  var extend, Subscription;
  var init_subscription = __esm({
    "node_modules/@rails/actioncable/src/subscription.js"() {
      extend = function(object, properties) {
        if (properties != null) {
          for (let key in properties) {
            const value = properties[key];
            object[key] = value;
          }
        }
        return object;
      };
      Subscription = class {
        constructor(consumer2, params = {}, mixin) {
          this.consumer = consumer2;
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }
        perform(action, data = {}) {
          data.action = action;
          return this.send(data);
        }
        send(data) {
          return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
        }
        unsubscribe() {
          return this.consumer.subscriptions.remove(this);
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/subscription_guarantor.js
  var SubscriptionGuarantor, subscription_guarantor_default;
  var init_subscription_guarantor = __esm({
    "node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
      init_logger();
      SubscriptionGuarantor = class {
        constructor(subscriptions) {
          this.subscriptions = subscriptions;
          this.pendingSubscriptions = [];
        }
        guarantee(subscription) {
          if (this.pendingSubscriptions.indexOf(subscription) == -1) {
            logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
            this.pendingSubscriptions.push(subscription);
          } else {
            logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
          }
          this.startGuaranteeing();
        }
        forget(subscription) {
          logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
          this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
        }
        startGuaranteeing() {
          this.stopGuaranteeing();
          this.retrySubscribing();
        }
        stopGuaranteeing() {
          clearTimeout(this.retryTimeout);
        }
        retrySubscribing() {
          this.retryTimeout = setTimeout(() => {
            if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
              this.pendingSubscriptions.map((subscription) => {
                logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                this.subscriptions.subscribe(subscription);
              });
            }
          }, 500);
        }
      };
      subscription_guarantor_default = SubscriptionGuarantor;
    }
  });

  // node_modules/@rails/actioncable/src/subscriptions.js
  var Subscriptions;
  var init_subscriptions = __esm({
    "node_modules/@rails/actioncable/src/subscriptions.js"() {
      init_subscription();
      init_subscription_guarantor();
      init_logger();
      Subscriptions = class {
        constructor(consumer2) {
          this.consumer = consumer2;
          this.guarantor = new subscription_guarantor_default(this);
          this.subscriptions = [];
        }
        create(channelName, mixin) {
          const channel = channelName;
          const params = typeof channel === "object" ? channel : { channel };
          const subscription = new Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        }
        add(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.subscribe(subscription);
          return subscription;
        }
        remove(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        }
        reject(identifier) {
          return this.findAll(identifier).map((subscription) => {
            this.forget(subscription);
            this.notify(subscription, "rejected");
            return subscription;
          });
        }
        forget(subscription) {
          this.guarantor.forget(subscription);
          this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
          return subscription;
        }
        findAll(identifier) {
          return this.subscriptions.filter((s) => s.identifier === identifier);
        }
        reload() {
          return this.subscriptions.map((subscription) => this.subscribe(subscription));
        }
        notifyAll(callbackName, ...args) {
          return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
        }
        notify(subscription, callbackName, ...args) {
          let subscriptions;
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
        }
        subscribe(subscription) {
          if (this.sendCommand(subscription, "subscribe")) {
            this.guarantor.guarantee(subscription);
          }
        }
        confirmSubscription(identifier) {
          logger_default.log(`Subscription confirmed ${identifier}`);
          this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
        }
        sendCommand(subscription, command) {
          const { identifier } = subscription;
          return this.consumer.send({ command, identifier });
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/consumer.js
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  var Consumer;
  var init_consumer = __esm({
    "node_modules/@rails/actioncable/src/consumer.js"() {
      init_connection();
      init_subscriptions();
      Consumer = class {
        constructor(url) {
          this._url = url;
          this.subscriptions = new Subscriptions(this);
          this.connection = new connection_default(this);
        }
        get url() {
          return createWebSocketURL(this._url);
        }
        send(data) {
          return this.connection.send(data);
        }
        connect() {
          return this.connection.open();
        }
        disconnect() {
          return this.connection.close({ allowReconnect: false });
        }
        ensureActiveConnection() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/index.js
  var src_exports = {};
  __export(src_exports, {
    Connection: () => connection_default,
    ConnectionMonitor: () => connection_monitor_default,
    Consumer: () => Consumer,
    INTERNAL: () => internal_default,
    Subscription: () => Subscription,
    SubscriptionGuarantor: () => subscription_guarantor_default,
    Subscriptions: () => Subscriptions,
    adapters: () => adapters_default,
    createConsumer: () => createConsumer,
    createWebSocketURL: () => createWebSocketURL,
    getConfig: () => getConfig,
    logger: () => logger_default
  });
  function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name) {
    const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  var init_src = __esm({
    "node_modules/@rails/actioncable/src/index.js"() {
      init_connection();
      init_connection_monitor();
      init_consumer();
      init_internal();
      init_subscription();
      init_subscriptions();
      init_subscription_guarantor();
      init_adapters();
      init_logger();
    }
  });

  // node_modules/jquery/dist/jquery.js
  var require_jquery = __commonJS({
    "node_modules/jquery/dist/jquery.js"(exports, module) {
      (function(global, factory) {
        "use strict";
        if (typeof module === "object" && typeof module.exports === "object") {
          module.exports = global.document ? factory(global, true) : function(w) {
            if (!w.document) {
              throw new Error("jQuery requires a window with a document");
            }
            return factory(w);
          };
        } else {
          factory(global);
        }
      })(typeof window !== "undefined" ? window : exports, function(window2, noGlobal) {
        "use strict";
        var arr = [];
        var getProto = Object.getPrototypeOf;
        var slice = arr.slice;
        var flat = arr.flat ? function(array) {
          return arr.flat.call(array);
        } : function(array) {
          return arr.concat.apply([], array);
        };
        var push = arr.push;
        var indexOf2 = arr.indexOf;
        var class2type = {};
        var toString = class2type.toString;
        var hasOwn = class2type.hasOwnProperty;
        var fnToString = hasOwn.toString;
        var ObjectFunctionString = fnToString.call(Object);
        var support = {};
        var isFunction = function isFunction2(obj) {
          return typeof obj === "function" && typeof obj.nodeType !== "number" && typeof obj.item !== "function";
        };
        var isWindow = function isWindow2(obj) {
          return obj != null && obj === obj.window;
        };
        var document2 = window2.document;
        var preservedScriptAttributes = {
          type: true,
          src: true,
          nonce: true,
          noModule: true
        };
        function DOMEval(code, node, doc) {
          doc = doc || document2;
          var i, val, script = doc.createElement("script");
          script.text = code;
          if (node) {
            for (i in preservedScriptAttributes) {
              val = node[i] || node.getAttribute && node.getAttribute(i);
              if (val) {
                script.setAttribute(i, val);
              }
            }
          }
          doc.head.appendChild(script).parentNode.removeChild(script);
        }
        function toType(obj) {
          if (obj == null) {
            return obj + "";
          }
          return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
        }
        var version = "3.6.0", jQuery2 = function(selector, context) {
          return new jQuery2.fn.init(selector, context);
        };
        jQuery2.fn = jQuery2.prototype = {
          jquery: version,
          constructor: jQuery2,
          length: 0,
          toArray: function() {
            return slice.call(this);
          },
          get: function(num) {
            if (num == null) {
              return slice.call(this);
            }
            return num < 0 ? this[num + this.length] : this[num];
          },
          pushStack: function(elems) {
            var ret = jQuery2.merge(this.constructor(), elems);
            ret.prevObject = this;
            return ret;
          },
          each: function(callback) {
            return jQuery2.each(this, callback);
          },
          map: function(callback) {
            return this.pushStack(jQuery2.map(this, function(elem, i) {
              return callback.call(elem, i, elem);
            }));
          },
          slice: function() {
            return this.pushStack(slice.apply(this, arguments));
          },
          first: function() {
            return this.eq(0);
          },
          last: function() {
            return this.eq(-1);
          },
          even: function() {
            return this.pushStack(jQuery2.grep(this, function(_elem, i) {
              return (i + 1) % 2;
            }));
          },
          odd: function() {
            return this.pushStack(jQuery2.grep(this, function(_elem, i) {
              return i % 2;
            }));
          },
          eq: function(i) {
            var len = this.length, j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
          },
          end: function() {
            return this.prevObject || this.constructor();
          },
          push,
          sort: arr.sort,
          splice: arr.splice
        };
        jQuery2.extend = jQuery2.fn.extend = function() {
          var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
          if (typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
          }
          if (typeof target !== "object" && !isFunction(target)) {
            target = {};
          }
          if (i === length) {
            target = this;
            i--;
          }
          for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
              for (name in options) {
                copy = options[name];
                if (name === "__proto__" || target === copy) {
                  continue;
                }
                if (deep && copy && (jQuery2.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                  src = target[name];
                  if (copyIsArray && !Array.isArray(src)) {
                    clone = [];
                  } else if (!copyIsArray && !jQuery2.isPlainObject(src)) {
                    clone = {};
                  } else {
                    clone = src;
                  }
                  copyIsArray = false;
                  target[name] = jQuery2.extend(deep, clone, copy);
                } else if (copy !== void 0) {
                  target[name] = copy;
                }
              }
            }
          }
          return target;
        };
        jQuery2.extend({
          expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
          isReady: true,
          error: function(msg) {
            throw new Error(msg);
          },
          noop: function() {
          },
          isPlainObject: function(obj) {
            var proto, Ctor;
            if (!obj || toString.call(obj) !== "[object Object]") {
              return false;
            }
            proto = getProto(obj);
            if (!proto) {
              return true;
            }
            Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
            return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
          },
          isEmptyObject: function(obj) {
            var name;
            for (name in obj) {
              return false;
            }
            return true;
          },
          globalEval: function(code, options, doc) {
            DOMEval(code, { nonce: options && options.nonce }, doc);
          },
          each: function(obj, callback) {
            var length, i = 0;
            if (isArrayLike(obj)) {
              length = obj.length;
              for (; i < length; i++) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                  break;
                }
              }
            } else {
              for (i in obj) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                  break;
                }
              }
            }
            return obj;
          },
          makeArray: function(arr2, results) {
            var ret = results || [];
            if (arr2 != null) {
              if (isArrayLike(Object(arr2))) {
                jQuery2.merge(ret, typeof arr2 === "string" ? [arr2] : arr2);
              } else {
                push.call(ret, arr2);
              }
            }
            return ret;
          },
          inArray: function(elem, arr2, i) {
            return arr2 == null ? -1 : indexOf2.call(arr2, elem, i);
          },
          merge: function(first, second) {
            var len = +second.length, j = 0, i = first.length;
            for (; j < len; j++) {
              first[i++] = second[j];
            }
            first.length = i;
            return first;
          },
          grep: function(elems, callback, invert) {
            var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert;
            for (; i < length; i++) {
              callbackInverse = !callback(elems[i], i);
              if (callbackInverse !== callbackExpect) {
                matches.push(elems[i]);
              }
            }
            return matches;
          },
          map: function(elems, callback, arg) {
            var length, value, i = 0, ret = [];
            if (isArrayLike(elems)) {
              length = elems.length;
              for (; i < length; i++) {
                value = callback(elems[i], i, arg);
                if (value != null) {
                  ret.push(value);
                }
              }
            } else {
              for (i in elems) {
                value = callback(elems[i], i, arg);
                if (value != null) {
                  ret.push(value);
                }
              }
            }
            return flat(ret);
          },
          guid: 1,
          support
        });
        if (typeof Symbol === "function") {
          jQuery2.fn[Symbol.iterator] = arr[Symbol.iterator];
        }
        jQuery2.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(_i, name) {
          class2type["[object " + name + "]"] = name.toLowerCase();
        });
        function isArrayLike(obj) {
          var length = !!obj && "length" in obj && obj.length, type = toType(obj);
          if (isFunction(obj) || isWindow(obj)) {
            return false;
          }
          return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
        }
        var Sizzle = function(window3) {
          var i, support2, Expr, getText, isXML, tokenize2, compile, select, outermostContext, sortInput, hasDuplicate, setDocument, document3, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, expando = "sizzle" + 1 * new Date(), preferredDoc = window3.document, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), nonnativeSelectorCache = createCache(), sortOrder = function(a, b) {
            if (a === b) {
              hasDuplicate = true;
            }
            return 0;
          }, hasOwn2 = {}.hasOwnProperty, arr2 = [], pop = arr2.pop, pushNative = arr2.push, push2 = arr2.push, slice2 = arr2.slice, indexOf3 = function(list, elem) {
            var i2 = 0, len = list.length;
            for (; i2 < len; i2++) {
              if (list[i2] === elem) {
                return i2;
              }
            }
            return -1;
          }, booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", whitespace = "[\\x20\\t\\r\\n\\f]", identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+", attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace + "*([*^$|!~]?=)" + whitespace + `*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(` + identifier + "))|)" + whitespace + "*\\]", pseudos = ":(" + identifier + `)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|` + attributes + ")*)|.*)\\)|)", rwhitespace = new RegExp(whitespace + "+", "g"), rtrim2 = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"), rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"), rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"), rdescend = new RegExp(whitespace + "|>"), rpseudo = new RegExp(pseudos), ridentifier = new RegExp("^" + identifier + "$"), matchExpr = {
            "ID": new RegExp("^#(" + identifier + ")"),
            "CLASS": new RegExp("^\\.(" + identifier + ")"),
            "TAG": new RegExp("^(" + identifier + "|[*])"),
            "ATTR": new RegExp("^" + attributes),
            "PSEUDO": new RegExp("^" + pseudos),
            "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
            "bool": new RegExp("^(?:" + booleans + ")$", "i"),
            "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
          }, rhtml2 = /HTML$/i, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rnative = /^[^{]+\{\s*\[native \w/, rquickExpr2 = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, runescape = new RegExp("\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g"), funescape = function(escape, nonHex) {
            var high = "0x" + escape.slice(1) - 65536;
            return nonHex ? nonHex : high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
          }, rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g, fcssescape = function(ch, asCodePoint) {
            if (asCodePoint) {
              if (ch === "\0") {
                return "\uFFFD";
              }
              return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
            }
            return "\\" + ch;
          }, unloadHandler = function() {
            setDocument();
          }, inDisabledFieldset = addCombinator(function(elem) {
            return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
          }, { dir: "parentNode", next: "legend" });
          try {
            push2.apply(arr2 = slice2.call(preferredDoc.childNodes), preferredDoc.childNodes);
            arr2[preferredDoc.childNodes.length].nodeType;
          } catch (e) {
            push2 = {
              apply: arr2.length ? function(target, els) {
                pushNative.apply(target, slice2.call(els));
              } : function(target, els) {
                var j = target.length, i2 = 0;
                while (target[j++] = els[i2++]) {
                }
                target.length = j - 1;
              }
            };
          }
          function Sizzle2(selector, context, results, seed) {
            var m, i2, elem, nid, match, groups, newSelector, newContext = context && context.ownerDocument, nodeType = context ? context.nodeType : 9;
            results = results || [];
            if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
              return results;
            }
            if (!seed) {
              setDocument(context);
              context = context || document3;
              if (documentIsHTML) {
                if (nodeType !== 11 && (match = rquickExpr2.exec(selector))) {
                  if (m = match[1]) {
                    if (nodeType === 9) {
                      if (elem = context.getElementById(m)) {
                        if (elem.id === m) {
                          results.push(elem);
                          return results;
                        }
                      } else {
                        return results;
                      }
                    } else {
                      if (newContext && (elem = newContext.getElementById(m)) && contains(context, elem) && elem.id === m) {
                        results.push(elem);
                        return results;
                      }
                    }
                  } else if (match[2]) {
                    push2.apply(results, context.getElementsByTagName(selector));
                    return results;
                  } else if ((m = match[3]) && support2.getElementsByClassName && context.getElementsByClassName) {
                    push2.apply(results, context.getElementsByClassName(m));
                    return results;
                  }
                }
                if (support2.qsa && !nonnativeSelectorCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector)) && (nodeType !== 1 || context.nodeName.toLowerCase() !== "object")) {
                  newSelector = selector;
                  newContext = context;
                  if (nodeType === 1 && (rdescend.test(selector) || rcombinators.test(selector))) {
                    newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                    if (newContext !== context || !support2.scope) {
                      if (nid = context.getAttribute("id")) {
                        nid = nid.replace(rcssescape, fcssescape);
                      } else {
                        context.setAttribute("id", nid = expando);
                      }
                    }
                    groups = tokenize2(selector);
                    i2 = groups.length;
                    while (i2--) {
                      groups[i2] = (nid ? "#" + nid : ":scope") + " " + toSelector(groups[i2]);
                    }
                    newSelector = groups.join(",");
                  }
                  try {
                    push2.apply(results, newContext.querySelectorAll(newSelector));
                    return results;
                  } catch (qsaError) {
                    nonnativeSelectorCache(selector, true);
                  } finally {
                    if (nid === expando) {
                      context.removeAttribute("id");
                    }
                  }
                }
              }
            }
            return select(selector.replace(rtrim2, "$1"), context, results, seed);
          }
          function createCache() {
            var keys = [];
            function cache(key, value) {
              if (keys.push(key + " ") > Expr.cacheLength) {
                delete cache[keys.shift()];
              }
              return cache[key + " "] = value;
            }
            return cache;
          }
          function markFunction(fn) {
            fn[expando] = true;
            return fn;
          }
          function assert(fn) {
            var el = document3.createElement("fieldset");
            try {
              return !!fn(el);
            } catch (e) {
              return false;
            } finally {
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
              el = null;
            }
          }
          function addHandle(attrs, handler) {
            var arr3 = attrs.split("|"), i2 = arr3.length;
            while (i2--) {
              Expr.attrHandle[arr3[i2]] = handler;
            }
          }
          function siblingCheck(a, b) {
            var cur = b && a, diff = cur && a.nodeType === 1 && b.nodeType === 1 && a.sourceIndex - b.sourceIndex;
            if (diff) {
              return diff;
            }
            if (cur) {
              while (cur = cur.nextSibling) {
                if (cur === b) {
                  return -1;
                }
              }
            }
            return a ? 1 : -1;
          }
          function createInputPseudo(type) {
            return function(elem) {
              var name = elem.nodeName.toLowerCase();
              return name === "input" && elem.type === type;
            };
          }
          function createButtonPseudo(type) {
            return function(elem) {
              var name = elem.nodeName.toLowerCase();
              return (name === "input" || name === "button") && elem.type === type;
            };
          }
          function createDisabledPseudo(disabled) {
            return function(elem) {
              if ("form" in elem) {
                if (elem.parentNode && elem.disabled === false) {
                  if ("label" in elem) {
                    if ("label" in elem.parentNode) {
                      return elem.parentNode.disabled === disabled;
                    } else {
                      return elem.disabled === disabled;
                    }
                  }
                  return elem.isDisabled === disabled || elem.isDisabled !== !disabled && inDisabledFieldset(elem) === disabled;
                }
                return elem.disabled === disabled;
              } else if ("label" in elem) {
                return elem.disabled === disabled;
              }
              return false;
            };
          }
          function createPositionalPseudo(fn) {
            return markFunction(function(argument) {
              argument = +argument;
              return markFunction(function(seed, matches2) {
                var j, matchIndexes = fn([], seed.length, argument), i2 = matchIndexes.length;
                while (i2--) {
                  if (seed[j = matchIndexes[i2]]) {
                    seed[j] = !(matches2[j] = seed[j]);
                  }
                }
              });
            });
          }
          function testContext(context) {
            return context && typeof context.getElementsByTagName !== "undefined" && context;
          }
          support2 = Sizzle2.support = {};
          isXML = Sizzle2.isXML = function(elem) {
            var namespace = elem && elem.namespaceURI, docElem2 = elem && (elem.ownerDocument || elem).documentElement;
            return !rhtml2.test(namespace || docElem2 && docElem2.nodeName || "HTML");
          };
          setDocument = Sizzle2.setDocument = function(node) {
            var hasCompare, subWindow, doc = node ? node.ownerDocument || node : preferredDoc;
            if (doc == document3 || doc.nodeType !== 9 || !doc.documentElement) {
              return document3;
            }
            document3 = doc;
            docElem = document3.documentElement;
            documentIsHTML = !isXML(document3);
            if (preferredDoc != document3 && (subWindow = document3.defaultView) && subWindow.top !== subWindow) {
              if (subWindow.addEventListener) {
                subWindow.addEventListener("unload", unloadHandler, false);
              } else if (subWindow.attachEvent) {
                subWindow.attachEvent("onunload", unloadHandler);
              }
            }
            support2.scope = assert(function(el) {
              docElem.appendChild(el).appendChild(document3.createElement("div"));
              return typeof el.querySelectorAll !== "undefined" && !el.querySelectorAll(":scope fieldset div").length;
            });
            support2.attributes = assert(function(el) {
              el.className = "i";
              return !el.getAttribute("className");
            });
            support2.getElementsByTagName = assert(function(el) {
              el.appendChild(document3.createComment(""));
              return !el.getElementsByTagName("*").length;
            });
            support2.getElementsByClassName = rnative.test(document3.getElementsByClassName);
            support2.getById = assert(function(el) {
              docElem.appendChild(el).id = expando;
              return !document3.getElementsByName || !document3.getElementsByName(expando).length;
            });
            if (support2.getById) {
              Expr.filter["ID"] = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  return elem.getAttribute("id") === attrId;
                };
              };
              Expr.find["ID"] = function(id, context) {
                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                  var elem = context.getElementById(id);
                  return elem ? [elem] : [];
                }
              };
            } else {
              Expr.filter["ID"] = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  var node2 = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                  return node2 && node2.value === attrId;
                };
              };
              Expr.find["ID"] = function(id, context) {
                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                  var node2, i2, elems, elem = context.getElementById(id);
                  if (elem) {
                    node2 = elem.getAttributeNode("id");
                    if (node2 && node2.value === id) {
                      return [elem];
                    }
                    elems = context.getElementsByName(id);
                    i2 = 0;
                    while (elem = elems[i2++]) {
                      node2 = elem.getAttributeNode("id");
                      if (node2 && node2.value === id) {
                        return [elem];
                      }
                    }
                  }
                  return [];
                }
              };
            }
            Expr.find["TAG"] = support2.getElementsByTagName ? function(tag, context) {
              if (typeof context.getElementsByTagName !== "undefined") {
                return context.getElementsByTagName(tag);
              } else if (support2.qsa) {
                return context.querySelectorAll(tag);
              }
            } : function(tag, context) {
              var elem, tmp = [], i2 = 0, results = context.getElementsByTagName(tag);
              if (tag === "*") {
                while (elem = results[i2++]) {
                  if (elem.nodeType === 1) {
                    tmp.push(elem);
                  }
                }
                return tmp;
              }
              return results;
            };
            Expr.find["CLASS"] = support2.getElementsByClassName && function(className, context) {
              if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
                return context.getElementsByClassName(className);
              }
            };
            rbuggyMatches = [];
            rbuggyQSA = [];
            if (support2.qsa = rnative.test(document3.querySelectorAll)) {
              assert(function(el) {
                var input;
                docElem.appendChild(el).innerHTML = "<a id='" + expando + "'></a><select id='" + expando + "-\r\\' msallowcapture=''><option selected=''></option></select>";
                if (el.querySelectorAll("[msallowcapture^='']").length) {
                  rbuggyQSA.push("[*^$]=" + whitespace + `*(?:''|"")`);
                }
                if (!el.querySelectorAll("[selected]").length) {
                  rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
                }
                if (!el.querySelectorAll("[id~=" + expando + "-]").length) {
                  rbuggyQSA.push("~=");
                }
                input = document3.createElement("input");
                input.setAttribute("name", "");
                el.appendChild(input);
                if (!el.querySelectorAll("[name='']").length) {
                  rbuggyQSA.push("\\[" + whitespace + "*name" + whitespace + "*=" + whitespace + `*(?:''|"")`);
                }
                if (!el.querySelectorAll(":checked").length) {
                  rbuggyQSA.push(":checked");
                }
                if (!el.querySelectorAll("a#" + expando + "+*").length) {
                  rbuggyQSA.push(".#.+[+~]");
                }
                el.querySelectorAll("\\\f");
                rbuggyQSA.push("[\\r\\n\\f]");
              });
              assert(function(el) {
                el.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
                var input = document3.createElement("input");
                input.setAttribute("type", "hidden");
                el.appendChild(input).setAttribute("name", "D");
                if (el.querySelectorAll("[name=d]").length) {
                  rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
                }
                if (el.querySelectorAll(":enabled").length !== 2) {
                  rbuggyQSA.push(":enabled", ":disabled");
                }
                docElem.appendChild(el).disabled = true;
                if (el.querySelectorAll(":disabled").length !== 2) {
                  rbuggyQSA.push(":enabled", ":disabled");
                }
                el.querySelectorAll("*,:x");
                rbuggyQSA.push(",.*:");
              });
            }
            if (support2.matchesSelector = rnative.test(matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {
              assert(function(el) {
                support2.disconnectedMatch = matches.call(el, "*");
                matches.call(el, "[s!='']:x");
                rbuggyMatches.push("!=", pseudos);
              });
            }
            rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
            rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
            hasCompare = rnative.test(docElem.compareDocumentPosition);
            contains = hasCompare || rnative.test(docElem.contains) ? function(a, b) {
              var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
              return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
            } : function(a, b) {
              if (b) {
                while (b = b.parentNode) {
                  if (b === a) {
                    return true;
                  }
                }
              }
              return false;
            };
            sortOrder = hasCompare ? function(a, b) {
              if (a === b) {
                hasDuplicate = true;
                return 0;
              }
              var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
              if (compare) {
                return compare;
              }
              compare = (a.ownerDocument || a) == (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1;
              if (compare & 1 || !support2.sortDetached && b.compareDocumentPosition(a) === compare) {
                if (a == document3 || a.ownerDocument == preferredDoc && contains(preferredDoc, a)) {
                  return -1;
                }
                if (b == document3 || b.ownerDocument == preferredDoc && contains(preferredDoc, b)) {
                  return 1;
                }
                return sortInput ? indexOf3(sortInput, a) - indexOf3(sortInput, b) : 0;
              }
              return compare & 4 ? -1 : 1;
            } : function(a, b) {
              if (a === b) {
                hasDuplicate = true;
                return 0;
              }
              var cur, i2 = 0, aup = a.parentNode, bup = b.parentNode, ap = [a], bp = [b];
              if (!aup || !bup) {
                return a == document3 ? -1 : b == document3 ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf3(sortInput, a) - indexOf3(sortInput, b) : 0;
              } else if (aup === bup) {
                return siblingCheck(a, b);
              }
              cur = a;
              while (cur = cur.parentNode) {
                ap.unshift(cur);
              }
              cur = b;
              while (cur = cur.parentNode) {
                bp.unshift(cur);
              }
              while (ap[i2] === bp[i2]) {
                i2++;
              }
              return i2 ? siblingCheck(ap[i2], bp[i2]) : ap[i2] == preferredDoc ? -1 : bp[i2] == preferredDoc ? 1 : 0;
            };
            return document3;
          };
          Sizzle2.matches = function(expr, elements) {
            return Sizzle2(expr, null, null, elements);
          };
          Sizzle2.matchesSelector = function(elem, expr) {
            setDocument(elem);
            if (support2.matchesSelector && documentIsHTML && !nonnativeSelectorCache[expr + " "] && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
              try {
                var ret = matches.call(elem, expr);
                if (ret || support2.disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
                  return ret;
                }
              } catch (e) {
                nonnativeSelectorCache(expr, true);
              }
            }
            return Sizzle2(expr, document3, null, [elem]).length > 0;
          };
          Sizzle2.contains = function(context, elem) {
            if ((context.ownerDocument || context) != document3) {
              setDocument(context);
            }
            return contains(context, elem);
          };
          Sizzle2.attr = function(elem, name) {
            if ((elem.ownerDocument || elem) != document3) {
              setDocument(elem);
            }
            var fn = Expr.attrHandle[name.toLowerCase()], val = fn && hasOwn2.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : void 0;
            return val !== void 0 ? val : support2.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
          };
          Sizzle2.escape = function(sel) {
            return (sel + "").replace(rcssescape, fcssescape);
          };
          Sizzle2.error = function(msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
          };
          Sizzle2.uniqueSort = function(results) {
            var elem, duplicates = [], j = 0, i2 = 0;
            hasDuplicate = !support2.detectDuplicates;
            sortInput = !support2.sortStable && results.slice(0);
            results.sort(sortOrder);
            if (hasDuplicate) {
              while (elem = results[i2++]) {
                if (elem === results[i2]) {
                  j = duplicates.push(i2);
                }
              }
              while (j--) {
                results.splice(duplicates[j], 1);
              }
            }
            sortInput = null;
            return results;
          };
          getText = Sizzle2.getText = function(elem) {
            var node, ret = "", i2 = 0, nodeType = elem.nodeType;
            if (!nodeType) {
              while (node = elem[i2++]) {
                ret += getText(node);
              }
            } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
              if (typeof elem.textContent === "string") {
                return elem.textContent;
              } else {
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                  ret += getText(elem);
                }
              }
            } else if (nodeType === 3 || nodeType === 4) {
              return elem.nodeValue;
            }
            return ret;
          };
          Expr = Sizzle2.selectors = {
            cacheLength: 50,
            createPseudo: markFunction,
            match: matchExpr,
            attrHandle: {},
            find: {},
            relative: {
              ">": { dir: "parentNode", first: true },
              " ": { dir: "parentNode" },
              "+": { dir: "previousSibling", first: true },
              "~": { dir: "previousSibling" }
            },
            preFilter: {
              "ATTR": function(match) {
                match[1] = match[1].replace(runescape, funescape);
                match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);
                if (match[2] === "~=") {
                  match[3] = " " + match[3] + " ";
                }
                return match.slice(0, 4);
              },
              "CHILD": function(match) {
                match[1] = match[1].toLowerCase();
                if (match[1].slice(0, 3) === "nth") {
                  if (!match[3]) {
                    Sizzle2.error(match[0]);
                  }
                  match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
                  match[5] = +(match[7] + match[8] || match[3] === "odd");
                } else if (match[3]) {
                  Sizzle2.error(match[0]);
                }
                return match;
              },
              "PSEUDO": function(match) {
                var excess, unquoted = !match[6] && match[2];
                if (matchExpr["CHILD"].test(match[0])) {
                  return null;
                }
                if (match[3]) {
                  match[2] = match[4] || match[5] || "";
                } else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize2(unquoted, true)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
                  match[0] = match[0].slice(0, excess);
                  match[2] = unquoted.slice(0, excess);
                }
                return match.slice(0, 3);
              }
            },
            filter: {
              "TAG": function(nodeNameSelector) {
                var nodeName2 = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                return nodeNameSelector === "*" ? function() {
                  return true;
                } : function(elem) {
                  return elem.nodeName && elem.nodeName.toLowerCase() === nodeName2;
                };
              },
              "CLASS": function(className) {
                var pattern = classCache[className + " "];
                return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                  return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
                });
              },
              "ATTR": function(name, operator, check) {
                return function(elem) {
                  var result = Sizzle2.attr(elem, name);
                  if (result == null) {
                    return operator === "!=";
                  }
                  if (!operator) {
                    return true;
                  }
                  result += "";
                  return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
                };
              },
              "CHILD": function(type, what, _argument, first, last) {
                var simple = type.slice(0, 3) !== "nth", forward = type.slice(-4) !== "last", ofType = what === "of-type";
                return first === 1 && last === 0 ? function(elem) {
                  return !!elem.parentNode;
                } : function(elem, _context, xml) {
                  var cache, uniqueCache, outerCache, node, nodeIndex, start2, dir2 = simple !== forward ? "nextSibling" : "previousSibling", parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType, diff = false;
                  if (parent) {
                    if (simple) {
                      while (dir2) {
                        node = elem;
                        while (node = node[dir2]) {
                          if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                            return false;
                          }
                        }
                        start2 = dir2 = type === "only" && !start2 && "nextSibling";
                      }
                      return true;
                    }
                    start2 = [forward ? parent.firstChild : parent.lastChild];
                    if (forward && useCache) {
                      node = parent;
                      outerCache = node[expando] || (node[expando] = {});
                      uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                      cache = uniqueCache[type] || [];
                      nodeIndex = cache[0] === dirruns && cache[1];
                      diff = nodeIndex && cache[2];
                      node = nodeIndex && parent.childNodes[nodeIndex];
                      while (node = ++nodeIndex && node && node[dir2] || (diff = nodeIndex = 0) || start2.pop()) {
                        if (node.nodeType === 1 && ++diff && node === elem) {
                          uniqueCache[type] = [dirruns, nodeIndex, diff];
                          break;
                        }
                      }
                    } else {
                      if (useCache) {
                        node = elem;
                        outerCache = node[expando] || (node[expando] = {});
                        uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                        cache = uniqueCache[type] || [];
                        nodeIndex = cache[0] === dirruns && cache[1];
                        diff = nodeIndex;
                      }
                      if (diff === false) {
                        while (node = ++nodeIndex && node && node[dir2] || (diff = nodeIndex = 0) || start2.pop()) {
                          if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                            if (useCache) {
                              outerCache = node[expando] || (node[expando] = {});
                              uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                              uniqueCache[type] = [dirruns, diff];
                            }
                            if (node === elem) {
                              break;
                            }
                          }
                        }
                      }
                    }
                    diff -= last;
                    return diff === first || diff % first === 0 && diff / first >= 0;
                  }
                };
              },
              "PSEUDO": function(pseudo, argument) {
                var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle2.error("unsupported pseudo: " + pseudo);
                if (fn[expando]) {
                  return fn(argument);
                }
                if (fn.length > 1) {
                  args = [pseudo, pseudo, "", argument];
                  return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches2) {
                    var idx, matched = fn(seed, argument), i2 = matched.length;
                    while (i2--) {
                      idx = indexOf3(seed, matched[i2]);
                      seed[idx] = !(matches2[idx] = matched[i2]);
                    }
                  }) : function(elem) {
                    return fn(elem, 0, args);
                  };
                }
                return fn;
              }
            },
            pseudos: {
              "not": markFunction(function(selector) {
                var input = [], results = [], matcher = compile(selector.replace(rtrim2, "$1"));
                return matcher[expando] ? markFunction(function(seed, matches2, _context, xml) {
                  var elem, unmatched = matcher(seed, null, xml, []), i2 = seed.length;
                  while (i2--) {
                    if (elem = unmatched[i2]) {
                      seed[i2] = !(matches2[i2] = elem);
                    }
                  }
                }) : function(elem, _context, xml) {
                  input[0] = elem;
                  matcher(input, null, xml, results);
                  input[0] = null;
                  return !results.pop();
                };
              }),
              "has": markFunction(function(selector) {
                return function(elem) {
                  return Sizzle2(selector, elem).length > 0;
                };
              }),
              "contains": markFunction(function(text) {
                text = text.replace(runescape, funescape);
                return function(elem) {
                  return (elem.textContent || getText(elem)).indexOf(text) > -1;
                };
              }),
              "lang": markFunction(function(lang) {
                if (!ridentifier.test(lang || "")) {
                  Sizzle2.error("unsupported lang: " + lang);
                }
                lang = lang.replace(runescape, funescape).toLowerCase();
                return function(elem) {
                  var elemLang;
                  do {
                    if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                      elemLang = elemLang.toLowerCase();
                      return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                    }
                  } while ((elem = elem.parentNode) && elem.nodeType === 1);
                  return false;
                };
              }),
              "target": function(elem) {
                var hash = window3.location && window3.location.hash;
                return hash && hash.slice(1) === elem.id;
              },
              "root": function(elem) {
                return elem === docElem;
              },
              "focus": function(elem) {
                return elem === document3.activeElement && (!document3.hasFocus || document3.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
              },
              "enabled": createDisabledPseudo(false),
              "disabled": createDisabledPseudo(true),
              "checked": function(elem) {
                var nodeName2 = elem.nodeName.toLowerCase();
                return nodeName2 === "input" && !!elem.checked || nodeName2 === "option" && !!elem.selected;
              },
              "selected": function(elem) {
                if (elem.parentNode) {
                  elem.parentNode.selectedIndex;
                }
                return elem.selected === true;
              },
              "empty": function(elem) {
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                  if (elem.nodeType < 6) {
                    return false;
                  }
                }
                return true;
              },
              "parent": function(elem) {
                return !Expr.pseudos["empty"](elem);
              },
              "header": function(elem) {
                return rheader.test(elem.nodeName);
              },
              "input": function(elem) {
                return rinputs.test(elem.nodeName);
              },
              "button": function(elem) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && elem.type === "button" || name === "button";
              },
              "text": function(elem) {
                var attr;
                return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
              },
              "first": createPositionalPseudo(function() {
                return [0];
              }),
              "last": createPositionalPseudo(function(_matchIndexes, length) {
                return [length - 1];
              }),
              "eq": createPositionalPseudo(function(_matchIndexes, length, argument) {
                return [argument < 0 ? argument + length : argument];
              }),
              "even": createPositionalPseudo(function(matchIndexes, length) {
                var i2 = 0;
                for (; i2 < length; i2 += 2) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              "odd": createPositionalPseudo(function(matchIndexes, length) {
                var i2 = 1;
                for (; i2 < length; i2 += 2) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              "lt": createPositionalPseudo(function(matchIndexes, length, argument) {
                var i2 = argument < 0 ? argument + length : argument > length ? length : argument;
                for (; --i2 >= 0; ) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              "gt": createPositionalPseudo(function(matchIndexes, length, argument) {
                var i2 = argument < 0 ? argument + length : argument;
                for (; ++i2 < length; ) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              })
            }
          };
          Expr.pseudos["nth"] = Expr.pseudos["eq"];
          for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
            Expr.pseudos[i] = createInputPseudo(i);
          }
          for (i in { submit: true, reset: true }) {
            Expr.pseudos[i] = createButtonPseudo(i);
          }
          function setFilters() {
          }
          setFilters.prototype = Expr.filters = Expr.pseudos;
          Expr.setFilters = new setFilters();
          tokenize2 = Sizzle2.tokenize = function(selector, parseOnly) {
            var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
            if (cached) {
              return parseOnly ? 0 : cached.slice(0);
            }
            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;
            while (soFar) {
              if (!matched || (match = rcomma.exec(soFar))) {
                if (match) {
                  soFar = soFar.slice(match[0].length) || soFar;
                }
                groups.push(tokens = []);
              }
              matched = false;
              if (match = rcombinators.exec(soFar)) {
                matched = match.shift();
                tokens.push({
                  value: matched,
                  type: match[0].replace(rtrim2, " ")
                });
                soFar = soFar.slice(matched.length);
              }
              for (type in Expr.filter) {
                if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                  matched = match.shift();
                  tokens.push({
                    value: matched,
                    type,
                    matches: match
                  });
                  soFar = soFar.slice(matched.length);
                }
              }
              if (!matched) {
                break;
              }
            }
            return parseOnly ? soFar.length : soFar ? Sizzle2.error(selector) : tokenCache(selector, groups).slice(0);
          };
          function toSelector(tokens) {
            var i2 = 0, len = tokens.length, selector = "";
            for (; i2 < len; i2++) {
              selector += tokens[i2].value;
            }
            return selector;
          }
          function addCombinator(matcher, combinator, base) {
            var dir2 = combinator.dir, skip = combinator.next, key = skip || dir2, checkNonElements = base && key === "parentNode", doneName = done++;
            return combinator.first ? function(elem, context, xml) {
              while (elem = elem[dir2]) {
                if (elem.nodeType === 1 || checkNonElements) {
                  return matcher(elem, context, xml);
                }
              }
              return false;
            } : function(elem, context, xml) {
              var oldCache, uniqueCache, outerCache, newCache = [dirruns, doneName];
              if (xml) {
                while (elem = elem[dir2]) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    if (matcher(elem, context, xml)) {
                      return true;
                    }
                  }
                }
              } else {
                while (elem = elem[dir2]) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    outerCache = elem[expando] || (elem[expando] = {});
                    uniqueCache = outerCache[elem.uniqueID] || (outerCache[elem.uniqueID] = {});
                    if (skip && skip === elem.nodeName.toLowerCase()) {
                      elem = elem[dir2] || elem;
                    } else if ((oldCache = uniqueCache[key]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                      return newCache[2] = oldCache[2];
                    } else {
                      uniqueCache[key] = newCache;
                      if (newCache[2] = matcher(elem, context, xml)) {
                        return true;
                      }
                    }
                  }
                }
              }
              return false;
            };
          }
          function elementMatcher(matchers) {
            return matchers.length > 1 ? function(elem, context, xml) {
              var i2 = matchers.length;
              while (i2--) {
                if (!matchers[i2](elem, context, xml)) {
                  return false;
                }
              }
              return true;
            } : matchers[0];
          }
          function multipleContexts(selector, contexts, results) {
            var i2 = 0, len = contexts.length;
            for (; i2 < len; i2++) {
              Sizzle2(selector, contexts[i2], results);
            }
            return results;
          }
          function condense(unmatched, map, filter, context, xml) {
            var elem, newUnmatched = [], i2 = 0, len = unmatched.length, mapped = map != null;
            for (; i2 < len; i2++) {
              if (elem = unmatched[i2]) {
                if (!filter || filter(elem, context, xml)) {
                  newUnmatched.push(elem);
                  if (mapped) {
                    map.push(i2);
                  }
                }
              }
            }
            return newUnmatched;
          }
          function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
            if (postFilter && !postFilter[expando]) {
              postFilter = setMatcher(postFilter);
            }
            if (postFinder && !postFinder[expando]) {
              postFinder = setMatcher(postFinder, postSelector);
            }
            return markFunction(function(seed, results, context, xml) {
              var temp, i2, elem, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []), matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems, matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
              if (matcher) {
                matcher(matcherIn, matcherOut, context, xml);
              }
              if (postFilter) {
                temp = condense(matcherOut, postMap);
                postFilter(temp, [], context, xml);
                i2 = temp.length;
                while (i2--) {
                  if (elem = temp[i2]) {
                    matcherOut[postMap[i2]] = !(matcherIn[postMap[i2]] = elem);
                  }
                }
              }
              if (seed) {
                if (postFinder || preFilter) {
                  if (postFinder) {
                    temp = [];
                    i2 = matcherOut.length;
                    while (i2--) {
                      if (elem = matcherOut[i2]) {
                        temp.push(matcherIn[i2] = elem);
                      }
                    }
                    postFinder(null, matcherOut = [], temp, xml);
                  }
                  i2 = matcherOut.length;
                  while (i2--) {
                    if ((elem = matcherOut[i2]) && (temp = postFinder ? indexOf3(seed, elem) : preMap[i2]) > -1) {
                      seed[temp] = !(results[temp] = elem);
                    }
                  }
                }
              } else {
                matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
                if (postFinder) {
                  postFinder(null, results, matcherOut, xml);
                } else {
                  push2.apply(results, matcherOut);
                }
              }
            });
          }
          function matcherFromTokens(tokens) {
            var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i2 = leadingRelative ? 1 : 0, matchContext = addCombinator(function(elem) {
              return elem === checkContext;
            }, implicitRelative, true), matchAnyContext = addCombinator(function(elem) {
              return indexOf3(checkContext, elem) > -1;
            }, implicitRelative, true), matchers = [function(elem, context, xml) {
              var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
              checkContext = null;
              return ret;
            }];
            for (; i2 < len; i2++) {
              if (matcher = Expr.relative[tokens[i2].type]) {
                matchers = [addCombinator(elementMatcher(matchers), matcher)];
              } else {
                matcher = Expr.filter[tokens[i2].type].apply(null, tokens[i2].matches);
                if (matcher[expando]) {
                  j = ++i2;
                  for (; j < len; j++) {
                    if (Expr.relative[tokens[j].type]) {
                      break;
                    }
                  }
                  return setMatcher(i2 > 1 && elementMatcher(matchers), i2 > 1 && toSelector(tokens.slice(0, i2 - 1).concat({ value: tokens[i2 - 2].type === " " ? "*" : "" })).replace(rtrim2, "$1"), matcher, i2 < j && matcherFromTokens(tokens.slice(i2, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
                }
                matchers.push(matcher);
              }
            }
            return elementMatcher(matchers);
          }
          function matcherFromGroupMatchers(elementMatchers, setMatchers) {
            var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function(seed, context, xml, results, outermost) {
              var elem, j, matcher, matchedCount = 0, i2 = "0", unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && Expr.find["TAG"]("*", outermost), dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1, len = elems.length;
              if (outermost) {
                outermostContext = context == document3 || context || outermost;
              }
              for (; i2 !== len && (elem = elems[i2]) != null; i2++) {
                if (byElement && elem) {
                  j = 0;
                  if (!context && elem.ownerDocument != document3) {
                    setDocument(elem);
                    xml = !documentIsHTML;
                  }
                  while (matcher = elementMatchers[j++]) {
                    if (matcher(elem, context || document3, xml)) {
                      results.push(elem);
                      break;
                    }
                  }
                  if (outermost) {
                    dirruns = dirrunsUnique;
                  }
                }
                if (bySet) {
                  if (elem = !matcher && elem) {
                    matchedCount--;
                  }
                  if (seed) {
                    unmatched.push(elem);
                  }
                }
              }
              matchedCount += i2;
              if (bySet && i2 !== matchedCount) {
                j = 0;
                while (matcher = setMatchers[j++]) {
                  matcher(unmatched, setMatched, context, xml);
                }
                if (seed) {
                  if (matchedCount > 0) {
                    while (i2--) {
                      if (!(unmatched[i2] || setMatched[i2])) {
                        setMatched[i2] = pop.call(results);
                      }
                    }
                  }
                  setMatched = condense(setMatched);
                }
                push2.apply(results, setMatched);
                if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
                  Sizzle2.uniqueSort(results);
                }
              }
              if (outermost) {
                dirruns = dirrunsUnique;
                outermostContext = contextBackup;
              }
              return unmatched;
            };
            return bySet ? markFunction(superMatcher) : superMatcher;
          }
          compile = Sizzle2.compile = function(selector, match) {
            var i2, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + " "];
            if (!cached) {
              if (!match) {
                match = tokenize2(selector);
              }
              i2 = match.length;
              while (i2--) {
                cached = matcherFromTokens(match[i2]);
                if (cached[expando]) {
                  setMatchers.push(cached);
                } else {
                  elementMatchers.push(cached);
                }
              }
              cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
              cached.selector = selector;
            }
            return cached;
          };
          select = Sizzle2.select = function(selector, context, results, seed) {
            var i2, tokens, token, type, find, compiled = typeof selector === "function" && selector, match = !seed && tokenize2(selector = compiled.selector || selector);
            results = results || [];
            if (match.length === 1) {
              tokens = match[0] = match[0].slice(0);
              if (tokens.length > 2 && (token = tokens[0]).type === "ID" && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
                context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
                if (!context) {
                  return results;
                } else if (compiled) {
                  context = context.parentNode;
                }
                selector = selector.slice(tokens.shift().value.length);
              }
              i2 = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
              while (i2--) {
                token = tokens[i2];
                if (Expr.relative[type = token.type]) {
                  break;
                }
                if (find = Expr.find[type]) {
                  if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {
                    tokens.splice(i2, 1);
                    selector = seed.length && toSelector(tokens);
                    if (!selector) {
                      push2.apply(results, seed);
                      return results;
                    }
                    break;
                  }
                }
              }
            }
            (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, !context || rsibling.test(selector) && testContext(context.parentNode) || context);
            return results;
          };
          support2.sortStable = expando.split("").sort(sortOrder).join("") === expando;
          support2.detectDuplicates = !!hasDuplicate;
          setDocument();
          support2.sortDetached = assert(function(el) {
            return el.compareDocumentPosition(document3.createElement("fieldset")) & 1;
          });
          if (!assert(function(el) {
            el.innerHTML = "<a href='#'></a>";
            return el.firstChild.getAttribute("href") === "#";
          })) {
            addHandle("type|href|height|width", function(elem, name, isXML2) {
              if (!isXML2) {
                return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
              }
            });
          }
          if (!support2.attributes || !assert(function(el) {
            el.innerHTML = "<input/>";
            el.firstChild.setAttribute("value", "");
            return el.firstChild.getAttribute("value") === "";
          })) {
            addHandle("value", function(elem, _name, isXML2) {
              if (!isXML2 && elem.nodeName.toLowerCase() === "input") {
                return elem.defaultValue;
              }
            });
          }
          if (!assert(function(el) {
            return el.getAttribute("disabled") == null;
          })) {
            addHandle(booleans, function(elem, name, isXML2) {
              var val;
              if (!isXML2) {
                return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
              }
            });
          }
          return Sizzle2;
        }(window2);
        jQuery2.find = Sizzle;
        jQuery2.expr = Sizzle.selectors;
        jQuery2.expr[":"] = jQuery2.expr.pseudos;
        jQuery2.uniqueSort = jQuery2.unique = Sizzle.uniqueSort;
        jQuery2.text = Sizzle.getText;
        jQuery2.isXMLDoc = Sizzle.isXML;
        jQuery2.contains = Sizzle.contains;
        jQuery2.escapeSelector = Sizzle.escape;
        var dir = function(elem, dir2, until) {
          var matched = [], truncate = until !== void 0;
          while ((elem = elem[dir2]) && elem.nodeType !== 9) {
            if (elem.nodeType === 1) {
              if (truncate && jQuery2(elem).is(until)) {
                break;
              }
              matched.push(elem);
            }
          }
          return matched;
        };
        var siblings = function(n, elem) {
          var matched = [];
          for (; n; n = n.nextSibling) {
            if (n.nodeType === 1 && n !== elem) {
              matched.push(n);
            }
          }
          return matched;
        };
        var rneedsContext = jQuery2.expr.match.needsContext;
        function nodeName(elem, name) {
          return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        }
        var rsingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
        function winnow(elements, qualifier, not) {
          if (isFunction(qualifier)) {
            return jQuery2.grep(elements, function(elem, i) {
              return !!qualifier.call(elem, i, elem) !== not;
            });
          }
          if (qualifier.nodeType) {
            return jQuery2.grep(elements, function(elem) {
              return elem === qualifier !== not;
            });
          }
          if (typeof qualifier !== "string") {
            return jQuery2.grep(elements, function(elem) {
              return indexOf2.call(qualifier, elem) > -1 !== not;
            });
          }
          return jQuery2.filter(qualifier, elements, not);
        }
        jQuery2.filter = function(expr, elems, not) {
          var elem = elems[0];
          if (not) {
            expr = ":not(" + expr + ")";
          }
          if (elems.length === 1 && elem.nodeType === 1) {
            return jQuery2.find.matchesSelector(elem, expr) ? [elem] : [];
          }
          return jQuery2.find.matches(expr, jQuery2.grep(elems, function(elem2) {
            return elem2.nodeType === 1;
          }));
        };
        jQuery2.fn.extend({
          find: function(selector) {
            var i, ret, len = this.length, self2 = this;
            if (typeof selector !== "string") {
              return this.pushStack(jQuery2(selector).filter(function() {
                for (i = 0; i < len; i++) {
                  if (jQuery2.contains(self2[i], this)) {
                    return true;
                  }
                }
              }));
            }
            ret = this.pushStack([]);
            for (i = 0; i < len; i++) {
              jQuery2.find(selector, self2[i], ret);
            }
            return len > 1 ? jQuery2.uniqueSort(ret) : ret;
          },
          filter: function(selector) {
            return this.pushStack(winnow(this, selector || [], false));
          },
          not: function(selector) {
            return this.pushStack(winnow(this, selector || [], true));
          },
          is: function(selector) {
            return !!winnow(this, typeof selector === "string" && rneedsContext.test(selector) ? jQuery2(selector) : selector || [], false).length;
          }
        });
        var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/, init = jQuery2.fn.init = function(selector, context, root) {
          var match, elem;
          if (!selector) {
            return this;
          }
          root = root || rootjQuery;
          if (typeof selector === "string") {
            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
              match = [null, selector, null];
            } else {
              match = rquickExpr.exec(selector);
            }
            if (match && (match[1] || !context)) {
              if (match[1]) {
                context = context instanceof jQuery2 ? context[0] : context;
                jQuery2.merge(this, jQuery2.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document2, true));
                if (rsingleTag.test(match[1]) && jQuery2.isPlainObject(context)) {
                  for (match in context) {
                    if (isFunction(this[match])) {
                      this[match](context[match]);
                    } else {
                      this.attr(match, context[match]);
                    }
                  }
                }
                return this;
              } else {
                elem = document2.getElementById(match[2]);
                if (elem) {
                  this[0] = elem;
                  this.length = 1;
                }
                return this;
              }
            } else if (!context || context.jquery) {
              return (context || root).find(selector);
            } else {
              return this.constructor(context).find(selector);
            }
          } else if (selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;
          } else if (isFunction(selector)) {
            return root.ready !== void 0 ? root.ready(selector) : selector(jQuery2);
          }
          return jQuery2.makeArray(selector, this);
        };
        init.prototype = jQuery2.fn;
        rootjQuery = jQuery2(document2);
        var rparentsprev = /^(?:parents|prev(?:Until|All))/, guaranteedUnique = {
          children: true,
          contents: true,
          next: true,
          prev: true
        };
        jQuery2.fn.extend({
          has: function(target) {
            var targets = jQuery2(target, this), l = targets.length;
            return this.filter(function() {
              var i = 0;
              for (; i < l; i++) {
                if (jQuery2.contains(this, targets[i])) {
                  return true;
                }
              }
            });
          },
          closest: function(selectors, context) {
            var cur, i = 0, l = this.length, matched = [], targets = typeof selectors !== "string" && jQuery2(selectors);
            if (!rneedsContext.test(selectors)) {
              for (; i < l; i++) {
                for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
                  if (cur.nodeType < 11 && (targets ? targets.index(cur) > -1 : cur.nodeType === 1 && jQuery2.find.matchesSelector(cur, selectors))) {
                    matched.push(cur);
                    break;
                  }
                }
              }
            }
            return this.pushStack(matched.length > 1 ? jQuery2.uniqueSort(matched) : matched);
          },
          index: function(elem) {
            if (!elem) {
              return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
            }
            if (typeof elem === "string") {
              return indexOf2.call(jQuery2(elem), this[0]);
            }
            return indexOf2.call(this, elem.jquery ? elem[0] : elem);
          },
          add: function(selector, context) {
            return this.pushStack(jQuery2.uniqueSort(jQuery2.merge(this.get(), jQuery2(selector, context))));
          },
          addBack: function(selector) {
            return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
          }
        });
        function sibling(cur, dir2) {
          while ((cur = cur[dir2]) && cur.nodeType !== 1) {
          }
          return cur;
        }
        jQuery2.each({
          parent: function(elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
          },
          parents: function(elem) {
            return dir(elem, "parentNode");
          },
          parentsUntil: function(elem, _i, until) {
            return dir(elem, "parentNode", until);
          },
          next: function(elem) {
            return sibling(elem, "nextSibling");
          },
          prev: function(elem) {
            return sibling(elem, "previousSibling");
          },
          nextAll: function(elem) {
            return dir(elem, "nextSibling");
          },
          prevAll: function(elem) {
            return dir(elem, "previousSibling");
          },
          nextUntil: function(elem, _i, until) {
            return dir(elem, "nextSibling", until);
          },
          prevUntil: function(elem, _i, until) {
            return dir(elem, "previousSibling", until);
          },
          siblings: function(elem) {
            return siblings((elem.parentNode || {}).firstChild, elem);
          },
          children: function(elem) {
            return siblings(elem.firstChild);
          },
          contents: function(elem) {
            if (elem.contentDocument != null && getProto(elem.contentDocument)) {
              return elem.contentDocument;
            }
            if (nodeName(elem, "template")) {
              elem = elem.content || elem;
            }
            return jQuery2.merge([], elem.childNodes);
          }
        }, function(name, fn) {
          jQuery2.fn[name] = function(until, selector) {
            var matched = jQuery2.map(this, fn, until);
            if (name.slice(-5) !== "Until") {
              selector = until;
            }
            if (selector && typeof selector === "string") {
              matched = jQuery2.filter(selector, matched);
            }
            if (this.length > 1) {
              if (!guaranteedUnique[name]) {
                jQuery2.uniqueSort(matched);
              }
              if (rparentsprev.test(name)) {
                matched.reverse();
              }
            }
            return this.pushStack(matched);
          };
        });
        var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;
        function createOptions(options) {
          var object = {};
          jQuery2.each(options.match(rnothtmlwhite) || [], function(_, flag) {
            object[flag] = true;
          });
          return object;
        }
        jQuery2.Callbacks = function(options) {
          options = typeof options === "string" ? createOptions(options) : jQuery2.extend({}, options);
          var firing, memory, fired, locked, list = [], queue = [], firingIndex = -1, fire = function() {
            locked = locked || options.once;
            fired = firing = true;
            for (; queue.length; firingIndex = -1) {
              memory = queue.shift();
              while (++firingIndex < list.length) {
                if (list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {
                  firingIndex = list.length;
                  memory = false;
                }
              }
            }
            if (!options.memory) {
              memory = false;
            }
            firing = false;
            if (locked) {
              if (memory) {
                list = [];
              } else {
                list = "";
              }
            }
          }, self2 = {
            add: function() {
              if (list) {
                if (memory && !firing) {
                  firingIndex = list.length - 1;
                  queue.push(memory);
                }
                (function add2(args) {
                  jQuery2.each(args, function(_, arg) {
                    if (isFunction(arg)) {
                      if (!options.unique || !self2.has(arg)) {
                        list.push(arg);
                      }
                    } else if (arg && arg.length && toType(arg) !== "string") {
                      add2(arg);
                    }
                  });
                })(arguments);
                if (memory && !firing) {
                  fire();
                }
              }
              return this;
            },
            remove: function() {
              jQuery2.each(arguments, function(_, arg) {
                var index;
                while ((index = jQuery2.inArray(arg, list, index)) > -1) {
                  list.splice(index, 1);
                  if (index <= firingIndex) {
                    firingIndex--;
                  }
                }
              });
              return this;
            },
            has: function(fn) {
              return fn ? jQuery2.inArray(fn, list) > -1 : list.length > 0;
            },
            empty: function() {
              if (list) {
                list = [];
              }
              return this;
            },
            disable: function() {
              locked = queue = [];
              list = memory = "";
              return this;
            },
            disabled: function() {
              return !list;
            },
            lock: function() {
              locked = queue = [];
              if (!memory && !firing) {
                list = memory = "";
              }
              return this;
            },
            locked: function() {
              return !!locked;
            },
            fireWith: function(context, args) {
              if (!locked) {
                args = args || [];
                args = [context, args.slice ? args.slice() : args];
                queue.push(args);
                if (!firing) {
                  fire();
                }
              }
              return this;
            },
            fire: function() {
              self2.fireWith(this, arguments);
              return this;
            },
            fired: function() {
              return !!fired;
            }
          };
          return self2;
        };
        function Identity(v) {
          return v;
        }
        function Thrower(ex) {
          throw ex;
        }
        function adoptValue(value, resolve, reject, noValue) {
          var method;
          try {
            if (value && isFunction(method = value.promise)) {
              method.call(value).done(resolve).fail(reject);
            } else if (value && isFunction(method = value.then)) {
              method.call(value, resolve, reject);
            } else {
              resolve.apply(void 0, [value].slice(noValue));
            }
          } catch (value2) {
            reject.apply(void 0, [value2]);
          }
        }
        jQuery2.extend({
          Deferred: function(func) {
            var tuples = [
              [
                "notify",
                "progress",
                jQuery2.Callbacks("memory"),
                jQuery2.Callbacks("memory"),
                2
              ],
              [
                "resolve",
                "done",
                jQuery2.Callbacks("once memory"),
                jQuery2.Callbacks("once memory"),
                0,
                "resolved"
              ],
              [
                "reject",
                "fail",
                jQuery2.Callbacks("once memory"),
                jQuery2.Callbacks("once memory"),
                1,
                "rejected"
              ]
            ], state = "pending", promise = {
              state: function() {
                return state;
              },
              always: function() {
                deferred.done(arguments).fail(arguments);
                return this;
              },
              "catch": function(fn) {
                return promise.then(null, fn);
              },
              pipe: function() {
                var fns = arguments;
                return jQuery2.Deferred(function(newDefer) {
                  jQuery2.each(tuples, function(_i, tuple) {
                    var fn = isFunction(fns[tuple[4]]) && fns[tuple[4]];
                    deferred[tuple[1]](function() {
                      var returned = fn && fn.apply(this, arguments);
                      if (returned && isFunction(returned.promise)) {
                        returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);
                      } else {
                        newDefer[tuple[0] + "With"](this, fn ? [returned] : arguments);
                      }
                    });
                  });
                  fns = null;
                }).promise();
              },
              then: function(onFulfilled, onRejected, onProgress) {
                var maxDepth = 0;
                function resolve(depth, deferred2, handler, special) {
                  return function() {
                    var that = this, args = arguments, mightThrow = function() {
                      var returned, then;
                      if (depth < maxDepth) {
                        return;
                      }
                      returned = handler.apply(that, args);
                      if (returned === deferred2.promise()) {
                        throw new TypeError("Thenable self-resolution");
                      }
                      then = returned && (typeof returned === "object" || typeof returned === "function") && returned.then;
                      if (isFunction(then)) {
                        if (special) {
                          then.call(returned, resolve(maxDepth, deferred2, Identity, special), resolve(maxDepth, deferred2, Thrower, special));
                        } else {
                          maxDepth++;
                          then.call(returned, resolve(maxDepth, deferred2, Identity, special), resolve(maxDepth, deferred2, Thrower, special), resolve(maxDepth, deferred2, Identity, deferred2.notifyWith));
                        }
                      } else {
                        if (handler !== Identity) {
                          that = void 0;
                          args = [returned];
                        }
                        (special || deferred2.resolveWith)(that, args);
                      }
                    }, process = special ? mightThrow : function() {
                      try {
                        mightThrow();
                      } catch (e) {
                        if (jQuery2.Deferred.exceptionHook) {
                          jQuery2.Deferred.exceptionHook(e, process.stackTrace);
                        }
                        if (depth + 1 >= maxDepth) {
                          if (handler !== Thrower) {
                            that = void 0;
                            args = [e];
                          }
                          deferred2.rejectWith(that, args);
                        }
                      }
                    };
                    if (depth) {
                      process();
                    } else {
                      if (jQuery2.Deferred.getStackHook) {
                        process.stackTrace = jQuery2.Deferred.getStackHook();
                      }
                      window2.setTimeout(process);
                    }
                  };
                }
                return jQuery2.Deferred(function(newDefer) {
                  tuples[0][3].add(resolve(0, newDefer, isFunction(onProgress) ? onProgress : Identity, newDefer.notifyWith));
                  tuples[1][3].add(resolve(0, newDefer, isFunction(onFulfilled) ? onFulfilled : Identity));
                  tuples[2][3].add(resolve(0, newDefer, isFunction(onRejected) ? onRejected : Thrower));
                }).promise();
              },
              promise: function(obj) {
                return obj != null ? jQuery2.extend(obj, promise) : promise;
              }
            }, deferred = {};
            jQuery2.each(tuples, function(i, tuple) {
              var list = tuple[2], stateString = tuple[5];
              promise[tuple[1]] = list.add;
              if (stateString) {
                list.add(function() {
                  state = stateString;
                }, tuples[3 - i][2].disable, tuples[3 - i][3].disable, tuples[0][2].lock, tuples[0][3].lock);
              }
              list.add(tuple[3].fire);
              deferred[tuple[0]] = function() {
                deferred[tuple[0] + "With"](this === deferred ? void 0 : this, arguments);
                return this;
              };
              deferred[tuple[0] + "With"] = list.fireWith;
            });
            promise.promise(deferred);
            if (func) {
              func.call(deferred, deferred);
            }
            return deferred;
          },
          when: function(singleValue) {
            var remaining = arguments.length, i = remaining, resolveContexts = Array(i), resolveValues = slice.call(arguments), primary = jQuery2.Deferred(), updateFunc = function(i2) {
              return function(value) {
                resolveContexts[i2] = this;
                resolveValues[i2] = arguments.length > 1 ? slice.call(arguments) : value;
                if (!--remaining) {
                  primary.resolveWith(resolveContexts, resolveValues);
                }
              };
            };
            if (remaining <= 1) {
              adoptValue(singleValue, primary.done(updateFunc(i)).resolve, primary.reject, !remaining);
              if (primary.state() === "pending" || isFunction(resolveValues[i] && resolveValues[i].then)) {
                return primary.then();
              }
            }
            while (i--) {
              adoptValue(resolveValues[i], updateFunc(i), primary.reject);
            }
            return primary.promise();
          }
        });
        var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
        jQuery2.Deferred.exceptionHook = function(error2, stack) {
          if (window2.console && window2.console.warn && error2 && rerrorNames.test(error2.name)) {
            window2.console.warn("jQuery.Deferred exception: " + error2.message, error2.stack, stack);
          }
        };
        jQuery2.readyException = function(error2) {
          window2.setTimeout(function() {
            throw error2;
          });
        };
        var readyList = jQuery2.Deferred();
        jQuery2.fn.ready = function(fn) {
          readyList.then(fn).catch(function(error2) {
            jQuery2.readyException(error2);
          });
          return this;
        };
        jQuery2.extend({
          isReady: false,
          readyWait: 1,
          ready: function(wait) {
            if (wait === true ? --jQuery2.readyWait : jQuery2.isReady) {
              return;
            }
            jQuery2.isReady = true;
            if (wait !== true && --jQuery2.readyWait > 0) {
              return;
            }
            readyList.resolveWith(document2, [jQuery2]);
          }
        });
        jQuery2.ready.then = readyList.then;
        function completed() {
          document2.removeEventListener("DOMContentLoaded", completed);
          window2.removeEventListener("load", completed);
          jQuery2.ready();
        }
        if (document2.readyState === "complete" || document2.readyState !== "loading" && !document2.documentElement.doScroll) {
          window2.setTimeout(jQuery2.ready);
        } else {
          document2.addEventListener("DOMContentLoaded", completed);
          window2.addEventListener("load", completed);
        }
        var access = function(elems, fn, key, value, chainable, emptyGet, raw) {
          var i = 0, len = elems.length, bulk = key == null;
          if (toType(key) === "object") {
            chainable = true;
            for (i in key) {
              access(elems, fn, i, key[i], true, emptyGet, raw);
            }
          } else if (value !== void 0) {
            chainable = true;
            if (!isFunction(value)) {
              raw = true;
            }
            if (bulk) {
              if (raw) {
                fn.call(elems, value);
                fn = null;
              } else {
                bulk = fn;
                fn = function(elem, _key, value2) {
                  return bulk.call(jQuery2(elem), value2);
                };
              }
            }
            if (fn) {
              for (; i < len; i++) {
                fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
              }
            }
          }
          if (chainable) {
            return elems;
          }
          if (bulk) {
            return fn.call(elems);
          }
          return len ? fn(elems[0], key) : emptyGet;
        };
        var rmsPrefix = /^-ms-/, rdashAlpha = /-([a-z])/g;
        function fcamelCase(_all, letter) {
          return letter.toUpperCase();
        }
        function camelCase(string) {
          return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        }
        var acceptData = function(owner) {
          return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
        };
        function Data() {
          this.expando = jQuery2.expando + Data.uid++;
        }
        Data.uid = 1;
        Data.prototype = {
          cache: function(owner) {
            var value = owner[this.expando];
            if (!value) {
              value = {};
              if (acceptData(owner)) {
                if (owner.nodeType) {
                  owner[this.expando] = value;
                } else {
                  Object.defineProperty(owner, this.expando, {
                    value,
                    configurable: true
                  });
                }
              }
            }
            return value;
          },
          set: function(owner, data, value) {
            var prop, cache = this.cache(owner);
            if (typeof data === "string") {
              cache[camelCase(data)] = value;
            } else {
              for (prop in data) {
                cache[camelCase(prop)] = data[prop];
              }
            }
            return cache;
          },
          get: function(owner, key) {
            return key === void 0 ? this.cache(owner) : owner[this.expando] && owner[this.expando][camelCase(key)];
          },
          access: function(owner, key, value) {
            if (key === void 0 || key && typeof key === "string" && value === void 0) {
              return this.get(owner, key);
            }
            this.set(owner, key, value);
            return value !== void 0 ? value : key;
          },
          remove: function(owner, key) {
            var i, cache = owner[this.expando];
            if (cache === void 0) {
              return;
            }
            if (key !== void 0) {
              if (Array.isArray(key)) {
                key = key.map(camelCase);
              } else {
                key = camelCase(key);
                key = key in cache ? [key] : key.match(rnothtmlwhite) || [];
              }
              i = key.length;
              while (i--) {
                delete cache[key[i]];
              }
            }
            if (key === void 0 || jQuery2.isEmptyObject(cache)) {
              if (owner.nodeType) {
                owner[this.expando] = void 0;
              } else {
                delete owner[this.expando];
              }
            }
          },
          hasData: function(owner) {
            var cache = owner[this.expando];
            return cache !== void 0 && !jQuery2.isEmptyObject(cache);
          }
        };
        var dataPriv = new Data();
        var dataUser = new Data();
        var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /[A-Z]/g;
        function getData(data) {
          if (data === "true") {
            return true;
          }
          if (data === "false") {
            return false;
          }
          if (data === "null") {
            return null;
          }
          if (data === +data + "") {
            return +data;
          }
          if (rbrace.test(data)) {
            return JSON.parse(data);
          }
          return data;
        }
        function dataAttr(elem, key, data) {
          var name;
          if (data === void 0 && elem.nodeType === 1) {
            name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
            data = elem.getAttribute(name);
            if (typeof data === "string") {
              try {
                data = getData(data);
              } catch (e) {
              }
              dataUser.set(elem, key, data);
            } else {
              data = void 0;
            }
          }
          return data;
        }
        jQuery2.extend({
          hasData: function(elem) {
            return dataUser.hasData(elem) || dataPriv.hasData(elem);
          },
          data: function(elem, name, data) {
            return dataUser.access(elem, name, data);
          },
          removeData: function(elem, name) {
            dataUser.remove(elem, name);
          },
          _data: function(elem, name, data) {
            return dataPriv.access(elem, name, data);
          },
          _removeData: function(elem, name) {
            dataPriv.remove(elem, name);
          }
        });
        jQuery2.fn.extend({
          data: function(key, value) {
            var i, name, data, elem = this[0], attrs = elem && elem.attributes;
            if (key === void 0) {
              if (this.length) {
                data = dataUser.get(elem);
                if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
                  i = attrs.length;
                  while (i--) {
                    if (attrs[i]) {
                      name = attrs[i].name;
                      if (name.indexOf("data-") === 0) {
                        name = camelCase(name.slice(5));
                        dataAttr(elem, name, data[name]);
                      }
                    }
                  }
                  dataPriv.set(elem, "hasDataAttrs", true);
                }
              }
              return data;
            }
            if (typeof key === "object") {
              return this.each(function() {
                dataUser.set(this, key);
              });
            }
            return access(this, function(value2) {
              var data2;
              if (elem && value2 === void 0) {
                data2 = dataUser.get(elem, key);
                if (data2 !== void 0) {
                  return data2;
                }
                data2 = dataAttr(elem, key);
                if (data2 !== void 0) {
                  return data2;
                }
                return;
              }
              this.each(function() {
                dataUser.set(this, key, value2);
              });
            }, null, value, arguments.length > 1, null, true);
          },
          removeData: function(key) {
            return this.each(function() {
              dataUser.remove(this, key);
            });
          }
        });
        jQuery2.extend({
          queue: function(elem, type, data) {
            var queue;
            if (elem) {
              type = (type || "fx") + "queue";
              queue = dataPriv.get(elem, type);
              if (data) {
                if (!queue || Array.isArray(data)) {
                  queue = dataPriv.access(elem, type, jQuery2.makeArray(data));
                } else {
                  queue.push(data);
                }
              }
              return queue || [];
            }
          },
          dequeue: function(elem, type) {
            type = type || "fx";
            var queue = jQuery2.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery2._queueHooks(elem, type), next = function() {
              jQuery2.dequeue(elem, type);
            };
            if (fn === "inprogress") {
              fn = queue.shift();
              startLength--;
            }
            if (fn) {
              if (type === "fx") {
                queue.unshift("inprogress");
              }
              delete hooks.stop;
              fn.call(elem, next, hooks);
            }
            if (!startLength && hooks) {
              hooks.empty.fire();
            }
          },
          _queueHooks: function(elem, type) {
            var key = type + "queueHooks";
            return dataPriv.get(elem, key) || dataPriv.access(elem, key, {
              empty: jQuery2.Callbacks("once memory").add(function() {
                dataPriv.remove(elem, [type + "queue", key]);
              })
            });
          }
        });
        jQuery2.fn.extend({
          queue: function(type, data) {
            var setter = 2;
            if (typeof type !== "string") {
              data = type;
              type = "fx";
              setter--;
            }
            if (arguments.length < setter) {
              return jQuery2.queue(this[0], type);
            }
            return data === void 0 ? this : this.each(function() {
              var queue = jQuery2.queue(this, type, data);
              jQuery2._queueHooks(this, type);
              if (type === "fx" && queue[0] !== "inprogress") {
                jQuery2.dequeue(this, type);
              }
            });
          },
          dequeue: function(type) {
            return this.each(function() {
              jQuery2.dequeue(this, type);
            });
          },
          clearQueue: function(type) {
            return this.queue(type || "fx", []);
          },
          promise: function(type, obj) {
            var tmp, count = 1, defer = jQuery2.Deferred(), elements = this, i = this.length, resolve = function() {
              if (!--count) {
                defer.resolveWith(elements, [elements]);
              }
            };
            if (typeof type !== "string") {
              obj = type;
              type = void 0;
            }
            type = type || "fx";
            while (i--) {
              tmp = dataPriv.get(elements[i], type + "queueHooks");
              if (tmp && tmp.empty) {
                count++;
                tmp.empty.add(resolve);
              }
            }
            resolve();
            return defer.promise(obj);
          }
        });
        var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
        var rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");
        var cssExpand = ["Top", "Right", "Bottom", "Left"];
        var documentElement = document2.documentElement;
        var isAttached = function(elem) {
          return jQuery2.contains(elem.ownerDocument, elem);
        }, composed = { composed: true };
        if (documentElement.getRootNode) {
          isAttached = function(elem) {
            return jQuery2.contains(elem.ownerDocument, elem) || elem.getRootNode(composed) === elem.ownerDocument;
          };
        }
        var isHiddenWithinTree = function(elem, el) {
          elem = el || elem;
          return elem.style.display === "none" || elem.style.display === "" && isAttached(elem) && jQuery2.css(elem, "display") === "none";
        };
        function adjustCSS(elem, prop, valueParts, tween) {
          var adjusted, scale, maxIterations = 20, currentValue = tween ? function() {
            return tween.cur();
          } : function() {
            return jQuery2.css(elem, prop, "");
          }, initial = currentValue(), unit = valueParts && valueParts[3] || (jQuery2.cssNumber[prop] ? "" : "px"), initialInUnit = elem.nodeType && (jQuery2.cssNumber[prop] || unit !== "px" && +initial) && rcssNum.exec(jQuery2.css(elem, prop));
          if (initialInUnit && initialInUnit[3] !== unit) {
            initial = initial / 2;
            unit = unit || initialInUnit[3];
            initialInUnit = +initial || 1;
            while (maxIterations--) {
              jQuery2.style(elem, prop, initialInUnit + unit);
              if ((1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <= 0) {
                maxIterations = 0;
              }
              initialInUnit = initialInUnit / scale;
            }
            initialInUnit = initialInUnit * 2;
            jQuery2.style(elem, prop, initialInUnit + unit);
            valueParts = valueParts || [];
          }
          if (valueParts) {
            initialInUnit = +initialInUnit || +initial || 0;
            adjusted = valueParts[1] ? initialInUnit + (valueParts[1] + 1) * valueParts[2] : +valueParts[2];
            if (tween) {
              tween.unit = unit;
              tween.start = initialInUnit;
              tween.end = adjusted;
            }
          }
          return adjusted;
        }
        var defaultDisplayMap = {};
        function getDefaultDisplay(elem) {
          var temp, doc = elem.ownerDocument, nodeName2 = elem.nodeName, display = defaultDisplayMap[nodeName2];
          if (display) {
            return display;
          }
          temp = doc.body.appendChild(doc.createElement(nodeName2));
          display = jQuery2.css(temp, "display");
          temp.parentNode.removeChild(temp);
          if (display === "none") {
            display = "block";
          }
          defaultDisplayMap[nodeName2] = display;
          return display;
        }
        function showHide(elements, show) {
          var display, elem, values = [], index = 0, length = elements.length;
          for (; index < length; index++) {
            elem = elements[index];
            if (!elem.style) {
              continue;
            }
            display = elem.style.display;
            if (show) {
              if (display === "none") {
                values[index] = dataPriv.get(elem, "display") || null;
                if (!values[index]) {
                  elem.style.display = "";
                }
              }
              if (elem.style.display === "" && isHiddenWithinTree(elem)) {
                values[index] = getDefaultDisplay(elem);
              }
            } else {
              if (display !== "none") {
                values[index] = "none";
                dataPriv.set(elem, "display", display);
              }
            }
          }
          for (index = 0; index < length; index++) {
            if (values[index] != null) {
              elements[index].style.display = values[index];
            }
          }
          return elements;
        }
        jQuery2.fn.extend({
          show: function() {
            return showHide(this, true);
          },
          hide: function() {
            return showHide(this);
          },
          toggle: function(state) {
            if (typeof state === "boolean") {
              return state ? this.show() : this.hide();
            }
            return this.each(function() {
              if (isHiddenWithinTree(this)) {
                jQuery2(this).show();
              } else {
                jQuery2(this).hide();
              }
            });
          }
        });
        var rcheckableType = /^(?:checkbox|radio)$/i;
        var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
        var rscriptType = /^$|^module$|\/(?:java|ecma)script/i;
        (function() {
          var fragment = document2.createDocumentFragment(), div = fragment.appendChild(document2.createElement("div")), input = document2.createElement("input");
          input.setAttribute("type", "radio");
          input.setAttribute("checked", "checked");
          input.setAttribute("name", "t");
          div.appendChild(input);
          support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
          div.innerHTML = "<textarea>x</textarea>";
          support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
          div.innerHTML = "<option></option>";
          support.option = !!div.lastChild;
        })();
        var wrapMap = {
          thead: [1, "<table>", "</table>"],
          col: [2, "<table><colgroup>", "</colgroup></table>"],
          tr: [2, "<table><tbody>", "</tbody></table>"],
          td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
          _default: [0, "", ""]
        };
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
        wrapMap.th = wrapMap.td;
        if (!support.option) {
          wrapMap.optgroup = wrapMap.option = [1, "<select multiple='multiple'>", "</select>"];
        }
        function getAll(context, tag) {
          var ret;
          if (typeof context.getElementsByTagName !== "undefined") {
            ret = context.getElementsByTagName(tag || "*");
          } else if (typeof context.querySelectorAll !== "undefined") {
            ret = context.querySelectorAll(tag || "*");
          } else {
            ret = [];
          }
          if (tag === void 0 || tag && nodeName(context, tag)) {
            return jQuery2.merge([context], ret);
          }
          return ret;
        }
        function setGlobalEval(elems, refElements) {
          var i = 0, l = elems.length;
          for (; i < l; i++) {
            dataPriv.set(elems[i], "globalEval", !refElements || dataPriv.get(refElements[i], "globalEval"));
          }
        }
        var rhtml = /<|&#?\w+;/;
        function buildFragment(elems, context, scripts, selection, ignored) {
          var elem, tmp, tag, wrap, attached, j, fragment = context.createDocumentFragment(), nodes = [], i = 0, l = elems.length;
          for (; i < l; i++) {
            elem = elems[i];
            if (elem || elem === 0) {
              if (toType(elem) === "object") {
                jQuery2.merge(nodes, elem.nodeType ? [elem] : elem);
              } else if (!rhtml.test(elem)) {
                nodes.push(context.createTextNode(elem));
              } else {
                tmp = tmp || fragment.appendChild(context.createElement("div"));
                tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                wrap = wrapMap[tag] || wrapMap._default;
                tmp.innerHTML = wrap[1] + jQuery2.htmlPrefilter(elem) + wrap[2];
                j = wrap[0];
                while (j--) {
                  tmp = tmp.lastChild;
                }
                jQuery2.merge(nodes, tmp.childNodes);
                tmp = fragment.firstChild;
                tmp.textContent = "";
              }
            }
          }
          fragment.textContent = "";
          i = 0;
          while (elem = nodes[i++]) {
            if (selection && jQuery2.inArray(elem, selection) > -1) {
              if (ignored) {
                ignored.push(elem);
              }
              continue;
            }
            attached = isAttached(elem);
            tmp = getAll(fragment.appendChild(elem), "script");
            if (attached) {
              setGlobalEval(tmp);
            }
            if (scripts) {
              j = 0;
              while (elem = tmp[j++]) {
                if (rscriptType.test(elem.type || "")) {
                  scripts.push(elem);
                }
              }
            }
          }
          return fragment;
        }
        var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
        function returnTrue() {
          return true;
        }
        function returnFalse() {
          return false;
        }
        function expectSync(elem, type) {
          return elem === safeActiveElement() === (type === "focus");
        }
        function safeActiveElement() {
          try {
            return document2.activeElement;
          } catch (err) {
          }
        }
        function on(elem, types, selector, data, fn, one) {
          var origFn, type;
          if (typeof types === "object") {
            if (typeof selector !== "string") {
              data = data || selector;
              selector = void 0;
            }
            for (type in types) {
              on(elem, type, selector, data, types[type], one);
            }
            return elem;
          }
          if (data == null && fn == null) {
            fn = selector;
            data = selector = void 0;
          } else if (fn == null) {
            if (typeof selector === "string") {
              fn = data;
              data = void 0;
            } else {
              fn = data;
              data = selector;
              selector = void 0;
            }
          }
          if (fn === false) {
            fn = returnFalse;
          } else if (!fn) {
            return elem;
          }
          if (one === 1) {
            origFn = fn;
            fn = function(event) {
              jQuery2().off(event);
              return origFn.apply(this, arguments);
            };
            fn.guid = origFn.guid || (origFn.guid = jQuery2.guid++);
          }
          return elem.each(function() {
            jQuery2.event.add(this, types, fn, data, selector);
          });
        }
        jQuery2.event = {
          global: {},
          add: function(elem, types, handler, data, selector) {
            var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.get(elem);
            if (!acceptData(elem)) {
              return;
            }
            if (handler.handler) {
              handleObjIn = handler;
              handler = handleObjIn.handler;
              selector = handleObjIn.selector;
            }
            if (selector) {
              jQuery2.find.matchesSelector(documentElement, selector);
            }
            if (!handler.guid) {
              handler.guid = jQuery2.guid++;
            }
            if (!(events = elemData.events)) {
              events = elemData.events = /* @__PURE__ */ Object.create(null);
            }
            if (!(eventHandle = elemData.handle)) {
              eventHandle = elemData.handle = function(e) {
                return typeof jQuery2 !== "undefined" && jQuery2.event.triggered !== e.type ? jQuery2.event.dispatch.apply(elem, arguments) : void 0;
              };
            }
            types = (types || "").match(rnothtmlwhite) || [""];
            t = types.length;
            while (t--) {
              tmp = rtypenamespace.exec(types[t]) || [];
              type = origType = tmp[1];
              namespaces = (tmp[2] || "").split(".").sort();
              if (!type) {
                continue;
              }
              special = jQuery2.event.special[type] || {};
              type = (selector ? special.delegateType : special.bindType) || type;
              special = jQuery2.event.special[type] || {};
              handleObj = jQuery2.extend({
                type,
                origType,
                data,
                handler,
                guid: handler.guid,
                selector,
                needsContext: selector && jQuery2.expr.match.needsContext.test(selector),
                namespace: namespaces.join(".")
              }, handleObjIn);
              if (!(handlers = events[type])) {
                handlers = events[type] = [];
                handlers.delegateCount = 0;
                if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                  if (elem.addEventListener) {
                    elem.addEventListener(type, eventHandle);
                  }
                }
              }
              if (special.add) {
                special.add.call(elem, handleObj);
                if (!handleObj.handler.guid) {
                  handleObj.handler.guid = handler.guid;
                }
              }
              if (selector) {
                handlers.splice(handlers.delegateCount++, 0, handleObj);
              } else {
                handlers.push(handleObj);
              }
              jQuery2.event.global[type] = true;
            }
          },
          remove: function(elem, types, handler, selector, mappedTypes) {
            var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = dataPriv.hasData(elem) && dataPriv.get(elem);
            if (!elemData || !(events = elemData.events)) {
              return;
            }
            types = (types || "").match(rnothtmlwhite) || [""];
            t = types.length;
            while (t--) {
              tmp = rtypenamespace.exec(types[t]) || [];
              type = origType = tmp[1];
              namespaces = (tmp[2] || "").split(".").sort();
              if (!type) {
                for (type in events) {
                  jQuery2.event.remove(elem, type + types[t], handler, selector, true);
                }
                continue;
              }
              special = jQuery2.event.special[type] || {};
              type = (selector ? special.delegateType : special.bindType) || type;
              handlers = events[type] || [];
              tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
              origCount = j = handlers.length;
              while (j--) {
                handleObj = handlers[j];
                if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                  handlers.splice(j, 1);
                  if (handleObj.selector) {
                    handlers.delegateCount--;
                  }
                  if (special.remove) {
                    special.remove.call(elem, handleObj);
                  }
                }
              }
              if (origCount && !handlers.length) {
                if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                  jQuery2.removeEvent(elem, type, elemData.handle);
                }
                delete events[type];
              }
            }
            if (jQuery2.isEmptyObject(events)) {
              dataPriv.remove(elem, "handle events");
            }
          },
          dispatch: function(nativeEvent) {
            var i, j, ret, matched, handleObj, handlerQueue, args = new Array(arguments.length), event = jQuery2.event.fix(nativeEvent), handlers = (dataPriv.get(this, "events") || /* @__PURE__ */ Object.create(null))[event.type] || [], special = jQuery2.event.special[event.type] || {};
            args[0] = event;
            for (i = 1; i < arguments.length; i++) {
              args[i] = arguments[i];
            }
            event.delegateTarget = this;
            if (special.preDispatch && special.preDispatch.call(this, event) === false) {
              return;
            }
            handlerQueue = jQuery2.event.handlers.call(this, event, handlers);
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
              event.currentTarget = matched.elem;
              j = 0;
              while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
                if (!event.rnamespace || handleObj.namespace === false || event.rnamespace.test(handleObj.namespace)) {
                  event.handleObj = handleObj;
                  event.data = handleObj.data;
                  ret = ((jQuery2.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                  if (ret !== void 0) {
                    if ((event.result = ret) === false) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }
                }
              }
            }
            if (special.postDispatch) {
              special.postDispatch.call(this, event);
            }
            return event.result;
          },
          handlers: function(event, handlers) {
            var i, handleObj, sel, matchedHandlers, matchedSelectors, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
            if (delegateCount && cur.nodeType && !(event.type === "click" && event.button >= 1)) {
              for (; cur !== this; cur = cur.parentNode || this) {
                if (cur.nodeType === 1 && !(event.type === "click" && cur.disabled === true)) {
                  matchedHandlers = [];
                  matchedSelectors = {};
                  for (i = 0; i < delegateCount; i++) {
                    handleObj = handlers[i];
                    sel = handleObj.selector + " ";
                    if (matchedSelectors[sel] === void 0) {
                      matchedSelectors[sel] = handleObj.needsContext ? jQuery2(sel, this).index(cur) > -1 : jQuery2.find(sel, this, null, [cur]).length;
                    }
                    if (matchedSelectors[sel]) {
                      matchedHandlers.push(handleObj);
                    }
                  }
                  if (matchedHandlers.length) {
                    handlerQueue.push({ elem: cur, handlers: matchedHandlers });
                  }
                }
              }
            }
            cur = this;
            if (delegateCount < handlers.length) {
              handlerQueue.push({ elem: cur, handlers: handlers.slice(delegateCount) });
            }
            return handlerQueue;
          },
          addProp: function(name, hook) {
            Object.defineProperty(jQuery2.Event.prototype, name, {
              enumerable: true,
              configurable: true,
              get: isFunction(hook) ? function() {
                if (this.originalEvent) {
                  return hook(this.originalEvent);
                }
              } : function() {
                if (this.originalEvent) {
                  return this.originalEvent[name];
                }
              },
              set: function(value) {
                Object.defineProperty(this, name, {
                  enumerable: true,
                  configurable: true,
                  writable: true,
                  value
                });
              }
            });
          },
          fix: function(originalEvent) {
            return originalEvent[jQuery2.expando] ? originalEvent : new jQuery2.Event(originalEvent);
          },
          special: {
            load: {
              noBubble: true
            },
            click: {
              setup: function(data) {
                var el = this || data;
                if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
                  leverageNative(el, "click", returnTrue);
                }
                return false;
              },
              trigger: function(data) {
                var el = this || data;
                if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
                  leverageNative(el, "click");
                }
                return true;
              },
              _default: function(event) {
                var target = event.target;
                return rcheckableType.test(target.type) && target.click && nodeName(target, "input") && dataPriv.get(target, "click") || nodeName(target, "a");
              }
            },
            beforeunload: {
              postDispatch: function(event) {
                if (event.result !== void 0 && event.originalEvent) {
                  event.originalEvent.returnValue = event.result;
                }
              }
            }
          }
        };
        function leverageNative(el, type, expectSync2) {
          if (!expectSync2) {
            if (dataPriv.get(el, type) === void 0) {
              jQuery2.event.add(el, type, returnTrue);
            }
            return;
          }
          dataPriv.set(el, type, false);
          jQuery2.event.add(el, type, {
            namespace: false,
            handler: function(event) {
              var notAsync, result, saved = dataPriv.get(this, type);
              if (event.isTrigger & 1 && this[type]) {
                if (!saved.length) {
                  saved = slice.call(arguments);
                  dataPriv.set(this, type, saved);
                  notAsync = expectSync2(this, type);
                  this[type]();
                  result = dataPriv.get(this, type);
                  if (saved !== result || notAsync) {
                    dataPriv.set(this, type, false);
                  } else {
                    result = {};
                  }
                  if (saved !== result) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return result && result.value;
                  }
                } else if ((jQuery2.event.special[type] || {}).delegateType) {
                  event.stopPropagation();
                }
              } else if (saved.length) {
                dataPriv.set(this, type, {
                  value: jQuery2.event.trigger(jQuery2.extend(saved[0], jQuery2.Event.prototype), saved.slice(1), this)
                });
                event.stopImmediatePropagation();
              }
            }
          });
        }
        jQuery2.removeEvent = function(elem, type, handle) {
          if (elem.removeEventListener) {
            elem.removeEventListener(type, handle);
          }
        };
        jQuery2.Event = function(src, props) {
          if (!(this instanceof jQuery2.Event)) {
            return new jQuery2.Event(src, props);
          }
          if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === void 0 && src.returnValue === false ? returnTrue : returnFalse;
            this.target = src.target && src.target.nodeType === 3 ? src.target.parentNode : src.target;
            this.currentTarget = src.currentTarget;
            this.relatedTarget = src.relatedTarget;
          } else {
            this.type = src;
          }
          if (props) {
            jQuery2.extend(this, props);
          }
          this.timeStamp = src && src.timeStamp || Date.now();
          this[jQuery2.expando] = true;
        };
        jQuery2.Event.prototype = {
          constructor: jQuery2.Event,
          isDefaultPrevented: returnFalse,
          isPropagationStopped: returnFalse,
          isImmediatePropagationStopped: returnFalse,
          isSimulated: false,
          preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (e && !this.isSimulated) {
              e.preventDefault();
            }
          },
          stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (e && !this.isSimulated) {
              e.stopPropagation();
            }
          },
          stopImmediatePropagation: function() {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = returnTrue;
            if (e && !this.isSimulated) {
              e.stopImmediatePropagation();
            }
            this.stopPropagation();
          }
        };
        jQuery2.each({
          altKey: true,
          bubbles: true,
          cancelable: true,
          changedTouches: true,
          ctrlKey: true,
          detail: true,
          eventPhase: true,
          metaKey: true,
          pageX: true,
          pageY: true,
          shiftKey: true,
          view: true,
          "char": true,
          code: true,
          charCode: true,
          key: true,
          keyCode: true,
          button: true,
          buttons: true,
          clientX: true,
          clientY: true,
          offsetX: true,
          offsetY: true,
          pointerId: true,
          pointerType: true,
          screenX: true,
          screenY: true,
          targetTouches: true,
          toElement: true,
          touches: true,
          which: true
        }, jQuery2.event.addProp);
        jQuery2.each({ focus: "focusin", blur: "focusout" }, function(type, delegateType) {
          jQuery2.event.special[type] = {
            setup: function() {
              leverageNative(this, type, expectSync);
              return false;
            },
            trigger: function() {
              leverageNative(this, type);
              return true;
            },
            _default: function() {
              return true;
            },
            delegateType
          };
        });
        jQuery2.each({
          mouseenter: "mouseover",
          mouseleave: "mouseout",
          pointerenter: "pointerover",
          pointerleave: "pointerout"
        }, function(orig, fix) {
          jQuery2.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function(event) {
              var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
              if (!related || related !== target && !jQuery2.contains(target, related)) {
                event.type = handleObj.origType;
                ret = handleObj.handler.apply(this, arguments);
                event.type = fix;
              }
              return ret;
            }
          };
        });
        jQuery2.fn.extend({
          on: function(types, selector, data, fn) {
            return on(this, types, selector, data, fn);
          },
          one: function(types, selector, data, fn) {
            return on(this, types, selector, data, fn, 1);
          },
          off: function(types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
              handleObj = types.handleObj;
              jQuery2(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
              return this;
            }
            if (typeof types === "object") {
              for (type in types) {
                this.off(type, selector, types[type]);
              }
              return this;
            }
            if (selector === false || typeof selector === "function") {
              fn = selector;
              selector = void 0;
            }
            if (fn === false) {
              fn = returnFalse;
            }
            return this.each(function() {
              jQuery2.event.remove(this, types, fn, selector);
            });
          }
        });
        var rnoInnerhtml = /<script|<style|<link/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
        function manipulationTarget(elem, content) {
          if (nodeName(elem, "table") && nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr")) {
            return jQuery2(elem).children("tbody")[0] || elem;
          }
          return elem;
        }
        function disableScript(elem) {
          elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
          return elem;
        }
        function restoreScript(elem) {
          if ((elem.type || "").slice(0, 5) === "true/") {
            elem.type = elem.type.slice(5);
          } else {
            elem.removeAttribute("type");
          }
          return elem;
        }
        function cloneCopyEvent(src, dest) {
          var i, l, type, pdataOld, udataOld, udataCur, events;
          if (dest.nodeType !== 1) {
            return;
          }
          if (dataPriv.hasData(src)) {
            pdataOld = dataPriv.get(src);
            events = pdataOld.events;
            if (events) {
              dataPriv.remove(dest, "handle events");
              for (type in events) {
                for (i = 0, l = events[type].length; i < l; i++) {
                  jQuery2.event.add(dest, type, events[type][i]);
                }
              }
            }
          }
          if (dataUser.hasData(src)) {
            udataOld = dataUser.access(src);
            udataCur = jQuery2.extend({}, udataOld);
            dataUser.set(dest, udataCur);
          }
        }
        function fixInput(src, dest) {
          var nodeName2 = dest.nodeName.toLowerCase();
          if (nodeName2 === "input" && rcheckableType.test(src.type)) {
            dest.checked = src.checked;
          } else if (nodeName2 === "input" || nodeName2 === "textarea") {
            dest.defaultValue = src.defaultValue;
          }
        }
        function domManip(collection, args, callback, ignored) {
          args = flat(args);
          var fragment, first, scripts, hasScripts, node, doc, i = 0, l = collection.length, iNoClone = l - 1, value = args[0], valueIsFunction = isFunction(value);
          if (valueIsFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)) {
            return collection.each(function(index) {
              var self2 = collection.eq(index);
              if (valueIsFunction) {
                args[0] = value.call(this, index, self2.html());
              }
              domManip(self2, args, callback, ignored);
            });
          }
          if (l) {
            fragment = buildFragment(args, collection[0].ownerDocument, false, collection, ignored);
            first = fragment.firstChild;
            if (fragment.childNodes.length === 1) {
              fragment = first;
            }
            if (first || ignored) {
              scripts = jQuery2.map(getAll(fragment, "script"), disableScript);
              hasScripts = scripts.length;
              for (; i < l; i++) {
                node = fragment;
                if (i !== iNoClone) {
                  node = jQuery2.clone(node, true, true);
                  if (hasScripts) {
                    jQuery2.merge(scripts, getAll(node, "script"));
                  }
                }
                callback.call(collection[i], node, i);
              }
              if (hasScripts) {
                doc = scripts[scripts.length - 1].ownerDocument;
                jQuery2.map(scripts, restoreScript);
                for (i = 0; i < hasScripts; i++) {
                  node = scripts[i];
                  if (rscriptType.test(node.type || "") && !dataPriv.access(node, "globalEval") && jQuery2.contains(doc, node)) {
                    if (node.src && (node.type || "").toLowerCase() !== "module") {
                      if (jQuery2._evalUrl && !node.noModule) {
                        jQuery2._evalUrl(node.src, {
                          nonce: node.nonce || node.getAttribute("nonce")
                        }, doc);
                      }
                    } else {
                      DOMEval(node.textContent.replace(rcleanScript, ""), node, doc);
                    }
                  }
                }
              }
            }
          }
          return collection;
        }
        function remove(elem, selector, keepData) {
          var node, nodes = selector ? jQuery2.filter(selector, elem) : elem, i = 0;
          for (; (node = nodes[i]) != null; i++) {
            if (!keepData && node.nodeType === 1) {
              jQuery2.cleanData(getAll(node));
            }
            if (node.parentNode) {
              if (keepData && isAttached(node)) {
                setGlobalEval(getAll(node, "script"));
              }
              node.parentNode.removeChild(node);
            }
          }
          return elem;
        }
        jQuery2.extend({
          htmlPrefilter: function(html) {
            return html;
          },
          clone: function(elem, dataAndEvents, deepDataAndEvents) {
            var i, l, srcElements, destElements, clone = elem.cloneNode(true), inPage = isAttached(elem);
            if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery2.isXMLDoc(elem)) {
              destElements = getAll(clone);
              srcElements = getAll(elem);
              for (i = 0, l = srcElements.length; i < l; i++) {
                fixInput(srcElements[i], destElements[i]);
              }
            }
            if (dataAndEvents) {
              if (deepDataAndEvents) {
                srcElements = srcElements || getAll(elem);
                destElements = destElements || getAll(clone);
                for (i = 0, l = srcElements.length; i < l; i++) {
                  cloneCopyEvent(srcElements[i], destElements[i]);
                }
              } else {
                cloneCopyEvent(elem, clone);
              }
            }
            destElements = getAll(clone, "script");
            if (destElements.length > 0) {
              setGlobalEval(destElements, !inPage && getAll(elem, "script"));
            }
            return clone;
          },
          cleanData: function(elems) {
            var data, elem, type, special = jQuery2.event.special, i = 0;
            for (; (elem = elems[i]) !== void 0; i++) {
              if (acceptData(elem)) {
                if (data = elem[dataPriv.expando]) {
                  if (data.events) {
                    for (type in data.events) {
                      if (special[type]) {
                        jQuery2.event.remove(elem, type);
                      } else {
                        jQuery2.removeEvent(elem, type, data.handle);
                      }
                    }
                  }
                  elem[dataPriv.expando] = void 0;
                }
                if (elem[dataUser.expando]) {
                  elem[dataUser.expando] = void 0;
                }
              }
            }
          }
        });
        jQuery2.fn.extend({
          detach: function(selector) {
            return remove(this, selector, true);
          },
          remove: function(selector) {
            return remove(this, selector);
          },
          text: function(value) {
            return access(this, function(value2) {
              return value2 === void 0 ? jQuery2.text(this) : this.empty().each(function() {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                  this.textContent = value2;
                }
              });
            }, null, value, arguments.length);
          },
          append: function() {
            return domManip(this, arguments, function(elem) {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                target.appendChild(elem);
              }
            });
          },
          prepend: function() {
            return domManip(this, arguments, function(elem) {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                target.insertBefore(elem, target.firstChild);
              }
            });
          },
          before: function() {
            return domManip(this, arguments, function(elem) {
              if (this.parentNode) {
                this.parentNode.insertBefore(elem, this);
              }
            });
          },
          after: function() {
            return domManip(this, arguments, function(elem) {
              if (this.parentNode) {
                this.parentNode.insertBefore(elem, this.nextSibling);
              }
            });
          },
          empty: function() {
            var elem, i = 0;
            for (; (elem = this[i]) != null; i++) {
              if (elem.nodeType === 1) {
                jQuery2.cleanData(getAll(elem, false));
                elem.textContent = "";
              }
            }
            return this;
          },
          clone: function(dataAndEvents, deepDataAndEvents) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
            return this.map(function() {
              return jQuery2.clone(this, dataAndEvents, deepDataAndEvents);
            });
          },
          html: function(value) {
            return access(this, function(value2) {
              var elem = this[0] || {}, i = 0, l = this.length;
              if (value2 === void 0 && elem.nodeType === 1) {
                return elem.innerHTML;
              }
              if (typeof value2 === "string" && !rnoInnerhtml.test(value2) && !wrapMap[(rtagName.exec(value2) || ["", ""])[1].toLowerCase()]) {
                value2 = jQuery2.htmlPrefilter(value2);
                try {
                  for (; i < l; i++) {
                    elem = this[i] || {};
                    if (elem.nodeType === 1) {
                      jQuery2.cleanData(getAll(elem, false));
                      elem.innerHTML = value2;
                    }
                  }
                  elem = 0;
                } catch (e) {
                }
              }
              if (elem) {
                this.empty().append(value2);
              }
            }, null, value, arguments.length);
          },
          replaceWith: function() {
            var ignored = [];
            return domManip(this, arguments, function(elem) {
              var parent = this.parentNode;
              if (jQuery2.inArray(this, ignored) < 0) {
                jQuery2.cleanData(getAll(this));
                if (parent) {
                  parent.replaceChild(elem, this);
                }
              }
            }, ignored);
          }
        });
        jQuery2.each({
          appendTo: "append",
          prependTo: "prepend",
          insertBefore: "before",
          insertAfter: "after",
          replaceAll: "replaceWith"
        }, function(name, original) {
          jQuery2.fn[name] = function(selector) {
            var elems, ret = [], insert = jQuery2(selector), last = insert.length - 1, i = 0;
            for (; i <= last; i++) {
              elems = i === last ? this : this.clone(true);
              jQuery2(insert[i])[original](elems);
              push.apply(ret, elems.get());
            }
            return this.pushStack(ret);
          };
        });
        var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
        var getStyles = function(elem) {
          var view = elem.ownerDocument.defaultView;
          if (!view || !view.opener) {
            view = window2;
          }
          return view.getComputedStyle(elem);
        };
        var swap = function(elem, options, callback) {
          var ret, name, old = {};
          for (name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
          }
          ret = callback.call(elem);
          for (name in options) {
            elem.style[name] = old[name];
          }
          return ret;
        };
        var rboxStyle = new RegExp(cssExpand.join("|"), "i");
        (function() {
          function computeStyleTests() {
            if (!div) {
              return;
            }
            container.style.cssText = "position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0";
            div.style.cssText = "position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%";
            documentElement.appendChild(container).appendChild(div);
            var divStyle = window2.getComputedStyle(div);
            pixelPositionVal = divStyle.top !== "1%";
            reliableMarginLeftVal = roundPixelMeasures(divStyle.marginLeft) === 12;
            div.style.right = "60%";
            pixelBoxStylesVal = roundPixelMeasures(divStyle.right) === 36;
            boxSizingReliableVal = roundPixelMeasures(divStyle.width) === 36;
            div.style.position = "absolute";
            scrollboxSizeVal = roundPixelMeasures(div.offsetWidth / 3) === 12;
            documentElement.removeChild(container);
            div = null;
          }
          function roundPixelMeasures(measure) {
            return Math.round(parseFloat(measure));
          }
          var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal, reliableTrDimensionsVal, reliableMarginLeftVal, container = document2.createElement("div"), div = document2.createElement("div");
          if (!div.style) {
            return;
          }
          div.style.backgroundClip = "content-box";
          div.cloneNode(true).style.backgroundClip = "";
          support.clearCloneStyle = div.style.backgroundClip === "content-box";
          jQuery2.extend(support, {
            boxSizingReliable: function() {
              computeStyleTests();
              return boxSizingReliableVal;
            },
            pixelBoxStyles: function() {
              computeStyleTests();
              return pixelBoxStylesVal;
            },
            pixelPosition: function() {
              computeStyleTests();
              return pixelPositionVal;
            },
            reliableMarginLeft: function() {
              computeStyleTests();
              return reliableMarginLeftVal;
            },
            scrollboxSize: function() {
              computeStyleTests();
              return scrollboxSizeVal;
            },
            reliableTrDimensions: function() {
              var table, tr, trChild, trStyle;
              if (reliableTrDimensionsVal == null) {
                table = document2.createElement("table");
                tr = document2.createElement("tr");
                trChild = document2.createElement("div");
                table.style.cssText = "position:absolute;left:-11111px;border-collapse:separate";
                tr.style.cssText = "border:1px solid";
                tr.style.height = "1px";
                trChild.style.height = "9px";
                trChild.style.display = "block";
                documentElement.appendChild(table).appendChild(tr).appendChild(trChild);
                trStyle = window2.getComputedStyle(tr);
                reliableTrDimensionsVal = parseInt(trStyle.height, 10) + parseInt(trStyle.borderTopWidth, 10) + parseInt(trStyle.borderBottomWidth, 10) === tr.offsetHeight;
                documentElement.removeChild(table);
              }
              return reliableTrDimensionsVal;
            }
          });
        })();
        function curCSS(elem, name, computed) {
          var width, minWidth, maxWidth, ret, style = elem.style;
          computed = computed || getStyles(elem);
          if (computed) {
            ret = computed.getPropertyValue(name) || computed[name];
            if (ret === "" && !isAttached(elem)) {
              ret = jQuery2.style(elem, name);
            }
            if (!support.pixelBoxStyles() && rnumnonpx.test(ret) && rboxStyle.test(name)) {
              width = style.width;
              minWidth = style.minWidth;
              maxWidth = style.maxWidth;
              style.minWidth = style.maxWidth = style.width = ret;
              ret = computed.width;
              style.width = width;
              style.minWidth = minWidth;
              style.maxWidth = maxWidth;
            }
          }
          return ret !== void 0 ? ret + "" : ret;
        }
        function addGetHookIf(conditionFn, hookFn) {
          return {
            get: function() {
              if (conditionFn()) {
                delete this.get;
                return;
              }
              return (this.get = hookFn).apply(this, arguments);
            }
          };
        }
        var cssPrefixes = ["Webkit", "Moz", "ms"], emptyStyle = document2.createElement("div").style, vendorProps = {};
        function vendorPropName(name) {
          var capName = name[0].toUpperCase() + name.slice(1), i = cssPrefixes.length;
          while (i--) {
            name = cssPrefixes[i] + capName;
            if (name in emptyStyle) {
              return name;
            }
          }
        }
        function finalPropName(name) {
          var final = jQuery2.cssProps[name] || vendorProps[name];
          if (final) {
            return final;
          }
          if (name in emptyStyle) {
            return name;
          }
          return vendorProps[name] = vendorPropName(name) || name;
        }
        var rdisplayswap = /^(none|table(?!-c[ea]).+)/, rcustomProp = /^--/, cssShow = { position: "absolute", visibility: "hidden", display: "block" }, cssNormalTransform = {
          letterSpacing: "0",
          fontWeight: "400"
        };
        function setPositiveNumber(_elem, value, subtract) {
          var matches = rcssNum.exec(value);
          return matches ? Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || "px") : value;
        }
        function boxModelAdjustment(elem, dimension, box, isBorderBox, styles, computedVal) {
          var i = dimension === "width" ? 1 : 0, extra = 0, delta = 0;
          if (box === (isBorderBox ? "border" : "content")) {
            return 0;
          }
          for (; i < 4; i += 2) {
            if (box === "margin") {
              delta += jQuery2.css(elem, box + cssExpand[i], true, styles);
            }
            if (!isBorderBox) {
              delta += jQuery2.css(elem, "padding" + cssExpand[i], true, styles);
              if (box !== "padding") {
                delta += jQuery2.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              } else {
                extra += jQuery2.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              }
            } else {
              if (box === "content") {
                delta -= jQuery2.css(elem, "padding" + cssExpand[i], true, styles);
              }
              if (box !== "margin") {
                delta -= jQuery2.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              }
            }
          }
          if (!isBorderBox && computedVal >= 0) {
            delta += Math.max(0, Math.ceil(elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - computedVal - delta - extra - 0.5)) || 0;
          }
          return delta;
        }
        function getWidthOrHeight(elem, dimension, extra) {
          var styles = getStyles(elem), boxSizingNeeded = !support.boxSizingReliable() || extra, isBorderBox = boxSizingNeeded && jQuery2.css(elem, "boxSizing", false, styles) === "border-box", valueIsBorderBox = isBorderBox, val = curCSS(elem, dimension, styles), offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);
          if (rnumnonpx.test(val)) {
            if (!extra) {
              return val;
            }
            val = "auto";
          }
          if ((!support.boxSizingReliable() && isBorderBox || !support.reliableTrDimensions() && nodeName(elem, "tr") || val === "auto" || !parseFloat(val) && jQuery2.css(elem, "display", false, styles) === "inline") && elem.getClientRects().length) {
            isBorderBox = jQuery2.css(elem, "boxSizing", false, styles) === "border-box";
            valueIsBorderBox = offsetProp in elem;
            if (valueIsBorderBox) {
              val = elem[offsetProp];
            }
          }
          val = parseFloat(val) || 0;
          return val + boxModelAdjustment(elem, dimension, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles, val) + "px";
        }
        jQuery2.extend({
          cssHooks: {
            opacity: {
              get: function(elem, computed) {
                if (computed) {
                  var ret = curCSS(elem, "opacity");
                  return ret === "" ? "1" : ret;
                }
              }
            }
          },
          cssNumber: {
            "animationIterationCount": true,
            "columnCount": true,
            "fillOpacity": true,
            "flexGrow": true,
            "flexShrink": true,
            "fontWeight": true,
            "gridArea": true,
            "gridColumn": true,
            "gridColumnEnd": true,
            "gridColumnStart": true,
            "gridRow": true,
            "gridRowEnd": true,
            "gridRowStart": true,
            "lineHeight": true,
            "opacity": true,
            "order": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
          },
          cssProps: {},
          style: function(elem, name, value, extra) {
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
              return;
            }
            var ret, type, hooks, origName = camelCase(name), isCustomProp = rcustomProp.test(name), style = elem.style;
            if (!isCustomProp) {
              name = finalPropName(origName);
            }
            hooks = jQuery2.cssHooks[name] || jQuery2.cssHooks[origName];
            if (value !== void 0) {
              type = typeof value;
              if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
                value = adjustCSS(elem, name, ret);
                type = "number";
              }
              if (value == null || value !== value) {
                return;
              }
              if (type === "number" && !isCustomProp) {
                value += ret && ret[3] || (jQuery2.cssNumber[origName] ? "" : "px");
              }
              if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                style[name] = "inherit";
              }
              if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== void 0) {
                if (isCustomProp) {
                  style.setProperty(name, value);
                } else {
                  style[name] = value;
                }
              }
            } else {
              if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== void 0) {
                return ret;
              }
              return style[name];
            }
          },
          css: function(elem, name, extra, styles) {
            var val, num, hooks, origName = camelCase(name), isCustomProp = rcustomProp.test(name);
            if (!isCustomProp) {
              name = finalPropName(origName);
            }
            hooks = jQuery2.cssHooks[name] || jQuery2.cssHooks[origName];
            if (hooks && "get" in hooks) {
              val = hooks.get(elem, true, extra);
            }
            if (val === void 0) {
              val = curCSS(elem, name, styles);
            }
            if (val === "normal" && name in cssNormalTransform) {
              val = cssNormalTransform[name];
            }
            if (extra === "" || extra) {
              num = parseFloat(val);
              return extra === true || isFinite(num) ? num || 0 : val;
            }
            return val;
          }
        });
        jQuery2.each(["height", "width"], function(_i, dimension) {
          jQuery2.cssHooks[dimension] = {
            get: function(elem, computed, extra) {
              if (computed) {
                return rdisplayswap.test(jQuery2.css(elem, "display")) && (!elem.getClientRects().length || !elem.getBoundingClientRect().width) ? swap(elem, cssShow, function() {
                  return getWidthOrHeight(elem, dimension, extra);
                }) : getWidthOrHeight(elem, dimension, extra);
              }
            },
            set: function(elem, value, extra) {
              var matches, styles = getStyles(elem), scrollboxSizeBuggy = !support.scrollboxSize() && styles.position === "absolute", boxSizingNeeded = scrollboxSizeBuggy || extra, isBorderBox = boxSizingNeeded && jQuery2.css(elem, "boxSizing", false, styles) === "border-box", subtract = extra ? boxModelAdjustment(elem, dimension, extra, isBorderBox, styles) : 0;
              if (isBorderBox && scrollboxSizeBuggy) {
                subtract -= Math.ceil(elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - parseFloat(styles[dimension]) - boxModelAdjustment(elem, dimension, "border", false, styles) - 0.5);
              }
              if (subtract && (matches = rcssNum.exec(value)) && (matches[3] || "px") !== "px") {
                elem.style[dimension] = value;
                value = jQuery2.css(elem, dimension);
              }
              return setPositiveNumber(elem, value, subtract);
            }
          };
        });
        jQuery2.cssHooks.marginLeft = addGetHookIf(support.reliableMarginLeft, function(elem, computed) {
          if (computed) {
            return (parseFloat(curCSS(elem, "marginLeft")) || elem.getBoundingClientRect().left - swap(elem, { marginLeft: 0 }, function() {
              return elem.getBoundingClientRect().left;
            })) + "px";
          }
        });
        jQuery2.each({
          margin: "",
          padding: "",
          border: "Width"
        }, function(prefix, suffix) {
          jQuery2.cssHooks[prefix + suffix] = {
            expand: function(value) {
              var i = 0, expanded = {}, parts = typeof value === "string" ? value.split(" ") : [value];
              for (; i < 4; i++) {
                expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
              }
              return expanded;
            }
          };
          if (prefix !== "margin") {
            jQuery2.cssHooks[prefix + suffix].set = setPositiveNumber;
          }
        });
        jQuery2.fn.extend({
          css: function(name, value) {
            return access(this, function(elem, name2, value2) {
              var styles, len, map = {}, i = 0;
              if (Array.isArray(name2)) {
                styles = getStyles(elem);
                len = name2.length;
                for (; i < len; i++) {
                  map[name2[i]] = jQuery2.css(elem, name2[i], false, styles);
                }
                return map;
              }
              return value2 !== void 0 ? jQuery2.style(elem, name2, value2) : jQuery2.css(elem, name2);
            }, name, value, arguments.length > 1);
          }
        });
        function Tween(elem, options, prop, end, easing) {
          return new Tween.prototype.init(elem, options, prop, end, easing);
        }
        jQuery2.Tween = Tween;
        Tween.prototype = {
          constructor: Tween,
          init: function(elem, options, prop, end, easing, unit) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || jQuery2.easing._default;
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || (jQuery2.cssNumber[prop] ? "" : "px");
          },
          cur: function() {
            var hooks = Tween.propHooks[this.prop];
            return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
          },
          run: function(percent) {
            var eased, hooks = Tween.propHooks[this.prop];
            if (this.options.duration) {
              this.pos = eased = jQuery2.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
            } else {
              this.pos = eased = percent;
            }
            this.now = (this.end - this.start) * eased + this.start;
            if (this.options.step) {
              this.options.step.call(this.elem, this.now, this);
            }
            if (hooks && hooks.set) {
              hooks.set(this);
            } else {
              Tween.propHooks._default.set(this);
            }
            return this;
          }
        };
        Tween.prototype.init.prototype = Tween.prototype;
        Tween.propHooks = {
          _default: {
            get: function(tween) {
              var result;
              if (tween.elem.nodeType !== 1 || tween.elem[tween.prop] != null && tween.elem.style[tween.prop] == null) {
                return tween.elem[tween.prop];
              }
              result = jQuery2.css(tween.elem, tween.prop, "");
              return !result || result === "auto" ? 0 : result;
            },
            set: function(tween) {
              if (jQuery2.fx.step[tween.prop]) {
                jQuery2.fx.step[tween.prop](tween);
              } else if (tween.elem.nodeType === 1 && (jQuery2.cssHooks[tween.prop] || tween.elem.style[finalPropName(tween.prop)] != null)) {
                jQuery2.style(tween.elem, tween.prop, tween.now + tween.unit);
              } else {
                tween.elem[tween.prop] = tween.now;
              }
            }
          }
        };
        Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
          set: function(tween) {
            if (tween.elem.nodeType && tween.elem.parentNode) {
              tween.elem[tween.prop] = tween.now;
            }
          }
        };
        jQuery2.easing = {
          linear: function(p) {
            return p;
          },
          swing: function(p) {
            return 0.5 - Math.cos(p * Math.PI) / 2;
          },
          _default: "swing"
        };
        jQuery2.fx = Tween.prototype.init;
        jQuery2.fx.step = {};
        var fxNow, inProgress, rfxtypes = /^(?:toggle|show|hide)$/, rrun = /queueHooks$/;
        function schedule() {
          if (inProgress) {
            if (document2.hidden === false && window2.requestAnimationFrame) {
              window2.requestAnimationFrame(schedule);
            } else {
              window2.setTimeout(schedule, jQuery2.fx.interval);
            }
            jQuery2.fx.tick();
          }
        }
        function createFxNow() {
          window2.setTimeout(function() {
            fxNow = void 0;
          });
          return fxNow = Date.now();
        }
        function genFx(type, includeWidth) {
          var which, i = 0, attrs = { height: type };
          includeWidth = includeWidth ? 1 : 0;
          for (; i < 4; i += 2 - includeWidth) {
            which = cssExpand[i];
            attrs["margin" + which] = attrs["padding" + which] = type;
          }
          if (includeWidth) {
            attrs.opacity = attrs.width = type;
          }
          return attrs;
        }
        function createTween(value, prop, animation) {
          var tween, collection = (Animation.tweeners[prop] || []).concat(Animation.tweeners["*"]), index = 0, length = collection.length;
          for (; index < length; index++) {
            if (tween = collection[index].call(animation, prop, value)) {
              return tween;
            }
          }
        }
        function defaultPrefilter(elem, props, opts) {
          var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display, isBox = "width" in props || "height" in props, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHiddenWithinTree(elem), dataShow = dataPriv.get(elem, "fxshow");
          if (!opts.queue) {
            hooks = jQuery2._queueHooks(elem, "fx");
            if (hooks.unqueued == null) {
              hooks.unqueued = 0;
              oldfire = hooks.empty.fire;
              hooks.empty.fire = function() {
                if (!hooks.unqueued) {
                  oldfire();
                }
              };
            }
            hooks.unqueued++;
            anim.always(function() {
              anim.always(function() {
                hooks.unqueued--;
                if (!jQuery2.queue(elem, "fx").length) {
                  hooks.empty.fire();
                }
              });
            });
          }
          for (prop in props) {
            value = props[prop];
            if (rfxtypes.test(value)) {
              delete props[prop];
              toggle = toggle || value === "toggle";
              if (value === (hidden ? "hide" : "show")) {
                if (value === "show" && dataShow && dataShow[prop] !== void 0) {
                  hidden = true;
                } else {
                  continue;
                }
              }
              orig[prop] = dataShow && dataShow[prop] || jQuery2.style(elem, prop);
            }
          }
          propTween = !jQuery2.isEmptyObject(props);
          if (!propTween && jQuery2.isEmptyObject(orig)) {
            return;
          }
          if (isBox && elem.nodeType === 1) {
            opts.overflow = [style.overflow, style.overflowX, style.overflowY];
            restoreDisplay = dataShow && dataShow.display;
            if (restoreDisplay == null) {
              restoreDisplay = dataPriv.get(elem, "display");
            }
            display = jQuery2.css(elem, "display");
            if (display === "none") {
              if (restoreDisplay) {
                display = restoreDisplay;
              } else {
                showHide([elem], true);
                restoreDisplay = elem.style.display || restoreDisplay;
                display = jQuery2.css(elem, "display");
                showHide([elem]);
              }
            }
            if (display === "inline" || display === "inline-block" && restoreDisplay != null) {
              if (jQuery2.css(elem, "float") === "none") {
                if (!propTween) {
                  anim.done(function() {
                    style.display = restoreDisplay;
                  });
                  if (restoreDisplay == null) {
                    display = style.display;
                    restoreDisplay = display === "none" ? "" : display;
                  }
                }
                style.display = "inline-block";
              }
            }
          }
          if (opts.overflow) {
            style.overflow = "hidden";
            anim.always(function() {
              style.overflow = opts.overflow[0];
              style.overflowX = opts.overflow[1];
              style.overflowY = opts.overflow[2];
            });
          }
          propTween = false;
          for (prop in orig) {
            if (!propTween) {
              if (dataShow) {
                if ("hidden" in dataShow) {
                  hidden = dataShow.hidden;
                }
              } else {
                dataShow = dataPriv.access(elem, "fxshow", { display: restoreDisplay });
              }
              if (toggle) {
                dataShow.hidden = !hidden;
              }
              if (hidden) {
                showHide([elem], true);
              }
              anim.done(function() {
                if (!hidden) {
                  showHide([elem]);
                }
                dataPriv.remove(elem, "fxshow");
                for (prop in orig) {
                  jQuery2.style(elem, prop, orig[prop]);
                }
              });
            }
            propTween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
            if (!(prop in dataShow)) {
              dataShow[prop] = propTween.start;
              if (hidden) {
                propTween.end = propTween.start;
                propTween.start = 0;
              }
            }
          }
        }
        function propFilter(props, specialEasing) {
          var index, name, easing, value, hooks;
          for (index in props) {
            name = camelCase(index);
            easing = specialEasing[name];
            value = props[index];
            if (Array.isArray(value)) {
              easing = value[1];
              value = props[index] = value[0];
            }
            if (index !== name) {
              props[name] = value;
              delete props[index];
            }
            hooks = jQuery2.cssHooks[name];
            if (hooks && "expand" in hooks) {
              value = hooks.expand(value);
              delete props[name];
              for (index in value) {
                if (!(index in props)) {
                  props[index] = value[index];
                  specialEasing[index] = easing;
                }
              }
            } else {
              specialEasing[name] = easing;
            }
          }
        }
        function Animation(elem, properties, options) {
          var result, stopped, index = 0, length = Animation.prefilters.length, deferred = jQuery2.Deferred().always(function() {
            delete tick.elem;
          }), tick = function() {
            if (stopped) {
              return false;
            }
            var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index2 = 0, length2 = animation.tweens.length;
            for (; index2 < length2; index2++) {
              animation.tweens[index2].run(percent);
            }
            deferred.notifyWith(elem, [animation, percent, remaining]);
            if (percent < 1 && length2) {
              return remaining;
            }
            if (!length2) {
              deferred.notifyWith(elem, [animation, 1, 0]);
            }
            deferred.resolveWith(elem, [animation]);
            return false;
          }, animation = deferred.promise({
            elem,
            props: jQuery2.extend({}, properties),
            opts: jQuery2.extend(true, {
              specialEasing: {},
              easing: jQuery2.easing._default
            }, options),
            originalProperties: properties,
            originalOptions: options,
            startTime: fxNow || createFxNow(),
            duration: options.duration,
            tweens: [],
            createTween: function(prop, end) {
              var tween = jQuery2.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
              animation.tweens.push(tween);
              return tween;
            },
            stop: function(gotoEnd) {
              var index2 = 0, length2 = gotoEnd ? animation.tweens.length : 0;
              if (stopped) {
                return this;
              }
              stopped = true;
              for (; index2 < length2; index2++) {
                animation.tweens[index2].run(1);
              }
              if (gotoEnd) {
                deferred.notifyWith(elem, [animation, 1, 0]);
                deferred.resolveWith(elem, [animation, gotoEnd]);
              } else {
                deferred.rejectWith(elem, [animation, gotoEnd]);
              }
              return this;
            }
          }), props = animation.props;
          propFilter(props, animation.opts.specialEasing);
          for (; index < length; index++) {
            result = Animation.prefilters[index].call(animation, elem, props, animation.opts);
            if (result) {
              if (isFunction(result.stop)) {
                jQuery2._queueHooks(animation.elem, animation.opts.queue).stop = result.stop.bind(result);
              }
              return result;
            }
          }
          jQuery2.map(props, createTween, animation);
          if (isFunction(animation.opts.start)) {
            animation.opts.start.call(elem, animation);
          }
          animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
          jQuery2.fx.timer(jQuery2.extend(tick, {
            elem,
            anim: animation,
            queue: animation.opts.queue
          }));
          return animation;
        }
        jQuery2.Animation = jQuery2.extend(Animation, {
          tweeners: {
            "*": [function(prop, value) {
              var tween = this.createTween(prop, value);
              adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
              return tween;
            }]
          },
          tweener: function(props, callback) {
            if (isFunction(props)) {
              callback = props;
              props = ["*"];
            } else {
              props = props.match(rnothtmlwhite);
            }
            var prop, index = 0, length = props.length;
            for (; index < length; index++) {
              prop = props[index];
              Animation.tweeners[prop] = Animation.tweeners[prop] || [];
              Animation.tweeners[prop].unshift(callback);
            }
          },
          prefilters: [defaultPrefilter],
          prefilter: function(callback, prepend) {
            if (prepend) {
              Animation.prefilters.unshift(callback);
            } else {
              Animation.prefilters.push(callback);
            }
          }
        });
        jQuery2.speed = function(speed, easing, fn) {
          var opt = speed && typeof speed === "object" ? jQuery2.extend({}, speed) : {
            complete: fn || !fn && easing || isFunction(speed) && speed,
            duration: speed,
            easing: fn && easing || easing && !isFunction(easing) && easing
          };
          if (jQuery2.fx.off) {
            opt.duration = 0;
          } else {
            if (typeof opt.duration !== "number") {
              if (opt.duration in jQuery2.fx.speeds) {
                opt.duration = jQuery2.fx.speeds[opt.duration];
              } else {
                opt.duration = jQuery2.fx.speeds._default;
              }
            }
          }
          if (opt.queue == null || opt.queue === true) {
            opt.queue = "fx";
          }
          opt.old = opt.complete;
          opt.complete = function() {
            if (isFunction(opt.old)) {
              opt.old.call(this);
            }
            if (opt.queue) {
              jQuery2.dequeue(this, opt.queue);
            }
          };
          return opt;
        };
        jQuery2.fn.extend({
          fadeTo: function(speed, to, easing, callback) {
            return this.filter(isHiddenWithinTree).css("opacity", 0).show().end().animate({ opacity: to }, speed, easing, callback);
          },
          animate: function(prop, speed, easing, callback) {
            var empty = jQuery2.isEmptyObject(prop), optall = jQuery2.speed(speed, easing, callback), doAnimation = function() {
              var anim = Animation(this, jQuery2.extend({}, prop), optall);
              if (empty || dataPriv.get(this, "finish")) {
                anim.stop(true);
              }
            };
            doAnimation.finish = doAnimation;
            return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
          },
          stop: function(type, clearQueue, gotoEnd) {
            var stopQueue = function(hooks) {
              var stop = hooks.stop;
              delete hooks.stop;
              stop(gotoEnd);
            };
            if (typeof type !== "string") {
              gotoEnd = clearQueue;
              clearQueue = type;
              type = void 0;
            }
            if (clearQueue) {
              this.queue(type || "fx", []);
            }
            return this.each(function() {
              var dequeue = true, index = type != null && type + "queueHooks", timers = jQuery2.timers, data = dataPriv.get(this);
              if (index) {
                if (data[index] && data[index].stop) {
                  stopQueue(data[index]);
                }
              } else {
                for (index in data) {
                  if (data[index] && data[index].stop && rrun.test(index)) {
                    stopQueue(data[index]);
                  }
                }
              }
              for (index = timers.length; index--; ) {
                if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                  timers[index].anim.stop(gotoEnd);
                  dequeue = false;
                  timers.splice(index, 1);
                }
              }
              if (dequeue || !gotoEnd) {
                jQuery2.dequeue(this, type);
              }
            });
          },
          finish: function(type) {
            if (type !== false) {
              type = type || "fx";
            }
            return this.each(function() {
              var index, data = dataPriv.get(this), queue = data[type + "queue"], hooks = data[type + "queueHooks"], timers = jQuery2.timers, length = queue ? queue.length : 0;
              data.finish = true;
              jQuery2.queue(this, type, []);
              if (hooks && hooks.stop) {
                hooks.stop.call(this, true);
              }
              for (index = timers.length; index--; ) {
                if (timers[index].elem === this && timers[index].queue === type) {
                  timers[index].anim.stop(true);
                  timers.splice(index, 1);
                }
              }
              for (index = 0; index < length; index++) {
                if (queue[index] && queue[index].finish) {
                  queue[index].finish.call(this);
                }
              }
              delete data.finish;
            });
          }
        });
        jQuery2.each(["toggle", "show", "hide"], function(_i, name) {
          var cssFn = jQuery2.fn[name];
          jQuery2.fn[name] = function(speed, easing, callback) {
            return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
          };
        });
        jQuery2.each({
          slideDown: genFx("show"),
          slideUp: genFx("hide"),
          slideToggle: genFx("toggle"),
          fadeIn: { opacity: "show" },
          fadeOut: { opacity: "hide" },
          fadeToggle: { opacity: "toggle" }
        }, function(name, props) {
          jQuery2.fn[name] = function(speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
          };
        });
        jQuery2.timers = [];
        jQuery2.fx.tick = function() {
          var timer, i = 0, timers = jQuery2.timers;
          fxNow = Date.now();
          for (; i < timers.length; i++) {
            timer = timers[i];
            if (!timer() && timers[i] === timer) {
              timers.splice(i--, 1);
            }
          }
          if (!timers.length) {
            jQuery2.fx.stop();
          }
          fxNow = void 0;
        };
        jQuery2.fx.timer = function(timer) {
          jQuery2.timers.push(timer);
          jQuery2.fx.start();
        };
        jQuery2.fx.interval = 13;
        jQuery2.fx.start = function() {
          if (inProgress) {
            return;
          }
          inProgress = true;
          schedule();
        };
        jQuery2.fx.stop = function() {
          inProgress = null;
        };
        jQuery2.fx.speeds = {
          slow: 600,
          fast: 200,
          _default: 400
        };
        jQuery2.fn.delay = function(time, type) {
          time = jQuery2.fx ? jQuery2.fx.speeds[time] || time : time;
          type = type || "fx";
          return this.queue(type, function(next, hooks) {
            var timeout = window2.setTimeout(next, time);
            hooks.stop = function() {
              window2.clearTimeout(timeout);
            };
          });
        };
        (function() {
          var input = document2.createElement("input"), select = document2.createElement("select"), opt = select.appendChild(document2.createElement("option"));
          input.type = "checkbox";
          support.checkOn = input.value !== "";
          support.optSelected = opt.selected;
          input = document2.createElement("input");
          input.value = "t";
          input.type = "radio";
          support.radioValue = input.value === "t";
        })();
        var boolHook, attrHandle = jQuery2.expr.attrHandle;
        jQuery2.fn.extend({
          attr: function(name, value) {
            return access(this, jQuery2.attr, name, value, arguments.length > 1);
          },
          removeAttr: function(name) {
            return this.each(function() {
              jQuery2.removeAttr(this, name);
            });
          }
        });
        jQuery2.extend({
          attr: function(elem, name, value) {
            var ret, hooks, nType = elem.nodeType;
            if (nType === 3 || nType === 8 || nType === 2) {
              return;
            }
            if (typeof elem.getAttribute === "undefined") {
              return jQuery2.prop(elem, name, value);
            }
            if (nType !== 1 || !jQuery2.isXMLDoc(elem)) {
              hooks = jQuery2.attrHooks[name.toLowerCase()] || (jQuery2.expr.match.bool.test(name) ? boolHook : void 0);
            }
            if (value !== void 0) {
              if (value === null) {
                jQuery2.removeAttr(elem, name);
                return;
              }
              if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
                return ret;
              }
              elem.setAttribute(name, value + "");
              return value;
            }
            if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
              return ret;
            }
            ret = jQuery2.find.attr(elem, name);
            return ret == null ? void 0 : ret;
          },
          attrHooks: {
            type: {
              set: function(elem, value) {
                if (!support.radioValue && value === "radio" && nodeName(elem, "input")) {
                  var val = elem.value;
                  elem.setAttribute("type", value);
                  if (val) {
                    elem.value = val;
                  }
                  return value;
                }
              }
            }
          },
          removeAttr: function(elem, value) {
            var name, i = 0, attrNames = value && value.match(rnothtmlwhite);
            if (attrNames && elem.nodeType === 1) {
              while (name = attrNames[i++]) {
                elem.removeAttribute(name);
              }
            }
          }
        });
        boolHook = {
          set: function(elem, value, name) {
            if (value === false) {
              jQuery2.removeAttr(elem, name);
            } else {
              elem.setAttribute(name, name);
            }
            return name;
          }
        };
        jQuery2.each(jQuery2.expr.match.bool.source.match(/\w+/g), function(_i, name) {
          var getter = attrHandle[name] || jQuery2.find.attr;
          attrHandle[name] = function(elem, name2, isXML) {
            var ret, handle, lowercaseName = name2.toLowerCase();
            if (!isXML) {
              handle = attrHandle[lowercaseName];
              attrHandle[lowercaseName] = ret;
              ret = getter(elem, name2, isXML) != null ? lowercaseName : null;
              attrHandle[lowercaseName] = handle;
            }
            return ret;
          };
        });
        var rfocusable = /^(?:input|select|textarea|button)$/i, rclickable = /^(?:a|area)$/i;
        jQuery2.fn.extend({
          prop: function(name, value) {
            return access(this, jQuery2.prop, name, value, arguments.length > 1);
          },
          removeProp: function(name) {
            return this.each(function() {
              delete this[jQuery2.propFix[name] || name];
            });
          }
        });
        jQuery2.extend({
          prop: function(elem, name, value) {
            var ret, hooks, nType = elem.nodeType;
            if (nType === 3 || nType === 8 || nType === 2) {
              return;
            }
            if (nType !== 1 || !jQuery2.isXMLDoc(elem)) {
              name = jQuery2.propFix[name] || name;
              hooks = jQuery2.propHooks[name];
            }
            if (value !== void 0) {
              if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
                return ret;
              }
              return elem[name] = value;
            }
            if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
              return ret;
            }
            return elem[name];
          },
          propHooks: {
            tabIndex: {
              get: function(elem) {
                var tabindex = jQuery2.find.attr(elem, "tabindex");
                if (tabindex) {
                  return parseInt(tabindex, 10);
                }
                if (rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href) {
                  return 0;
                }
                return -1;
              }
            }
          },
          propFix: {
            "for": "htmlFor",
            "class": "className"
          }
        });
        if (!support.optSelected) {
          jQuery2.propHooks.selected = {
            get: function(elem) {
              var parent = elem.parentNode;
              if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
              }
              return null;
            },
            set: function(elem) {
              var parent = elem.parentNode;
              if (parent) {
                parent.selectedIndex;
                if (parent.parentNode) {
                  parent.parentNode.selectedIndex;
                }
              }
            }
          };
        }
        jQuery2.each([
          "tabIndex",
          "readOnly",
          "maxLength",
          "cellSpacing",
          "cellPadding",
          "rowSpan",
          "colSpan",
          "useMap",
          "frameBorder",
          "contentEditable"
        ], function() {
          jQuery2.propFix[this.toLowerCase()] = this;
        });
        function stripAndCollapse(value) {
          var tokens = value.match(rnothtmlwhite) || [];
          return tokens.join(" ");
        }
        function getClass(elem) {
          return elem.getAttribute && elem.getAttribute("class") || "";
        }
        function classesToArray(value) {
          if (Array.isArray(value)) {
            return value;
          }
          if (typeof value === "string") {
            return value.match(rnothtmlwhite) || [];
          }
          return [];
        }
        jQuery2.fn.extend({
          addClass: function(value) {
            var classes, elem, cur, curValue, clazz, j, finalValue, i = 0;
            if (isFunction(value)) {
              return this.each(function(j2) {
                jQuery2(this).addClass(value.call(this, j2, getClass(this)));
              });
            }
            classes = classesToArray(value);
            if (classes.length) {
              while (elem = this[i++]) {
                curValue = getClass(elem);
                cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
                if (cur) {
                  j = 0;
                  while (clazz = classes[j++]) {
                    if (cur.indexOf(" " + clazz + " ") < 0) {
                      cur += clazz + " ";
                    }
                  }
                  finalValue = stripAndCollapse(cur);
                  if (curValue !== finalValue) {
                    elem.setAttribute("class", finalValue);
                  }
                }
              }
            }
            return this;
          },
          removeClass: function(value) {
            var classes, elem, cur, curValue, clazz, j, finalValue, i = 0;
            if (isFunction(value)) {
              return this.each(function(j2) {
                jQuery2(this).removeClass(value.call(this, j2, getClass(this)));
              });
            }
            if (!arguments.length) {
              return this.attr("class", "");
            }
            classes = classesToArray(value);
            if (classes.length) {
              while (elem = this[i++]) {
                curValue = getClass(elem);
                cur = elem.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
                if (cur) {
                  j = 0;
                  while (clazz = classes[j++]) {
                    while (cur.indexOf(" " + clazz + " ") > -1) {
                      cur = cur.replace(" " + clazz + " ", " ");
                    }
                  }
                  finalValue = stripAndCollapse(cur);
                  if (curValue !== finalValue) {
                    elem.setAttribute("class", finalValue);
                  }
                }
              }
            }
            return this;
          },
          toggleClass: function(value, stateVal) {
            var type = typeof value, isValidValue = type === "string" || Array.isArray(value);
            if (typeof stateVal === "boolean" && isValidValue) {
              return stateVal ? this.addClass(value) : this.removeClass(value);
            }
            if (isFunction(value)) {
              return this.each(function(i) {
                jQuery2(this).toggleClass(value.call(this, i, getClass(this), stateVal), stateVal);
              });
            }
            return this.each(function() {
              var className, i, self2, classNames;
              if (isValidValue) {
                i = 0;
                self2 = jQuery2(this);
                classNames = classesToArray(value);
                while (className = classNames[i++]) {
                  if (self2.hasClass(className)) {
                    self2.removeClass(className);
                  } else {
                    self2.addClass(className);
                  }
                }
              } else if (value === void 0 || type === "boolean") {
                className = getClass(this);
                if (className) {
                  dataPriv.set(this, "__className__", className);
                }
                if (this.setAttribute) {
                  this.setAttribute("class", className || value === false ? "" : dataPriv.get(this, "__className__") || "");
                }
              }
            });
          },
          hasClass: function(selector) {
            var className, elem, i = 0;
            className = " " + selector + " ";
            while (elem = this[i++]) {
              if (elem.nodeType === 1 && (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1) {
                return true;
              }
            }
            return false;
          }
        });
        var rreturn = /\r/g;
        jQuery2.fn.extend({
          val: function(value) {
            var hooks, ret, valueIsFunction, elem = this[0];
            if (!arguments.length) {
              if (elem) {
                hooks = jQuery2.valHooks[elem.type] || jQuery2.valHooks[elem.nodeName.toLowerCase()];
                if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== void 0) {
                  return ret;
                }
                ret = elem.value;
                if (typeof ret === "string") {
                  return ret.replace(rreturn, "");
                }
                return ret == null ? "" : ret;
              }
              return;
            }
            valueIsFunction = isFunction(value);
            return this.each(function(i) {
              var val;
              if (this.nodeType !== 1) {
                return;
              }
              if (valueIsFunction) {
                val = value.call(this, i, jQuery2(this).val());
              } else {
                val = value;
              }
              if (val == null) {
                val = "";
              } else if (typeof val === "number") {
                val += "";
              } else if (Array.isArray(val)) {
                val = jQuery2.map(val, function(value2) {
                  return value2 == null ? "" : value2 + "";
                });
              }
              hooks = jQuery2.valHooks[this.type] || jQuery2.valHooks[this.nodeName.toLowerCase()];
              if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === void 0) {
                this.value = val;
              }
            });
          }
        });
        jQuery2.extend({
          valHooks: {
            option: {
              get: function(elem) {
                var val = jQuery2.find.attr(elem, "value");
                return val != null ? val : stripAndCollapse(jQuery2.text(elem));
              }
            },
            select: {
              get: function(elem) {
                var value, option, i, options = elem.options, index = elem.selectedIndex, one = elem.type === "select-one", values = one ? null : [], max = one ? index + 1 : options.length;
                if (index < 0) {
                  i = max;
                } else {
                  i = one ? index : 0;
                }
                for (; i < max; i++) {
                  option = options[i];
                  if ((option.selected || i === index) && !option.disabled && (!option.parentNode.disabled || !nodeName(option.parentNode, "optgroup"))) {
                    value = jQuery2(option).val();
                    if (one) {
                      return value;
                    }
                    values.push(value);
                  }
                }
                return values;
              },
              set: function(elem, value) {
                var optionSet, option, options = elem.options, values = jQuery2.makeArray(value), i = options.length;
                while (i--) {
                  option = options[i];
                  if (option.selected = jQuery2.inArray(jQuery2.valHooks.option.get(option), values) > -1) {
                    optionSet = true;
                  }
                }
                if (!optionSet) {
                  elem.selectedIndex = -1;
                }
                return values;
              }
            }
          }
        });
        jQuery2.each(["radio", "checkbox"], function() {
          jQuery2.valHooks[this] = {
            set: function(elem, value) {
              if (Array.isArray(value)) {
                return elem.checked = jQuery2.inArray(jQuery2(elem).val(), value) > -1;
              }
            }
          };
          if (!support.checkOn) {
            jQuery2.valHooks[this].get = function(elem) {
              return elem.getAttribute("value") === null ? "on" : elem.value;
            };
          }
        });
        support.focusin = "onfocusin" in window2;
        var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, stopPropagationCallback = function(e) {
          e.stopPropagation();
        };
        jQuery2.extend(jQuery2.event, {
          trigger: function(event, data, elem, onlyHandlers) {
            var i, cur, tmp, bubbleType, ontype, handle, special, lastElement, eventPath = [elem || document2], type = hasOwn.call(event, "type") ? event.type : event, namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
            cur = lastElement = tmp = elem = elem || document2;
            if (elem.nodeType === 3 || elem.nodeType === 8) {
              return;
            }
            if (rfocusMorph.test(type + jQuery2.event.triggered)) {
              return;
            }
            if (type.indexOf(".") > -1) {
              namespaces = type.split(".");
              type = namespaces.shift();
              namespaces.sort();
            }
            ontype = type.indexOf(":") < 0 && "on" + type;
            event = event[jQuery2.expando] ? event : new jQuery2.Event(type, typeof event === "object" && event);
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join(".");
            event.rnamespace = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            event.result = void 0;
            if (!event.target) {
              event.target = elem;
            }
            data = data == null ? [event] : jQuery2.makeArray(data, [event]);
            special = jQuery2.event.special[type] || {};
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
              return;
            }
            if (!onlyHandlers && !special.noBubble && !isWindow(elem)) {
              bubbleType = special.delegateType || type;
              if (!rfocusMorph.test(bubbleType + type)) {
                cur = cur.parentNode;
              }
              for (; cur; cur = cur.parentNode) {
                eventPath.push(cur);
                tmp = cur;
              }
              if (tmp === (elem.ownerDocument || document2)) {
                eventPath.push(tmp.defaultView || tmp.parentWindow || window2);
              }
            }
            i = 0;
            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
              lastElement = cur;
              event.type = i > 1 ? bubbleType : special.bindType || type;
              handle = (dataPriv.get(cur, "events") || /* @__PURE__ */ Object.create(null))[event.type] && dataPriv.get(cur, "handle");
              if (handle) {
                handle.apply(cur, data);
              }
              handle = ontype && cur[ontype];
              if (handle && handle.apply && acceptData(cur)) {
                event.result = handle.apply(cur, data);
                if (event.result === false) {
                  event.preventDefault();
                }
              }
            }
            event.type = type;
            if (!onlyHandlers && !event.isDefaultPrevented()) {
              if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && acceptData(elem)) {
                if (ontype && isFunction(elem[type]) && !isWindow(elem)) {
                  tmp = elem[ontype];
                  if (tmp) {
                    elem[ontype] = null;
                  }
                  jQuery2.event.triggered = type;
                  if (event.isPropagationStopped()) {
                    lastElement.addEventListener(type, stopPropagationCallback);
                  }
                  elem[type]();
                  if (event.isPropagationStopped()) {
                    lastElement.removeEventListener(type, stopPropagationCallback);
                  }
                  jQuery2.event.triggered = void 0;
                  if (tmp) {
                    elem[ontype] = tmp;
                  }
                }
              }
            }
            return event.result;
          },
          simulate: function(type, elem, event) {
            var e = jQuery2.extend(new jQuery2.Event(), event, {
              type,
              isSimulated: true
            });
            jQuery2.event.trigger(e, null, elem);
          }
        });
        jQuery2.fn.extend({
          trigger: function(type, data) {
            return this.each(function() {
              jQuery2.event.trigger(type, data, this);
            });
          },
          triggerHandler: function(type, data) {
            var elem = this[0];
            if (elem) {
              return jQuery2.event.trigger(type, data, elem, true);
            }
          }
        });
        if (!support.focusin) {
          jQuery2.each({ focus: "focusin", blur: "focusout" }, function(orig, fix) {
            var handler = function(event) {
              jQuery2.event.simulate(fix, event.target, jQuery2.event.fix(event));
            };
            jQuery2.event.special[fix] = {
              setup: function() {
                var doc = this.ownerDocument || this.document || this, attaches = dataPriv.access(doc, fix);
                if (!attaches) {
                  doc.addEventListener(orig, handler, true);
                }
                dataPriv.access(doc, fix, (attaches || 0) + 1);
              },
              teardown: function() {
                var doc = this.ownerDocument || this.document || this, attaches = dataPriv.access(doc, fix) - 1;
                if (!attaches) {
                  doc.removeEventListener(orig, handler, true);
                  dataPriv.remove(doc, fix);
                } else {
                  dataPriv.access(doc, fix, attaches);
                }
              }
            };
          });
        }
        var location2 = window2.location;
        var nonce = { guid: Date.now() };
        var rquery = /\?/;
        jQuery2.parseXML = function(data) {
          var xml, parserErrorElem;
          if (!data || typeof data !== "string") {
            return null;
          }
          try {
            xml = new window2.DOMParser().parseFromString(data, "text/xml");
          } catch (e) {
          }
          parserErrorElem = xml && xml.getElementsByTagName("parsererror")[0];
          if (!xml || parserErrorElem) {
            jQuery2.error("Invalid XML: " + (parserErrorElem ? jQuery2.map(parserErrorElem.childNodes, function(el) {
              return el.textContent;
            }).join("\n") : data));
          }
          return xml;
        };
        var rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
        function buildParams(prefix, obj, traditional, add2) {
          var name;
          if (Array.isArray(obj)) {
            jQuery2.each(obj, function(i, v) {
              if (traditional || rbracket.test(prefix)) {
                add2(prefix, v);
              } else {
                buildParams(prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]", v, traditional, add2);
              }
            });
          } else if (!traditional && toType(obj) === "object") {
            for (name in obj) {
              buildParams(prefix + "[" + name + "]", obj[name], traditional, add2);
            }
          } else {
            add2(prefix, obj);
          }
        }
        jQuery2.param = function(a, traditional) {
          var prefix, s = [], add2 = function(key, valueOrFunction) {
            var value = isFunction(valueOrFunction) ? valueOrFunction() : valueOrFunction;
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value == null ? "" : value);
          };
          if (a == null) {
            return "";
          }
          if (Array.isArray(a) || a.jquery && !jQuery2.isPlainObject(a)) {
            jQuery2.each(a, function() {
              add2(this.name, this.value);
            });
          } else {
            for (prefix in a) {
              buildParams(prefix, a[prefix], traditional, add2);
            }
          }
          return s.join("&");
        };
        jQuery2.fn.extend({
          serialize: function() {
            return jQuery2.param(this.serializeArray());
          },
          serializeArray: function() {
            return this.map(function() {
              var elements = jQuery2.prop(this, "elements");
              return elements ? jQuery2.makeArray(elements) : this;
            }).filter(function() {
              var type = this.type;
              return this.name && !jQuery2(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
            }).map(function(_i, elem) {
              var val = jQuery2(this).val();
              if (val == null) {
                return null;
              }
              if (Array.isArray(val)) {
                return jQuery2.map(val, function(val2) {
                  return { name: elem.name, value: val2.replace(rCRLF, "\r\n") };
                });
              }
              return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
            }).get();
          }
        });
        var r20 = /%20/g, rhash = /#.*$/, rantiCache = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, prefilters = {}, transports = {}, allTypes = "*/".concat("*"), originAnchor = document2.createElement("a");
        originAnchor.href = location2.href;
        function addToPrefiltersOrTransports(structure) {
          return function(dataTypeExpression, func) {
            if (typeof dataTypeExpression !== "string") {
              func = dataTypeExpression;
              dataTypeExpression = "*";
            }
            var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];
            if (isFunction(func)) {
              while (dataType = dataTypes[i++]) {
                if (dataType[0] === "+") {
                  dataType = dataType.slice(1) || "*";
                  (structure[dataType] = structure[dataType] || []).unshift(func);
                } else {
                  (structure[dataType] = structure[dataType] || []).push(func);
                }
              }
            }
          };
        }
        function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
          var inspected = {}, seekingTransport = structure === transports;
          function inspect(dataType) {
            var selected;
            inspected[dataType] = true;
            jQuery2.each(structure[dataType] || [], function(_, prefilterOrFactory) {
              var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
              if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
                options.dataTypes.unshift(dataTypeOrTransport);
                inspect(dataTypeOrTransport);
                return false;
              } else if (seekingTransport) {
                return !(selected = dataTypeOrTransport);
              }
            });
            return selected;
          }
          return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
        }
        function ajaxExtend(target, src) {
          var key, deep, flatOptions = jQuery2.ajaxSettings.flatOptions || {};
          for (key in src) {
            if (src[key] !== void 0) {
              (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
            }
          }
          if (deep) {
            jQuery2.extend(true, target, deep);
          }
          return target;
        }
        function ajaxHandleResponses(s, jqXHR, responses) {
          var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes;
          while (dataTypes[0] === "*") {
            dataTypes.shift();
            if (ct === void 0) {
              ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
            }
          }
          if (ct) {
            for (type in contents) {
              if (contents[type] && contents[type].test(ct)) {
                dataTypes.unshift(type);
                break;
              }
            }
          }
          if (dataTypes[0] in responses) {
            finalDataType = dataTypes[0];
          } else {
            for (type in responses) {
              if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                finalDataType = type;
                break;
              }
              if (!firstDataType) {
                firstDataType = type;
              }
            }
            finalDataType = finalDataType || firstDataType;
          }
          if (finalDataType) {
            if (finalDataType !== dataTypes[0]) {
              dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
          }
        }
        function ajaxConvert(s, response, jqXHR, isSuccess) {
          var conv2, current, conv, tmp, prev, converters = {}, dataTypes = s.dataTypes.slice();
          if (dataTypes[1]) {
            for (conv in s.converters) {
              converters[conv.toLowerCase()] = s.converters[conv];
            }
          }
          current = dataTypes.shift();
          while (current) {
            if (s.responseFields[current]) {
              jqXHR[s.responseFields[current]] = response;
            }
            if (!prev && isSuccess && s.dataFilter) {
              response = s.dataFilter(response, s.dataType);
            }
            prev = current;
            current = dataTypes.shift();
            if (current) {
              if (current === "*") {
                current = prev;
              } else if (prev !== "*" && prev !== current) {
                conv = converters[prev + " " + current] || converters["* " + current];
                if (!conv) {
                  for (conv2 in converters) {
                    tmp = conv2.split(" ");
                    if (tmp[1] === current) {
                      conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                      if (conv) {
                        if (conv === true) {
                          conv = converters[conv2];
                        } else if (converters[conv2] !== true) {
                          current = tmp[0];
                          dataTypes.unshift(tmp[1]);
                        }
                        break;
                      }
                    }
                  }
                }
                if (conv !== true) {
                  if (conv && s.throws) {
                    response = conv(response);
                  } else {
                    try {
                      response = conv(response);
                    } catch (e) {
                      return {
                        state: "parsererror",
                        error: conv ? e : "No conversion from " + prev + " to " + current
                      };
                    }
                  }
                }
              }
            }
          }
          return { state: "success", data: response };
        }
        jQuery2.extend({
          active: 0,
          lastModified: {},
          etag: {},
          ajaxSettings: {
            url: location2.href,
            type: "GET",
            isLocal: rlocalProtocol.test(location2.protocol),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
              "*": allTypes,
              text: "text/plain",
              html: "text/html",
              xml: "application/xml, text/xml",
              json: "application/json, text/javascript"
            },
            contents: {
              xml: /\bxml\b/,
              html: /\bhtml/,
              json: /\bjson\b/
            },
            responseFields: {
              xml: "responseXML",
              text: "responseText",
              json: "responseJSON"
            },
            converters: {
              "* text": String,
              "text html": true,
              "text json": JSON.parse,
              "text xml": jQuery2.parseXML
            },
            flatOptions: {
              url: true,
              context: true
            }
          },
          ajaxSetup: function(target, settings) {
            return settings ? ajaxExtend(ajaxExtend(target, jQuery2.ajaxSettings), settings) : ajaxExtend(jQuery2.ajaxSettings, target);
          },
          ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
          ajaxTransport: addToPrefiltersOrTransports(transports),
          ajax: function(url, options) {
            if (typeof url === "object") {
              options = url;
              url = void 0;
            }
            options = options || {};
            var transport, cacheURL, responseHeadersString, responseHeaders, timeoutTimer, urlAnchor, completed2, fireGlobals, i, uncached, s = jQuery2.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery2(callbackContext) : jQuery2.event, deferred = jQuery2.Deferred(), completeDeferred = jQuery2.Callbacks("once memory"), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, strAbort = "canceled", jqXHR = {
              readyState: 0,
              getResponseHeader: function(key) {
                var match;
                if (completed2) {
                  if (!responseHeaders) {
                    responseHeaders = {};
                    while (match = rheaders.exec(responseHeadersString)) {
                      responseHeaders[match[1].toLowerCase() + " "] = (responseHeaders[match[1].toLowerCase() + " "] || []).concat(match[2]);
                    }
                  }
                  match = responseHeaders[key.toLowerCase() + " "];
                }
                return match == null ? null : match.join(", ");
              },
              getAllResponseHeaders: function() {
                return completed2 ? responseHeadersString : null;
              },
              setRequestHeader: function(name, value) {
                if (completed2 == null) {
                  name = requestHeadersNames[name.toLowerCase()] = requestHeadersNames[name.toLowerCase()] || name;
                  requestHeaders[name] = value;
                }
                return this;
              },
              overrideMimeType: function(type) {
                if (completed2 == null) {
                  s.mimeType = type;
                }
                return this;
              },
              statusCode: function(map) {
                var code;
                if (map) {
                  if (completed2) {
                    jqXHR.always(map[jqXHR.status]);
                  } else {
                    for (code in map) {
                      statusCode[code] = [statusCode[code], map[code]];
                    }
                  }
                }
                return this;
              },
              abort: function(statusText) {
                var finalText = statusText || strAbort;
                if (transport) {
                  transport.abort(finalText);
                }
                done(0, finalText);
                return this;
              }
            };
            deferred.promise(jqXHR);
            s.url = ((url || s.url || location2.href) + "").replace(rprotocol, location2.protocol + "//");
            s.type = options.method || options.type || s.method || s.type;
            s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];
            if (s.crossDomain == null) {
              urlAnchor = document2.createElement("a");
              try {
                urlAnchor.href = s.url;
                urlAnchor.href = urlAnchor.href;
                s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !== urlAnchor.protocol + "//" + urlAnchor.host;
              } catch (e) {
                s.crossDomain = true;
              }
            }
            if (s.data && s.processData && typeof s.data !== "string") {
              s.data = jQuery2.param(s.data, s.traditional);
            }
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
            if (completed2) {
              return jqXHR;
            }
            fireGlobals = jQuery2.event && s.global;
            if (fireGlobals && jQuery2.active++ === 0) {
              jQuery2.event.trigger("ajaxStart");
            }
            s.type = s.type.toUpperCase();
            s.hasContent = !rnoContent.test(s.type);
            cacheURL = s.url.replace(rhash, "");
            if (!s.hasContent) {
              uncached = s.url.slice(cacheURL.length);
              if (s.data && (s.processData || typeof s.data === "string")) {
                cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;
                delete s.data;
              }
              if (s.cache === false) {
                cacheURL = cacheURL.replace(rantiCache, "$1");
                uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce.guid++ + uncached;
              }
              s.url = cacheURL + uncached;
            } else if (s.data && s.processData && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0) {
              s.data = s.data.replace(r20, "+");
            }
            if (s.ifModified) {
              if (jQuery2.lastModified[cacheURL]) {
                jqXHR.setRequestHeader("If-Modified-Since", jQuery2.lastModified[cacheURL]);
              }
              if (jQuery2.etag[cacheURL]) {
                jqXHR.setRequestHeader("If-None-Match", jQuery2.etag[cacheURL]);
              }
            }
            if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
              jqXHR.setRequestHeader("Content-Type", s.contentType);
            }
            jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
            for (i in s.headers) {
              jqXHR.setRequestHeader(i, s.headers[i]);
            }
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed2)) {
              return jqXHR.abort();
            }
            strAbort = "abort";
            completeDeferred.add(s.complete);
            jqXHR.done(s.success);
            jqXHR.fail(s.error);
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
            if (!transport) {
              done(-1, "No Transport");
            } else {
              jqXHR.readyState = 1;
              if (fireGlobals) {
                globalEventContext.trigger("ajaxSend", [jqXHR, s]);
              }
              if (completed2) {
                return jqXHR;
              }
              if (s.async && s.timeout > 0) {
                timeoutTimer = window2.setTimeout(function() {
                  jqXHR.abort("timeout");
                }, s.timeout);
              }
              try {
                completed2 = false;
                transport.send(requestHeaders, done);
              } catch (e) {
                if (completed2) {
                  throw e;
                }
                done(-1, e);
              }
            }
            function done(status, nativeStatusText, responses, headers) {
              var isSuccess, success, error2, response, modified, statusText = nativeStatusText;
              if (completed2) {
                return;
              }
              completed2 = true;
              if (timeoutTimer) {
                window2.clearTimeout(timeoutTimer);
              }
              transport = void 0;
              responseHeadersString = headers || "";
              jqXHR.readyState = status > 0 ? 4 : 0;
              isSuccess = status >= 200 && status < 300 || status === 304;
              if (responses) {
                response = ajaxHandleResponses(s, jqXHR, responses);
              }
              if (!isSuccess && jQuery2.inArray("script", s.dataTypes) > -1 && jQuery2.inArray("json", s.dataTypes) < 0) {
                s.converters["text script"] = function() {
                };
              }
              response = ajaxConvert(s, response, jqXHR, isSuccess);
              if (isSuccess) {
                if (s.ifModified) {
                  modified = jqXHR.getResponseHeader("Last-Modified");
                  if (modified) {
                    jQuery2.lastModified[cacheURL] = modified;
                  }
                  modified = jqXHR.getResponseHeader("etag");
                  if (modified) {
                    jQuery2.etag[cacheURL] = modified;
                  }
                }
                if (status === 204 || s.type === "HEAD") {
                  statusText = "nocontent";
                } else if (status === 304) {
                  statusText = "notmodified";
                } else {
                  statusText = response.state;
                  success = response.data;
                  error2 = response.error;
                  isSuccess = !error2;
                }
              } else {
                error2 = statusText;
                if (status || !statusText) {
                  statusText = "error";
                  if (status < 0) {
                    status = 0;
                  }
                }
              }
              jqXHR.status = status;
              jqXHR.statusText = (nativeStatusText || statusText) + "";
              if (isSuccess) {
                deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
              } else {
                deferred.rejectWith(callbackContext, [jqXHR, statusText, error2]);
              }
              jqXHR.statusCode(statusCode);
              statusCode = void 0;
              if (fireGlobals) {
                globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error2]);
              }
              completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
              if (fireGlobals) {
                globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                if (!--jQuery2.active) {
                  jQuery2.event.trigger("ajaxStop");
                }
              }
            }
            return jqXHR;
          },
          getJSON: function(url, data, callback) {
            return jQuery2.get(url, data, callback, "json");
          },
          getScript: function(url, callback) {
            return jQuery2.get(url, void 0, callback, "script");
          }
        });
        jQuery2.each(["get", "post"], function(_i, method) {
          jQuery2[method] = function(url, data, callback, type) {
            if (isFunction(data)) {
              type = type || callback;
              callback = data;
              data = void 0;
            }
            return jQuery2.ajax(jQuery2.extend({
              url,
              type: method,
              dataType: type,
              data,
              success: callback
            }, jQuery2.isPlainObject(url) && url));
          };
        });
        jQuery2.ajaxPrefilter(function(s) {
          var i;
          for (i in s.headers) {
            if (i.toLowerCase() === "content-type") {
              s.contentType = s.headers[i] || "";
            }
          }
        });
        jQuery2._evalUrl = function(url, options, doc) {
          return jQuery2.ajax({
            url,
            type: "GET",
            dataType: "script",
            cache: true,
            async: false,
            global: false,
            converters: {
              "text script": function() {
              }
            },
            dataFilter: function(response) {
              jQuery2.globalEval(response, options, doc);
            }
          });
        };
        jQuery2.fn.extend({
          wrapAll: function(html) {
            var wrap;
            if (this[0]) {
              if (isFunction(html)) {
                html = html.call(this[0]);
              }
              wrap = jQuery2(html, this[0].ownerDocument).eq(0).clone(true);
              if (this[0].parentNode) {
                wrap.insertBefore(this[0]);
              }
              wrap.map(function() {
                var elem = this;
                while (elem.firstElementChild) {
                  elem = elem.firstElementChild;
                }
                return elem;
              }).append(this);
            }
            return this;
          },
          wrapInner: function(html) {
            if (isFunction(html)) {
              return this.each(function(i) {
                jQuery2(this).wrapInner(html.call(this, i));
              });
            }
            return this.each(function() {
              var self2 = jQuery2(this), contents = self2.contents();
              if (contents.length) {
                contents.wrapAll(html);
              } else {
                self2.append(html);
              }
            });
          },
          wrap: function(html) {
            var htmlIsFunction = isFunction(html);
            return this.each(function(i) {
              jQuery2(this).wrapAll(htmlIsFunction ? html.call(this, i) : html);
            });
          },
          unwrap: function(selector) {
            this.parent(selector).not("body").each(function() {
              jQuery2(this).replaceWith(this.childNodes);
            });
            return this;
          }
        });
        jQuery2.expr.pseudos.hidden = function(elem) {
          return !jQuery2.expr.pseudos.visible(elem);
        };
        jQuery2.expr.pseudos.visible = function(elem) {
          return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
        };
        jQuery2.ajaxSettings.xhr = function() {
          try {
            return new window2.XMLHttpRequest();
          } catch (e) {
          }
        };
        var xhrSuccessStatus = {
          0: 200,
          1223: 204
        }, xhrSupported = jQuery2.ajaxSettings.xhr();
        support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
        support.ajax = xhrSupported = !!xhrSupported;
        jQuery2.ajaxTransport(function(options) {
          var callback, errorCallback;
          if (support.cors || xhrSupported && !options.crossDomain) {
            return {
              send: function(headers, complete) {
                var i, xhr = options.xhr();
                xhr.open(options.type, options.url, options.async, options.username, options.password);
                if (options.xhrFields) {
                  for (i in options.xhrFields) {
                    xhr[i] = options.xhrFields[i];
                  }
                }
                if (options.mimeType && xhr.overrideMimeType) {
                  xhr.overrideMimeType(options.mimeType);
                }
                if (!options.crossDomain && !headers["X-Requested-With"]) {
                  headers["X-Requested-With"] = "XMLHttpRequest";
                }
                for (i in headers) {
                  xhr.setRequestHeader(i, headers[i]);
                }
                callback = function(type) {
                  return function() {
                    if (callback) {
                      callback = errorCallback = xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = xhr.onreadystatechange = null;
                      if (type === "abort") {
                        xhr.abort();
                      } else if (type === "error") {
                        if (typeof xhr.status !== "number") {
                          complete(0, "error");
                        } else {
                          complete(xhr.status, xhr.statusText);
                        }
                      } else {
                        complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText, (xhr.responseType || "text") !== "text" || typeof xhr.responseText !== "string" ? { binary: xhr.response } : { text: xhr.responseText }, xhr.getAllResponseHeaders());
                      }
                    }
                  };
                };
                xhr.onload = callback();
                errorCallback = xhr.onerror = xhr.ontimeout = callback("error");
                if (xhr.onabort !== void 0) {
                  xhr.onabort = errorCallback;
                } else {
                  xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                      window2.setTimeout(function() {
                        if (callback) {
                          errorCallback();
                        }
                      });
                    }
                  };
                }
                callback = callback("abort");
                try {
                  xhr.send(options.hasContent && options.data || null);
                } catch (e) {
                  if (callback) {
                    throw e;
                  }
                }
              },
              abort: function() {
                if (callback) {
                  callback();
                }
              }
            };
          }
        });
        jQuery2.ajaxPrefilter(function(s) {
          if (s.crossDomain) {
            s.contents.script = false;
          }
        });
        jQuery2.ajaxSetup({
          accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
          },
          contents: {
            script: /\b(?:java|ecma)script\b/
          },
          converters: {
            "text script": function(text) {
              jQuery2.globalEval(text);
              return text;
            }
          }
        });
        jQuery2.ajaxPrefilter("script", function(s) {
          if (s.cache === void 0) {
            s.cache = false;
          }
          if (s.crossDomain) {
            s.type = "GET";
          }
        });
        jQuery2.ajaxTransport("script", function(s) {
          if (s.crossDomain || s.scriptAttrs) {
            var script, callback;
            return {
              send: function(_, complete) {
                script = jQuery2("<script>").attr(s.scriptAttrs || {}).prop({ charset: s.scriptCharset, src: s.url }).on("load error", callback = function(evt) {
                  script.remove();
                  callback = null;
                  if (evt) {
                    complete(evt.type === "error" ? 404 : 200, evt.type);
                  }
                });
                document2.head.appendChild(script[0]);
              },
              abort: function() {
                if (callback) {
                  callback();
                }
              }
            };
          }
        });
        var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
        jQuery2.ajaxSetup({
          jsonp: "callback",
          jsonpCallback: function() {
            var callback = oldCallbacks.pop() || jQuery2.expando + "_" + nonce.guid++;
            this[callback] = true;
            return callback;
          }
        });
        jQuery2.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
          var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0 && rjsonp.test(s.data) && "data");
          if (jsonProp || s.dataTypes[0] === "jsonp") {
            callbackName = s.jsonpCallback = isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
            if (jsonProp) {
              s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
            } else if (s.jsonp !== false) {
              s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
            }
            s.converters["script json"] = function() {
              if (!responseContainer) {
                jQuery2.error(callbackName + " was not called");
              }
              return responseContainer[0];
            };
            s.dataTypes[0] = "json";
            overwritten = window2[callbackName];
            window2[callbackName] = function() {
              responseContainer = arguments;
            };
            jqXHR.always(function() {
              if (overwritten === void 0) {
                jQuery2(window2).removeProp(callbackName);
              } else {
                window2[callbackName] = overwritten;
              }
              if (s[callbackName]) {
                s.jsonpCallback = originalSettings.jsonpCallback;
                oldCallbacks.push(callbackName);
              }
              if (responseContainer && isFunction(overwritten)) {
                overwritten(responseContainer[0]);
              }
              responseContainer = overwritten = void 0;
            });
            return "script";
          }
        });
        support.createHTMLDocument = function() {
          var body = document2.implementation.createHTMLDocument("").body;
          body.innerHTML = "<form></form><form></form>";
          return body.childNodes.length === 2;
        }();
        jQuery2.parseHTML = function(data, context, keepScripts) {
          if (typeof data !== "string") {
            return [];
          }
          if (typeof context === "boolean") {
            keepScripts = context;
            context = false;
          }
          var base, parsed, scripts;
          if (!context) {
            if (support.createHTMLDocument) {
              context = document2.implementation.createHTMLDocument("");
              base = context.createElement("base");
              base.href = document2.location.href;
              context.head.appendChild(base);
            } else {
              context = document2;
            }
          }
          parsed = rsingleTag.exec(data);
          scripts = !keepScripts && [];
          if (parsed) {
            return [context.createElement(parsed[1])];
          }
          parsed = buildFragment([data], context, scripts);
          if (scripts && scripts.length) {
            jQuery2(scripts).remove();
          }
          return jQuery2.merge([], parsed.childNodes);
        };
        jQuery2.fn.load = function(url, params, callback) {
          var selector, type, response, self2 = this, off = url.indexOf(" ");
          if (off > -1) {
            selector = stripAndCollapse(url.slice(off));
            url = url.slice(0, off);
          }
          if (isFunction(params)) {
            callback = params;
            params = void 0;
          } else if (params && typeof params === "object") {
            type = "POST";
          }
          if (self2.length > 0) {
            jQuery2.ajax({
              url,
              type: type || "GET",
              dataType: "html",
              data: params
            }).done(function(responseText) {
              response = arguments;
              self2.html(selector ? jQuery2("<div>").append(jQuery2.parseHTML(responseText)).find(selector) : responseText);
            }).always(callback && function(jqXHR, status) {
              self2.each(function() {
                callback.apply(this, response || [jqXHR.responseText, status, jqXHR]);
              });
            });
          }
          return this;
        };
        jQuery2.expr.pseudos.animated = function(elem) {
          return jQuery2.grep(jQuery2.timers, function(fn) {
            return elem === fn.elem;
          }).length;
        };
        jQuery2.offset = {
          setOffset: function(elem, options, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery2.css(elem, "position"), curElem = jQuery2(elem), props = {};
            if (position === "static") {
              elem.style.position = "relative";
            }
            curOffset = curElem.offset();
            curCSSTop = jQuery2.css(elem, "top");
            curCSSLeft = jQuery2.css(elem, "left");
            calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
            if (calculatePosition) {
              curPosition = curElem.position();
              curTop = curPosition.top;
              curLeft = curPosition.left;
            } else {
              curTop = parseFloat(curCSSTop) || 0;
              curLeft = parseFloat(curCSSLeft) || 0;
            }
            if (isFunction(options)) {
              options = options.call(elem, i, jQuery2.extend({}, curOffset));
            }
            if (options.top != null) {
              props.top = options.top - curOffset.top + curTop;
            }
            if (options.left != null) {
              props.left = options.left - curOffset.left + curLeft;
            }
            if ("using" in options) {
              options.using.call(elem, props);
            } else {
              curElem.css(props);
            }
          }
        };
        jQuery2.fn.extend({
          offset: function(options) {
            if (arguments.length) {
              return options === void 0 ? this : this.each(function(i) {
                jQuery2.offset.setOffset(this, options, i);
              });
            }
            var rect, win, elem = this[0];
            if (!elem) {
              return;
            }
            if (!elem.getClientRects().length) {
              return { top: 0, left: 0 };
            }
            rect = elem.getBoundingClientRect();
            win = elem.ownerDocument.defaultView;
            return {
              top: rect.top + win.pageYOffset,
              left: rect.left + win.pageXOffset
            };
          },
          position: function() {
            if (!this[0]) {
              return;
            }
            var offsetParent, offset, doc, elem = this[0], parentOffset = { top: 0, left: 0 };
            if (jQuery2.css(elem, "position") === "fixed") {
              offset = elem.getBoundingClientRect();
            } else {
              offset = this.offset();
              doc = elem.ownerDocument;
              offsetParent = elem.offsetParent || doc.documentElement;
              while (offsetParent && (offsetParent === doc.body || offsetParent === doc.documentElement) && jQuery2.css(offsetParent, "position") === "static") {
                offsetParent = offsetParent.parentNode;
              }
              if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
                parentOffset = jQuery2(offsetParent).offset();
                parentOffset.top += jQuery2.css(offsetParent, "borderTopWidth", true);
                parentOffset.left += jQuery2.css(offsetParent, "borderLeftWidth", true);
              }
            }
            return {
              top: offset.top - parentOffset.top - jQuery2.css(elem, "marginTop", true),
              left: offset.left - parentOffset.left - jQuery2.css(elem, "marginLeft", true)
            };
          },
          offsetParent: function() {
            return this.map(function() {
              var offsetParent = this.offsetParent;
              while (offsetParent && jQuery2.css(offsetParent, "position") === "static") {
                offsetParent = offsetParent.offsetParent;
              }
              return offsetParent || documentElement;
            });
          }
        });
        jQuery2.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function(method, prop) {
          var top = prop === "pageYOffset";
          jQuery2.fn[method] = function(val) {
            return access(this, function(elem, method2, val2) {
              var win;
              if (isWindow(elem)) {
                win = elem;
              } else if (elem.nodeType === 9) {
                win = elem.defaultView;
              }
              if (val2 === void 0) {
                return win ? win[prop] : elem[method2];
              }
              if (win) {
                win.scrollTo(!top ? val2 : win.pageXOffset, top ? val2 : win.pageYOffset);
              } else {
                elem[method2] = val2;
              }
            }, method, val, arguments.length);
          };
        });
        jQuery2.each(["top", "left"], function(_i, prop) {
          jQuery2.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, computed) {
            if (computed) {
              computed = curCSS(elem, prop);
              return rnumnonpx.test(computed) ? jQuery2(elem).position()[prop] + "px" : computed;
            }
          });
        });
        jQuery2.each({ Height: "height", Width: "width" }, function(name, type) {
          jQuery2.each({
            padding: "inner" + name,
            content: type,
            "": "outer" + name
          }, function(defaultExtra, funcName) {
            jQuery2.fn[funcName] = function(margin, value) {
              var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"), extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
              return access(this, function(elem, type2, value2) {
                var doc;
                if (isWindow(elem)) {
                  return funcName.indexOf("outer") === 0 ? elem["inner" + name] : elem.document.documentElement["client" + name];
                }
                if (elem.nodeType === 9) {
                  doc = elem.documentElement;
                  return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
                }
                return value2 === void 0 ? jQuery2.css(elem, type2, extra) : jQuery2.style(elem, type2, value2, extra);
              }, type, chainable ? margin : void 0, chainable);
            };
          });
        });
        jQuery2.each([
          "ajaxStart",
          "ajaxStop",
          "ajaxComplete",
          "ajaxError",
          "ajaxSuccess",
          "ajaxSend"
        ], function(_i, type) {
          jQuery2.fn[type] = function(fn) {
            return this.on(type, fn);
          };
        });
        jQuery2.fn.extend({
          bind: function(types, data, fn) {
            return this.on(types, null, data, fn);
          },
          unbind: function(types, fn) {
            return this.off(types, null, fn);
          },
          delegate: function(selector, types, data, fn) {
            return this.on(types, selector, data, fn);
          },
          undelegate: function(selector, types, fn) {
            return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
          },
          hover: function(fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
          }
        });
        jQuery2.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(_i, name) {
          jQuery2.fn[name] = function(data, fn) {
            return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
          };
        });
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        jQuery2.proxy = function(fn, context) {
          var tmp, args, proxy;
          if (typeof context === "string") {
            tmp = fn[context];
            context = fn;
            fn = tmp;
          }
          if (!isFunction(fn)) {
            return void 0;
          }
          args = slice.call(arguments, 2);
          proxy = function() {
            return fn.apply(context || this, args.concat(slice.call(arguments)));
          };
          proxy.guid = fn.guid = fn.guid || jQuery2.guid++;
          return proxy;
        };
        jQuery2.holdReady = function(hold) {
          if (hold) {
            jQuery2.readyWait++;
          } else {
            jQuery2.ready(true);
          }
        };
        jQuery2.isArray = Array.isArray;
        jQuery2.parseJSON = JSON.parse;
        jQuery2.nodeName = nodeName;
        jQuery2.isFunction = isFunction;
        jQuery2.isWindow = isWindow;
        jQuery2.camelCase = camelCase;
        jQuery2.type = toType;
        jQuery2.now = Date.now;
        jQuery2.isNumeric = function(obj) {
          var type = jQuery2.type(obj);
          return (type === "number" || type === "string") && !isNaN(obj - parseFloat(obj));
        };
        jQuery2.trim = function(text) {
          return text == null ? "" : (text + "").replace(rtrim, "");
        };
        if (typeof define === "function" && define.amd) {
          define("jquery", [], function() {
            return jQuery2;
          });
        }
        var _jQuery = window2.jQuery, _$ = window2.$;
        jQuery2.noConflict = function(deep) {
          if (window2.$ === jQuery2) {
            window2.$ = _$;
          }
          if (deep && window2.jQuery === jQuery2) {
            window2.jQuery = _jQuery;
          }
          return jQuery2;
        };
        if (typeof noGlobal === "undefined") {
          window2.jQuery = window2.$ = jQuery2;
        }
        return jQuery2;
      });
    }
  });

  // node_modules/datatables.net/js/jquery.dataTables.js
  var require_jquery_dataTables = __commonJS({
    "node_modules/datatables.net/js/jquery.dataTables.js"(exports, module) {
      (function(factory) {
        "use strict";
        if (typeof define === "function" && define.amd) {
          define(["jquery"], function($) {
            return factory($, window, document);
          });
        } else if (typeof exports === "object") {
          module.exports = function(root, $) {
            if (!root) {
              root = window;
            }
            if (!$) {
              $ = typeof window !== "undefined" ? require_jquery() : require_jquery()(root);
            }
            return factory($, root, root.document);
          };
        } else {
          window.DataTable = factory(jQuery, window, document);
        }
      })(function($, window2, document2, undefined2) {
        "use strict";
        var DataTable2 = function(selector, options) {
          if (this instanceof DataTable2) {
            return $(selector).DataTable(options);
          } else {
            options = selector;
          }
          this.$ = function(sSelector, oOpts) {
            return this.api(true).$(sSelector, oOpts);
          };
          this._ = function(sSelector, oOpts) {
            return this.api(true).rows(sSelector, oOpts).data();
          };
          this.api = function(traditional) {
            return traditional ? new _Api(_fnSettingsFromNode(this[_ext.iApiIndex])) : new _Api(this);
          };
          this.fnAddData = function(data, redraw) {
            var api = this.api(true);
            var rows = Array.isArray(data) && (Array.isArray(data[0]) || $.isPlainObject(data[0])) ? api.rows.add(data) : api.row.add(data);
            if (redraw === undefined2 || redraw) {
              api.draw();
            }
            return rows.flatten().toArray();
          };
          this.fnAdjustColumnSizing = function(bRedraw) {
            var api = this.api(true).columns.adjust();
            var settings = api.settings()[0];
            var scroll = settings.oScroll;
            if (bRedraw === undefined2 || bRedraw) {
              api.draw(false);
            } else if (scroll.sX !== "" || scroll.sY !== "") {
              _fnScrollDraw(settings);
            }
          };
          this.fnClearTable = function(bRedraw) {
            var api = this.api(true).clear();
            if (bRedraw === undefined2 || bRedraw) {
              api.draw();
            }
          };
          this.fnClose = function(nTr) {
            this.api(true).row(nTr).child.hide();
          };
          this.fnDeleteRow = function(target, callback, redraw) {
            var api = this.api(true);
            var rows = api.rows(target);
            var settings = rows.settings()[0];
            var data = settings.aoData[rows[0][0]];
            rows.remove();
            if (callback) {
              callback.call(this, settings, data);
            }
            if (redraw === undefined2 || redraw) {
              api.draw();
            }
            return data;
          };
          this.fnDestroy = function(remove) {
            this.api(true).destroy(remove);
          };
          this.fnDraw = function(complete) {
            this.api(true).draw(complete);
          };
          this.fnFilter = function(sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive) {
            var api = this.api(true);
            if (iColumn === null || iColumn === undefined2) {
              api.search(sInput, bRegex, bSmart, bCaseInsensitive);
            } else {
              api.column(iColumn).search(sInput, bRegex, bSmart, bCaseInsensitive);
            }
            api.draw();
          };
          this.fnGetData = function(src, col) {
            var api = this.api(true);
            if (src !== undefined2) {
              var type = src.nodeName ? src.nodeName.toLowerCase() : "";
              return col !== undefined2 || type == "td" || type == "th" ? api.cell(src, col).data() : api.row(src).data() || null;
            }
            return api.data().toArray();
          };
          this.fnGetNodes = function(iRow) {
            var api = this.api(true);
            return iRow !== undefined2 ? api.row(iRow).node() : api.rows().nodes().flatten().toArray();
          };
          this.fnGetPosition = function(node) {
            var api = this.api(true);
            var nodeName = node.nodeName.toUpperCase();
            if (nodeName == "TR") {
              return api.row(node).index();
            } else if (nodeName == "TD" || nodeName == "TH") {
              var cell = api.cell(node).index();
              return [
                cell.row,
                cell.columnVisible,
                cell.column
              ];
            }
            return null;
          };
          this.fnIsOpen = function(nTr) {
            return this.api(true).row(nTr).child.isShown();
          };
          this.fnOpen = function(nTr, mHtml, sClass) {
            return this.api(true).row(nTr).child(mHtml, sClass).show().child()[0];
          };
          this.fnPageChange = function(mAction, bRedraw) {
            var api = this.api(true).page(mAction);
            if (bRedraw === undefined2 || bRedraw) {
              api.draw(false);
            }
          };
          this.fnSetColumnVis = function(iCol, bShow, bRedraw) {
            var api = this.api(true).column(iCol).visible(bShow);
            if (bRedraw === undefined2 || bRedraw) {
              api.columns.adjust().draw();
            }
          };
          this.fnSettings = function() {
            return _fnSettingsFromNode(this[_ext.iApiIndex]);
          };
          this.fnSort = function(aaSort) {
            this.api(true).order(aaSort).draw();
          };
          this.fnSortListener = function(nNode, iColumn, fnCallback) {
            this.api(true).order.listener(nNode, iColumn, fnCallback);
          };
          this.fnUpdate = function(mData, mRow, iColumn, bRedraw, bAction) {
            var api = this.api(true);
            if (iColumn === undefined2 || iColumn === null) {
              api.row(mRow).data(mData);
            } else {
              api.cell(mRow, iColumn).data(mData);
            }
            if (bAction === undefined2 || bAction) {
              api.columns.adjust();
            }
            if (bRedraw === undefined2 || bRedraw) {
              api.draw();
            }
            return 0;
          };
          this.fnVersionCheck = _ext.fnVersionCheck;
          var _that = this;
          var emptyInit = options === undefined2;
          var len = this.length;
          if (emptyInit) {
            options = {};
          }
          this.oApi = this.internal = _ext.internal;
          for (var fn in DataTable2.ext.internal) {
            if (fn) {
              this[fn] = _fnExternApiFunc(fn);
            }
          }
          this.each(function() {
            var o = {};
            var oInit = len > 1 ? _fnExtend(o, options, true) : options;
            var i = 0, iLen, j, jLen, k, kLen;
            var sId = this.getAttribute("id");
            var bInitHandedOff = false;
            var defaults = DataTable2.defaults;
            var $this = $(this);
            if (this.nodeName.toLowerCase() != "table") {
              _fnLog(null, 0, "Non-table node initialisation (" + this.nodeName + ")", 2);
              return;
            }
            _fnCompatOpts(defaults);
            _fnCompatCols(defaults.column);
            _fnCamelToHungarian(defaults, defaults, true);
            _fnCamelToHungarian(defaults.column, defaults.column, true);
            _fnCamelToHungarian(defaults, $.extend(oInit, $this.data()), true);
            var allSettings = DataTable2.settings;
            for (i = 0, iLen = allSettings.length; i < iLen; i++) {
              var s = allSettings[i];
              if (s.nTable == this || s.nTHead && s.nTHead.parentNode == this || s.nTFoot && s.nTFoot.parentNode == this) {
                var bRetrieve = oInit.bRetrieve !== undefined2 ? oInit.bRetrieve : defaults.bRetrieve;
                var bDestroy = oInit.bDestroy !== undefined2 ? oInit.bDestroy : defaults.bDestroy;
                if (emptyInit || bRetrieve) {
                  return s.oInstance;
                } else if (bDestroy) {
                  s.oInstance.fnDestroy();
                  break;
                } else {
                  _fnLog(s, 0, "Cannot reinitialise DataTable", 3);
                  return;
                }
              }
              if (s.sTableId == this.id) {
                allSettings.splice(i, 1);
                break;
              }
            }
            if (sId === null || sId === "") {
              sId = "DataTables_Table_" + DataTable2.ext._unique++;
              this.id = sId;
            }
            var oSettings = $.extend(true, {}, DataTable2.models.oSettings, {
              "sDestroyWidth": $this[0].style.width,
              "sInstance": sId,
              "sTableId": sId
            });
            oSettings.nTable = this;
            oSettings.oApi = _that.internal;
            oSettings.oInit = oInit;
            allSettings.push(oSettings);
            oSettings.oInstance = _that.length === 1 ? _that : $this.dataTable();
            _fnCompatOpts(oInit);
            _fnLanguageCompat(oInit.oLanguage);
            if (oInit.aLengthMenu && !oInit.iDisplayLength) {
              oInit.iDisplayLength = Array.isArray(oInit.aLengthMenu[0]) ? oInit.aLengthMenu[0][0] : oInit.aLengthMenu[0];
            }
            oInit = _fnExtend($.extend(true, {}, defaults), oInit);
            _fnMap(oSettings.oFeatures, oInit, [
              "bPaginate",
              "bLengthChange",
              "bFilter",
              "bSort",
              "bSortMulti",
              "bInfo",
              "bProcessing",
              "bAutoWidth",
              "bSortClasses",
              "bServerSide",
              "bDeferRender"
            ]);
            _fnMap(oSettings, oInit, [
              "asStripeClasses",
              "ajax",
              "fnServerData",
              "fnFormatNumber",
              "sServerMethod",
              "aaSorting",
              "aaSortingFixed",
              "aLengthMenu",
              "sPaginationType",
              "sAjaxSource",
              "sAjaxDataProp",
              "iStateDuration",
              "sDom",
              "bSortCellsTop",
              "iTabIndex",
              "fnStateLoadCallback",
              "fnStateSaveCallback",
              "renderer",
              "searchDelay",
              "rowId",
              ["iCookieDuration", "iStateDuration"],
              ["oSearch", "oPreviousSearch"],
              ["aoSearchCols", "aoPreSearchCols"],
              ["iDisplayLength", "_iDisplayLength"]
            ]);
            _fnMap(oSettings.oScroll, oInit, [
              ["sScrollX", "sX"],
              ["sScrollXInner", "sXInner"],
              ["sScrollY", "sY"],
              ["bScrollCollapse", "bCollapse"]
            ]);
            _fnMap(oSettings.oLanguage, oInit, "fnInfoCallback");
            _fnCallbackReg(oSettings, "aoDrawCallback", oInit.fnDrawCallback, "user");
            _fnCallbackReg(oSettings, "aoServerParams", oInit.fnServerParams, "user");
            _fnCallbackReg(oSettings, "aoStateSaveParams", oInit.fnStateSaveParams, "user");
            _fnCallbackReg(oSettings, "aoStateLoadParams", oInit.fnStateLoadParams, "user");
            _fnCallbackReg(oSettings, "aoStateLoaded", oInit.fnStateLoaded, "user");
            _fnCallbackReg(oSettings, "aoRowCallback", oInit.fnRowCallback, "user");
            _fnCallbackReg(oSettings, "aoRowCreatedCallback", oInit.fnCreatedRow, "user");
            _fnCallbackReg(oSettings, "aoHeaderCallback", oInit.fnHeaderCallback, "user");
            _fnCallbackReg(oSettings, "aoFooterCallback", oInit.fnFooterCallback, "user");
            _fnCallbackReg(oSettings, "aoInitComplete", oInit.fnInitComplete, "user");
            _fnCallbackReg(oSettings, "aoPreDrawCallback", oInit.fnPreDrawCallback, "user");
            oSettings.rowIdFn = _fnGetObjectDataFn(oInit.rowId);
            _fnBrowserDetect(oSettings);
            var oClasses = oSettings.oClasses;
            $.extend(oClasses, DataTable2.ext.classes, oInit.oClasses);
            $this.addClass(oClasses.sTable);
            if (oSettings.iInitDisplayStart === undefined2) {
              oSettings.iInitDisplayStart = oInit.iDisplayStart;
              oSettings._iDisplayStart = oInit.iDisplayStart;
            }
            if (oInit.iDeferLoading !== null) {
              oSettings.bDeferLoading = true;
              var tmp = Array.isArray(oInit.iDeferLoading);
              oSettings._iRecordsDisplay = tmp ? oInit.iDeferLoading[0] : oInit.iDeferLoading;
              oSettings._iRecordsTotal = tmp ? oInit.iDeferLoading[1] : oInit.iDeferLoading;
            }
            var oLanguage = oSettings.oLanguage;
            $.extend(true, oLanguage, oInit.oLanguage);
            if (oLanguage.sUrl) {
              $.ajax({
                dataType: "json",
                url: oLanguage.sUrl,
                success: function(json) {
                  _fnCamelToHungarian(defaults.oLanguage, json);
                  _fnLanguageCompat(json);
                  $.extend(true, oLanguage, json);
                  _fnCallbackFire(oSettings, null, "i18n", [oSettings]);
                  _fnInitialise(oSettings);
                },
                error: function() {
                  _fnInitialise(oSettings);
                }
              });
              bInitHandedOff = true;
            } else {
              _fnCallbackFire(oSettings, null, "i18n", [oSettings]);
            }
            if (oInit.asStripeClasses === null) {
              oSettings.asStripeClasses = [
                oClasses.sStripeOdd,
                oClasses.sStripeEven
              ];
            }
            var stripeClasses = oSettings.asStripeClasses;
            var rowOne = $this.children("tbody").find("tr").eq(0);
            if ($.inArray(true, $.map(stripeClasses, function(el, i2) {
              return rowOne.hasClass(el);
            })) !== -1) {
              $("tbody tr", this).removeClass(stripeClasses.join(" "));
              oSettings.asDestroyStripes = stripeClasses.slice();
            }
            var anThs = [];
            var aoColumnsInit;
            var nThead = this.getElementsByTagName("thead");
            if (nThead.length !== 0) {
              _fnDetectHeader(oSettings.aoHeader, nThead[0]);
              anThs = _fnGetUniqueThs(oSettings);
            }
            if (oInit.aoColumns === null) {
              aoColumnsInit = [];
              for (i = 0, iLen = anThs.length; i < iLen; i++) {
                aoColumnsInit.push(null);
              }
            } else {
              aoColumnsInit = oInit.aoColumns;
            }
            for (i = 0, iLen = aoColumnsInit.length; i < iLen; i++) {
              _fnAddColumn(oSettings, anThs ? anThs[i] : null);
            }
            _fnApplyColumnDefs(oSettings, oInit.aoColumnDefs, aoColumnsInit, function(iCol, oDef) {
              _fnColumnOptions(oSettings, iCol, oDef);
            });
            if (rowOne.length) {
              var a = function(cell, name) {
                return cell.getAttribute("data-" + name) !== null ? name : null;
              };
              $(rowOne[0]).children("th, td").each(function(i2, cell) {
                var col = oSettings.aoColumns[i2];
                if (col.mData === i2) {
                  var sort = a(cell, "sort") || a(cell, "order");
                  var filter = a(cell, "filter") || a(cell, "search");
                  if (sort !== null || filter !== null) {
                    col.mData = {
                      _: i2 + ".display",
                      sort: sort !== null ? i2 + ".@data-" + sort : undefined2,
                      type: sort !== null ? i2 + ".@data-" + sort : undefined2,
                      filter: filter !== null ? i2 + ".@data-" + filter : undefined2
                    };
                    _fnColumnOptions(oSettings, i2);
                  }
                }
              });
            }
            var features = oSettings.oFeatures;
            var loadedInit = function() {
              if (oInit.aaSorting === undefined2) {
                var sorting = oSettings.aaSorting;
                for (i = 0, iLen = sorting.length; i < iLen; i++) {
                  sorting[i][1] = oSettings.aoColumns[i].asSorting[0];
                }
              }
              _fnSortingClasses(oSettings);
              if (features.bSort) {
                _fnCallbackReg(oSettings, "aoDrawCallback", function() {
                  if (oSettings.bSorted) {
                    var aSort = _fnSortFlatten(oSettings);
                    var sortedColumns = {};
                    $.each(aSort, function(i2, val) {
                      sortedColumns[val.src] = val.dir;
                    });
                    _fnCallbackFire(oSettings, null, "order", [oSettings, aSort, sortedColumns]);
                    _fnSortAria(oSettings);
                  }
                });
              }
              _fnCallbackReg(oSettings, "aoDrawCallback", function() {
                if (oSettings.bSorted || _fnDataSource(oSettings) === "ssp" || features.bDeferRender) {
                  _fnSortingClasses(oSettings);
                }
              }, "sc");
              var captions = $this.children("caption").each(function() {
                this._captionSide = $(this).css("caption-side");
              });
              var thead = $this.children("thead");
              if (thead.length === 0) {
                thead = $("<thead/>").appendTo($this);
              }
              oSettings.nTHead = thead[0];
              var tbody = $this.children("tbody");
              if (tbody.length === 0) {
                tbody = $("<tbody/>").insertAfter(thead);
              }
              oSettings.nTBody = tbody[0];
              var tfoot = $this.children("tfoot");
              if (tfoot.length === 0 && captions.length > 0 && (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "")) {
                tfoot = $("<tfoot/>").appendTo($this);
              }
              if (tfoot.length === 0 || tfoot.children().length === 0) {
                $this.addClass(oClasses.sNoFooter);
              } else if (tfoot.length > 0) {
                oSettings.nTFoot = tfoot[0];
                _fnDetectHeader(oSettings.aoFooter, oSettings.nTFoot);
              }
              if (oInit.aaData) {
                for (i = 0; i < oInit.aaData.length; i++) {
                  _fnAddData(oSettings, oInit.aaData[i]);
                }
              } else if (oSettings.bDeferLoading || _fnDataSource(oSettings) == "dom") {
                _fnAddTr(oSettings, $(oSettings.nTBody).children("tr"));
              }
              oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
              oSettings.bInitialised = true;
              if (bInitHandedOff === false) {
                _fnInitialise(oSettings);
              }
            };
            _fnCallbackReg(oSettings, "aoDrawCallback", _fnSaveState, "state_save");
            if (oInit.bStateSave) {
              features.bStateSave = true;
              _fnLoadState(oSettings, oInit, loadedInit);
            } else {
              loadedInit();
            }
          });
          _that = null;
          return this;
        };
        var _ext;
        var _Api;
        var _api_register;
        var _api_registerPlural;
        var _re_dic = {};
        var _re_new_lines = /[\r\n\u2028]/g;
        var _re_html = /<.*?>/g;
        var _re_date = /^\d{2,4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,2}([T ]{1}\d{1,2}[:\.]\d{2}([\.:]\d{2})?)?$/;
        var _re_escape_regex = new RegExp("(\\" + ["/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^", "-"].join("|\\") + ")", "g");
        var _re_formatted_numeric = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi;
        var _empty = function(d) {
          return !d || d === true || d === "-" ? true : false;
        };
        var _intVal = function(s) {
          var integer = parseInt(s, 10);
          return !isNaN(integer) && isFinite(s) ? integer : null;
        };
        var _numToDecimal = function(num, decimalPoint) {
          if (!_re_dic[decimalPoint]) {
            _re_dic[decimalPoint] = new RegExp(_fnEscapeRegex(decimalPoint), "g");
          }
          return typeof num === "string" && decimalPoint !== "." ? num.replace(/\./g, "").replace(_re_dic[decimalPoint], ".") : num;
        };
        var _isNumber = function(d, decimalPoint, formatted) {
          var strType = typeof d === "string";
          if (_empty(d)) {
            return true;
          }
          if (decimalPoint && strType) {
            d = _numToDecimal(d, decimalPoint);
          }
          if (formatted && strType) {
            d = d.replace(_re_formatted_numeric, "");
          }
          return !isNaN(parseFloat(d)) && isFinite(d);
        };
        var _isHtml = function(d) {
          return _empty(d) || typeof d === "string";
        };
        var _htmlNumeric = function(d, decimalPoint, formatted) {
          if (_empty(d)) {
            return true;
          }
          var html = _isHtml(d);
          return !html ? null : _isNumber(_stripHtml(d), decimalPoint, formatted) ? true : null;
        };
        var _pluck = function(a, prop, prop2) {
          var out = [];
          var i = 0, ien = a.length;
          if (prop2 !== undefined2) {
            for (; i < ien; i++) {
              if (a[i] && a[i][prop]) {
                out.push(a[i][prop][prop2]);
              }
            }
          } else {
            for (; i < ien; i++) {
              if (a[i]) {
                out.push(a[i][prop]);
              }
            }
          }
          return out;
        };
        var _pluck_order = function(a, order, prop, prop2) {
          var out = [];
          var i = 0, ien = order.length;
          if (prop2 !== undefined2) {
            for (; i < ien; i++) {
              if (a[order[i]][prop]) {
                out.push(a[order[i]][prop][prop2]);
              }
            }
          } else {
            for (; i < ien; i++) {
              out.push(a[order[i]][prop]);
            }
          }
          return out;
        };
        var _range = function(len, start2) {
          var out = [];
          var end;
          if (start2 === undefined2) {
            start2 = 0;
            end = len;
          } else {
            end = start2;
            start2 = len;
          }
          for (var i = start2; i < end; i++) {
            out.push(i);
          }
          return out;
        };
        var _removeEmpty = function(a) {
          var out = [];
          for (var i = 0, ien = a.length; i < ien; i++) {
            if (a[i]) {
              out.push(a[i]);
            }
          }
          return out;
        };
        var _stripHtml = function(d) {
          return d.replace(_re_html, "");
        };
        var _areAllUnique = function(src) {
          if (src.length < 2) {
            return true;
          }
          var sorted = src.slice().sort();
          var last = sorted[0];
          for (var i = 1, ien = sorted.length; i < ien; i++) {
            if (sorted[i] === last) {
              return false;
            }
            last = sorted[i];
          }
          return true;
        };
        var _unique = function(src) {
          if (_areAllUnique(src)) {
            return src.slice();
          }
          var out = [], val, i, ien = src.length, j, k = 0;
          again:
            for (i = 0; i < ien; i++) {
              val = src[i];
              for (j = 0; j < k; j++) {
                if (out[j] === val) {
                  continue again;
                }
              }
              out.push(val);
              k++;
            }
          return out;
        };
        var _flatten = function(out, val) {
          if (Array.isArray(val)) {
            for (var i = 0; i < val.length; i++) {
              _flatten(out, val[i]);
            }
          } else {
            out.push(val);
          }
          return out;
        };
        var _includes = function(search, start2) {
          if (start2 === undefined2) {
            start2 = 0;
          }
          return this.indexOf(search, start2) !== -1;
        };
        if (!Array.isArray) {
          Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === "[object Array]";
          };
        }
        if (!Array.prototype.includes) {
          Array.prototype.includes = _includes;
        }
        if (!String.prototype.trim) {
          String.prototype.trim = function() {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
          };
        }
        if (!String.prototype.includes) {
          String.prototype.includes = _includes;
        }
        DataTable2.util = {
          throttle: function(fn, freq) {
            var frequency = freq !== undefined2 ? freq : 200, last, timer;
            return function() {
              var that = this, now2 = +new Date(), args = arguments;
              if (last && now2 < last + frequency) {
                clearTimeout(timer);
                timer = setTimeout(function() {
                  last = undefined2;
                  fn.apply(that, args);
                }, frequency);
              } else {
                last = now2;
                fn.apply(that, args);
              }
            };
          },
          escapeRegex: function(val) {
            return val.replace(_re_escape_regex, "\\$1");
          },
          set: function(source) {
            if ($.isPlainObject(source)) {
              return DataTable2.util.set(source._);
            } else if (source === null) {
              return function() {
              };
            } else if (typeof source === "function") {
              return function(data, val, meta) {
                source(data, "set", val, meta);
              };
            } else if (typeof source === "string" && (source.indexOf(".") !== -1 || source.indexOf("[") !== -1 || source.indexOf("(") !== -1)) {
              var setData = function(data, val, src) {
                var a = _fnSplitObjNotation(src), b;
                var aLast = a[a.length - 1];
                var arrayNotation, funcNotation, o, innerSrc;
                for (var i = 0, iLen = a.length - 1; i < iLen; i++) {
                  if (a[i] === "__proto__" || a[i] === "constructor") {
                    throw new Error("Cannot set prototype values");
                  }
                  arrayNotation = a[i].match(__reArray);
                  funcNotation = a[i].match(__reFn);
                  if (arrayNotation) {
                    a[i] = a[i].replace(__reArray, "");
                    data[a[i]] = [];
                    b = a.slice();
                    b.splice(0, i + 1);
                    innerSrc = b.join(".");
                    if (Array.isArray(val)) {
                      for (var j = 0, jLen = val.length; j < jLen; j++) {
                        o = {};
                        setData(o, val[j], innerSrc);
                        data[a[i]].push(o);
                      }
                    } else {
                      data[a[i]] = val;
                    }
                    return;
                  } else if (funcNotation) {
                    a[i] = a[i].replace(__reFn, "");
                    data = data[a[i]](val);
                  }
                  if (data[a[i]] === null || data[a[i]] === undefined2) {
                    data[a[i]] = {};
                  }
                  data = data[a[i]];
                }
                if (aLast.match(__reFn)) {
                  data = data[aLast.replace(__reFn, "")](val);
                } else {
                  data[aLast.replace(__reArray, "")] = val;
                }
              };
              return function(data, val) {
                return setData(data, val, source);
              };
            } else {
              return function(data, val) {
                data[source] = val;
              };
            }
          },
          get: function(source) {
            if ($.isPlainObject(source)) {
              var o = {};
              $.each(source, function(key, val) {
                if (val) {
                  o[key] = DataTable2.util.get(val);
                }
              });
              return function(data, type, row, meta) {
                var t = o[type] || o._;
                return t !== undefined2 ? t(data, type, row, meta) : data;
              };
            } else if (source === null) {
              return function(data) {
                return data;
              };
            } else if (typeof source === "function") {
              return function(data, type, row, meta) {
                return source(data, type, row, meta);
              };
            } else if (typeof source === "string" && (source.indexOf(".") !== -1 || source.indexOf("[") !== -1 || source.indexOf("(") !== -1)) {
              var fetchData = function(data, type, src) {
                var arrayNotation, funcNotation, out, innerSrc;
                if (src !== "") {
                  var a = _fnSplitObjNotation(src);
                  for (var i = 0, iLen = a.length; i < iLen; i++) {
                    arrayNotation = a[i].match(__reArray);
                    funcNotation = a[i].match(__reFn);
                    if (arrayNotation) {
                      a[i] = a[i].replace(__reArray, "");
                      if (a[i] !== "") {
                        data = data[a[i]];
                      }
                      out = [];
                      a.splice(0, i + 1);
                      innerSrc = a.join(".");
                      if (Array.isArray(data)) {
                        for (var j = 0, jLen = data.length; j < jLen; j++) {
                          out.push(fetchData(data[j], type, innerSrc));
                        }
                      }
                      var join = arrayNotation[0].substring(1, arrayNotation[0].length - 1);
                      data = join === "" ? out : out.join(join);
                      break;
                    } else if (funcNotation) {
                      a[i] = a[i].replace(__reFn, "");
                      data = data[a[i]]();
                      continue;
                    }
                    if (data === null || data[a[i]] === undefined2) {
                      return undefined2;
                    }
                    data = data[a[i]];
                  }
                }
                return data;
              };
              return function(data, type) {
                return fetchData(data, type, source);
              };
            } else {
              return function(data, type) {
                return data[source];
              };
            }
          }
        };
        function _fnHungarianMap(o) {
          var hungarian = "a aa ai ao as b fn i m o s ", match, newKey, map = {};
          $.each(o, function(key, val) {
            match = key.match(/^([^A-Z]+?)([A-Z])/);
            if (match && hungarian.indexOf(match[1] + " ") !== -1) {
              newKey = key.replace(match[0], match[2].toLowerCase());
              map[newKey] = key;
              if (match[1] === "o") {
                _fnHungarianMap(o[key]);
              }
            }
          });
          o._hungarianMap = map;
        }
        function _fnCamelToHungarian(src, user, force) {
          if (!src._hungarianMap) {
            _fnHungarianMap(src);
          }
          var hungarianKey;
          $.each(user, function(key, val) {
            hungarianKey = src._hungarianMap[key];
            if (hungarianKey !== undefined2 && (force || user[hungarianKey] === undefined2)) {
              if (hungarianKey.charAt(0) === "o") {
                if (!user[hungarianKey]) {
                  user[hungarianKey] = {};
                }
                $.extend(true, user[hungarianKey], user[key]);
                _fnCamelToHungarian(src[hungarianKey], user[hungarianKey], force);
              } else {
                user[hungarianKey] = user[key];
              }
            }
          });
        }
        function _fnLanguageCompat(lang) {
          var defaults = DataTable2.defaults.oLanguage;
          var defaultDecimal = defaults.sDecimal;
          if (defaultDecimal) {
            _addNumericSort(defaultDecimal);
          }
          if (lang) {
            var zeroRecords = lang.sZeroRecords;
            if (!lang.sEmptyTable && zeroRecords && defaults.sEmptyTable === "No data available in table") {
              _fnMap(lang, lang, "sZeroRecords", "sEmptyTable");
            }
            if (!lang.sLoadingRecords && zeroRecords && defaults.sLoadingRecords === "Loading...") {
              _fnMap(lang, lang, "sZeroRecords", "sLoadingRecords");
            }
            if (lang.sInfoThousands) {
              lang.sThousands = lang.sInfoThousands;
            }
            var decimal = lang.sDecimal;
            if (decimal && defaultDecimal !== decimal) {
              _addNumericSort(decimal);
            }
          }
        }
        var _fnCompatMap = function(o, knew, old) {
          if (o[knew] !== undefined2) {
            o[old] = o[knew];
          }
        };
        function _fnCompatOpts(init) {
          _fnCompatMap(init, "ordering", "bSort");
          _fnCompatMap(init, "orderMulti", "bSortMulti");
          _fnCompatMap(init, "orderClasses", "bSortClasses");
          _fnCompatMap(init, "orderCellsTop", "bSortCellsTop");
          _fnCompatMap(init, "order", "aaSorting");
          _fnCompatMap(init, "orderFixed", "aaSortingFixed");
          _fnCompatMap(init, "paging", "bPaginate");
          _fnCompatMap(init, "pagingType", "sPaginationType");
          _fnCompatMap(init, "pageLength", "iDisplayLength");
          _fnCompatMap(init, "searching", "bFilter");
          if (typeof init.sScrollX === "boolean") {
            init.sScrollX = init.sScrollX ? "100%" : "";
          }
          if (typeof init.scrollX === "boolean") {
            init.scrollX = init.scrollX ? "100%" : "";
          }
          var searchCols = init.aoSearchCols;
          if (searchCols) {
            for (var i = 0, ien = searchCols.length; i < ien; i++) {
              if (searchCols[i]) {
                _fnCamelToHungarian(DataTable2.models.oSearch, searchCols[i]);
              }
            }
          }
        }
        function _fnCompatCols(init) {
          _fnCompatMap(init, "orderable", "bSortable");
          _fnCompatMap(init, "orderData", "aDataSort");
          _fnCompatMap(init, "orderSequence", "asSorting");
          _fnCompatMap(init, "orderDataType", "sortDataType");
          var dataSort = init.aDataSort;
          if (typeof dataSort === "number" && !Array.isArray(dataSort)) {
            init.aDataSort = [dataSort];
          }
        }
        function _fnBrowserDetect(settings) {
          if (!DataTable2.__browser) {
            var browser = {};
            DataTable2.__browser = browser;
            var n = $("<div/>").css({
              position: "fixed",
              top: 0,
              left: $(window2).scrollLeft() * -1,
              height: 1,
              width: 1,
              overflow: "hidden"
            }).append($("<div/>").css({
              position: "absolute",
              top: 1,
              left: 1,
              width: 100,
              overflow: "scroll"
            }).append($("<div/>").css({
              width: "100%",
              height: 10
            }))).appendTo("body");
            var outer = n.children();
            var inner = outer.children();
            browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;
            browser.bScrollOversize = inner[0].offsetWidth === 100 && outer[0].clientWidth !== 100;
            browser.bScrollbarLeft = Math.round(inner.offset().left) !== 1;
            browser.bBounding = n[0].getBoundingClientRect().width ? true : false;
            n.remove();
          }
          $.extend(settings.oBrowser, DataTable2.__browser);
          settings.oScroll.iBarWidth = DataTable2.__browser.barWidth;
        }
        function _fnReduce(that, fn, init, start2, end, inc) {
          var i = start2, value, isSet = false;
          if (init !== undefined2) {
            value = init;
            isSet = true;
          }
          while (i !== end) {
            if (!that.hasOwnProperty(i)) {
              continue;
            }
            value = isSet ? fn(value, that[i], i, that) : that[i];
            isSet = true;
            i += inc;
          }
          return value;
        }
        function _fnAddColumn(oSettings, nTh) {
          var oDefaults = DataTable2.defaults.column;
          var iCol = oSettings.aoColumns.length;
          var oCol = $.extend({}, DataTable2.models.oColumn, oDefaults, {
            "nTh": nTh ? nTh : document2.createElement("th"),
            "sTitle": oDefaults.sTitle ? oDefaults.sTitle : nTh ? nTh.innerHTML : "",
            "aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
            "mData": oDefaults.mData ? oDefaults.mData : iCol,
            idx: iCol
          });
          oSettings.aoColumns.push(oCol);
          var searchCols = oSettings.aoPreSearchCols;
          searchCols[iCol] = $.extend({}, DataTable2.models.oSearch, searchCols[iCol]);
          _fnColumnOptions(oSettings, iCol, $(nTh).data());
        }
        function _fnColumnOptions(oSettings, iCol, oOptions) {
          var oCol = oSettings.aoColumns[iCol];
          var oClasses = oSettings.oClasses;
          var th = $(oCol.nTh);
          if (!oCol.sWidthOrig) {
            oCol.sWidthOrig = th.attr("width") || null;
            var t = (th.attr("style") || "").match(/width:\s*(\d+[pxem%]+)/);
            if (t) {
              oCol.sWidthOrig = t[1];
            }
          }
          if (oOptions !== undefined2 && oOptions !== null) {
            _fnCompatCols(oOptions);
            _fnCamelToHungarian(DataTable2.defaults.column, oOptions, true);
            if (oOptions.mDataProp !== undefined2 && !oOptions.mData) {
              oOptions.mData = oOptions.mDataProp;
            }
            if (oOptions.sType) {
              oCol._sManualType = oOptions.sType;
            }
            if (oOptions.className && !oOptions.sClass) {
              oOptions.sClass = oOptions.className;
            }
            if (oOptions.sClass) {
              th.addClass(oOptions.sClass);
            }
            $.extend(oCol, oOptions);
            _fnMap(oCol, oOptions, "sWidth", "sWidthOrig");
            if (oOptions.iDataSort !== undefined2) {
              oCol.aDataSort = [oOptions.iDataSort];
            }
            _fnMap(oCol, oOptions, "aDataSort");
          }
          var mDataSrc = oCol.mData;
          var mData = _fnGetObjectDataFn(mDataSrc);
          var mRender = oCol.mRender ? _fnGetObjectDataFn(oCol.mRender) : null;
          var attrTest = function(src) {
            return typeof src === "string" && src.indexOf("@") !== -1;
          };
          oCol._bAttrSrc = $.isPlainObject(mDataSrc) && (attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter));
          oCol._setter = null;
          oCol.fnGetData = function(rowData, type, meta) {
            var innerData = mData(rowData, type, undefined2, meta);
            return mRender && type ? mRender(innerData, type, rowData, meta) : innerData;
          };
          oCol.fnSetData = function(rowData, val, meta) {
            return _fnSetObjectDataFn(mDataSrc)(rowData, val, meta);
          };
          if (typeof mDataSrc !== "number") {
            oSettings._rowReadObject = true;
          }
          if (!oSettings.oFeatures.bSort) {
            oCol.bSortable = false;
            th.addClass(oClasses.sSortableNone);
          }
          var bAsc = $.inArray("asc", oCol.asSorting) !== -1;
          var bDesc = $.inArray("desc", oCol.asSorting) !== -1;
          if (!oCol.bSortable || !bAsc && !bDesc) {
            oCol.sSortingClass = oClasses.sSortableNone;
            oCol.sSortingClassJUI = "";
          } else if (bAsc && !bDesc) {
            oCol.sSortingClass = oClasses.sSortableAsc;
            oCol.sSortingClassJUI = oClasses.sSortJUIAscAllowed;
          } else if (!bAsc && bDesc) {
            oCol.sSortingClass = oClasses.sSortableDesc;
            oCol.sSortingClassJUI = oClasses.sSortJUIDescAllowed;
          } else {
            oCol.sSortingClass = oClasses.sSortable;
            oCol.sSortingClassJUI = oClasses.sSortJUI;
          }
        }
        function _fnAdjustColumnSizing(settings) {
          if (settings.oFeatures.bAutoWidth !== false) {
            var columns = settings.aoColumns;
            _fnCalculateColumnWidths(settings);
            for (var i = 0, iLen = columns.length; i < iLen; i++) {
              columns[i].nTh.style.width = columns[i].sWidth;
            }
          }
          var scroll = settings.oScroll;
          if (scroll.sY !== "" || scroll.sX !== "") {
            _fnScrollDraw(settings);
          }
          _fnCallbackFire(settings, null, "column-sizing", [settings]);
        }
        function _fnVisibleToColumnIndex(oSettings, iMatch) {
          var aiVis = _fnGetColumns(oSettings, "bVisible");
          return typeof aiVis[iMatch] === "number" ? aiVis[iMatch] : null;
        }
        function _fnColumnIndexToVisible(oSettings, iMatch) {
          var aiVis = _fnGetColumns(oSettings, "bVisible");
          var iPos = $.inArray(iMatch, aiVis);
          return iPos !== -1 ? iPos : null;
        }
        function _fnVisbleColumns(oSettings) {
          var vis = 0;
          $.each(oSettings.aoColumns, function(i, col) {
            if (col.bVisible && $(col.nTh).css("display") !== "none") {
              vis++;
            }
          });
          return vis;
        }
        function _fnGetColumns(oSettings, sParam) {
          var a = [];
          $.map(oSettings.aoColumns, function(val, i) {
            if (val[sParam]) {
              a.push(i);
            }
          });
          return a;
        }
        function _fnColumnTypes(settings) {
          var columns = settings.aoColumns;
          var data = settings.aoData;
          var types = DataTable2.ext.type.detect;
          var i, ien, j, jen, k, ken;
          var col, cell, detectedType, cache;
          for (i = 0, ien = columns.length; i < ien; i++) {
            col = columns[i];
            cache = [];
            if (!col.sType && col._sManualType) {
              col.sType = col._sManualType;
            } else if (!col.sType) {
              for (j = 0, jen = types.length; j < jen; j++) {
                for (k = 0, ken = data.length; k < ken; k++) {
                  if (cache[k] === undefined2) {
                    cache[k] = _fnGetCellData(settings, k, i, "type");
                  }
                  detectedType = types[j](cache[k], settings);
                  if (!detectedType && j !== types.length - 1) {
                    break;
                  }
                  if (detectedType === "html" && !_empty(cache[k])) {
                    break;
                  }
                }
                if (detectedType) {
                  col.sType = detectedType;
                  break;
                }
              }
              if (!col.sType) {
                col.sType = "string";
              }
            }
          }
        }
        function _fnApplyColumnDefs(oSettings, aoColDefs, aoCols, fn) {
          var i, iLen, j, jLen, k, kLen, def;
          var columns = oSettings.aoColumns;
          if (aoColDefs) {
            for (i = aoColDefs.length - 1; i >= 0; i--) {
              def = aoColDefs[i];
              var aTargets = def.targets !== undefined2 ? def.targets : def.aTargets;
              if (!Array.isArray(aTargets)) {
                aTargets = [aTargets];
              }
              for (j = 0, jLen = aTargets.length; j < jLen; j++) {
                if (typeof aTargets[j] === "number" && aTargets[j] >= 0) {
                  while (columns.length <= aTargets[j]) {
                    _fnAddColumn(oSettings);
                  }
                  fn(aTargets[j], def);
                } else if (typeof aTargets[j] === "number" && aTargets[j] < 0) {
                  fn(columns.length + aTargets[j], def);
                } else if (typeof aTargets[j] === "string") {
                  for (k = 0, kLen = columns.length; k < kLen; k++) {
                    if (aTargets[j] == "_all" || $(columns[k].nTh).hasClass(aTargets[j])) {
                      fn(k, def);
                    }
                  }
                }
              }
            }
          }
          if (aoCols) {
            for (i = 0, iLen = aoCols.length; i < iLen; i++) {
              fn(i, aoCols[i]);
            }
          }
        }
        function _fnAddData(oSettings, aDataIn, nTr, anTds) {
          var iRow = oSettings.aoData.length;
          var oData = $.extend(true, {}, DataTable2.models.oRow, {
            src: nTr ? "dom" : "data",
            idx: iRow
          });
          oData._aData = aDataIn;
          oSettings.aoData.push(oData);
          var nTd, sThisType;
          var columns = oSettings.aoColumns;
          for (var i = 0, iLen = columns.length; i < iLen; i++) {
            columns[i].sType = null;
          }
          oSettings.aiDisplayMaster.push(iRow);
          var id = oSettings.rowIdFn(aDataIn);
          if (id !== undefined2) {
            oSettings.aIds[id] = oData;
          }
          if (nTr || !oSettings.oFeatures.bDeferRender) {
            _fnCreateTr(oSettings, iRow, nTr, anTds);
          }
          return iRow;
        }
        function _fnAddTr(settings, trs) {
          var row;
          if (!(trs instanceof $)) {
            trs = $(trs);
          }
          return trs.map(function(i, el) {
            row = _fnGetRowElements(settings, el);
            return _fnAddData(settings, row.data, el, row.cells);
          });
        }
        function _fnNodeToDataIndex(oSettings, n) {
          return n._DT_RowIndex !== undefined2 ? n._DT_RowIndex : null;
        }
        function _fnNodeToColumnIndex(oSettings, iRow, n) {
          return $.inArray(n, oSettings.aoData[iRow].anCells);
        }
        function _fnGetCellData(settings, rowIdx, colIdx, type) {
          if (type === "search") {
            type = "filter";
          } else if (type === "order") {
            type = "sort";
          }
          var draw = settings.iDraw;
          var col = settings.aoColumns[colIdx];
          var rowData = settings.aoData[rowIdx]._aData;
          var defaultContent = col.sDefaultContent;
          var cellData = col.fnGetData(rowData, type, {
            settings,
            row: rowIdx,
            col: colIdx
          });
          if (cellData === undefined2) {
            if (settings.iDrawError != draw && defaultContent === null) {
              _fnLog(settings, 0, "Requested unknown parameter " + (typeof col.mData == "function" ? "{function}" : "'" + col.mData + "'") + " for row " + rowIdx + ", column " + colIdx, 4);
              settings.iDrawError = draw;
            }
            return defaultContent;
          }
          if ((cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined2) {
            cellData = defaultContent;
          } else if (typeof cellData === "function") {
            return cellData.call(rowData);
          }
          if (cellData === null && type === "display") {
            return "";
          }
          if (type === "filter") {
            var fomatters = DataTable2.ext.type.search;
            if (fomatters[col.sType]) {
              cellData = fomatters[col.sType](cellData);
            }
          }
          return cellData;
        }
        function _fnSetCellData(settings, rowIdx, colIdx, val) {
          var col = settings.aoColumns[colIdx];
          var rowData = settings.aoData[rowIdx]._aData;
          col.fnSetData(rowData, val, {
            settings,
            row: rowIdx,
            col: colIdx
          });
        }
        var __reArray = /\[.*?\]$/;
        var __reFn = /\(\)$/;
        function _fnSplitObjNotation(str) {
          return $.map(str.match(/(\\.|[^\.])+/g) || [""], function(s) {
            return s.replace(/\\\./g, ".");
          });
        }
        var _fnGetObjectDataFn = DataTable2.util.get;
        var _fnSetObjectDataFn = DataTable2.util.set;
        function _fnGetDataMaster(settings) {
          return _pluck(settings.aoData, "_aData");
        }
        function _fnClearTable(settings) {
          settings.aoData.length = 0;
          settings.aiDisplayMaster.length = 0;
          settings.aiDisplay.length = 0;
          settings.aIds = {};
        }
        function _fnDeleteIndex(a, iTarget, splice) {
          var iTargetIndex = -1;
          for (var i = 0, iLen = a.length; i < iLen; i++) {
            if (a[i] == iTarget) {
              iTargetIndex = i;
            } else if (a[i] > iTarget) {
              a[i]--;
            }
          }
          if (iTargetIndex != -1 && splice === undefined2) {
            a.splice(iTargetIndex, 1);
          }
        }
        function _fnInvalidate(settings, rowIdx, src, colIdx) {
          var row = settings.aoData[rowIdx];
          var i, ien;
          var cellWrite = function(cell, col) {
            while (cell.childNodes.length) {
              cell.removeChild(cell.firstChild);
            }
            cell.innerHTML = _fnGetCellData(settings, rowIdx, col, "display");
          };
          if (src === "dom" || (!src || src === "auto") && row.src === "dom") {
            row._aData = _fnGetRowElements(settings, row, colIdx, colIdx === undefined2 ? undefined2 : row._aData).data;
          } else {
            var cells = row.anCells;
            if (cells) {
              if (colIdx !== undefined2) {
                cellWrite(cells[colIdx], colIdx);
              } else {
                for (i = 0, ien = cells.length; i < ien; i++) {
                  cellWrite(cells[i], i);
                }
              }
            }
          }
          row._aSortData = null;
          row._aFilterData = null;
          var cols = settings.aoColumns;
          if (colIdx !== undefined2) {
            cols[colIdx].sType = null;
          } else {
            for (i = 0, ien = cols.length; i < ien; i++) {
              cols[i].sType = null;
            }
            _fnRowAttributes(settings, row);
          }
        }
        function _fnGetRowElements(settings, row, colIdx, d) {
          var tds = [], td = row.firstChild, name, col, o, i = 0, contents, columns = settings.aoColumns, objectRead = settings._rowReadObject;
          d = d !== undefined2 ? d : objectRead ? {} : [];
          var attr = function(str, td2) {
            if (typeof str === "string") {
              var idx = str.indexOf("@");
              if (idx !== -1) {
                var attr2 = str.substring(idx + 1);
                var setter = _fnSetObjectDataFn(str);
                setter(d, td2.getAttribute(attr2));
              }
            }
          };
          var cellProcess = function(cell) {
            if (colIdx === undefined2 || colIdx === i) {
              col = columns[i];
              contents = cell.innerHTML.trim();
              if (col && col._bAttrSrc) {
                var setter = _fnSetObjectDataFn(col.mData._);
                setter(d, contents);
                attr(col.mData.sort, cell);
                attr(col.mData.type, cell);
                attr(col.mData.filter, cell);
              } else {
                if (objectRead) {
                  if (!col._setter) {
                    col._setter = _fnSetObjectDataFn(col.mData);
                  }
                  col._setter(d, contents);
                } else {
                  d[i] = contents;
                }
              }
            }
            i++;
          };
          if (td) {
            while (td) {
              name = td.nodeName.toUpperCase();
              if (name == "TD" || name == "TH") {
                cellProcess(td);
                tds.push(td);
              }
              td = td.nextSibling;
            }
          } else {
            tds = row.anCells;
            for (var j = 0, jen = tds.length; j < jen; j++) {
              cellProcess(tds[j]);
            }
          }
          var rowNode = row.firstChild ? row : row.nTr;
          if (rowNode) {
            var id = rowNode.getAttribute("id");
            if (id) {
              _fnSetObjectDataFn(settings.rowId)(d, id);
            }
          }
          return {
            data: d,
            cells: tds
          };
        }
        function _fnCreateTr(oSettings, iRow, nTrIn, anTds) {
          var row = oSettings.aoData[iRow], rowData = row._aData, cells = [], nTr, nTd, oCol, i, iLen, create;
          if (row.nTr === null) {
            nTr = nTrIn || document2.createElement("tr");
            row.nTr = nTr;
            row.anCells = cells;
            nTr._DT_RowIndex = iRow;
            _fnRowAttributes(oSettings, row);
            for (i = 0, iLen = oSettings.aoColumns.length; i < iLen; i++) {
              oCol = oSettings.aoColumns[i];
              create = nTrIn ? false : true;
              nTd = create ? document2.createElement(oCol.sCellType) : anTds[i];
              nTd._DT_CellIndex = {
                row: iRow,
                column: i
              };
              cells.push(nTd);
              if (create || (oCol.mRender || oCol.mData !== i) && (!$.isPlainObject(oCol.mData) || oCol.mData._ !== i + ".display")) {
                nTd.innerHTML = _fnGetCellData(oSettings, iRow, i, "display");
              }
              if (oCol.sClass) {
                nTd.className += " " + oCol.sClass;
              }
              if (oCol.bVisible && !nTrIn) {
                nTr.appendChild(nTd);
              } else if (!oCol.bVisible && nTrIn) {
                nTd.parentNode.removeChild(nTd);
              }
              if (oCol.fnCreatedCell) {
                oCol.fnCreatedCell.call(oSettings.oInstance, nTd, _fnGetCellData(oSettings, iRow, i), rowData, iRow, i);
              }
            }
            _fnCallbackFire(oSettings, "aoRowCreatedCallback", null, [nTr, rowData, iRow, cells]);
          }
        }
        function _fnRowAttributes(settings, row) {
          var tr = row.nTr;
          var data = row._aData;
          if (tr) {
            var id = settings.rowIdFn(data);
            if (id) {
              tr.id = id;
            }
            if (data.DT_RowClass) {
              var a = data.DT_RowClass.split(" ");
              row.__rowc = row.__rowc ? _unique(row.__rowc.concat(a)) : a;
              $(tr).removeClass(row.__rowc.join(" ")).addClass(data.DT_RowClass);
            }
            if (data.DT_RowAttr) {
              $(tr).attr(data.DT_RowAttr);
            }
            if (data.DT_RowData) {
              $(tr).data(data.DT_RowData);
            }
          }
        }
        function _fnBuildHead(oSettings) {
          var i, ien, cell, row, column;
          var thead = oSettings.nTHead;
          var tfoot = oSettings.nTFoot;
          var createHeader = $("th, td", thead).length === 0;
          var classes = oSettings.oClasses;
          var columns = oSettings.aoColumns;
          if (createHeader) {
            row = $("<tr/>").appendTo(thead);
          }
          for (i = 0, ien = columns.length; i < ien; i++) {
            column = columns[i];
            cell = $(column.nTh).addClass(column.sClass);
            if (createHeader) {
              cell.appendTo(row);
            }
            if (oSettings.oFeatures.bSort) {
              cell.addClass(column.sSortingClass);
              if (column.bSortable !== false) {
                cell.attr("tabindex", oSettings.iTabIndex).attr("aria-controls", oSettings.sTableId);
                _fnSortAttachListener(oSettings, column.nTh, i);
              }
            }
            if (column.sTitle != cell[0].innerHTML) {
              cell.html(column.sTitle);
            }
            _fnRenderer(oSettings, "header")(oSettings, cell, column, classes);
          }
          if (createHeader) {
            _fnDetectHeader(oSettings.aoHeader, thead);
          }
          $(thead).children("tr").children("th, td").addClass(classes.sHeaderTH);
          $(tfoot).children("tr").children("th, td").addClass(classes.sFooterTH);
          if (tfoot !== null) {
            var cells = oSettings.aoFooter[0];
            for (i = 0, ien = cells.length; i < ien; i++) {
              column = columns[i];
              column.nTf = cells[i].cell;
              if (column.sClass) {
                $(column.nTf).addClass(column.sClass);
              }
            }
          }
        }
        function _fnDrawHead(oSettings, aoSource, bIncludeHidden) {
          var i, iLen, j, jLen, k, kLen, n, nLocalTr;
          var aoLocal = [];
          var aApplied = [];
          var iColumns = oSettings.aoColumns.length;
          var iRowspan, iColspan;
          if (!aoSource) {
            return;
          }
          if (bIncludeHidden === undefined2) {
            bIncludeHidden = false;
          }
          for (i = 0, iLen = aoSource.length; i < iLen; i++) {
            aoLocal[i] = aoSource[i].slice();
            aoLocal[i].nTr = aoSource[i].nTr;
            for (j = iColumns - 1; j >= 0; j--) {
              if (!oSettings.aoColumns[j].bVisible && !bIncludeHidden) {
                aoLocal[i].splice(j, 1);
              }
            }
            aApplied.push([]);
          }
          for (i = 0, iLen = aoLocal.length; i < iLen; i++) {
            nLocalTr = aoLocal[i].nTr;
            if (nLocalTr) {
              while (n = nLocalTr.firstChild) {
                nLocalTr.removeChild(n);
              }
            }
            for (j = 0, jLen = aoLocal[i].length; j < jLen; j++) {
              iRowspan = 1;
              iColspan = 1;
              if (aApplied[i][j] === undefined2) {
                nLocalTr.appendChild(aoLocal[i][j].cell);
                aApplied[i][j] = 1;
                while (aoLocal[i + iRowspan] !== undefined2 && aoLocal[i][j].cell == aoLocal[i + iRowspan][j].cell) {
                  aApplied[i + iRowspan][j] = 1;
                  iRowspan++;
                }
                while (aoLocal[i][j + iColspan] !== undefined2 && aoLocal[i][j].cell == aoLocal[i][j + iColspan].cell) {
                  for (k = 0; k < iRowspan; k++) {
                    aApplied[i + k][j + iColspan] = 1;
                  }
                  iColspan++;
                }
                $(aoLocal[i][j].cell).attr("rowspan", iRowspan).attr("colspan", iColspan);
              }
            }
          }
        }
        function _fnDraw(oSettings, ajaxComplete) {
          var aPreDraw = _fnCallbackFire(oSettings, "aoPreDrawCallback", "preDraw", [oSettings]);
          if ($.inArray(false, aPreDraw) !== -1) {
            _fnProcessingDisplay(oSettings, false);
            return;
          }
          var i, iLen, n;
          var anRows = [];
          var iRowCount = 0;
          var asStripeClasses = oSettings.asStripeClasses;
          var iStripes = asStripeClasses.length;
          var iOpenRows = oSettings.aoOpenRows.length;
          var oLang = oSettings.oLanguage;
          var iInitDisplayStart = oSettings.iInitDisplayStart;
          var bServerSide = _fnDataSource(oSettings) == "ssp";
          var aiDisplay = oSettings.aiDisplay;
          oSettings.bDrawing = true;
          if (iInitDisplayStart !== undefined2 && iInitDisplayStart !== -1) {
            oSettings._iDisplayStart = bServerSide ? iInitDisplayStart : iInitDisplayStart >= oSettings.fnRecordsDisplay() ? 0 : iInitDisplayStart;
            oSettings.iInitDisplayStart = -1;
          }
          var iDisplayStart = oSettings._iDisplayStart;
          var iDisplayEnd = oSettings.fnDisplayEnd();
          if (oSettings.bDeferLoading) {
            oSettings.bDeferLoading = false;
            oSettings.iDraw++;
            _fnProcessingDisplay(oSettings, false);
          } else if (!bServerSide) {
            oSettings.iDraw++;
          } else if (!oSettings.bDestroying && !ajaxComplete) {
            _fnAjaxUpdate(oSettings);
            return;
          }
          if (aiDisplay.length !== 0) {
            var iStart = bServerSide ? 0 : iDisplayStart;
            var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;
            for (var j = iStart; j < iEnd; j++) {
              var iDataIndex = aiDisplay[j];
              var aoData = oSettings.aoData[iDataIndex];
              if (aoData.nTr === null) {
                _fnCreateTr(oSettings, iDataIndex);
              }
              var nRow = aoData.nTr;
              if (iStripes !== 0) {
                var sStripe = asStripeClasses[iRowCount % iStripes];
                if (aoData._sRowStripe != sStripe) {
                  $(nRow).removeClass(aoData._sRowStripe).addClass(sStripe);
                  aoData._sRowStripe = sStripe;
                }
              }
              _fnCallbackFire(oSettings, "aoRowCallback", null, [nRow, aoData._aData, iRowCount, j, iDataIndex]);
              anRows.push(nRow);
              iRowCount++;
            }
          } else {
            var sZero = oLang.sZeroRecords;
            if (oSettings.iDraw == 1 && _fnDataSource(oSettings) == "ajax") {
              sZero = oLang.sLoadingRecords;
            } else if (oLang.sEmptyTable && oSettings.fnRecordsTotal() === 0) {
              sZero = oLang.sEmptyTable;
            }
            anRows[0] = $("<tr/>", { "class": iStripes ? asStripeClasses[0] : "" }).append($("<td />", {
              "valign": "top",
              "colSpan": _fnVisbleColumns(oSettings),
              "class": oSettings.oClasses.sRowEmpty
            }).html(sZero))[0];
          }
          _fnCallbackFire(oSettings, "aoHeaderCallback", "header", [
            $(oSettings.nTHead).children("tr")[0],
            _fnGetDataMaster(oSettings),
            iDisplayStart,
            iDisplayEnd,
            aiDisplay
          ]);
          _fnCallbackFire(oSettings, "aoFooterCallback", "footer", [
            $(oSettings.nTFoot).children("tr")[0],
            _fnGetDataMaster(oSettings),
            iDisplayStart,
            iDisplayEnd,
            aiDisplay
          ]);
          var body = $(oSettings.nTBody);
          body.children().detach();
          body.append($(anRows));
          _fnCallbackFire(oSettings, "aoDrawCallback", "draw", [oSettings]);
          oSettings.bSorted = false;
          oSettings.bFiltered = false;
          oSettings.bDrawing = false;
        }
        function _fnReDraw(settings, holdPosition) {
          var features = settings.oFeatures, sort = features.bSort, filter = features.bFilter;
          if (sort) {
            _fnSort(settings);
          }
          if (filter) {
            _fnFilterComplete(settings, settings.oPreviousSearch);
          } else {
            settings.aiDisplay = settings.aiDisplayMaster.slice();
          }
          if (holdPosition !== true) {
            settings._iDisplayStart = 0;
          }
          settings._drawHold = holdPosition;
          _fnDraw(settings);
          settings._drawHold = false;
        }
        function _fnAddOptionsHtml(oSettings) {
          var classes = oSettings.oClasses;
          var table = $(oSettings.nTable);
          var holding = $("<div/>").insertBefore(table);
          var features = oSettings.oFeatures;
          var insert = $("<div/>", {
            id: oSettings.sTableId + "_wrapper",
            "class": classes.sWrapper + (oSettings.nTFoot ? "" : " " + classes.sNoFooter)
          });
          oSettings.nHolding = holding[0];
          oSettings.nTableWrapper = insert[0];
          oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;
          var aDom = oSettings.sDom.split("");
          var featureNode, cOption, nNewNode, cNext, sAttr, j;
          for (var i = 0; i < aDom.length; i++) {
            featureNode = null;
            cOption = aDom[i];
            if (cOption == "<") {
              nNewNode = $("<div/>")[0];
              cNext = aDom[i + 1];
              if (cNext == "'" || cNext == '"') {
                sAttr = "";
                j = 2;
                while (aDom[i + j] != cNext) {
                  sAttr += aDom[i + j];
                  j++;
                }
                if (sAttr == "H") {
                  sAttr = classes.sJUIHeader;
                } else if (sAttr == "F") {
                  sAttr = classes.sJUIFooter;
                }
                if (sAttr.indexOf(".") != -1) {
                  var aSplit = sAttr.split(".");
                  nNewNode.id = aSplit[0].substr(1, aSplit[0].length - 1);
                  nNewNode.className = aSplit[1];
                } else if (sAttr.charAt(0) == "#") {
                  nNewNode.id = sAttr.substr(1, sAttr.length - 1);
                } else {
                  nNewNode.className = sAttr;
                }
                i += j;
              }
              insert.append(nNewNode);
              insert = $(nNewNode);
            } else if (cOption == ">") {
              insert = insert.parent();
            } else if (cOption == "l" && features.bPaginate && features.bLengthChange) {
              featureNode = _fnFeatureHtmlLength(oSettings);
            } else if (cOption == "f" && features.bFilter) {
              featureNode = _fnFeatureHtmlFilter(oSettings);
            } else if (cOption == "r" && features.bProcessing) {
              featureNode = _fnFeatureHtmlProcessing(oSettings);
            } else if (cOption == "t") {
              featureNode = _fnFeatureHtmlTable(oSettings);
            } else if (cOption == "i" && features.bInfo) {
              featureNode = _fnFeatureHtmlInfo(oSettings);
            } else if (cOption == "p" && features.bPaginate) {
              featureNode = _fnFeatureHtmlPaginate(oSettings);
            } else if (DataTable2.ext.feature.length !== 0) {
              var aoFeatures = DataTable2.ext.feature;
              for (var k = 0, kLen = aoFeatures.length; k < kLen; k++) {
                if (cOption == aoFeatures[k].cFeature) {
                  featureNode = aoFeatures[k].fnInit(oSettings);
                  break;
                }
              }
            }
            if (featureNode) {
              var aanFeatures = oSettings.aanFeatures;
              if (!aanFeatures[cOption]) {
                aanFeatures[cOption] = [];
              }
              aanFeatures[cOption].push(featureNode);
              insert.append(featureNode);
            }
          }
          holding.replaceWith(insert);
          oSettings.nHolding = null;
        }
        function _fnDetectHeader(aLayout, nThead) {
          var nTrs = $(nThead).children("tr");
          var nTr, nCell;
          var i, k, l, iLen, jLen, iColShifted, iColumn, iColspan, iRowspan;
          var bUnique;
          var fnShiftCol = function(a, i2, j) {
            var k2 = a[i2];
            while (k2[j]) {
              j++;
            }
            return j;
          };
          aLayout.splice(0, aLayout.length);
          for (i = 0, iLen = nTrs.length; i < iLen; i++) {
            aLayout.push([]);
          }
          for (i = 0, iLen = nTrs.length; i < iLen; i++) {
            nTr = nTrs[i];
            iColumn = 0;
            nCell = nTr.firstChild;
            while (nCell) {
              if (nCell.nodeName.toUpperCase() == "TD" || nCell.nodeName.toUpperCase() == "TH") {
                iColspan = nCell.getAttribute("colspan") * 1;
                iRowspan = nCell.getAttribute("rowspan") * 1;
                iColspan = !iColspan || iColspan === 0 || iColspan === 1 ? 1 : iColspan;
                iRowspan = !iRowspan || iRowspan === 0 || iRowspan === 1 ? 1 : iRowspan;
                iColShifted = fnShiftCol(aLayout, i, iColumn);
                bUnique = iColspan === 1 ? true : false;
                for (l = 0; l < iColspan; l++) {
                  for (k = 0; k < iRowspan; k++) {
                    aLayout[i + k][iColShifted + l] = {
                      "cell": nCell,
                      "unique": bUnique
                    };
                    aLayout[i + k].nTr = nTr;
                  }
                }
              }
              nCell = nCell.nextSibling;
            }
          }
        }
        function _fnGetUniqueThs(oSettings, nHeader, aLayout) {
          var aReturn = [];
          if (!aLayout) {
            aLayout = oSettings.aoHeader;
            if (nHeader) {
              aLayout = [];
              _fnDetectHeader(aLayout, nHeader);
            }
          }
          for (var i = 0, iLen = aLayout.length; i < iLen; i++) {
            for (var j = 0, jLen = aLayout[i].length; j < jLen; j++) {
              if (aLayout[i][j].unique && (!aReturn[j] || !oSettings.bSortCellsTop)) {
                aReturn[j] = aLayout[i][j].cell;
              }
            }
          }
          return aReturn;
        }
        function _fnBuildAjax(oSettings, data, fn) {
          _fnCallbackFire(oSettings, "aoServerParams", "serverParams", [data]);
          if (data && Array.isArray(data)) {
            var tmp = {};
            var rbracket = /(.*?)\[\]$/;
            $.each(data, function(key, val) {
              var match = val.name.match(rbracket);
              if (match) {
                var name = match[0];
                if (!tmp[name]) {
                  tmp[name] = [];
                }
                tmp[name].push(val.value);
              } else {
                tmp[val.name] = val.value;
              }
            });
            data = tmp;
          }
          var ajaxData;
          var ajax = oSettings.ajax;
          var instance = oSettings.oInstance;
          var callback = function(json) {
            var status = oSettings.jqXhr ? oSettings.jqXhr.status : null;
            if (json === null || typeof status === "number" && status == 204) {
              json = {};
              _fnAjaxDataSrc(oSettings, json, []);
            }
            var error2 = json.error || json.sError;
            if (error2) {
              _fnLog(oSettings, 0, error2);
            }
            oSettings.json = json;
            _fnCallbackFire(oSettings, null, "xhr", [oSettings, json, oSettings.jqXHR]);
            fn(json);
          };
          if ($.isPlainObject(ajax) && ajax.data) {
            ajaxData = ajax.data;
            var newData = typeof ajaxData === "function" ? ajaxData(data, oSettings) : ajaxData;
            data = typeof ajaxData === "function" && newData ? newData : $.extend(true, data, newData);
            delete ajax.data;
          }
          var baseAjax = {
            "data": data,
            "success": callback,
            "dataType": "json",
            "cache": false,
            "type": oSettings.sServerMethod,
            "error": function(xhr, error2, thrown) {
              var ret = _fnCallbackFire(oSettings, null, "xhr", [oSettings, null, oSettings.jqXHR]);
              if ($.inArray(true, ret) === -1) {
                if (error2 == "parsererror") {
                  _fnLog(oSettings, 0, "Invalid JSON response", 1);
                } else if (xhr.readyState === 4) {
                  _fnLog(oSettings, 0, "Ajax error", 7);
                }
              }
              _fnProcessingDisplay(oSettings, false);
            }
          };
          oSettings.oAjaxData = data;
          _fnCallbackFire(oSettings, null, "preXhr", [oSettings, data]);
          if (oSettings.fnServerData) {
            oSettings.fnServerData.call(instance, oSettings.sAjaxSource, $.map(data, function(val, key) {
              return { name: key, value: val };
            }), callback, oSettings);
          } else if (oSettings.sAjaxSource || typeof ajax === "string") {
            oSettings.jqXHR = $.ajax($.extend(baseAjax, {
              url: ajax || oSettings.sAjaxSource
            }));
          } else if (typeof ajax === "function") {
            oSettings.jqXHR = ajax.call(instance, data, callback, oSettings);
          } else {
            oSettings.jqXHR = $.ajax($.extend(baseAjax, ajax));
            ajax.data = ajaxData;
          }
        }
        function _fnAjaxUpdate(settings) {
          settings.iDraw++;
          _fnProcessingDisplay(settings, true);
          _fnBuildAjax(settings, _fnAjaxParameters(settings), function(json) {
            _fnAjaxUpdateDraw(settings, json);
          });
        }
        function _fnAjaxParameters(settings) {
          var columns = settings.aoColumns, columnCount = columns.length, features = settings.oFeatures, preSearch = settings.oPreviousSearch, preColSearch = settings.aoPreSearchCols, i, data = [], dataProp, column, columnSearch, sort = _fnSortFlatten(settings), displayStart = settings._iDisplayStart, displayLength = features.bPaginate !== false ? settings._iDisplayLength : -1;
          var param = function(name, value) {
            data.push({ "name": name, "value": value });
          };
          param("sEcho", settings.iDraw);
          param("iColumns", columnCount);
          param("sColumns", _pluck(columns, "sName").join(","));
          param("iDisplayStart", displayStart);
          param("iDisplayLength", displayLength);
          var d = {
            draw: settings.iDraw,
            columns: [],
            order: [],
            start: displayStart,
            length: displayLength,
            search: {
              value: preSearch.sSearch,
              regex: preSearch.bRegex
            }
          };
          for (i = 0; i < columnCount; i++) {
            column = columns[i];
            columnSearch = preColSearch[i];
            dataProp = typeof column.mData == "function" ? "function" : column.mData;
            d.columns.push({
              data: dataProp,
              name: column.sName,
              searchable: column.bSearchable,
              orderable: column.bSortable,
              search: {
                value: columnSearch.sSearch,
                regex: columnSearch.bRegex
              }
            });
            param("mDataProp_" + i, dataProp);
            if (features.bFilter) {
              param("sSearch_" + i, columnSearch.sSearch);
              param("bRegex_" + i, columnSearch.bRegex);
              param("bSearchable_" + i, column.bSearchable);
            }
            if (features.bSort) {
              param("bSortable_" + i, column.bSortable);
            }
          }
          if (features.bFilter) {
            param("sSearch", preSearch.sSearch);
            param("bRegex", preSearch.bRegex);
          }
          if (features.bSort) {
            $.each(sort, function(i2, val) {
              d.order.push({ column: val.col, dir: val.dir });
              param("iSortCol_" + i2, val.col);
              param("sSortDir_" + i2, val.dir);
            });
            param("iSortingCols", sort.length);
          }
          var legacy = DataTable2.ext.legacy.ajax;
          if (legacy === null) {
            return settings.sAjaxSource ? data : d;
          }
          return legacy ? data : d;
        }
        function _fnAjaxUpdateDraw(settings, json) {
          var compat = function(old, modern) {
            return json[old] !== undefined2 ? json[old] : json[modern];
          };
          var data = _fnAjaxDataSrc(settings, json);
          var draw = compat("sEcho", "draw");
          var recordsTotal = compat("iTotalRecords", "recordsTotal");
          var recordsFiltered = compat("iTotalDisplayRecords", "recordsFiltered");
          if (draw !== undefined2) {
            if (draw * 1 < settings.iDraw) {
              return;
            }
            settings.iDraw = draw * 1;
          }
          if (!data) {
            data = [];
          }
          _fnClearTable(settings);
          settings._iRecordsTotal = parseInt(recordsTotal, 10);
          settings._iRecordsDisplay = parseInt(recordsFiltered, 10);
          for (var i = 0, ien = data.length; i < ien; i++) {
            _fnAddData(settings, data[i]);
          }
          settings.aiDisplay = settings.aiDisplayMaster.slice();
          _fnDraw(settings, true);
          if (!settings._bInitComplete) {
            _fnInitComplete(settings, json);
          }
          _fnProcessingDisplay(settings, false);
        }
        function _fnAjaxDataSrc(oSettings, json, write) {
          var dataSrc = $.isPlainObject(oSettings.ajax) && oSettings.ajax.dataSrc !== undefined2 ? oSettings.ajax.dataSrc : oSettings.sAjaxDataProp;
          if (!write) {
            if (dataSrc === "data") {
              return json.aaData || json[dataSrc];
            }
            return dataSrc !== "" ? _fnGetObjectDataFn(dataSrc)(json) : json;
          }
          _fnSetObjectDataFn(dataSrc)(json, write);
        }
        function _fnFeatureHtmlFilter(settings) {
          var classes = settings.oClasses;
          var tableId = settings.sTableId;
          var language = settings.oLanguage;
          var previousSearch = settings.oPreviousSearch;
          var features = settings.aanFeatures;
          var input = '<input type="search" class="' + classes.sFilterInput + '"/>';
          var str = language.sSearch;
          str = str.match(/_INPUT_/) ? str.replace("_INPUT_", input) : str + input;
          var filter = $("<div/>", {
            "id": !features.f ? tableId + "_filter" : null,
            "class": classes.sFilter
          }).append($("<label/>").append(str));
          var searchFn = function(event) {
            var n = features.f;
            var val = !this.value ? "" : this.value;
            if (previousSearch.return && event.key !== "Enter") {
              return;
            }
            if (val != previousSearch.sSearch) {
              _fnFilterComplete(settings, {
                "sSearch": val,
                "bRegex": previousSearch.bRegex,
                "bSmart": previousSearch.bSmart,
                "bCaseInsensitive": previousSearch.bCaseInsensitive,
                "return": previousSearch.return
              });
              settings._iDisplayStart = 0;
              _fnDraw(settings);
            }
          };
          var searchDelay = settings.searchDelay !== null ? settings.searchDelay : _fnDataSource(settings) === "ssp" ? 400 : 0;
          var jqFilter = $("input", filter).val(previousSearch.sSearch).attr("placeholder", language.sSearchPlaceholder).on("keyup.DT search.DT input.DT paste.DT cut.DT", searchDelay ? _fnThrottle(searchFn, searchDelay) : searchFn).on("mouseup", function(e) {
            setTimeout(function() {
              searchFn.call(jqFilter[0], e);
            }, 10);
          }).on("keypress.DT", function(e) {
            if (e.keyCode == 13) {
              return false;
            }
          }).attr("aria-controls", tableId);
          $(settings.nTable).on("search.dt.DT", function(ev, s) {
            if (settings === s) {
              try {
                if (jqFilter[0] !== document2.activeElement) {
                  jqFilter.val(previousSearch.sSearch);
                }
              } catch (e) {
              }
            }
          });
          return filter[0];
        }
        function _fnFilterComplete(oSettings, oInput, iForce) {
          var oPrevSearch = oSettings.oPreviousSearch;
          var aoPrevSearch = oSettings.aoPreSearchCols;
          var fnSaveFilter = function(oFilter) {
            oPrevSearch.sSearch = oFilter.sSearch;
            oPrevSearch.bRegex = oFilter.bRegex;
            oPrevSearch.bSmart = oFilter.bSmart;
            oPrevSearch.bCaseInsensitive = oFilter.bCaseInsensitive;
            oPrevSearch.return = oFilter.return;
          };
          var fnRegex = function(o) {
            return o.bEscapeRegex !== undefined2 ? !o.bEscapeRegex : o.bRegex;
          };
          _fnColumnTypes(oSettings);
          if (_fnDataSource(oSettings) != "ssp") {
            _fnFilter(oSettings, oInput.sSearch, iForce, fnRegex(oInput), oInput.bSmart, oInput.bCaseInsensitive, oInput.return);
            fnSaveFilter(oInput);
            for (var i = 0; i < aoPrevSearch.length; i++) {
              _fnFilterColumn(oSettings, aoPrevSearch[i].sSearch, i, fnRegex(aoPrevSearch[i]), aoPrevSearch[i].bSmart, aoPrevSearch[i].bCaseInsensitive);
            }
            _fnFilterCustom(oSettings);
          } else {
            fnSaveFilter(oInput);
          }
          oSettings.bFiltered = true;
          _fnCallbackFire(oSettings, null, "search", [oSettings]);
        }
        function _fnFilterCustom(settings) {
          var filters = DataTable2.ext.search;
          var displayRows = settings.aiDisplay;
          var row, rowIdx;
          for (var i = 0, ien = filters.length; i < ien; i++) {
            var rows = [];
            for (var j = 0, jen = displayRows.length; j < jen; j++) {
              rowIdx = displayRows[j];
              row = settings.aoData[rowIdx];
              if (filters[i](settings, row._aFilterData, rowIdx, row._aData, j)) {
                rows.push(rowIdx);
              }
            }
            displayRows.length = 0;
            $.merge(displayRows, rows);
          }
        }
        function _fnFilterColumn(settings, searchStr, colIdx, regex, smart, caseInsensitive) {
          if (searchStr === "") {
            return;
          }
          var data;
          var out = [];
          var display = settings.aiDisplay;
          var rpSearch = _fnFilterCreateSearch(searchStr, regex, smart, caseInsensitive);
          for (var i = 0; i < display.length; i++) {
            data = settings.aoData[display[i]]._aFilterData[colIdx];
            if (rpSearch.test(data)) {
              out.push(display[i]);
            }
          }
          settings.aiDisplay = out;
        }
        function _fnFilter(settings, input, force, regex, smart, caseInsensitive) {
          var rpSearch = _fnFilterCreateSearch(input, regex, smart, caseInsensitive);
          var prevSearch = settings.oPreviousSearch.sSearch;
          var displayMaster = settings.aiDisplayMaster;
          var display, invalidated, i;
          var filtered = [];
          if (DataTable2.ext.search.length !== 0) {
            force = true;
          }
          invalidated = _fnFilterData(settings);
          if (input.length <= 0) {
            settings.aiDisplay = displayMaster.slice();
          } else {
            if (invalidated || force || regex || prevSearch.length > input.length || input.indexOf(prevSearch) !== 0 || settings.bSorted) {
              settings.aiDisplay = displayMaster.slice();
            }
            display = settings.aiDisplay;
            for (i = 0; i < display.length; i++) {
              if (rpSearch.test(settings.aoData[display[i]]._sFilterRow)) {
                filtered.push(display[i]);
              }
            }
            settings.aiDisplay = filtered;
          }
        }
        function _fnFilterCreateSearch(search, regex, smart, caseInsensitive) {
          search = regex ? search : _fnEscapeRegex(search);
          if (smart) {
            var a = $.map(search.match(/"[^"]+"|[^ ]+/g) || [""], function(word) {
              if (word.charAt(0) === '"') {
                var m = word.match(/^"(.*)"$/);
                word = m ? m[1] : word;
              }
              return word.replace('"', "");
            });
            search = "^(?=.*?" + a.join(")(?=.*?") + ").*$";
          }
          return new RegExp(search, caseInsensitive ? "i" : "");
        }
        var _fnEscapeRegex = DataTable2.util.escapeRegex;
        var __filter_div = $("<div>")[0];
        var __filter_div_textContent = __filter_div.textContent !== undefined2;
        function _fnFilterData(settings) {
          var columns = settings.aoColumns;
          var column;
          var i, j, ien, jen, filterData, cellData, row;
          var wasInvalidated = false;
          for (i = 0, ien = settings.aoData.length; i < ien; i++) {
            row = settings.aoData[i];
            if (!row._aFilterData) {
              filterData = [];
              for (j = 0, jen = columns.length; j < jen; j++) {
                column = columns[j];
                if (column.bSearchable) {
                  cellData = _fnGetCellData(settings, i, j, "filter");
                  if (cellData === null) {
                    cellData = "";
                  }
                  if (typeof cellData !== "string" && cellData.toString) {
                    cellData = cellData.toString();
                  }
                } else {
                  cellData = "";
                }
                if (cellData.indexOf && cellData.indexOf("&") !== -1) {
                  __filter_div.innerHTML = cellData;
                  cellData = __filter_div_textContent ? __filter_div.textContent : __filter_div.innerText;
                }
                if (cellData.replace) {
                  cellData = cellData.replace(/[\r\n\u2028]/g, "");
                }
                filterData.push(cellData);
              }
              row._aFilterData = filterData;
              row._sFilterRow = filterData.join("  ");
              wasInvalidated = true;
            }
          }
          return wasInvalidated;
        }
        function _fnSearchToCamel(obj) {
          return {
            search: obj.sSearch,
            smart: obj.bSmart,
            regex: obj.bRegex,
            caseInsensitive: obj.bCaseInsensitive
          };
        }
        function _fnSearchToHung(obj) {
          return {
            sSearch: obj.search,
            bSmart: obj.smart,
            bRegex: obj.regex,
            bCaseInsensitive: obj.caseInsensitive
          };
        }
        function _fnFeatureHtmlInfo(settings) {
          var tid = settings.sTableId, nodes = settings.aanFeatures.i, n = $("<div/>", {
            "class": settings.oClasses.sInfo,
            "id": !nodes ? tid + "_info" : null
          });
          if (!nodes) {
            settings.aoDrawCallback.push({
              "fn": _fnUpdateInfo,
              "sName": "information"
            });
            n.attr("role", "status").attr("aria-live", "polite");
            $(settings.nTable).attr("aria-describedby", tid + "_info");
          }
          return n[0];
        }
        function _fnUpdateInfo(settings) {
          var nodes = settings.aanFeatures.i;
          if (nodes.length === 0) {
            return;
          }
          var lang = settings.oLanguage, start2 = settings._iDisplayStart + 1, end = settings.fnDisplayEnd(), max = settings.fnRecordsTotal(), total = settings.fnRecordsDisplay(), out = total ? lang.sInfo : lang.sInfoEmpty;
          if (total !== max) {
            out += " " + lang.sInfoFiltered;
          }
          out += lang.sInfoPostFix;
          out = _fnInfoMacros(settings, out);
          var callback = lang.fnInfoCallback;
          if (callback !== null) {
            out = callback.call(settings.oInstance, settings, start2, end, max, total, out);
          }
          $(nodes).html(out);
        }
        function _fnInfoMacros(settings, str) {
          var formatter = settings.fnFormatNumber, start2 = settings._iDisplayStart + 1, len = settings._iDisplayLength, vis = settings.fnRecordsDisplay(), all = len === -1;
          return str.replace(/_START_/g, formatter.call(settings, start2)).replace(/_END_/g, formatter.call(settings, settings.fnDisplayEnd())).replace(/_MAX_/g, formatter.call(settings, settings.fnRecordsTotal())).replace(/_TOTAL_/g, formatter.call(settings, vis)).replace(/_PAGE_/g, formatter.call(settings, all ? 1 : Math.ceil(start2 / len))).replace(/_PAGES_/g, formatter.call(settings, all ? 1 : Math.ceil(vis / len)));
        }
        function _fnInitialise(settings) {
          var i, iLen, iAjaxStart = settings.iInitDisplayStart;
          var columns = settings.aoColumns, column;
          var features = settings.oFeatures;
          var deferLoading = settings.bDeferLoading;
          if (!settings.bInitialised) {
            setTimeout(function() {
              _fnInitialise(settings);
            }, 200);
            return;
          }
          _fnAddOptionsHtml(settings);
          _fnBuildHead(settings);
          _fnDrawHead(settings, settings.aoHeader);
          _fnDrawHead(settings, settings.aoFooter);
          _fnProcessingDisplay(settings, true);
          if (features.bAutoWidth) {
            _fnCalculateColumnWidths(settings);
          }
          for (i = 0, iLen = columns.length; i < iLen; i++) {
            column = columns[i];
            if (column.sWidth) {
              column.nTh.style.width = _fnStringToCss(column.sWidth);
            }
          }
          _fnCallbackFire(settings, null, "preInit", [settings]);
          _fnReDraw(settings);
          var dataSrc = _fnDataSource(settings);
          if (dataSrc != "ssp" || deferLoading) {
            if (dataSrc == "ajax") {
              _fnBuildAjax(settings, [], function(json) {
                var aData = _fnAjaxDataSrc(settings, json);
                for (i = 0; i < aData.length; i++) {
                  _fnAddData(settings, aData[i]);
                }
                settings.iInitDisplayStart = iAjaxStart;
                _fnReDraw(settings);
                _fnProcessingDisplay(settings, false);
                _fnInitComplete(settings, json);
              }, settings);
            } else {
              _fnProcessingDisplay(settings, false);
              _fnInitComplete(settings);
            }
          }
        }
        function _fnInitComplete(settings, json) {
          settings._bInitComplete = true;
          if (json || settings.oInit.aaData) {
            _fnAdjustColumnSizing(settings);
          }
          _fnCallbackFire(settings, null, "plugin-init", [settings, json]);
          _fnCallbackFire(settings, "aoInitComplete", "init", [settings, json]);
        }
        function _fnLengthChange(settings, val) {
          var len = parseInt(val, 10);
          settings._iDisplayLength = len;
          _fnLengthOverflow(settings);
          _fnCallbackFire(settings, null, "length", [settings, len]);
        }
        function _fnFeatureHtmlLength(settings) {
          var classes = settings.oClasses, tableId = settings.sTableId, menu = settings.aLengthMenu, d2 = Array.isArray(menu[0]), lengths = d2 ? menu[0] : menu, language = d2 ? menu[1] : menu;
          var select = $("<select/>", {
            "name": tableId + "_length",
            "aria-controls": tableId,
            "class": classes.sLengthSelect
          });
          for (var i = 0, ien = lengths.length; i < ien; i++) {
            select[0][i] = new Option(typeof language[i] === "number" ? settings.fnFormatNumber(language[i]) : language[i], lengths[i]);
          }
          var div = $("<div><label/></div>").addClass(classes.sLength);
          if (!settings.aanFeatures.l) {
            div[0].id = tableId + "_length";
          }
          div.children().append(settings.oLanguage.sLengthMenu.replace("_MENU_", select[0].outerHTML));
          $("select", div).val(settings._iDisplayLength).on("change.DT", function(e) {
            _fnLengthChange(settings, $(this).val());
            _fnDraw(settings);
          });
          $(settings.nTable).on("length.dt.DT", function(e, s, len) {
            if (settings === s) {
              $("select", div).val(len);
            }
          });
          return div[0];
        }
        function _fnFeatureHtmlPaginate(settings) {
          var type = settings.sPaginationType, plugin = DataTable2.ext.pager[type], modern = typeof plugin === "function", redraw = function(settings2) {
            _fnDraw(settings2);
          }, node = $("<div/>").addClass(settings.oClasses.sPaging + type)[0], features = settings.aanFeatures;
          if (!modern) {
            plugin.fnInit(settings, node, redraw);
          }
          if (!features.p) {
            node.id = settings.sTableId + "_paginate";
            settings.aoDrawCallback.push({
              "fn": function(settings2) {
                if (modern) {
                  var start2 = settings2._iDisplayStart, len = settings2._iDisplayLength, visRecords = settings2.fnRecordsDisplay(), all = len === -1, page = all ? 0 : Math.ceil(start2 / len), pages = all ? 1 : Math.ceil(visRecords / len), buttons = plugin(page, pages), i, ien;
                  for (i = 0, ien = features.p.length; i < ien; i++) {
                    _fnRenderer(settings2, "pageButton")(settings2, features.p[i], i, buttons, page, pages);
                  }
                } else {
                  plugin.fnUpdate(settings2, redraw);
                }
              },
              "sName": "pagination"
            });
          }
          return node;
        }
        function _fnPageChange(settings, action, redraw) {
          var start2 = settings._iDisplayStart, len = settings._iDisplayLength, records = settings.fnRecordsDisplay();
          if (records === 0 || len === -1) {
            start2 = 0;
          } else if (typeof action === "number") {
            start2 = action * len;
            if (start2 > records) {
              start2 = 0;
            }
          } else if (action == "first") {
            start2 = 0;
          } else if (action == "previous") {
            start2 = len >= 0 ? start2 - len : 0;
            if (start2 < 0) {
              start2 = 0;
            }
          } else if (action == "next") {
            if (start2 + len < records) {
              start2 += len;
            }
          } else if (action == "last") {
            start2 = Math.floor((records - 1) / len) * len;
          } else {
            _fnLog(settings, 0, "Unknown paging action: " + action, 5);
          }
          var changed = settings._iDisplayStart !== start2;
          settings._iDisplayStart = start2;
          if (changed) {
            _fnCallbackFire(settings, null, "page", [settings]);
            if (redraw) {
              _fnDraw(settings);
            }
          }
          return changed;
        }
        function _fnFeatureHtmlProcessing(settings) {
          return $("<div/>", {
            "id": !settings.aanFeatures.r ? settings.sTableId + "_processing" : null,
            "class": settings.oClasses.sProcessing
          }).html(settings.oLanguage.sProcessing).insertBefore(settings.nTable)[0];
        }
        function _fnProcessingDisplay(settings, show) {
          if (settings.oFeatures.bProcessing) {
            $(settings.aanFeatures.r).css("display", show ? "block" : "none");
          }
          _fnCallbackFire(settings, null, "processing", [settings, show]);
        }
        function _fnFeatureHtmlTable(settings) {
          var table = $(settings.nTable);
          var scroll = settings.oScroll;
          if (scroll.sX === "" && scroll.sY === "") {
            return settings.nTable;
          }
          var scrollX = scroll.sX;
          var scrollY = scroll.sY;
          var classes = settings.oClasses;
          var caption = table.children("caption");
          var captionSide = caption.length ? caption[0]._captionSide : null;
          var headerClone = $(table[0].cloneNode(false));
          var footerClone = $(table[0].cloneNode(false));
          var footer = table.children("tfoot");
          var _div = "<div/>";
          var size = function(s) {
            return !s ? null : _fnStringToCss(s);
          };
          if (!footer.length) {
            footer = null;
          }
          var scroller = $(_div, { "class": classes.sScrollWrapper }).append($(_div, { "class": classes.sScrollHead }).css({
            overflow: "hidden",
            position: "relative",
            border: 0,
            width: scrollX ? size(scrollX) : "100%"
          }).append($(_div, { "class": classes.sScrollHeadInner }).css({
            "box-sizing": "content-box",
            width: scroll.sXInner || "100%"
          }).append(headerClone.removeAttr("id").css("margin-left", 0).append(captionSide === "top" ? caption : null).append(table.children("thead"))))).append($(_div, { "class": classes.sScrollBody }).css({
            position: "relative",
            overflow: "auto",
            width: size(scrollX)
          }).append(table));
          if (footer) {
            scroller.append($(_div, { "class": classes.sScrollFoot }).css({
              overflow: "hidden",
              border: 0,
              width: scrollX ? size(scrollX) : "100%"
            }).append($(_div, { "class": classes.sScrollFootInner }).append(footerClone.removeAttr("id").css("margin-left", 0).append(captionSide === "bottom" ? caption : null).append(table.children("tfoot")))));
          }
          var children = scroller.children();
          var scrollHead = children[0];
          var scrollBody = children[1];
          var scrollFoot = footer ? children[2] : null;
          if (scrollX) {
            $(scrollBody).on("scroll.DT", function(e) {
              var scrollLeft = this.scrollLeft;
              scrollHead.scrollLeft = scrollLeft;
              if (footer) {
                scrollFoot.scrollLeft = scrollLeft;
              }
            });
          }
          $(scrollBody).css("max-height", scrollY);
          if (!scroll.bCollapse) {
            $(scrollBody).css("height", scrollY);
          }
          settings.nScrollHead = scrollHead;
          settings.nScrollBody = scrollBody;
          settings.nScrollFoot = scrollFoot;
          settings.aoDrawCallback.push({
            "fn": _fnScrollDraw,
            "sName": "scrolling"
          });
          return scroller[0];
        }
        function _fnScrollDraw(settings) {
          var scroll = settings.oScroll, scrollX = scroll.sX, scrollXInner = scroll.sXInner, scrollY = scroll.sY, barWidth = scroll.iBarWidth, divHeader = $(settings.nScrollHead), divHeaderStyle = divHeader[0].style, divHeaderInner = divHeader.children("div"), divHeaderInnerStyle = divHeaderInner[0].style, divHeaderTable = divHeaderInner.children("table"), divBodyEl = settings.nScrollBody, divBody = $(divBodyEl), divBodyStyle = divBodyEl.style, divFooter = $(settings.nScrollFoot), divFooterInner = divFooter.children("div"), divFooterTable = divFooterInner.children("table"), header = $(settings.nTHead), table = $(settings.nTable), tableEl = table[0], tableStyle = tableEl.style, footer = settings.nTFoot ? $(settings.nTFoot) : null, browser = settings.oBrowser, ie67 = browser.bScrollOversize, dtHeaderCells = _pluck(settings.aoColumns, "nTh"), headerTrgEls, footerTrgEls, headerSrcEls, footerSrcEls, headerCopy, footerCopy, headerWidths = [], footerWidths = [], headerContent = [], footerContent = [], idx, correction, sanityWidth, zeroOut = function(nSizer) {
            var style = nSizer.style;
            style.paddingTop = "0";
            style.paddingBottom = "0";
            style.borderTopWidth = "0";
            style.borderBottomWidth = "0";
            style.height = 0;
          };
          var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;
          if (settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined2) {
            settings.scrollBarVis = scrollBarVis;
            _fnAdjustColumnSizing(settings);
            return;
          } else {
            settings.scrollBarVis = scrollBarVis;
          }
          table.children("thead, tfoot").remove();
          if (footer) {
            footerCopy = footer.clone().prependTo(table);
            footerTrgEls = footer.find("tr");
            footerSrcEls = footerCopy.find("tr");
          }
          headerCopy = header.clone().prependTo(table);
          headerTrgEls = header.find("tr");
          headerSrcEls = headerCopy.find("tr");
          headerCopy.find("th, td").removeAttr("tabindex");
          if (!scrollX) {
            divBodyStyle.width = "100%";
            divHeader[0].style.width = "100%";
          }
          $.each(_fnGetUniqueThs(settings, headerCopy), function(i, el) {
            idx = _fnVisibleToColumnIndex(settings, i);
            el.style.width = settings.aoColumns[idx].sWidth;
          });
          if (footer) {
            _fnApplyToChildren(function(n) {
              n.style.width = "";
            }, footerSrcEls);
          }
          sanityWidth = table.outerWidth();
          if (scrollX === "") {
            tableStyle.width = "100%";
            if (ie67 && (table.find("tbody").height() > divBodyEl.offsetHeight || divBody.css("overflow-y") == "scroll")) {
              tableStyle.width = _fnStringToCss(table.outerWidth() - barWidth);
            }
            sanityWidth = table.outerWidth();
          } else if (scrollXInner !== "") {
            tableStyle.width = _fnStringToCss(scrollXInner);
            sanityWidth = table.outerWidth();
          }
          _fnApplyToChildren(zeroOut, headerSrcEls);
          _fnApplyToChildren(function(nSizer) {
            var style = window2.getComputedStyle ? window2.getComputedStyle(nSizer).width : _fnStringToCss($(nSizer).width());
            headerContent.push(nSizer.innerHTML);
            headerWidths.push(style);
          }, headerSrcEls);
          _fnApplyToChildren(function(nToSize, i) {
            nToSize.style.width = headerWidths[i];
          }, headerTrgEls);
          $(headerSrcEls).height(0);
          if (footer) {
            _fnApplyToChildren(zeroOut, footerSrcEls);
            _fnApplyToChildren(function(nSizer) {
              footerContent.push(nSizer.innerHTML);
              footerWidths.push(_fnStringToCss($(nSizer).css("width")));
            }, footerSrcEls);
            _fnApplyToChildren(function(nToSize, i) {
              nToSize.style.width = footerWidths[i];
            }, footerTrgEls);
            $(footerSrcEls).height(0);
          }
          _fnApplyToChildren(function(nSizer, i) {
            nSizer.innerHTML = '<div class="dataTables_sizing">' + headerContent[i] + "</div>";
            nSizer.childNodes[0].style.height = "0";
            nSizer.childNodes[0].style.overflow = "hidden";
            nSizer.style.width = headerWidths[i];
          }, headerSrcEls);
          if (footer) {
            _fnApplyToChildren(function(nSizer, i) {
              nSizer.innerHTML = '<div class="dataTables_sizing">' + footerContent[i] + "</div>";
              nSizer.childNodes[0].style.height = "0";
              nSizer.childNodes[0].style.overflow = "hidden";
              nSizer.style.width = footerWidths[i];
            }, footerSrcEls);
          }
          if (table.outerWidth() < sanityWidth) {
            correction = divBodyEl.scrollHeight > divBodyEl.offsetHeight || divBody.css("overflow-y") == "scroll" ? sanityWidth + barWidth : sanityWidth;
            if (ie67 && (divBodyEl.scrollHeight > divBodyEl.offsetHeight || divBody.css("overflow-y") == "scroll")) {
              tableStyle.width = _fnStringToCss(correction - barWidth);
            }
            if (scrollX === "" || scrollXInner !== "") {
              _fnLog(settings, 1, "Possible column misalignment", 6);
            }
          } else {
            correction = "100%";
          }
          divBodyStyle.width = _fnStringToCss(correction);
          divHeaderStyle.width = _fnStringToCss(correction);
          if (footer) {
            settings.nScrollFoot.style.width = _fnStringToCss(correction);
          }
          if (!scrollY) {
            if (ie67) {
              divBodyStyle.height = _fnStringToCss(tableEl.offsetHeight + barWidth);
            }
          }
          var iOuterWidth = table.outerWidth();
          divHeaderTable[0].style.width = _fnStringToCss(iOuterWidth);
          divHeaderInnerStyle.width = _fnStringToCss(iOuterWidth);
          var bScrolling = table.height() > divBodyEl.clientHeight || divBody.css("overflow-y") == "scroll";
          var padding = "padding" + (browser.bScrollbarLeft ? "Left" : "Right");
          divHeaderInnerStyle[padding] = bScrolling ? barWidth + "px" : "0px";
          if (footer) {
            divFooterTable[0].style.width = _fnStringToCss(iOuterWidth);
            divFooterInner[0].style.width = _fnStringToCss(iOuterWidth);
            divFooterInner[0].style[padding] = bScrolling ? barWidth + "px" : "0px";
          }
          table.children("colgroup").insertBefore(table.children("thead"));
          divBody.trigger("scroll");
          if ((settings.bSorted || settings.bFiltered) && !settings._drawHold) {
            divBodyEl.scrollTop = 0;
          }
        }
        function _fnApplyToChildren(fn, an1, an2) {
          var index = 0, i = 0, iLen = an1.length;
          var nNode1, nNode2;
          while (i < iLen) {
            nNode1 = an1[i].firstChild;
            nNode2 = an2 ? an2[i].firstChild : null;
            while (nNode1) {
              if (nNode1.nodeType === 1) {
                if (an2) {
                  fn(nNode1, nNode2, index);
                } else {
                  fn(nNode1, index);
                }
                index++;
              }
              nNode1 = nNode1.nextSibling;
              nNode2 = an2 ? nNode2.nextSibling : null;
            }
            i++;
          }
        }
        var __re_html_remove = /<.*?>/g;
        function _fnCalculateColumnWidths(oSettings) {
          var table = oSettings.nTable, columns = oSettings.aoColumns, scroll = oSettings.oScroll, scrollY = scroll.sY, scrollX = scroll.sX, scrollXInner = scroll.sXInner, columnCount = columns.length, visibleColumns = _fnGetColumns(oSettings, "bVisible"), headerCells = $("th", oSettings.nTHead), tableWidthAttr = table.getAttribute("width"), tableContainer = table.parentNode, userInputs = false, i, column, columnIdx, width, outerWidth, browser = oSettings.oBrowser, ie67 = browser.bScrollOversize;
          var styleWidth = table.style.width;
          if (styleWidth && styleWidth.indexOf("%") !== -1) {
            tableWidthAttr = styleWidth;
          }
          for (i = 0; i < visibleColumns.length; i++) {
            column = columns[visibleColumns[i]];
            if (column.sWidth !== null) {
              column.sWidth = _fnConvertToWidth(column.sWidthOrig, tableContainer);
              userInputs = true;
            }
          }
          if (ie67 || !userInputs && !scrollX && !scrollY && columnCount == _fnVisbleColumns(oSettings) && columnCount == headerCells.length) {
            for (i = 0; i < columnCount; i++) {
              var colIdx = _fnVisibleToColumnIndex(oSettings, i);
              if (colIdx !== null) {
                columns[colIdx].sWidth = _fnStringToCss(headerCells.eq(i).width());
              }
            }
          } else {
            var tmpTable = $(table).clone().css("visibility", "hidden").removeAttr("id");
            tmpTable.find("tbody tr").remove();
            var tr = $("<tr/>").appendTo(tmpTable.find("tbody"));
            tmpTable.find("thead, tfoot").remove();
            tmpTable.append($(oSettings.nTHead).clone()).append($(oSettings.nTFoot).clone());
            tmpTable.find("tfoot th, tfoot td").css("width", "");
            headerCells = _fnGetUniqueThs(oSettings, tmpTable.find("thead")[0]);
            for (i = 0; i < visibleColumns.length; i++) {
              column = columns[visibleColumns[i]];
              headerCells[i].style.width = column.sWidthOrig !== null && column.sWidthOrig !== "" ? _fnStringToCss(column.sWidthOrig) : "";
              if (column.sWidthOrig && scrollX) {
                $(headerCells[i]).append($("<div/>").css({
                  width: column.sWidthOrig,
                  margin: 0,
                  padding: 0,
                  border: 0,
                  height: 1
                }));
              }
            }
            if (oSettings.aoData.length) {
              for (i = 0; i < visibleColumns.length; i++) {
                columnIdx = visibleColumns[i];
                column = columns[columnIdx];
                $(_fnGetWidestNode(oSettings, columnIdx)).clone(false).append(column.sContentPadding).appendTo(tr);
              }
            }
            $("[name]", tmpTable).removeAttr("name");
            var holder = $("<div/>").css(scrollX || scrollY ? {
              position: "absolute",
              top: 0,
              left: 0,
              height: 1,
              right: 0,
              overflow: "hidden"
            } : {}).append(tmpTable).appendTo(tableContainer);
            if (scrollX && scrollXInner) {
              tmpTable.width(scrollXInner);
            } else if (scrollX) {
              tmpTable.css("width", "auto");
              tmpTable.removeAttr("width");
              if (tmpTable.width() < tableContainer.clientWidth && tableWidthAttr) {
                tmpTable.width(tableContainer.clientWidth);
              }
            } else if (scrollY) {
              tmpTable.width(tableContainer.clientWidth);
            } else if (tableWidthAttr) {
              tmpTable.width(tableWidthAttr);
            }
            var total = 0;
            for (i = 0; i < visibleColumns.length; i++) {
              var cell = $(headerCells[i]);
              var border = cell.outerWidth() - cell.width();
              var bounding = browser.bBounding ? Math.ceil(headerCells[i].getBoundingClientRect().width) : cell.outerWidth();
              total += bounding;
              columns[visibleColumns[i]].sWidth = _fnStringToCss(bounding - border);
            }
            table.style.width = _fnStringToCss(total);
            holder.remove();
          }
          if (tableWidthAttr) {
            table.style.width = _fnStringToCss(tableWidthAttr);
          }
          if ((tableWidthAttr || scrollX) && !oSettings._reszEvt) {
            var bindResize = function() {
              $(window2).on("resize.DT-" + oSettings.sInstance, _fnThrottle(function() {
                _fnAdjustColumnSizing(oSettings);
              }));
            };
            if (ie67) {
              setTimeout(bindResize, 1e3);
            } else {
              bindResize();
            }
            oSettings._reszEvt = true;
          }
        }
        var _fnThrottle = DataTable2.util.throttle;
        function _fnConvertToWidth(width, parent) {
          if (!width) {
            return 0;
          }
          var n = $("<div/>").css("width", _fnStringToCss(width)).appendTo(parent || document2.body);
          var val = n[0].offsetWidth;
          n.remove();
          return val;
        }
        function _fnGetWidestNode(settings, colIdx) {
          var idx = _fnGetMaxLenString(settings, colIdx);
          if (idx < 0) {
            return null;
          }
          var data = settings.aoData[idx];
          return !data.nTr ? $("<td/>").html(_fnGetCellData(settings, idx, colIdx, "display"))[0] : data.anCells[colIdx];
        }
        function _fnGetMaxLenString(settings, colIdx) {
          var s, max = -1, maxIdx = -1;
          for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
            s = _fnGetCellData(settings, i, colIdx, "display") + "";
            s = s.replace(__re_html_remove, "");
            s = s.replace(/&nbsp;/g, " ");
            if (s.length > max) {
              max = s.length;
              maxIdx = i;
            }
          }
          return maxIdx;
        }
        function _fnStringToCss(s) {
          if (s === null) {
            return "0px";
          }
          if (typeof s == "number") {
            return s < 0 ? "0px" : s + "px";
          }
          return s.match(/\d$/) ? s + "px" : s;
        }
        function _fnSortFlatten(settings) {
          var i, iLen, k, kLen, aSort = [], aiOrig = [], aoColumns = settings.aoColumns, aDataSort, iCol, sType, srcCol, fixed = settings.aaSortingFixed, fixedObj = $.isPlainObject(fixed), nestedSort = [], add2 = function(a) {
            if (a.length && !Array.isArray(a[0])) {
              nestedSort.push(a);
            } else {
              $.merge(nestedSort, a);
            }
          };
          if (Array.isArray(fixed)) {
            add2(fixed);
          }
          if (fixedObj && fixed.pre) {
            add2(fixed.pre);
          }
          add2(settings.aaSorting);
          if (fixedObj && fixed.post) {
            add2(fixed.post);
          }
          for (i = 0; i < nestedSort.length; i++) {
            srcCol = nestedSort[i][0];
            aDataSort = aoColumns[srcCol].aDataSort;
            for (k = 0, kLen = aDataSort.length; k < kLen; k++) {
              iCol = aDataSort[k];
              sType = aoColumns[iCol].sType || "string";
              if (nestedSort[i]._idx === undefined2) {
                nestedSort[i]._idx = $.inArray(nestedSort[i][1], aoColumns[iCol].asSorting);
              }
              aSort.push({
                src: srcCol,
                col: iCol,
                dir: nestedSort[i][1],
                index: nestedSort[i]._idx,
                type: sType,
                formatter: DataTable2.ext.type.order[sType + "-pre"]
              });
            }
          }
          return aSort;
        }
        function _fnSort(oSettings) {
          var i, ien, iLen, j, jLen, k, kLen, sDataType, nTh, aiOrig = [], oExtSort = DataTable2.ext.type.order, aoData = oSettings.aoData, aoColumns = oSettings.aoColumns, aDataSort, data, iCol, sType, oSort, formatters = 0, sortCol, displayMaster = oSettings.aiDisplayMaster, aSort;
          _fnColumnTypes(oSettings);
          aSort = _fnSortFlatten(oSettings);
          for (i = 0, ien = aSort.length; i < ien; i++) {
            sortCol = aSort[i];
            if (sortCol.formatter) {
              formatters++;
            }
            _fnSortData(oSettings, sortCol.col);
          }
          if (_fnDataSource(oSettings) != "ssp" && aSort.length !== 0) {
            for (i = 0, iLen = displayMaster.length; i < iLen; i++) {
              aiOrig[displayMaster[i]] = i;
            }
            if (formatters === aSort.length) {
              displayMaster.sort(function(a, b) {
                var x, y, k2, test, sort, len = aSort.length, dataA = aoData[a]._aSortData, dataB = aoData[b]._aSortData;
                for (k2 = 0; k2 < len; k2++) {
                  sort = aSort[k2];
                  x = dataA[sort.col];
                  y = dataB[sort.col];
                  test = x < y ? -1 : x > y ? 1 : 0;
                  if (test !== 0) {
                    return sort.dir === "asc" ? test : -test;
                  }
                }
                x = aiOrig[a];
                y = aiOrig[b];
                return x < y ? -1 : x > y ? 1 : 0;
              });
            } else {
              displayMaster.sort(function(a, b) {
                var x, y, k2, l, test, sort, fn, len = aSort.length, dataA = aoData[a]._aSortData, dataB = aoData[b]._aSortData;
                for (k2 = 0; k2 < len; k2++) {
                  sort = aSort[k2];
                  x = dataA[sort.col];
                  y = dataB[sort.col];
                  fn = oExtSort[sort.type + "-" + sort.dir] || oExtSort["string-" + sort.dir];
                  test = fn(x, y);
                  if (test !== 0) {
                    return test;
                  }
                }
                x = aiOrig[a];
                y = aiOrig[b];
                return x < y ? -1 : x > y ? 1 : 0;
              });
            }
          }
          oSettings.bSorted = true;
        }
        function _fnSortAria(settings) {
          var label;
          var nextSort;
          var columns = settings.aoColumns;
          var aSort = _fnSortFlatten(settings);
          var oAria = settings.oLanguage.oAria;
          for (var i = 0, iLen = columns.length; i < iLen; i++) {
            var col = columns[i];
            var asSorting = col.asSorting;
            var sTitle = col.ariaTitle || col.sTitle.replace(/<.*?>/g, "");
            var th = col.nTh;
            th.removeAttribute("aria-sort");
            if (col.bSortable) {
              if (aSort.length > 0 && aSort[0].col == i) {
                th.setAttribute("aria-sort", aSort[0].dir == "asc" ? "ascending" : "descending");
                nextSort = asSorting[aSort[0].index + 1] || asSorting[0];
              } else {
                nextSort = asSorting[0];
              }
              label = sTitle + (nextSort === "asc" ? oAria.sSortAscending : oAria.sSortDescending);
            } else {
              label = sTitle;
            }
            th.setAttribute("aria-label", label);
          }
        }
        function _fnSortListener(settings, colIdx, append, callback) {
          var col = settings.aoColumns[colIdx];
          var sorting = settings.aaSorting;
          var asSorting = col.asSorting;
          var nextSortIdx;
          var next = function(a, overflow) {
            var idx = a._idx;
            if (idx === undefined2) {
              idx = $.inArray(a[1], asSorting);
            }
            return idx + 1 < asSorting.length ? idx + 1 : overflow ? null : 0;
          };
          if (typeof sorting[0] === "number") {
            sorting = settings.aaSorting = [sorting];
          }
          if (append && settings.oFeatures.bSortMulti) {
            var sortIdx = $.inArray(colIdx, _pluck(sorting, "0"));
            if (sortIdx !== -1) {
              nextSortIdx = next(sorting[sortIdx], true);
              if (nextSortIdx === null && sorting.length === 1) {
                nextSortIdx = 0;
              }
              if (nextSortIdx === null) {
                sorting.splice(sortIdx, 1);
              } else {
                sorting[sortIdx][1] = asSorting[nextSortIdx];
                sorting[sortIdx]._idx = nextSortIdx;
              }
            } else {
              sorting.push([colIdx, asSorting[0], 0]);
              sorting[sorting.length - 1]._idx = 0;
            }
          } else if (sorting.length && sorting[0][0] == colIdx) {
            nextSortIdx = next(sorting[0]);
            sorting.length = 1;
            sorting[0][1] = asSorting[nextSortIdx];
            sorting[0]._idx = nextSortIdx;
          } else {
            sorting.length = 0;
            sorting.push([colIdx, asSorting[0]]);
            sorting[0]._idx = 0;
          }
          _fnReDraw(settings);
          if (typeof callback == "function") {
            callback(settings);
          }
        }
        function _fnSortAttachListener(settings, attachTo, colIdx, callback) {
          var col = settings.aoColumns[colIdx];
          _fnBindAction(attachTo, {}, function(e) {
            if (col.bSortable === false) {
              return;
            }
            if (settings.oFeatures.bProcessing) {
              _fnProcessingDisplay(settings, true);
              setTimeout(function() {
                _fnSortListener(settings, colIdx, e.shiftKey, callback);
                if (_fnDataSource(settings) !== "ssp") {
                  _fnProcessingDisplay(settings, false);
                }
              }, 0);
            } else {
              _fnSortListener(settings, colIdx, e.shiftKey, callback);
            }
          });
        }
        function _fnSortingClasses(settings) {
          var oldSort = settings.aLastSort;
          var sortClass = settings.oClasses.sSortColumn;
          var sort = _fnSortFlatten(settings);
          var features = settings.oFeatures;
          var i, ien, colIdx;
          if (features.bSort && features.bSortClasses) {
            for (i = 0, ien = oldSort.length; i < ien; i++) {
              colIdx = oldSort[i].src;
              $(_pluck(settings.aoData, "anCells", colIdx)).removeClass(sortClass + (i < 2 ? i + 1 : 3));
            }
            for (i = 0, ien = sort.length; i < ien; i++) {
              colIdx = sort[i].src;
              $(_pluck(settings.aoData, "anCells", colIdx)).addClass(sortClass + (i < 2 ? i + 1 : 3));
            }
          }
          settings.aLastSort = sort;
        }
        function _fnSortData(settings, idx) {
          var column = settings.aoColumns[idx];
          var customSort = DataTable2.ext.order[column.sSortDataType];
          var customData;
          if (customSort) {
            customData = customSort.call(settings.oInstance, settings, idx, _fnColumnIndexToVisible(settings, idx));
          }
          var row, cellData;
          var formatter = DataTable2.ext.type.order[column.sType + "-pre"];
          for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
            row = settings.aoData[i];
            if (!row._aSortData) {
              row._aSortData = [];
            }
            if (!row._aSortData[idx] || customSort) {
              cellData = customSort ? customData[i] : _fnGetCellData(settings, i, idx, "sort");
              row._aSortData[idx] = formatter ? formatter(cellData) : cellData;
            }
          }
        }
        function _fnSaveState(settings) {
          if (settings._bLoadingState) {
            return;
          }
          var state = {
            time: +new Date(),
            start: settings._iDisplayStart,
            length: settings._iDisplayLength,
            order: $.extend(true, [], settings.aaSorting),
            search: _fnSearchToCamel(settings.oPreviousSearch),
            columns: $.map(settings.aoColumns, function(col, i) {
              return {
                visible: col.bVisible,
                search: _fnSearchToCamel(settings.aoPreSearchCols[i])
              };
            })
          };
          settings.oSavedState = state;
          _fnCallbackFire(settings, "aoStateSaveParams", "stateSaveParams", [settings, state]);
          if (settings.oFeatures.bStateSave && !settings.bDestroying) {
            settings.fnStateSaveCallback.call(settings.oInstance, settings, state);
          }
        }
        function _fnLoadState(settings, oInit, callback) {
          if (!settings.oFeatures.bStateSave) {
            callback();
            return;
          }
          var loaded = function(state2) {
            _fnImplementState(settings, state2, callback);
          };
          var state = settings.fnStateLoadCallback.call(settings.oInstance, settings, loaded);
          if (state !== undefined2) {
            _fnImplementState(settings, state, callback);
          }
          return true;
        }
        function _fnImplementState(settings, s, callback) {
          var i, ien;
          var columns = settings.aoColumns;
          settings._bLoadingState = true;
          var api = settings._bInitComplete ? new DataTable2.Api(settings) : null;
          if (!s || !s.time) {
            settings._bLoadingState = false;
            callback();
            return;
          }
          var abStateLoad = _fnCallbackFire(settings, "aoStateLoadParams", "stateLoadParams", [settings, s]);
          if ($.inArray(false, abStateLoad) !== -1) {
            settings._bLoadingState = false;
            callback();
            return;
          }
          var duration = settings.iStateDuration;
          if (duration > 0 && s.time < +new Date() - duration * 1e3) {
            settings._bLoadingState = false;
            callback();
            return;
          }
          if (s.columns && columns.length !== s.columns.length) {
            settings._bLoadingState = false;
            callback();
            return;
          }
          settings.oLoadedState = $.extend(true, {}, s);
          if (s.start !== undefined2) {
            settings._iDisplayStart = s.start;
            if (api === null) {
              settings.iInitDisplayStart = s.start;
            }
          }
          if (s.length !== undefined2) {
            settings._iDisplayLength = s.length;
          }
          if (s.order !== undefined2) {
            settings.aaSorting = [];
            $.each(s.order, function(i2, col2) {
              settings.aaSorting.push(col2[0] >= columns.length ? [0, col2[1]] : col2);
            });
          }
          if (s.search !== undefined2) {
            $.extend(settings.oPreviousSearch, _fnSearchToHung(s.search));
          }
          if (s.columns) {
            for (i = 0, ien = s.columns.length; i < ien; i++) {
              var col = s.columns[i];
              if (col.visible !== undefined2) {
                if (api) {
                  api.column(i).visible(col.visible, false);
                } else {
                  columns[i].bVisible = col.visible;
                }
              }
              if (col.search !== undefined2) {
                $.extend(settings.aoPreSearchCols[i], _fnSearchToHung(col.search));
              }
            }
            if (api) {
              api.columns.adjust();
            }
          }
          settings._bLoadingState = false;
          _fnCallbackFire(settings, "aoStateLoaded", "stateLoaded", [settings, s]);
          callback();
        }
        ;
        function _fnSettingsFromNode(table) {
          var settings = DataTable2.settings;
          var idx = $.inArray(table, _pluck(settings, "nTable"));
          return idx !== -1 ? settings[idx] : null;
        }
        function _fnLog(settings, level, msg, tn) {
          msg = "DataTables warning: " + (settings ? "table id=" + settings.sTableId + " - " : "") + msg;
          if (tn) {
            msg += ". For more information about this error, please see http://datatables.net/tn/" + tn;
          }
          if (!level) {
            var ext = DataTable2.ext;
            var type = ext.sErrMode || ext.errMode;
            if (settings) {
              _fnCallbackFire(settings, null, "error", [settings, tn, msg]);
            }
            if (type == "alert") {
              alert(msg);
            } else if (type == "throw") {
              throw new Error(msg);
            } else if (typeof type == "function") {
              type(settings, tn, msg);
            }
          } else if (window2.console && console.log) {
            console.log(msg);
          }
        }
        function _fnMap(ret, src, name, mappedName) {
          if (Array.isArray(name)) {
            $.each(name, function(i, val) {
              if (Array.isArray(val)) {
                _fnMap(ret, src, val[0], val[1]);
              } else {
                _fnMap(ret, src, val);
              }
            });
            return;
          }
          if (mappedName === undefined2) {
            mappedName = name;
          }
          if (src[name] !== undefined2) {
            ret[mappedName] = src[name];
          }
        }
        function _fnExtend(out, extender, breakRefs) {
          var val;
          for (var prop in extender) {
            if (extender.hasOwnProperty(prop)) {
              val = extender[prop];
              if ($.isPlainObject(val)) {
                if (!$.isPlainObject(out[prop])) {
                  out[prop] = {};
                }
                $.extend(true, out[prop], val);
              } else if (breakRefs && prop !== "data" && prop !== "aaData" && Array.isArray(val)) {
                out[prop] = val.slice();
              } else {
                out[prop] = val;
              }
            }
          }
          return out;
        }
        function _fnBindAction(n, oData, fn) {
          $(n).on("click.DT", oData, function(e) {
            $(n).trigger("blur");
            fn(e);
          }).on("keypress.DT", oData, function(e) {
            if (e.which === 13) {
              e.preventDefault();
              fn(e);
            }
          }).on("selectstart.DT", function() {
            return false;
          });
        }
        function _fnCallbackReg(oSettings, sStore, fn, sName) {
          if (fn) {
            oSettings[sStore].push({
              "fn": fn,
              "sName": sName
            });
          }
        }
        function _fnCallbackFire(settings, callbackArr, eventName, args) {
          var ret = [];
          if (callbackArr) {
            ret = $.map(settings[callbackArr].slice().reverse(), function(val, i) {
              return val.fn.apply(settings.oInstance, args);
            });
          }
          if (eventName !== null) {
            var e = $.Event(eventName + ".dt");
            $(settings.nTable).trigger(e, args);
            ret.push(e.result);
          }
          return ret;
        }
        function _fnLengthOverflow(settings) {
          var start2 = settings._iDisplayStart, end = settings.fnDisplayEnd(), len = settings._iDisplayLength;
          if (start2 >= end) {
            start2 = end - len;
          }
          start2 -= start2 % len;
          if (len === -1 || start2 < 0) {
            start2 = 0;
          }
          settings._iDisplayStart = start2;
        }
        function _fnRenderer(settings, type) {
          var renderer = settings.renderer;
          var host = DataTable2.ext.renderer[type];
          if ($.isPlainObject(renderer) && renderer[type]) {
            return host[renderer[type]] || host._;
          } else if (typeof renderer === "string") {
            return host[renderer] || host._;
          }
          return host._;
        }
        function _fnDataSource(settings) {
          if (settings.oFeatures.bServerSide) {
            return "ssp";
          } else if (settings.ajax || settings.sAjaxSource) {
            return "ajax";
          }
          return "dom";
        }
        var __apiStruct = [];
        var __arrayProto = Array.prototype;
        var _toSettings = function(mixed) {
          var idx, jq;
          var settings = DataTable2.settings;
          var tables = $.map(settings, function(el, i) {
            return el.nTable;
          });
          if (!mixed) {
            return [];
          } else if (mixed.nTable && mixed.oApi) {
            return [mixed];
          } else if (mixed.nodeName && mixed.nodeName.toLowerCase() === "table") {
            idx = $.inArray(mixed, tables);
            return idx !== -1 ? [settings[idx]] : null;
          } else if (mixed && typeof mixed.settings === "function") {
            return mixed.settings().toArray();
          } else if (typeof mixed === "string") {
            jq = $(mixed);
          } else if (mixed instanceof $) {
            jq = mixed;
          }
          if (jq) {
            return jq.map(function(i) {
              idx = $.inArray(this, tables);
              return idx !== -1 ? settings[idx] : null;
            }).toArray();
          }
        };
        _Api = function(context, data) {
          if (!(this instanceof _Api)) {
            return new _Api(context, data);
          }
          var settings = [];
          var ctxSettings = function(o) {
            var a = _toSettings(o);
            if (a) {
              settings.push.apply(settings, a);
            }
          };
          if (Array.isArray(context)) {
            for (var i = 0, ien = context.length; i < ien; i++) {
              ctxSettings(context[i]);
            }
          } else {
            ctxSettings(context);
          }
          this.context = _unique(settings);
          if (data) {
            $.merge(this, data);
          }
          this.selector = {
            rows: null,
            cols: null,
            opts: null
          };
          _Api.extend(this, this, __apiStruct);
        };
        DataTable2.Api = _Api;
        $.extend(_Api.prototype, {
          any: function() {
            return this.count() !== 0;
          },
          concat: __arrayProto.concat,
          context: [],
          count: function() {
            return this.flatten().length;
          },
          each: function(fn) {
            for (var i = 0, ien = this.length; i < ien; i++) {
              fn.call(this, this[i], i, this);
            }
            return this;
          },
          eq: function(idx) {
            var ctx = this.context;
            return ctx.length > idx ? new _Api(ctx[idx], this[idx]) : null;
          },
          filter: function(fn) {
            var a = [];
            if (__arrayProto.filter) {
              a = __arrayProto.filter.call(this, fn, this);
            } else {
              for (var i = 0, ien = this.length; i < ien; i++) {
                if (fn.call(this, this[i], i, this)) {
                  a.push(this[i]);
                }
              }
            }
            return new _Api(this.context, a);
          },
          flatten: function() {
            var a = [];
            return new _Api(this.context, a.concat.apply(a, this.toArray()));
          },
          join: __arrayProto.join,
          indexOf: __arrayProto.indexOf || function(obj, start2) {
            for (var i = start2 || 0, ien = this.length; i < ien; i++) {
              if (this[i] === obj) {
                return i;
              }
            }
            return -1;
          },
          iterator: function(flatten, type, fn, alwaysNew) {
            var a = [], ret, i, ien, j, jen, context = this.context, rows, items, item, selector = this.selector;
            if (typeof flatten === "string") {
              alwaysNew = fn;
              fn = type;
              type = flatten;
              flatten = false;
            }
            for (i = 0, ien = context.length; i < ien; i++) {
              var apiInst = new _Api(context[i]);
              if (type === "table") {
                ret = fn.call(apiInst, context[i], i);
                if (ret !== undefined2) {
                  a.push(ret);
                }
              } else if (type === "columns" || type === "rows") {
                ret = fn.call(apiInst, context[i], this[i], i);
                if (ret !== undefined2) {
                  a.push(ret);
                }
              } else if (type === "column" || type === "column-rows" || type === "row" || type === "cell") {
                items = this[i];
                if (type === "column-rows") {
                  rows = _selector_row_indexes(context[i], selector.opts);
                }
                for (j = 0, jen = items.length; j < jen; j++) {
                  item = items[j];
                  if (type === "cell") {
                    ret = fn.call(apiInst, context[i], item.row, item.column, i, j);
                  } else {
                    ret = fn.call(apiInst, context[i], item, i, j, rows);
                  }
                  if (ret !== undefined2) {
                    a.push(ret);
                  }
                }
              }
            }
            if (a.length || alwaysNew) {
              var api = new _Api(context, flatten ? a.concat.apply([], a) : a);
              var apiSelector = api.selector;
              apiSelector.rows = selector.rows;
              apiSelector.cols = selector.cols;
              apiSelector.opts = selector.opts;
              return api;
            }
            return this;
          },
          lastIndexOf: __arrayProto.lastIndexOf || function(obj, start2) {
            return this.indexOf.apply(this.toArray.reverse(), arguments);
          },
          length: 0,
          map: function(fn) {
            var a = [];
            if (__arrayProto.map) {
              a = __arrayProto.map.call(this, fn, this);
            } else {
              for (var i = 0, ien = this.length; i < ien; i++) {
                a.push(fn.call(this, this[i], i));
              }
            }
            return new _Api(this.context, a);
          },
          pluck: function(prop) {
            return this.map(function(el) {
              return el[prop];
            });
          },
          pop: __arrayProto.pop,
          push: __arrayProto.push,
          reduce: __arrayProto.reduce || function(fn, init) {
            return _fnReduce(this, fn, init, 0, this.length, 1);
          },
          reduceRight: __arrayProto.reduceRight || function(fn, init) {
            return _fnReduce(this, fn, init, this.length - 1, -1, -1);
          },
          reverse: __arrayProto.reverse,
          selector: null,
          shift: __arrayProto.shift,
          slice: function() {
            return new _Api(this.context, this);
          },
          sort: __arrayProto.sort,
          splice: __arrayProto.splice,
          toArray: function() {
            return __arrayProto.slice.call(this);
          },
          to$: function() {
            return $(this);
          },
          toJQuery: function() {
            return $(this);
          },
          unique: function() {
            return new _Api(this.context, _unique(this));
          },
          unshift: __arrayProto.unshift
        });
        _Api.extend = function(scope, obj, ext) {
          if (!ext.length || !obj || !(obj instanceof _Api) && !obj.__dt_wrapper) {
            return;
          }
          var i, ien, struct, methodScoping = function(scope2, fn, struc) {
            return function() {
              var ret = fn.apply(scope2, arguments);
              _Api.extend(ret, ret, struc.methodExt);
              return ret;
            };
          };
          for (i = 0, ien = ext.length; i < ien; i++) {
            struct = ext[i];
            obj[struct.name] = struct.type === "function" ? methodScoping(scope, struct.val, struct) : struct.type === "object" ? {} : struct.val;
            obj[struct.name].__dt_wrapper = true;
            _Api.extend(scope, obj[struct.name], struct.propExt);
          }
        };
        _Api.register = _api_register = function(name, val) {
          if (Array.isArray(name)) {
            for (var j = 0, jen = name.length; j < jen; j++) {
              _Api.register(name[j], val);
            }
            return;
          }
          var i, ien, heir = name.split("."), struct = __apiStruct, key, method;
          var find = function(src2, name2) {
            for (var i2 = 0, ien2 = src2.length; i2 < ien2; i2++) {
              if (src2[i2].name === name2) {
                return src2[i2];
              }
            }
            return null;
          };
          for (i = 0, ien = heir.length; i < ien; i++) {
            method = heir[i].indexOf("()") !== -1;
            key = method ? heir[i].replace("()", "") : heir[i];
            var src = find(struct, key);
            if (!src) {
              src = {
                name: key,
                val: {},
                methodExt: [],
                propExt: [],
                type: "object"
              };
              struct.push(src);
            }
            if (i === ien - 1) {
              src.val = val;
              src.type = typeof val === "function" ? "function" : $.isPlainObject(val) ? "object" : "other";
            } else {
              struct = method ? src.methodExt : src.propExt;
            }
          }
        };
        _Api.registerPlural = _api_registerPlural = function(pluralName, singularName, val) {
          _Api.register(pluralName, val);
          _Api.register(singularName, function() {
            var ret = val.apply(this, arguments);
            if (ret === this) {
              return this;
            } else if (ret instanceof _Api) {
              return ret.length ? Array.isArray(ret[0]) ? new _Api(ret.context, ret[0]) : ret[0] : undefined2;
            }
            return ret;
          });
        };
        var __table_selector = function(selector, a) {
          if (Array.isArray(selector)) {
            return $.map(selector, function(item) {
              return __table_selector(item, a);
            });
          }
          if (typeof selector === "number") {
            return [a[selector]];
          }
          var nodes = $.map(a, function(el, i) {
            return el.nTable;
          });
          return $(nodes).filter(selector).map(function(i) {
            var idx = $.inArray(this, nodes);
            return a[idx];
          }).toArray();
        };
        _api_register("tables()", function(selector) {
          return selector !== undefined2 && selector !== null ? new _Api(__table_selector(selector, this.context)) : this;
        });
        _api_register("table()", function(selector) {
          var tables = this.tables(selector);
          var ctx = tables.context;
          return ctx.length ? new _Api(ctx[0]) : tables;
        });
        _api_registerPlural("tables().nodes()", "table().node()", function() {
          return this.iterator("table", function(ctx) {
            return ctx.nTable;
          }, 1);
        });
        _api_registerPlural("tables().body()", "table().body()", function() {
          return this.iterator("table", function(ctx) {
            return ctx.nTBody;
          }, 1);
        });
        _api_registerPlural("tables().header()", "table().header()", function() {
          return this.iterator("table", function(ctx) {
            return ctx.nTHead;
          }, 1);
        });
        _api_registerPlural("tables().footer()", "table().footer()", function() {
          return this.iterator("table", function(ctx) {
            return ctx.nTFoot;
          }, 1);
        });
        _api_registerPlural("tables().containers()", "table().container()", function() {
          return this.iterator("table", function(ctx) {
            return ctx.nTableWrapper;
          }, 1);
        });
        _api_register("draw()", function(paging) {
          return this.iterator("table", function(settings) {
            if (paging === "page") {
              _fnDraw(settings);
            } else {
              if (typeof paging === "string") {
                paging = paging === "full-hold" ? false : true;
              }
              _fnReDraw(settings, paging === false);
            }
          });
        });
        _api_register("page()", function(action) {
          if (action === undefined2) {
            return this.page.info().page;
          }
          return this.iterator("table", function(settings) {
            _fnPageChange(settings, action);
          });
        });
        _api_register("page.info()", function(action) {
          if (this.context.length === 0) {
            return undefined2;
          }
          var settings = this.context[0], start2 = settings._iDisplayStart, len = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1, visRecords = settings.fnRecordsDisplay(), all = len === -1;
          return {
            "page": all ? 0 : Math.floor(start2 / len),
            "pages": all ? 1 : Math.ceil(visRecords / len),
            "start": start2,
            "end": settings.fnDisplayEnd(),
            "length": len,
            "recordsTotal": settings.fnRecordsTotal(),
            "recordsDisplay": visRecords,
            "serverSide": _fnDataSource(settings) === "ssp"
          };
        });
        _api_register("page.len()", function(len) {
          if (len === undefined2) {
            return this.context.length !== 0 ? this.context[0]._iDisplayLength : undefined2;
          }
          return this.iterator("table", function(settings) {
            _fnLengthChange(settings, len);
          });
        });
        var __reload = function(settings, holdPosition, callback) {
          if (callback) {
            var api = new _Api(settings);
            api.one("draw", function() {
              callback(api.ajax.json());
            });
          }
          if (_fnDataSource(settings) == "ssp") {
            _fnReDraw(settings, holdPosition);
          } else {
            _fnProcessingDisplay(settings, true);
            var xhr = settings.jqXHR;
            if (xhr && xhr.readyState !== 4) {
              xhr.abort();
            }
            _fnBuildAjax(settings, [], function(json) {
              _fnClearTable(settings);
              var data = _fnAjaxDataSrc(settings, json);
              for (var i = 0, ien = data.length; i < ien; i++) {
                _fnAddData(settings, data[i]);
              }
              _fnReDraw(settings, holdPosition);
              _fnProcessingDisplay(settings, false);
            });
          }
        };
        _api_register("ajax.json()", function() {
          var ctx = this.context;
          if (ctx.length > 0) {
            return ctx[0].json;
          }
        });
        _api_register("ajax.params()", function() {
          var ctx = this.context;
          if (ctx.length > 0) {
            return ctx[0].oAjaxData;
          }
        });
        _api_register("ajax.reload()", function(callback, resetPaging) {
          return this.iterator("table", function(settings) {
            __reload(settings, resetPaging === false, callback);
          });
        });
        _api_register("ajax.url()", function(url) {
          var ctx = this.context;
          if (url === undefined2) {
            if (ctx.length === 0) {
              return undefined2;
            }
            ctx = ctx[0];
            return ctx.ajax ? $.isPlainObject(ctx.ajax) ? ctx.ajax.url : ctx.ajax : ctx.sAjaxSource;
          }
          return this.iterator("table", function(settings) {
            if ($.isPlainObject(settings.ajax)) {
              settings.ajax.url = url;
            } else {
              settings.ajax = url;
            }
          });
        });
        _api_register("ajax.url().load()", function(callback, resetPaging) {
          return this.iterator("table", function(ctx) {
            __reload(ctx, resetPaging === false, callback);
          });
        });
        var _selector_run = function(type, selector, selectFn, settings, opts) {
          var out = [], res, a, i, ien, j, jen, selectorType = typeof selector;
          if (!selector || selectorType === "string" || selectorType === "function" || selector.length === undefined2) {
            selector = [selector];
          }
          for (i = 0, ien = selector.length; i < ien; i++) {
            a = selector[i] && selector[i].split && !selector[i].match(/[\[\(:]/) ? selector[i].split(",") : [selector[i]];
            for (j = 0, jen = a.length; j < jen; j++) {
              res = selectFn(typeof a[j] === "string" ? a[j].trim() : a[j]);
              if (res && res.length) {
                out = out.concat(res);
              }
            }
          }
          var ext = _ext.selector[type];
          if (ext.length) {
            for (i = 0, ien = ext.length; i < ien; i++) {
              out = ext[i](settings, opts, out);
            }
          }
          return _unique(out);
        };
        var _selector_opts = function(opts) {
          if (!opts) {
            opts = {};
          }
          if (opts.filter && opts.search === undefined2) {
            opts.search = opts.filter;
          }
          return $.extend({
            search: "none",
            order: "current",
            page: "all"
          }, opts);
        };
        var _selector_first = function(inst) {
          for (var i = 0, ien = inst.length; i < ien; i++) {
            if (inst[i].length > 0) {
              inst[0] = inst[i];
              inst[0].length = 1;
              inst.length = 1;
              inst.context = [inst.context[i]];
              return inst;
            }
          }
          inst.length = 0;
          return inst;
        };
        var _selector_row_indexes = function(settings, opts) {
          var i, ien, tmp, a = [], displayFiltered = settings.aiDisplay, displayMaster = settings.aiDisplayMaster;
          var search = opts.search, order = opts.order, page = opts.page;
          if (_fnDataSource(settings) == "ssp") {
            return search === "removed" ? [] : _range(0, displayMaster.length);
          } else if (page == "current") {
            for (i = settings._iDisplayStart, ien = settings.fnDisplayEnd(); i < ien; i++) {
              a.push(displayFiltered[i]);
            }
          } else if (order == "current" || order == "applied") {
            if (search == "none") {
              a = displayMaster.slice();
            } else if (search == "applied") {
              a = displayFiltered.slice();
            } else if (search == "removed") {
              var displayFilteredMap = {};
              for (var i = 0, ien = displayFiltered.length; i < ien; i++) {
                displayFilteredMap[displayFiltered[i]] = null;
              }
              a = $.map(displayMaster, function(el) {
                return !displayFilteredMap.hasOwnProperty(el) ? el : null;
              });
            }
          } else if (order == "index" || order == "original") {
            for (i = 0, ien = settings.aoData.length; i < ien; i++) {
              if (search == "none") {
                a.push(i);
              } else {
                tmp = $.inArray(i, displayFiltered);
                if (tmp === -1 && search == "removed" || tmp >= 0 && search == "applied") {
                  a.push(i);
                }
              }
            }
          }
          return a;
        };
        var __row_selector = function(settings, selector, opts) {
          var rows;
          var run = function(sel) {
            var selInt = _intVal(sel);
            var i, ien;
            var aoData = settings.aoData;
            if (selInt !== null && !opts) {
              return [selInt];
            }
            if (!rows) {
              rows = _selector_row_indexes(settings, opts);
            }
            if (selInt !== null && $.inArray(selInt, rows) !== -1) {
              return [selInt];
            } else if (sel === null || sel === undefined2 || sel === "") {
              return rows;
            }
            if (typeof sel === "function") {
              return $.map(rows, function(idx) {
                var row = aoData[idx];
                return sel(idx, row._aData, row.nTr) ? idx : null;
              });
            }
            if (sel.nodeName) {
              var rowIdx = sel._DT_RowIndex;
              var cellIdx = sel._DT_CellIndex;
              if (rowIdx !== undefined2) {
                return aoData[rowIdx] && aoData[rowIdx].nTr === sel ? [rowIdx] : [];
              } else if (cellIdx) {
                return aoData[cellIdx.row] && aoData[cellIdx.row].nTr === sel.parentNode ? [cellIdx.row] : [];
              } else {
                var host = $(sel).closest("*[data-dt-row]");
                return host.length ? [host.data("dt-row")] : [];
              }
            }
            if (typeof sel === "string" && sel.charAt(0) === "#") {
              var rowObj = settings.aIds[sel.replace(/^#/, "")];
              if (rowObj !== undefined2) {
                return [rowObj.idx];
              }
            }
            var nodes = _removeEmpty(_pluck_order(settings.aoData, rows, "nTr"));
            return $(nodes).filter(sel).map(function() {
              return this._DT_RowIndex;
            }).toArray();
          };
          return _selector_run("row", selector, run, settings, opts);
        };
        _api_register("rows()", function(selector, opts) {
          if (selector === undefined2) {
            selector = "";
          } else if ($.isPlainObject(selector)) {
            opts = selector;
            selector = "";
          }
          opts = _selector_opts(opts);
          var inst = this.iterator("table", function(settings) {
            return __row_selector(settings, selector, opts);
          }, 1);
          inst.selector.rows = selector;
          inst.selector.opts = opts;
          return inst;
        });
        _api_register("rows().nodes()", function() {
          return this.iterator("row", function(settings, row) {
            return settings.aoData[row].nTr || undefined2;
          }, 1);
        });
        _api_register("rows().data()", function() {
          return this.iterator(true, "rows", function(settings, rows) {
            return _pluck_order(settings.aoData, rows, "_aData");
          }, 1);
        });
        _api_registerPlural("rows().cache()", "row().cache()", function(type) {
          return this.iterator("row", function(settings, row) {
            var r = settings.aoData[row];
            return type === "search" ? r._aFilterData : r._aSortData;
          }, 1);
        });
        _api_registerPlural("rows().invalidate()", "row().invalidate()", function(src) {
          return this.iterator("row", function(settings, row) {
            _fnInvalidate(settings, row, src);
          });
        });
        _api_registerPlural("rows().indexes()", "row().index()", function() {
          return this.iterator("row", function(settings, row) {
            return row;
          }, 1);
        });
        _api_registerPlural("rows().ids()", "row().id()", function(hash) {
          var a = [];
          var context = this.context;
          for (var i = 0, ien = context.length; i < ien; i++) {
            for (var j = 0, jen = this[i].length; j < jen; j++) {
              var id = context[i].rowIdFn(context[i].aoData[this[i][j]]._aData);
              a.push((hash === true ? "#" : "") + id);
            }
          }
          return new _Api(context, a);
        });
        _api_registerPlural("rows().remove()", "row().remove()", function() {
          var that = this;
          this.iterator("row", function(settings, row, thatIdx) {
            var data = settings.aoData;
            var rowData = data[row];
            var i, ien, j, jen;
            var loopRow, loopCells;
            data.splice(row, 1);
            for (i = 0, ien = data.length; i < ien; i++) {
              loopRow = data[i];
              loopCells = loopRow.anCells;
              if (loopRow.nTr !== null) {
                loopRow.nTr._DT_RowIndex = i;
              }
              if (loopCells !== null) {
                for (j = 0, jen = loopCells.length; j < jen; j++) {
                  loopCells[j]._DT_CellIndex.row = i;
                }
              }
            }
            _fnDeleteIndex(settings.aiDisplayMaster, row);
            _fnDeleteIndex(settings.aiDisplay, row);
            _fnDeleteIndex(that[thatIdx], row, false);
            if (settings._iRecordsDisplay > 0) {
              settings._iRecordsDisplay--;
            }
            _fnLengthOverflow(settings);
            var id = settings.rowIdFn(rowData._aData);
            if (id !== undefined2) {
              delete settings.aIds[id];
            }
          });
          this.iterator("table", function(settings) {
            for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
              settings.aoData[i].idx = i;
            }
          });
          return this;
        });
        _api_register("rows.add()", function(rows) {
          var newRows = this.iterator("table", function(settings) {
            var row, i, ien;
            var out = [];
            for (i = 0, ien = rows.length; i < ien; i++) {
              row = rows[i];
              if (row.nodeName && row.nodeName.toUpperCase() === "TR") {
                out.push(_fnAddTr(settings, row)[0]);
              } else {
                out.push(_fnAddData(settings, row));
              }
            }
            return out;
          }, 1);
          var modRows = this.rows(-1);
          modRows.pop();
          $.merge(modRows, newRows);
          return modRows;
        });
        _api_register("row()", function(selector, opts) {
          return _selector_first(this.rows(selector, opts));
        });
        _api_register("row().data()", function(data) {
          var ctx = this.context;
          if (data === undefined2) {
            return ctx.length && this.length ? ctx[0].aoData[this[0]]._aData : undefined2;
          }
          var row = ctx[0].aoData[this[0]];
          row._aData = data;
          if (Array.isArray(data) && row.nTr && row.nTr.id) {
            _fnSetObjectDataFn(ctx[0].rowId)(data, row.nTr.id);
          }
          _fnInvalidate(ctx[0], this[0], "data");
          return this;
        });
        _api_register("row().node()", function() {
          var ctx = this.context;
          return ctx.length && this.length ? ctx[0].aoData[this[0]].nTr || null : null;
        });
        _api_register("row.add()", function(row) {
          if (row instanceof $ && row.length) {
            row = row[0];
          }
          var rows = this.iterator("table", function(settings) {
            if (row.nodeName && row.nodeName.toUpperCase() === "TR") {
              return _fnAddTr(settings, row)[0];
            }
            return _fnAddData(settings, row);
          });
          return this.row(rows[0]);
        });
        $(document2).on("plugin-init.dt", function(e, context) {
          var api = new _Api(context);
          api.on("stateSaveParams", function(e2, settings, data) {
            var indexes = api.rows().iterator("row", function(settings2, idx) {
              return settings2.aoData[idx]._detailsShow ? idx : undefined2;
            });
            data.childRows = api.rows(indexes).ids(true).toArray();
          });
          var loaded = api.state.loaded();
          if (loaded && loaded.childRows) {
            api.rows(loaded.childRows).every(function() {
              _fnCallbackFire(context, null, "requestChild", [this]);
            });
          }
        });
        var __details_add = function(ctx, row, data, klass) {
          var rows = [];
          var addRow = function(r, k) {
            if (Array.isArray(r) || r instanceof $) {
              for (var i = 0, ien = r.length; i < ien; i++) {
                addRow(r[i], k);
              }
              return;
            }
            if (r.nodeName && r.nodeName.toLowerCase() === "tr") {
              rows.push(r);
            } else {
              var created = $("<tr><td></td></tr>").addClass(k);
              $("td", created).addClass(k).html(r)[0].colSpan = _fnVisbleColumns(ctx);
              rows.push(created[0]);
            }
          };
          addRow(data, klass);
          if (row._details) {
            row._details.detach();
          }
          row._details = $(rows);
          if (row._detailsShow) {
            row._details.insertAfter(row.nTr);
          }
        };
        var __details_remove = function(api, idx) {
          var ctx = api.context;
          if (ctx.length) {
            var row = ctx[0].aoData[idx !== undefined2 ? idx : api[0]];
            if (row && row._details) {
              row._details.remove();
              row._detailsShow = undefined2;
              row._details = undefined2;
              $(row.nTr).removeClass("dt-hasChild");
              _fnSaveState(ctx[0]);
            }
          }
        };
        var __details_display = function(api, show) {
          var ctx = api.context;
          if (ctx.length && api.length) {
            var row = ctx[0].aoData[api[0]];
            if (row._details) {
              row._detailsShow = show;
              if (show) {
                row._details.insertAfter(row.nTr);
                $(row.nTr).addClass("dt-hasChild");
              } else {
                row._details.detach();
                $(row.nTr).removeClass("dt-hasChild");
              }
              _fnCallbackFire(ctx[0], null, "childRow", [show, api.row(api[0])]);
              __details_events(ctx[0]);
              _fnSaveState(ctx[0]);
            }
          }
        };
        var __details_events = function(settings) {
          var api = new _Api(settings);
          var namespace = ".dt.DT_details";
          var drawEvent = "draw" + namespace;
          var colvisEvent = "column-visibility" + namespace;
          var destroyEvent = "destroy" + namespace;
          var data = settings.aoData;
          api.off(drawEvent + " " + colvisEvent + " " + destroyEvent);
          if (_pluck(data, "_details").length > 0) {
            api.on(drawEvent, function(e, ctx) {
              if (settings !== ctx) {
                return;
              }
              api.rows({ page: "current" }).eq(0).each(function(idx) {
                var row = data[idx];
                if (row._detailsShow) {
                  row._details.insertAfter(row.nTr);
                }
              });
            });
            api.on(colvisEvent, function(e, ctx, idx, vis) {
              if (settings !== ctx) {
                return;
              }
              var row, visible = _fnVisbleColumns(ctx);
              for (var i = 0, ien = data.length; i < ien; i++) {
                row = data[i];
                if (row._details) {
                  row._details.children("td[colspan]").attr("colspan", visible);
                }
              }
            });
            api.on(destroyEvent, function(e, ctx) {
              if (settings !== ctx) {
                return;
              }
              for (var i = 0, ien = data.length; i < ien; i++) {
                if (data[i]._details) {
                  __details_remove(api, i);
                }
              }
            });
          }
        };
        var _emp = "";
        var _child_obj = _emp + "row().child";
        var _child_mth = _child_obj + "()";
        _api_register(_child_mth, function(data, klass) {
          var ctx = this.context;
          if (data === undefined2) {
            return ctx.length && this.length ? ctx[0].aoData[this[0]]._details : undefined2;
          } else if (data === true) {
            this.child.show();
          } else if (data === false) {
            __details_remove(this);
          } else if (ctx.length && this.length) {
            __details_add(ctx[0], ctx[0].aoData[this[0]], data, klass);
          }
          return this;
        });
        _api_register([
          _child_obj + ".show()",
          _child_mth + ".show()"
        ], function(show) {
          __details_display(this, true);
          return this;
        });
        _api_register([
          _child_obj + ".hide()",
          _child_mth + ".hide()"
        ], function() {
          __details_display(this, false);
          return this;
        });
        _api_register([
          _child_obj + ".remove()",
          _child_mth + ".remove()"
        ], function() {
          __details_remove(this);
          return this;
        });
        _api_register(_child_obj + ".isShown()", function() {
          var ctx = this.context;
          if (ctx.length && this.length) {
            return ctx[0].aoData[this[0]]._detailsShow || false;
          }
          return false;
        });
        var __re_column_selector = /^([^:]+):(name|visIdx|visible)$/;
        var __columnData = function(settings, column, r1, r2, rows) {
          var a = [];
          for (var row = 0, ien = rows.length; row < ien; row++) {
            a.push(_fnGetCellData(settings, rows[row], column));
          }
          return a;
        };
        var __column_selector = function(settings, selector, opts) {
          var columns = settings.aoColumns, names = _pluck(columns, "sName"), nodes = _pluck(columns, "nTh");
          var run = function(s) {
            var selInt = _intVal(s);
            if (s === "") {
              return _range(columns.length);
            }
            if (selInt !== null) {
              return [
                selInt >= 0 ? selInt : columns.length + selInt
              ];
            }
            if (typeof s === "function") {
              var rows = _selector_row_indexes(settings, opts);
              return $.map(columns, function(col, idx2) {
                return s(idx2, __columnData(settings, idx2, 0, 0, rows), nodes[idx2]) ? idx2 : null;
              });
            }
            var match = typeof s === "string" ? s.match(__re_column_selector) : "";
            if (match) {
              switch (match[2]) {
                case "visIdx":
                case "visible":
                  var idx = parseInt(match[1], 10);
                  if (idx < 0) {
                    var visColumns = $.map(columns, function(col, i) {
                      return col.bVisible ? i : null;
                    });
                    return [visColumns[visColumns.length + idx]];
                  }
                  return [_fnVisibleToColumnIndex(settings, idx)];
                case "name":
                  return $.map(names, function(name, i) {
                    return name === match[1] ? i : null;
                  });
                default:
                  return [];
              }
            }
            if (s.nodeName && s._DT_CellIndex) {
              return [s._DT_CellIndex.column];
            }
            var jqResult = $(nodes).filter(s).map(function() {
              return $.inArray(this, nodes);
            }).toArray();
            if (jqResult.length || !s.nodeName) {
              return jqResult;
            }
            var host = $(s).closest("*[data-dt-column]");
            return host.length ? [host.data("dt-column")] : [];
          };
          return _selector_run("column", selector, run, settings, opts);
        };
        var __setColumnVis = function(settings, column, vis) {
          var cols = settings.aoColumns, col = cols[column], data = settings.aoData, row, cells, i, ien, tr;
          if (vis === undefined2) {
            return col.bVisible;
          }
          if (col.bVisible === vis) {
            return;
          }
          if (vis) {
            var insertBefore = $.inArray(true, _pluck(cols, "bVisible"), column + 1);
            for (i = 0, ien = data.length; i < ien; i++) {
              tr = data[i].nTr;
              cells = data[i].anCells;
              if (tr) {
                tr.insertBefore(cells[column], cells[insertBefore] || null);
              }
            }
          } else {
            $(_pluck(settings.aoData, "anCells", column)).detach();
          }
          col.bVisible = vis;
        };
        _api_register("columns()", function(selector, opts) {
          if (selector === undefined2) {
            selector = "";
          } else if ($.isPlainObject(selector)) {
            opts = selector;
            selector = "";
          }
          opts = _selector_opts(opts);
          var inst = this.iterator("table", function(settings) {
            return __column_selector(settings, selector, opts);
          }, 1);
          inst.selector.cols = selector;
          inst.selector.opts = opts;
          return inst;
        });
        _api_registerPlural("columns().header()", "column().header()", function(selector, opts) {
          return this.iterator("column", function(settings, column) {
            return settings.aoColumns[column].nTh;
          }, 1);
        });
        _api_registerPlural("columns().footer()", "column().footer()", function(selector, opts) {
          return this.iterator("column", function(settings, column) {
            return settings.aoColumns[column].nTf;
          }, 1);
        });
        _api_registerPlural("columns().data()", "column().data()", function() {
          return this.iterator("column-rows", __columnData, 1);
        });
        _api_registerPlural("columns().dataSrc()", "column().dataSrc()", function() {
          return this.iterator("column", function(settings, column) {
            return settings.aoColumns[column].mData;
          }, 1);
        });
        _api_registerPlural("columns().cache()", "column().cache()", function(type) {
          return this.iterator("column-rows", function(settings, column, i, j, rows) {
            return _pluck_order(settings.aoData, rows, type === "search" ? "_aFilterData" : "_aSortData", column);
          }, 1);
        });
        _api_registerPlural("columns().nodes()", "column().nodes()", function() {
          return this.iterator("column-rows", function(settings, column, i, j, rows) {
            return _pluck_order(settings.aoData, rows, "anCells", column);
          }, 1);
        });
        _api_registerPlural("columns().visible()", "column().visible()", function(vis, calc) {
          var that = this;
          var ret = this.iterator("column", function(settings, column) {
            if (vis === undefined2) {
              return settings.aoColumns[column].bVisible;
            }
            __setColumnVis(settings, column, vis);
          });
          if (vis !== undefined2) {
            this.iterator("table", function(settings) {
              _fnDrawHead(settings, settings.aoHeader);
              _fnDrawHead(settings, settings.aoFooter);
              if (!settings.aiDisplay.length) {
                $(settings.nTBody).find("td[colspan]").attr("colspan", _fnVisbleColumns(settings));
              }
              _fnSaveState(settings);
              that.iterator("column", function(settings2, column) {
                _fnCallbackFire(settings2, null, "column-visibility", [settings2, column, vis, calc]);
              });
              if (calc === undefined2 || calc) {
                that.columns.adjust();
              }
            });
          }
          return ret;
        });
        _api_registerPlural("columns().indexes()", "column().index()", function(type) {
          return this.iterator("column", function(settings, column) {
            return type === "visible" ? _fnColumnIndexToVisible(settings, column) : column;
          }, 1);
        });
        _api_register("columns.adjust()", function() {
          return this.iterator("table", function(settings) {
            _fnAdjustColumnSizing(settings);
          }, 1);
        });
        _api_register("column.index()", function(type, idx) {
          if (this.context.length !== 0) {
            var ctx = this.context[0];
            if (type === "fromVisible" || type === "toData") {
              return _fnVisibleToColumnIndex(ctx, idx);
            } else if (type === "fromData" || type === "toVisible") {
              return _fnColumnIndexToVisible(ctx, idx);
            }
          }
        });
        _api_register("column()", function(selector, opts) {
          return _selector_first(this.columns(selector, opts));
        });
        var __cell_selector = function(settings, selector, opts) {
          var data = settings.aoData;
          var rows = _selector_row_indexes(settings, opts);
          var cells = _removeEmpty(_pluck_order(data, rows, "anCells"));
          var allCells = $(_flatten([], cells));
          var row;
          var columns = settings.aoColumns.length;
          var a, i, ien, j, o, host;
          var run = function(s) {
            var fnSelector = typeof s === "function";
            if (s === null || s === undefined2 || fnSelector) {
              a = [];
              for (i = 0, ien = rows.length; i < ien; i++) {
                row = rows[i];
                for (j = 0; j < columns; j++) {
                  o = {
                    row,
                    column: j
                  };
                  if (fnSelector) {
                    host = data[row];
                    if (s(o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null)) {
                      a.push(o);
                    }
                  } else {
                    a.push(o);
                  }
                }
              }
              return a;
            }
            if ($.isPlainObject(s)) {
              return s.column !== undefined2 && s.row !== undefined2 && $.inArray(s.row, rows) !== -1 ? [s] : [];
            }
            var jqResult = allCells.filter(s).map(function(i2, el) {
              return {
                row: el._DT_CellIndex.row,
                column: el._DT_CellIndex.column
              };
            }).toArray();
            if (jqResult.length || !s.nodeName) {
              return jqResult;
            }
            host = $(s).closest("*[data-dt-row]");
            return host.length ? [{
              row: host.data("dt-row"),
              column: host.data("dt-column")
            }] : [];
          };
          return _selector_run("cell", selector, run, settings, opts);
        };
        _api_register("cells()", function(rowSelector, columnSelector, opts) {
          if ($.isPlainObject(rowSelector)) {
            if (rowSelector.row === undefined2) {
              opts = rowSelector;
              rowSelector = null;
            } else {
              opts = columnSelector;
              columnSelector = null;
            }
          }
          if ($.isPlainObject(columnSelector)) {
            opts = columnSelector;
            columnSelector = null;
          }
          if (columnSelector === null || columnSelector === undefined2) {
            return this.iterator("table", function(settings) {
              return __cell_selector(settings, rowSelector, _selector_opts(opts));
            });
          }
          var internalOpts = opts ? {
            page: opts.page,
            order: opts.order,
            search: opts.search
          } : {};
          var columns = this.columns(columnSelector, internalOpts);
          var rows = this.rows(rowSelector, internalOpts);
          var i, ien, j, jen;
          var cellsNoOpts = this.iterator("table", function(settings, idx) {
            var a = [];
            for (i = 0, ien = rows[idx].length; i < ien; i++) {
              for (j = 0, jen = columns[idx].length; j < jen; j++) {
                a.push({
                  row: rows[idx][i],
                  column: columns[idx][j]
                });
              }
            }
            return a;
          }, 1);
          var cells = opts && opts.selected ? this.cells(cellsNoOpts, opts) : cellsNoOpts;
          $.extend(cells.selector, {
            cols: columnSelector,
            rows: rowSelector,
            opts
          });
          return cells;
        });
        _api_registerPlural("cells().nodes()", "cell().node()", function() {
          return this.iterator("cell", function(settings, row, column) {
            var data = settings.aoData[row];
            return data && data.anCells ? data.anCells[column] : undefined2;
          }, 1);
        });
        _api_register("cells().data()", function() {
          return this.iterator("cell", function(settings, row, column) {
            return _fnGetCellData(settings, row, column);
          }, 1);
        });
        _api_registerPlural("cells().cache()", "cell().cache()", function(type) {
          type = type === "search" ? "_aFilterData" : "_aSortData";
          return this.iterator("cell", function(settings, row, column) {
            return settings.aoData[row][type][column];
          }, 1);
        });
        _api_registerPlural("cells().render()", "cell().render()", function(type) {
          return this.iterator("cell", function(settings, row, column) {
            return _fnGetCellData(settings, row, column, type);
          }, 1);
        });
        _api_registerPlural("cells().indexes()", "cell().index()", function() {
          return this.iterator("cell", function(settings, row, column) {
            return {
              row,
              column,
              columnVisible: _fnColumnIndexToVisible(settings, column)
            };
          }, 1);
        });
        _api_registerPlural("cells().invalidate()", "cell().invalidate()", function(src) {
          return this.iterator("cell", function(settings, row, column) {
            _fnInvalidate(settings, row, src, column);
          });
        });
        _api_register("cell()", function(rowSelector, columnSelector, opts) {
          return _selector_first(this.cells(rowSelector, columnSelector, opts));
        });
        _api_register("cell().data()", function(data) {
          var ctx = this.context;
          var cell = this[0];
          if (data === undefined2) {
            return ctx.length && cell.length ? _fnGetCellData(ctx[0], cell[0].row, cell[0].column) : undefined2;
          }
          _fnSetCellData(ctx[0], cell[0].row, cell[0].column, data);
          _fnInvalidate(ctx[0], cell[0].row, "data", cell[0].column);
          return this;
        });
        _api_register("order()", function(order, dir) {
          var ctx = this.context;
          if (order === undefined2) {
            return ctx.length !== 0 ? ctx[0].aaSorting : undefined2;
          }
          if (typeof order === "number") {
            order = [[order, dir]];
          } else if (order.length && !Array.isArray(order[0])) {
            order = Array.prototype.slice.call(arguments);
          }
          return this.iterator("table", function(settings) {
            settings.aaSorting = order.slice();
          });
        });
        _api_register("order.listener()", function(node, column, callback) {
          return this.iterator("table", function(settings) {
            _fnSortAttachListener(settings, node, column, callback);
          });
        });
        _api_register("order.fixed()", function(set) {
          if (!set) {
            var ctx = this.context;
            var fixed = ctx.length ? ctx[0].aaSortingFixed : undefined2;
            return Array.isArray(fixed) ? { pre: fixed } : fixed;
          }
          return this.iterator("table", function(settings) {
            settings.aaSortingFixed = $.extend(true, {}, set);
          });
        });
        _api_register([
          "columns().order()",
          "column().order()"
        ], function(dir) {
          var that = this;
          return this.iterator("table", function(settings, i) {
            var sort = [];
            $.each(that[i], function(j, col) {
              sort.push([col, dir]);
            });
            settings.aaSorting = sort;
          });
        });
        _api_register("search()", function(input, regex, smart, caseInsen) {
          var ctx = this.context;
          if (input === undefined2) {
            return ctx.length !== 0 ? ctx[0].oPreviousSearch.sSearch : undefined2;
          }
          return this.iterator("table", function(settings) {
            if (!settings.oFeatures.bFilter) {
              return;
            }
            _fnFilterComplete(settings, $.extend({}, settings.oPreviousSearch, {
              "sSearch": input + "",
              "bRegex": regex === null ? false : regex,
              "bSmart": smart === null ? true : smart,
              "bCaseInsensitive": caseInsen === null ? true : caseInsen
            }), 1);
          });
        });
        _api_registerPlural("columns().search()", "column().search()", function(input, regex, smart, caseInsen) {
          return this.iterator("column", function(settings, column) {
            var preSearch = settings.aoPreSearchCols;
            if (input === undefined2) {
              return preSearch[column].sSearch;
            }
            if (!settings.oFeatures.bFilter) {
              return;
            }
            $.extend(preSearch[column], {
              "sSearch": input + "",
              "bRegex": regex === null ? false : regex,
              "bSmart": smart === null ? true : smart,
              "bCaseInsensitive": caseInsen === null ? true : caseInsen
            });
            _fnFilterComplete(settings, settings.oPreviousSearch, 1);
          });
        });
        _api_register("state()", function() {
          return this.context.length ? this.context[0].oSavedState : null;
        });
        _api_register("state.clear()", function() {
          return this.iterator("table", function(settings) {
            settings.fnStateSaveCallback.call(settings.oInstance, settings, {});
          });
        });
        _api_register("state.loaded()", function() {
          return this.context.length ? this.context[0].oLoadedState : null;
        });
        _api_register("state.save()", function() {
          return this.iterator("table", function(settings) {
            _fnSaveState(settings);
          });
        });
        DataTable2.versionCheck = DataTable2.fnVersionCheck = function(version) {
          var aThis = DataTable2.version.split(".");
          var aThat = version.split(".");
          var iThis, iThat;
          for (var i = 0, iLen = aThat.length; i < iLen; i++) {
            iThis = parseInt(aThis[i], 10) || 0;
            iThat = parseInt(aThat[i], 10) || 0;
            if (iThis === iThat) {
              continue;
            }
            return iThis > iThat;
          }
          return true;
        };
        DataTable2.isDataTable = DataTable2.fnIsDataTable = function(table) {
          var t = $(table).get(0);
          var is = false;
          if (table instanceof DataTable2.Api) {
            return true;
          }
          $.each(DataTable2.settings, function(i, o) {
            var head = o.nScrollHead ? $("table", o.nScrollHead)[0] : null;
            var foot = o.nScrollFoot ? $("table", o.nScrollFoot)[0] : null;
            if (o.nTable === t || head === t || foot === t) {
              is = true;
            }
          });
          return is;
        };
        DataTable2.tables = DataTable2.fnTables = function(visible) {
          var api = false;
          if ($.isPlainObject(visible)) {
            api = visible.api;
            visible = visible.visible;
          }
          var a = $.map(DataTable2.settings, function(o) {
            if (!visible || visible && $(o.nTable).is(":visible")) {
              return o.nTable;
            }
          });
          return api ? new _Api(a) : a;
        };
        DataTable2.camelToHungarian = _fnCamelToHungarian;
        _api_register("$()", function(selector, opts) {
          var rows = this.rows(opts).nodes(), jqRows = $(rows);
          return $([].concat(jqRows.filter(selector).toArray(), jqRows.find(selector).toArray()));
        });
        $.each(["on", "one", "off"], function(i, key) {
          _api_register(key + "()", function() {
            var args = Array.prototype.slice.call(arguments);
            args[0] = $.map(args[0].split(/\s/), function(e) {
              return !e.match(/\.dt\b/) ? e + ".dt" : e;
            }).join(" ");
            var inst = $(this.tables().nodes());
            inst[key].apply(inst, args);
            return this;
          });
        });
        _api_register("clear()", function() {
          return this.iterator("table", function(settings) {
            _fnClearTable(settings);
          });
        });
        _api_register("settings()", function() {
          return new _Api(this.context, this.context);
        });
        _api_register("init()", function() {
          var ctx = this.context;
          return ctx.length ? ctx[0].oInit : null;
        });
        _api_register("data()", function() {
          return this.iterator("table", function(settings) {
            return _pluck(settings.aoData, "_aData");
          }).flatten();
        });
        _api_register("destroy()", function(remove) {
          remove = remove || false;
          return this.iterator("table", function(settings) {
            var orig = settings.nTableWrapper.parentNode;
            var classes = settings.oClasses;
            var table = settings.nTable;
            var tbody = settings.nTBody;
            var thead = settings.nTHead;
            var tfoot = settings.nTFoot;
            var jqTable = $(table);
            var jqTbody = $(tbody);
            var jqWrapper = $(settings.nTableWrapper);
            var rows = $.map(settings.aoData, function(r) {
              return r.nTr;
            });
            var i, ien;
            settings.bDestroying = true;
            _fnCallbackFire(settings, "aoDestroyCallback", "destroy", [settings]);
            if (!remove) {
              new _Api(settings).columns().visible(true);
            }
            jqWrapper.off(".DT").find(":not(tbody *)").off(".DT");
            $(window2).off(".DT-" + settings.sInstance);
            if (table != thead.parentNode) {
              jqTable.children("thead").detach();
              jqTable.append(thead);
            }
            if (tfoot && table != tfoot.parentNode) {
              jqTable.children("tfoot").detach();
              jqTable.append(tfoot);
            }
            settings.aaSorting = [];
            settings.aaSortingFixed = [];
            _fnSortingClasses(settings);
            $(rows).removeClass(settings.asStripeClasses.join(" "));
            $("th, td", thead).removeClass(classes.sSortable + " " + classes.sSortableAsc + " " + classes.sSortableDesc + " " + classes.sSortableNone);
            jqTbody.children().detach();
            jqTbody.append(rows);
            var removedMethod = remove ? "remove" : "detach";
            jqTable[removedMethod]();
            jqWrapper[removedMethod]();
            if (!remove && orig) {
              orig.insertBefore(table, settings.nTableReinsertBefore);
              jqTable.css("width", settings.sDestroyWidth).removeClass(classes.sTable);
              ien = settings.asDestroyStripes.length;
              if (ien) {
                jqTbody.children().each(function(i2) {
                  $(this).addClass(settings.asDestroyStripes[i2 % ien]);
                });
              }
            }
            var idx = $.inArray(settings, DataTable2.settings);
            if (idx !== -1) {
              DataTable2.settings.splice(idx, 1);
            }
          });
        });
        $.each(["column", "row", "cell"], function(i, type) {
          _api_register(type + "s().every()", function(fn) {
            var opts = this.selector.opts;
            var api = this;
            return this.iterator(type, function(settings, arg1, arg2, arg3, arg4) {
              fn.call(api[type](arg1, type === "cell" ? arg2 : opts, type === "cell" ? opts : undefined2), arg1, arg2, arg3, arg4);
            });
          });
        });
        _api_register("i18n()", function(token, def, plural) {
          var ctx = this.context[0];
          var resolved = _fnGetObjectDataFn(token)(ctx.oLanguage);
          if (resolved === undefined2) {
            resolved = def;
          }
          if (plural !== undefined2 && $.isPlainObject(resolved)) {
            resolved = resolved[plural] !== undefined2 ? resolved[plural] : resolved._;
          }
          return resolved.replace("%d", plural);
        });
        DataTable2.version = "1.11.3";
        DataTable2.settings = [];
        DataTable2.models = {};
        DataTable2.models.oSearch = {
          "bCaseInsensitive": true,
          "sSearch": "",
          "bRegex": false,
          "bSmart": true,
          "return": false
        };
        DataTable2.models.oRow = {
          "nTr": null,
          "anCells": null,
          "_aData": [],
          "_aSortData": null,
          "_aFilterData": null,
          "_sFilterRow": null,
          "_sRowStripe": "",
          "src": null,
          "idx": -1
        };
        DataTable2.models.oColumn = {
          "idx": null,
          "aDataSort": null,
          "asSorting": null,
          "bSearchable": null,
          "bSortable": null,
          "bVisible": null,
          "_sManualType": null,
          "_bAttrSrc": false,
          "fnCreatedCell": null,
          "fnGetData": null,
          "fnSetData": null,
          "mData": null,
          "mRender": null,
          "nTh": null,
          "nTf": null,
          "sClass": null,
          "sContentPadding": null,
          "sDefaultContent": null,
          "sName": null,
          "sSortDataType": "std",
          "sSortingClass": null,
          "sSortingClassJUI": null,
          "sTitle": null,
          "sType": null,
          "sWidth": null,
          "sWidthOrig": null
        };
        DataTable2.defaults = {
          "aaData": null,
          "aaSorting": [[0, "asc"]],
          "aaSortingFixed": [],
          "ajax": null,
          "aLengthMenu": [10, 25, 50, 100],
          "aoColumns": null,
          "aoColumnDefs": null,
          "aoSearchCols": [],
          "asStripeClasses": null,
          "bAutoWidth": true,
          "bDeferRender": false,
          "bDestroy": false,
          "bFilter": true,
          "bInfo": true,
          "bLengthChange": true,
          "bPaginate": true,
          "bProcessing": false,
          "bRetrieve": false,
          "bScrollCollapse": false,
          "bServerSide": false,
          "bSort": true,
          "bSortMulti": true,
          "bSortCellsTop": false,
          "bSortClasses": true,
          "bStateSave": false,
          "fnCreatedRow": null,
          "fnDrawCallback": null,
          "fnFooterCallback": null,
          "fnFormatNumber": function(toFormat) {
            return toFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.oLanguage.sThousands);
          },
          "fnHeaderCallback": null,
          "fnInfoCallback": null,
          "fnInitComplete": null,
          "fnPreDrawCallback": null,
          "fnRowCallback": null,
          "fnServerData": null,
          "fnServerParams": null,
          "fnStateLoadCallback": function(settings) {
            try {
              return JSON.parse((settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem("DataTables_" + settings.sInstance + "_" + location.pathname));
            } catch (e) {
              return {};
            }
          },
          "fnStateLoadParams": null,
          "fnStateLoaded": null,
          "fnStateSaveCallback": function(settings, data) {
            try {
              (settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem("DataTables_" + settings.sInstance + "_" + location.pathname, JSON.stringify(data));
            } catch (e) {
            }
          },
          "fnStateSaveParams": null,
          "iStateDuration": 7200,
          "iDeferLoading": null,
          "iDisplayLength": 10,
          "iDisplayStart": 0,
          "iTabIndex": 0,
          "oClasses": {},
          "oLanguage": {
            "oAria": {
              "sSortAscending": ": activate to sort column ascending",
              "sSortDescending": ": activate to sort column descending"
            },
            "oPaginate": {
              "sFirst": "First",
              "sLast": "Last",
              "sNext": "Next",
              "sPrevious": "Previous"
            },
            "sEmptyTable": "No data available in table",
            "sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
            "sInfoEmpty": "Showing 0 to 0 of 0 entries",
            "sInfoFiltered": "(filtered from _MAX_ total entries)",
            "sInfoPostFix": "",
            "sDecimal": "",
            "sThousands": ",",
            "sLengthMenu": "Show _MENU_ entries",
            "sLoadingRecords": "Loading...",
            "sProcessing": "Processing...",
            "sSearch": "Search:",
            "sSearchPlaceholder": "",
            "sUrl": "",
            "sZeroRecords": "No matching records found"
          },
          "oSearch": $.extend({}, DataTable2.models.oSearch),
          "sAjaxDataProp": "data",
          "sAjaxSource": null,
          "sDom": "lfrtip",
          "searchDelay": null,
          "sPaginationType": "simple_numbers",
          "sScrollX": "",
          "sScrollXInner": "",
          "sScrollY": "",
          "sServerMethod": "GET",
          "renderer": null,
          "rowId": "DT_RowId"
        };
        _fnHungarianMap(DataTable2.defaults);
        DataTable2.defaults.column = {
          "aDataSort": null,
          "iDataSort": -1,
          "asSorting": ["asc", "desc"],
          "bSearchable": true,
          "bSortable": true,
          "bVisible": true,
          "fnCreatedCell": null,
          "mData": null,
          "mRender": null,
          "sCellType": "td",
          "sClass": "",
          "sContentPadding": "",
          "sDefaultContent": null,
          "sName": "",
          "sSortDataType": "std",
          "sTitle": null,
          "sType": null,
          "sWidth": null
        };
        _fnHungarianMap(DataTable2.defaults.column);
        DataTable2.models.oSettings = {
          "oFeatures": {
            "bAutoWidth": null,
            "bDeferRender": null,
            "bFilter": null,
            "bInfo": null,
            "bLengthChange": null,
            "bPaginate": null,
            "bProcessing": null,
            "bServerSide": null,
            "bSort": null,
            "bSortMulti": null,
            "bSortClasses": null,
            "bStateSave": null
          },
          "oScroll": {
            "bCollapse": null,
            "iBarWidth": 0,
            "sX": null,
            "sXInner": null,
            "sY": null
          },
          "oLanguage": {
            "fnInfoCallback": null
          },
          "oBrowser": {
            "bScrollOversize": false,
            "bScrollbarLeft": false,
            "bBounding": false,
            "barWidth": 0
          },
          "ajax": null,
          "aanFeatures": [],
          "aoData": [],
          "aiDisplay": [],
          "aiDisplayMaster": [],
          "aIds": {},
          "aoColumns": [],
          "aoHeader": [],
          "aoFooter": [],
          "oPreviousSearch": {},
          "aoPreSearchCols": [],
          "aaSorting": null,
          "aaSortingFixed": [],
          "asStripeClasses": null,
          "asDestroyStripes": [],
          "sDestroyWidth": 0,
          "aoRowCallback": [],
          "aoHeaderCallback": [],
          "aoFooterCallback": [],
          "aoDrawCallback": [],
          "aoRowCreatedCallback": [],
          "aoPreDrawCallback": [],
          "aoInitComplete": [],
          "aoStateSaveParams": [],
          "aoStateLoadParams": [],
          "aoStateLoaded": [],
          "sTableId": "",
          "nTable": null,
          "nTHead": null,
          "nTFoot": null,
          "nTBody": null,
          "nTableWrapper": null,
          "bDeferLoading": false,
          "bInitialised": false,
          "aoOpenRows": [],
          "sDom": null,
          "searchDelay": null,
          "sPaginationType": "two_button",
          "iStateDuration": 0,
          "aoStateSave": [],
          "aoStateLoad": [],
          "oSavedState": null,
          "oLoadedState": null,
          "sAjaxSource": null,
          "sAjaxDataProp": null,
          "jqXHR": null,
          "json": undefined2,
          "oAjaxData": undefined2,
          "fnServerData": null,
          "aoServerParams": [],
          "sServerMethod": null,
          "fnFormatNumber": null,
          "aLengthMenu": null,
          "iDraw": 0,
          "bDrawing": false,
          "iDrawError": -1,
          "_iDisplayLength": 10,
          "_iDisplayStart": 0,
          "_iRecordsTotal": 0,
          "_iRecordsDisplay": 0,
          "oClasses": {},
          "bFiltered": false,
          "bSorted": false,
          "bSortCellsTop": null,
          "oInit": null,
          "aoDestroyCallback": [],
          "fnRecordsTotal": function() {
            return _fnDataSource(this) == "ssp" ? this._iRecordsTotal * 1 : this.aiDisplayMaster.length;
          },
          "fnRecordsDisplay": function() {
            return _fnDataSource(this) == "ssp" ? this._iRecordsDisplay * 1 : this.aiDisplay.length;
          },
          "fnDisplayEnd": function() {
            var len = this._iDisplayLength, start2 = this._iDisplayStart, calc = start2 + len, records = this.aiDisplay.length, features = this.oFeatures, paginate = features.bPaginate;
            if (features.bServerSide) {
              return paginate === false || len === -1 ? start2 + records : Math.min(start2 + len, this._iRecordsDisplay);
            } else {
              return !paginate || calc > records || len === -1 ? records : calc;
            }
          },
          "oInstance": null,
          "sInstance": null,
          "iTabIndex": 0,
          "nScrollHead": null,
          "nScrollFoot": null,
          "aLastSort": [],
          "oPlugins": {},
          "rowIdFn": null,
          "rowId": null
        };
        DataTable2.ext = _ext = {
          buttons: {},
          classes: {},
          builder: "-source-",
          errMode: "alert",
          feature: [],
          search: [],
          selector: {
            cell: [],
            column: [],
            row: []
          },
          internal: {},
          legacy: {
            ajax: null
          },
          pager: {},
          renderer: {
            pageButton: {},
            header: {}
          },
          order: {},
          type: {
            detect: [],
            search: {},
            order: {}
          },
          _unique: 0,
          fnVersionCheck: DataTable2.fnVersionCheck,
          iApiIndex: 0,
          oJUIClasses: {},
          sVersion: DataTable2.version
        };
        $.extend(_ext, {
          afnFiltering: _ext.search,
          aTypes: _ext.type.detect,
          ofnSearch: _ext.type.search,
          oSort: _ext.type.order,
          afnSortData: _ext.order,
          aoFeatures: _ext.feature,
          oApi: _ext.internal,
          oStdClasses: _ext.classes,
          oPagination: _ext.pager
        });
        $.extend(DataTable2.ext.classes, {
          "sTable": "dataTable",
          "sNoFooter": "no-footer",
          "sPageButton": "paginate_button",
          "sPageButtonActive": "current",
          "sPageButtonDisabled": "disabled",
          "sStripeOdd": "odd",
          "sStripeEven": "even",
          "sRowEmpty": "dataTables_empty",
          "sWrapper": "dataTables_wrapper",
          "sFilter": "dataTables_filter",
          "sInfo": "dataTables_info",
          "sPaging": "dataTables_paginate paging_",
          "sLength": "dataTables_length",
          "sProcessing": "dataTables_processing",
          "sSortAsc": "sorting_asc",
          "sSortDesc": "sorting_desc",
          "sSortable": "sorting",
          "sSortableAsc": "sorting_desc_disabled",
          "sSortableDesc": "sorting_asc_disabled",
          "sSortableNone": "sorting_disabled",
          "sSortColumn": "sorting_",
          "sFilterInput": "",
          "sLengthSelect": "",
          "sScrollWrapper": "dataTables_scroll",
          "sScrollHead": "dataTables_scrollHead",
          "sScrollHeadInner": "dataTables_scrollHeadInner",
          "sScrollBody": "dataTables_scrollBody",
          "sScrollFoot": "dataTables_scrollFoot",
          "sScrollFootInner": "dataTables_scrollFootInner",
          "sHeaderTH": "",
          "sFooterTH": "",
          "sSortJUIAsc": "",
          "sSortJUIDesc": "",
          "sSortJUI": "",
          "sSortJUIAscAllowed": "",
          "sSortJUIDescAllowed": "",
          "sSortJUIWrapper": "",
          "sSortIcon": "",
          "sJUIHeader": "",
          "sJUIFooter": ""
        });
        var extPagination = DataTable2.ext.pager;
        function _numbers(page, pages) {
          var numbers = [], buttons = extPagination.numbers_length, half = Math.floor(buttons / 2), i = 1;
          if (pages <= buttons) {
            numbers = _range(0, pages);
          } else if (page <= half) {
            numbers = _range(0, buttons - 2);
            numbers.push("ellipsis");
            numbers.push(pages - 1);
          } else if (page >= pages - 1 - half) {
            numbers = _range(pages - (buttons - 2), pages);
            numbers.splice(0, 0, "ellipsis");
            numbers.splice(0, 0, 0);
          } else {
            numbers = _range(page - half + 2, page + half - 1);
            numbers.push("ellipsis");
            numbers.push(pages - 1);
            numbers.splice(0, 0, "ellipsis");
            numbers.splice(0, 0, 0);
          }
          numbers.DT_el = "span";
          return numbers;
        }
        $.extend(extPagination, {
          simple: function(page, pages) {
            return ["previous", "next"];
          },
          full: function(page, pages) {
            return ["first", "previous", "next", "last"];
          },
          numbers: function(page, pages) {
            return [_numbers(page, pages)];
          },
          simple_numbers: function(page, pages) {
            return ["previous", _numbers(page, pages), "next"];
          },
          full_numbers: function(page, pages) {
            return ["first", "previous", _numbers(page, pages), "next", "last"];
          },
          first_last_numbers: function(page, pages) {
            return ["first", _numbers(page, pages), "last"];
          },
          _numbers,
          numbers_length: 7
        });
        $.extend(true, DataTable2.ext.renderer, {
          pageButton: {
            _: function(settings, host, idx, buttons, page, pages) {
              var classes = settings.oClasses;
              var lang = settings.oLanguage.oPaginate;
              var aria = settings.oLanguage.oAria.paginate || {};
              var btnDisplay, btnClass, counter = 0;
              var attach = function(container, buttons2) {
                var i, ien, node, button, tabIndex;
                var disabledClass = classes.sPageButtonDisabled;
                var clickHandler = function(e) {
                  _fnPageChange(settings, e.data.action, true);
                };
                for (i = 0, ien = buttons2.length; i < ien; i++) {
                  button = buttons2[i];
                  if (Array.isArray(button)) {
                    var inner = $("<" + (button.DT_el || "div") + "/>").appendTo(container);
                    attach(inner, button);
                  } else {
                    btnDisplay = null;
                    btnClass = button;
                    tabIndex = settings.iTabIndex;
                    switch (button) {
                      case "ellipsis":
                        container.append('<span class="ellipsis">&#x2026;</span>');
                        break;
                      case "first":
                        btnDisplay = lang.sFirst;
                        if (page === 0) {
                          tabIndex = -1;
                          btnClass += " " + disabledClass;
                        }
                        break;
                      case "previous":
                        btnDisplay = lang.sPrevious;
                        if (page === 0) {
                          tabIndex = -1;
                          btnClass += " " + disabledClass;
                        }
                        break;
                      case "next":
                        btnDisplay = lang.sNext;
                        if (pages === 0 || page === pages - 1) {
                          tabIndex = -1;
                          btnClass += " " + disabledClass;
                        }
                        break;
                      case "last":
                        btnDisplay = lang.sLast;
                        if (pages === 0 || page === pages - 1) {
                          tabIndex = -1;
                          btnClass += " " + disabledClass;
                        }
                        break;
                      default:
                        btnDisplay = settings.fnFormatNumber(button + 1);
                        btnClass = page === button ? classes.sPageButtonActive : "";
                        break;
                    }
                    if (btnDisplay !== null) {
                      node = $("<a>", {
                        "class": classes.sPageButton + " " + btnClass,
                        "aria-controls": settings.sTableId,
                        "aria-label": aria[button],
                        "data-dt-idx": counter,
                        "tabindex": tabIndex,
                        "id": idx === 0 && typeof button === "string" ? settings.sTableId + "_" + button : null
                      }).html(btnDisplay).appendTo(container);
                      _fnBindAction(node, { action: button }, clickHandler);
                      counter++;
                    }
                  }
                }
              };
              var activeEl;
              try {
                activeEl = $(host).find(document2.activeElement).data("dt-idx");
              } catch (e) {
              }
              attach($(host).empty(), buttons);
              if (activeEl !== undefined2) {
                $(host).find("[data-dt-idx=" + activeEl + "]").trigger("focus");
              }
            }
          }
        });
        $.extend(DataTable2.ext.type.detect, [
          function(d, settings) {
            var decimal = settings.oLanguage.sDecimal;
            return _isNumber(d, decimal) ? "num" + decimal : null;
          },
          function(d, settings) {
            if (d && !(d instanceof Date) && !_re_date.test(d)) {
              return null;
            }
            var parsed = Date.parse(d);
            return parsed !== null && !isNaN(parsed) || _empty(d) ? "date" : null;
          },
          function(d, settings) {
            var decimal = settings.oLanguage.sDecimal;
            return _isNumber(d, decimal, true) ? "num-fmt" + decimal : null;
          },
          function(d, settings) {
            var decimal = settings.oLanguage.sDecimal;
            return _htmlNumeric(d, decimal) ? "html-num" + decimal : null;
          },
          function(d, settings) {
            var decimal = settings.oLanguage.sDecimal;
            return _htmlNumeric(d, decimal, true) ? "html-num-fmt" + decimal : null;
          },
          function(d, settings) {
            return _empty(d) || typeof d === "string" && d.indexOf("<") !== -1 ? "html" : null;
          }
        ]);
        $.extend(DataTable2.ext.type.search, {
          html: function(data) {
            return _empty(data) ? data : typeof data === "string" ? data.replace(_re_new_lines, " ").replace(_re_html, "") : "";
          },
          string: function(data) {
            return _empty(data) ? data : typeof data === "string" ? data.replace(_re_new_lines, " ") : data;
          }
        });
        var __numericReplace = function(d, decimalPlace, re1, re2) {
          if (d !== 0 && (!d || d === "-")) {
            return -Infinity;
          }
          if (decimalPlace) {
            d = _numToDecimal(d, decimalPlace);
          }
          if (d.replace) {
            if (re1) {
              d = d.replace(re1, "");
            }
            if (re2) {
              d = d.replace(re2, "");
            }
          }
          return d * 1;
        };
        function _addNumericSort(decimalPlace) {
          $.each({
            "num": function(d) {
              return __numericReplace(d, decimalPlace);
            },
            "num-fmt": function(d) {
              return __numericReplace(d, decimalPlace, _re_formatted_numeric);
            },
            "html-num": function(d) {
              return __numericReplace(d, decimalPlace, _re_html);
            },
            "html-num-fmt": function(d) {
              return __numericReplace(d, decimalPlace, _re_html, _re_formatted_numeric);
            }
          }, function(key, fn) {
            _ext.type.order[key + decimalPlace + "-pre"] = fn;
            if (key.match(/^html\-/)) {
              _ext.type.search[key + decimalPlace] = _ext.type.search.html;
            }
          });
        }
        $.extend(_ext.type.order, {
          "date-pre": function(d) {
            var ts = Date.parse(d);
            return isNaN(ts) ? -Infinity : ts;
          },
          "html-pre": function(a) {
            return _empty(a) ? "" : a.replace ? a.replace(/<.*?>/g, "").toLowerCase() : a + "";
          },
          "string-pre": function(a) {
            return _empty(a) ? "" : typeof a === "string" ? a.toLowerCase() : !a.toString ? "" : a.toString();
          },
          "string-asc": function(x, y) {
            return x < y ? -1 : x > y ? 1 : 0;
          },
          "string-desc": function(x, y) {
            return x < y ? 1 : x > y ? -1 : 0;
          }
        });
        _addNumericSort("");
        $.extend(true, DataTable2.ext.renderer, {
          header: {
            _: function(settings, cell, column, classes) {
              $(settings.nTable).on("order.dt.DT", function(e, ctx, sorting, columns) {
                if (settings !== ctx) {
                  return;
                }
                var colIdx = column.idx;
                cell.removeClass(classes.sSortAsc + " " + classes.sSortDesc).addClass(columns[colIdx] == "asc" ? classes.sSortAsc : columns[colIdx] == "desc" ? classes.sSortDesc : column.sSortingClass);
              });
            },
            jqueryui: function(settings, cell, column, classes) {
              $("<div/>").addClass(classes.sSortJUIWrapper).append(cell.contents()).append($("<span/>").addClass(classes.sSortIcon + " " + column.sSortingClassJUI)).appendTo(cell);
              $(settings.nTable).on("order.dt.DT", function(e, ctx, sorting, columns) {
                if (settings !== ctx) {
                  return;
                }
                var colIdx = column.idx;
                cell.removeClass(classes.sSortAsc + " " + classes.sSortDesc).addClass(columns[colIdx] == "asc" ? classes.sSortAsc : columns[colIdx] == "desc" ? classes.sSortDesc : column.sSortingClass);
                cell.find("span." + classes.sSortIcon).removeClass(classes.sSortJUIAsc + " " + classes.sSortJUIDesc + " " + classes.sSortJUI + " " + classes.sSortJUIAscAllowed + " " + classes.sSortJUIDescAllowed).addClass(columns[colIdx] == "asc" ? classes.sSortJUIAsc : columns[colIdx] == "desc" ? classes.sSortJUIDesc : column.sSortingClassJUI);
              });
            }
          }
        });
        var __htmlEscapeEntities = function(d) {
          if (Array.isArray(d)) {
            d = d.join(",");
          }
          return typeof d === "string" ? d.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : d;
        };
        DataTable2.render = {
          number: function(thousands, decimal, precision, prefix, postfix) {
            return {
              display: function(d) {
                if (typeof d !== "number" && typeof d !== "string") {
                  return d;
                }
                var negative = d < 0 ? "-" : "";
                var flo = parseFloat(d);
                if (isNaN(flo)) {
                  return __htmlEscapeEntities(d);
                }
                flo = flo.toFixed(precision);
                d = Math.abs(flo);
                var intPart = parseInt(d, 10);
                var floatPart = precision ? decimal + (d - intPart).toFixed(precision).substring(2) : "";
                if (intPart === 0 && parseFloat(floatPart) === 0) {
                  negative = "";
                }
                return negative + (prefix || "") + intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousands) + floatPart + (postfix || "");
              }
            };
          },
          text: function() {
            return {
              display: __htmlEscapeEntities,
              filter: __htmlEscapeEntities
            };
          }
        };
        function _fnExternApiFunc(fn) {
          return function() {
            var args = [_fnSettingsFromNode(this[DataTable2.ext.iApiIndex])].concat(Array.prototype.slice.call(arguments));
            return DataTable2.ext.internal[fn].apply(this, args);
          };
        }
        $.extend(DataTable2.ext.internal, {
          _fnExternApiFunc,
          _fnBuildAjax,
          _fnAjaxUpdate,
          _fnAjaxParameters,
          _fnAjaxUpdateDraw,
          _fnAjaxDataSrc,
          _fnAddColumn,
          _fnColumnOptions,
          _fnAdjustColumnSizing,
          _fnVisibleToColumnIndex,
          _fnColumnIndexToVisible,
          _fnVisbleColumns,
          _fnGetColumns,
          _fnColumnTypes,
          _fnApplyColumnDefs,
          _fnHungarianMap,
          _fnCamelToHungarian,
          _fnLanguageCompat,
          _fnBrowserDetect,
          _fnAddData,
          _fnAddTr,
          _fnNodeToDataIndex,
          _fnNodeToColumnIndex,
          _fnGetCellData,
          _fnSetCellData,
          _fnSplitObjNotation,
          _fnGetObjectDataFn,
          _fnSetObjectDataFn,
          _fnGetDataMaster,
          _fnClearTable,
          _fnDeleteIndex,
          _fnInvalidate,
          _fnGetRowElements,
          _fnCreateTr,
          _fnBuildHead,
          _fnDrawHead,
          _fnDraw,
          _fnReDraw,
          _fnAddOptionsHtml,
          _fnDetectHeader,
          _fnGetUniqueThs,
          _fnFeatureHtmlFilter,
          _fnFilterComplete,
          _fnFilterCustom,
          _fnFilterColumn,
          _fnFilter,
          _fnFilterCreateSearch,
          _fnEscapeRegex,
          _fnFilterData,
          _fnFeatureHtmlInfo,
          _fnUpdateInfo,
          _fnInfoMacros,
          _fnInitialise,
          _fnInitComplete,
          _fnLengthChange,
          _fnFeatureHtmlLength,
          _fnFeatureHtmlPaginate,
          _fnPageChange,
          _fnFeatureHtmlProcessing,
          _fnProcessingDisplay,
          _fnFeatureHtmlTable,
          _fnScrollDraw,
          _fnApplyToChildren,
          _fnCalculateColumnWidths,
          _fnThrottle,
          _fnConvertToWidth,
          _fnGetWidestNode,
          _fnGetMaxLenString,
          _fnStringToCss,
          _fnSortFlatten,
          _fnSort,
          _fnSortAria,
          _fnSortListener,
          _fnSortAttachListener,
          _fnSortingClasses,
          _fnSortData,
          _fnSaveState,
          _fnLoadState,
          _fnImplementState,
          _fnSettingsFromNode,
          _fnLog,
          _fnMap,
          _fnBindAction,
          _fnCallbackReg,
          _fnCallbackFire,
          _fnLengthOverflow,
          _fnRenderer,
          _fnDataSource,
          _fnRowAttributes,
          _fnExtend,
          _fnCalculateEnd: function() {
          }
        });
        $.fn.dataTable = DataTable2;
        DataTable2.$ = $;
        $.fn.dataTableSettings = DataTable2.settings;
        $.fn.dataTableExt = DataTable2.ext;
        $.fn.DataTable = function(opts) {
          return $(this).dataTable(opts).api();
        };
        $.each(DataTable2, function(prop, val) {
          $.fn.DataTable[prop] = val;
        });
        return DataTable2;
      });
    }
  });

  // node_modules/datatables.net-buttons/js/dataTables.buttons.js
  var require_dataTables_buttons = __commonJS({
    "node_modules/datatables.net-buttons/js/dataTables.buttons.js"(exports, module) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["jquery", "datatables.net"], function($) {
            return factory($, window, document);
          });
        } else if (typeof exports === "object") {
          module.exports = function(root, $) {
            if (!root) {
              root = window;
            }
            if (!$ || !$.fn.dataTable) {
              $ = require_jquery_dataTables()(root, $).$;
            }
            return factory($, root, root.document);
          };
        } else {
          factory(jQuery, window, document);
        }
      })(function($, window2, document2, undefined2) {
        "use strict";
        var DataTable2 = $.fn.dataTable;
        var _instCounter = 0;
        var _buttonCounter = 0;
        var _dtButtons = DataTable2.ext.buttons;
        function _fadeIn(el, duration, fn) {
          if ($.fn.animate) {
            el.stop().fadeIn(duration, fn);
          } else {
            el.css("display", "block");
            if (fn) {
              fn.call(el);
            }
          }
        }
        function _fadeOut(el, duration, fn) {
          if ($.fn.animate) {
            el.stop().fadeOut(duration, fn);
          } else {
            el.css("display", "none");
            if (fn) {
              fn.call(el);
            }
          }
        }
        var Buttons = function(dt, config) {
          if (!(this instanceof Buttons)) {
            return function(settings) {
              return new Buttons(settings, dt).container();
            };
          }
          if (typeof config === "undefined") {
            config = {};
          }
          if (config === true) {
            config = {};
          }
          if (Array.isArray(config)) {
            config = { buttons: config };
          }
          this.c = $.extend(true, {}, Buttons.defaults, config);
          if (config.buttons) {
            this.c.buttons = config.buttons;
          }
          this.s = {
            dt: new DataTable2.Api(dt),
            buttons: [],
            listenKeys: "",
            namespace: "dtb" + _instCounter++
          };
          this.dom = {
            container: $("<" + this.c.dom.container.tag + "/>").addClass(this.c.dom.container.className)
          };
          this._constructor();
        };
        $.extend(Buttons.prototype, {
          action: function(node, action) {
            var button = this._nodeToButton(node);
            if (action === undefined2) {
              return button.conf.action;
            }
            button.conf.action = action;
            return this;
          },
          active: function(node, flag) {
            var button = this._nodeToButton(node);
            var klass = this.c.dom.button.active;
            var jqNode = $(button.node);
            if (flag === undefined2) {
              return jqNode.hasClass(klass);
            }
            jqNode.toggleClass(klass, flag === undefined2 ? true : flag);
            return this;
          },
          add: function(config, idx, draw) {
            var buttons = this.s.buttons;
            if (typeof idx === "string") {
              var split = idx.split("-");
              var base = this.s;
              for (var i = 0, ien = split.length - 1; i < ien; i++) {
                base = base.buttons[split[i] * 1];
              }
              buttons = base.buttons;
              idx = split[split.length - 1] * 1;
            }
            this._expandButton(buttons, config, config !== undefined2 ? config.split : undefined2, (config === undefined2 || config.split === undefined2 || config.split.length === 0) && base !== undefined2, false, idx);
            if (draw === undefined2 || draw === true) {
              this._draw();
            }
            return this;
          },
          collectionRebuild: function(node, newButtons) {
            var button = this._nodeToButton(node);
            if (newButtons !== undefined2) {
              var i;
              for (i = button.buttons.length - 1; i >= 0; i--) {
                this.remove(button.buttons[i].node);
              }
              for (i = 0; i < newButtons.length; i++) {
                var newBtn = newButtons[i];
                this._expandButton(button.buttons, newBtn, newBtn !== undefined2 && newBtn.config !== undefined2 && newBtn.config.split !== undefined2, true, newBtn.parentConf !== undefined2 && newBtn.parentConf.split !== undefined2, i, newBtn.parentConf);
              }
            }
            this._draw(button.collection, button.buttons);
          },
          container: function() {
            return this.dom.container;
          },
          disable: function(node) {
            var button = this._nodeToButton(node);
            $(button.node).addClass(this.c.dom.button.disabled).attr("disabled", true);
            return this;
          },
          destroy: function() {
            $("body").off("keyup." + this.s.namespace);
            var buttons = this.s.buttons.slice();
            var i, ien;
            for (i = 0, ien = buttons.length; i < ien; i++) {
              this.remove(buttons[i].node);
            }
            this.dom.container.remove();
            var buttonInsts = this.s.dt.settings()[0];
            for (i = 0, ien = buttonInsts.length; i < ien; i++) {
              if (buttonInsts.inst === this) {
                buttonInsts.splice(i, 1);
                break;
              }
            }
            return this;
          },
          enable: function(node, flag) {
            if (flag === false) {
              return this.disable(node);
            }
            var button = this._nodeToButton(node);
            $(button.node).removeClass(this.c.dom.button.disabled).removeAttr("disabled");
            return this;
          },
          index: function(node, nested, buttons) {
            if (!nested) {
              nested = "";
              buttons = this.s.buttons;
            }
            for (var i = 0, ien = buttons.length; i < ien; i++) {
              var inner = buttons[i].buttons;
              if (buttons[i].node === node) {
                return nested + i;
              }
              if (inner && inner.length) {
                var match = this.index(node, i + "-", inner);
                if (match !== null) {
                  return match;
                }
              }
            }
            return null;
          },
          name: function() {
            return this.c.name;
          },
          node: function(node) {
            if (!node) {
              return this.dom.container;
            }
            var button = this._nodeToButton(node);
            return $(button.node);
          },
          processing: function(node, flag) {
            var dt = this.s.dt;
            var button = this._nodeToButton(node);
            if (flag === undefined2) {
              return $(button.node).hasClass("processing");
            }
            $(button.node).toggleClass("processing", flag);
            $(dt.table().node()).triggerHandler("buttons-processing.dt", [
              flag,
              dt.button(node),
              dt,
              $(node),
              button.conf
            ]);
            return this;
          },
          remove: function(node) {
            var button = this._nodeToButton(node);
            var host = this._nodeToHost(node);
            var dt = this.s.dt;
            if (button.buttons.length) {
              for (var i = button.buttons.length - 1; i >= 0; i--) {
                this.remove(button.buttons[i].node);
              }
            }
            button.conf.destroying = true;
            if (button.conf.destroy) {
              button.conf.destroy.call(dt.button(node), dt, $(node), button.conf);
            }
            this._removeKey(button.conf);
            $(button.node).remove();
            var idx = $.inArray(button, host);
            host.splice(idx, 1);
            return this;
          },
          text: function(node, label) {
            var button = this._nodeToButton(node);
            var buttonLiner = this.c.dom.collection.buttonLiner;
            var linerTag = button.inCollection && buttonLiner && buttonLiner.tag ? buttonLiner.tag : this.c.dom.buttonLiner.tag;
            var dt = this.s.dt;
            var jqNode = $(button.node);
            var text = function(opt) {
              return typeof opt === "function" ? opt(dt, jqNode, button.conf) : opt;
            };
            if (label === undefined2) {
              return text(button.conf.text);
            }
            button.conf.text = label;
            if (linerTag) {
              jqNode.children(linerTag).eq(0).filter(":not(.dt-down-arrow)").html(text(label));
            } else {
              jqNode.html(text(label));
            }
            return this;
          },
          _constructor: function() {
            var that = this;
            var dt = this.s.dt;
            var dtSettings = dt.settings()[0];
            var buttons = this.c.buttons;
            if (!dtSettings._buttons) {
              dtSettings._buttons = [];
            }
            dtSettings._buttons.push({
              inst: this,
              name: this.c.name
            });
            for (var i = 0, ien = buttons.length; i < ien; i++) {
              this.add(buttons[i]);
            }
            dt.on("destroy", function(e, settings) {
              if (settings === dtSettings) {
                that.destroy();
              }
            });
            $("body").on("keyup." + this.s.namespace, function(e) {
              if (!document2.activeElement || document2.activeElement === document2.body) {
                var character = String.fromCharCode(e.keyCode).toLowerCase();
                if (that.s.listenKeys.toLowerCase().indexOf(character) !== -1) {
                  that._keypress(character, e);
                }
              }
            });
          },
          _addKey: function(conf) {
            if (conf.key) {
              this.s.listenKeys += $.isPlainObject(conf.key) ? conf.key.key : conf.key;
            }
          },
          _draw: function(container, buttons) {
            if (!container) {
              container = this.dom.container;
              buttons = this.s.buttons;
            }
            container.children().detach();
            for (var i = 0, ien = buttons.length; i < ien; i++) {
              container.append(buttons[i].inserter);
              container.append(" ");
              if (buttons[i].buttons && buttons[i].buttons.length) {
                this._draw(buttons[i].collection, buttons[i].buttons);
              }
            }
          },
          _expandButton: function(attachTo, button, split, inCollection, inSplit, attachPoint, parentConf) {
            var dt = this.s.dt;
            var buttonCounter = 0;
            var isSplit = false;
            var buttons = !Array.isArray(button) ? [button] : button;
            if (button === undefined2) {
              buttons = !Array.isArray(split) ? [split] : split;
            }
            if (button !== undefined2 && button.split !== undefined2) {
              isSplit = true;
            }
            for (var i = 0, ien = buttons.length; i < ien; i++) {
              var conf = this._resolveExtends(buttons[i]);
              if (!conf) {
                continue;
              }
              if (conf.config !== undefined2 && conf.config.split) {
                isSplit = true;
              } else {
                isSplit = false;
              }
              if (Array.isArray(conf)) {
                this._expandButton(attachTo, conf, built !== undefined2 && built.conf !== undefined2 ? built.conf.split : undefined2, inCollection, parentConf !== undefined2 && parentConf.split !== undefined2, attachPoint, parentConf);
                continue;
              }
              var built = this._buildButton(conf, inCollection, conf.split !== undefined2 || conf.config !== undefined2 && conf.config.split !== undefined2, inSplit);
              if (!built) {
                continue;
              }
              if (attachPoint !== undefined2 && attachPoint !== null) {
                attachTo.splice(attachPoint, 0, built);
                attachPoint++;
              } else {
                attachTo.push(built);
              }
              if (built.conf.buttons || built.conf.split) {
                built.collection = $("<" + (isSplit ? this.c.dom.splitCollection.tag : this.c.dom.collection.tag) + "/>");
                built.conf._collection = built.collection;
                if (built.conf.split) {
                  for (var j = 0; j < built.conf.split.length; j++) {
                    if (typeof built.conf.split[j] === "object") {
                      built.conf.split[j].parent = parentConf;
                      if (built.conf.split[j].collectionLayout === undefined2) {
                        built.conf.split[j].collectionLayout = built.conf.collectionLayout;
                      }
                      if (built.conf.split[j].dropup === undefined2) {
                        built.conf.split[j].dropup = built.conf.dropup;
                      }
                      if (built.conf.split[j].fade === undefined2) {
                        built.conf.split[j].fade = built.conf.fade;
                      }
                    }
                  }
                } else {
                  $(built.node).append($('<span class="dt-down-arrow">' + this.c.dom.splitDropdown.text + "</span>"));
                }
                this._expandButton(built.buttons, built.conf.buttons, built.conf.split, !isSplit, isSplit, attachPoint, built.conf);
              }
              built.conf.parent = parentConf;
              if (conf.init) {
                conf.init.call(dt.button(built.node), dt, $(built.node), conf);
              }
              buttonCounter++;
            }
          },
          _buildButton: function(config, inCollection, isSplit, inSplit) {
            var buttonDom = this.c.dom.button;
            var linerDom = this.c.dom.buttonLiner;
            var collectionDom = this.c.dom.collection;
            var splitDom = this.c.dom.split;
            var splitCollectionDom = this.c.dom.splitCollection;
            var splitDropdownButton = this.c.dom.splitDropdownButton;
            var dt = this.s.dt;
            var text = function(opt) {
              return typeof opt === "function" ? opt(dt, button, config) : opt;
            };
            if (config.spacer) {
              var spacer = $("<span></span>").addClass("dt-button-spacer " + config.style + " " + buttonDom.spacerClass).html(text(config.text));
              return {
                conf: config,
                node: spacer,
                inserter: spacer,
                buttons: [],
                inCollection,
                isSplit,
                inSplit,
                collection: null
              };
            }
            if (!isSplit && inSplit && splitCollectionDom) {
              buttonDom = splitDropdownButton;
            } else if (!isSplit && inCollection && collectionDom.button) {
              buttonDom = collectionDom.button;
            }
            if (!isSplit && inSplit && splitCollectionDom.buttonLiner) {
              linerDom = splitCollectionDom.buttonLiner;
            } else if (!isSplit && inCollection && collectionDom.buttonLiner) {
              linerDom = collectionDom.buttonLiner;
            }
            if (config.available && !config.available(dt, config) && !config.hasOwnProperty("html")) {
              return false;
            }
            var button;
            if (!config.hasOwnProperty("html")) {
              var action = function(e, dt2, button2, config2) {
                config2.action.call(dt2.button(button2), e, dt2, button2, config2);
                $(dt2.table().node()).triggerHandler("buttons-action.dt", [
                  dt2.button(button2),
                  dt2,
                  button2,
                  config2
                ]);
              };
              var tag = config.tag || buttonDom.tag;
              var clickBlurs = config.clickBlurs === undefined2 ? true : config.clickBlurs;
              button = $("<" + tag + "/>").addClass(buttonDom.className).addClass(inSplit ? this.c.dom.splitDropdownButton.className : "").attr("tabindex", this.s.dt.settings()[0].iTabIndex).attr("aria-controls", this.s.dt.table().node().id).on("click.dtb", function(e) {
                e.preventDefault();
                if (!button.hasClass(buttonDom.disabled) && config.action) {
                  action(e, dt, button, config);
                }
                if (clickBlurs) {
                  button.trigger("blur");
                }
              }).on("keypress.dtb", function(e) {
                if (e.keyCode === 13) {
                  e.preventDefault();
                  if (!button.hasClass(buttonDom.disabled) && config.action) {
                    action(e, dt, button, config);
                  }
                }
              });
              if (tag.toLowerCase() === "a") {
                button.attr("href", "#");
              }
              if (tag.toLowerCase() === "button") {
                button.attr("type", "button");
              }
              if (linerDom.tag) {
                var liner = $("<" + linerDom.tag + "/>").html(text(config.text)).addClass(linerDom.className);
                if (linerDom.tag.toLowerCase() === "a") {
                  liner.attr("href", "#");
                }
                button.append(liner);
              } else {
                button.html(text(config.text));
              }
              if (config.enabled === false) {
                button.addClass(buttonDom.disabled);
              }
              if (config.className) {
                button.addClass(config.className);
              }
              if (config.titleAttr) {
                button.attr("title", text(config.titleAttr));
              }
              if (config.attr) {
                button.attr(config.attr);
              }
              if (!config.namespace) {
                config.namespace = ".dt-button-" + _buttonCounter++;
              }
              if (config.config !== undefined2 && config.config.split) {
                config.split = config.config.split;
              }
            } else {
              button = $(config.html);
            }
            var buttonContainer = this.c.dom.buttonContainer;
            var inserter;
            if (buttonContainer && buttonContainer.tag) {
              inserter = $("<" + buttonContainer.tag + "/>").addClass(buttonContainer.className).append(button);
            } else {
              inserter = button;
            }
            this._addKey(config);
            if (this.c.buttonCreated) {
              inserter = this.c.buttonCreated(config, inserter);
            }
            var splitDiv;
            if (isSplit) {
              splitDiv = $("<div/>").addClass(this.c.dom.splitWrapper.className);
              splitDiv.append(button);
              var dropButtonConfig = $.extend(config, {
                text: this.c.dom.splitDropdown.text,
                className: this.c.dom.splitDropdown.className,
                closeButton: false,
                attr: {
                  "aria-haspopup": true,
                  "aria-expanded": false
                },
                align: this.c.dom.splitDropdown.align,
                splitAlignClass: this.c.dom.splitDropdown.splitAlignClass
              });
              this._addKey(dropButtonConfig);
              var splitAction = function(e, dt2, button2, config2) {
                _dtButtons.split.action.call(dt2.button($("div.dt-btn-split-wrapper")[0]), e, dt2, button2, config2);
                $(dt2.table().node()).triggerHandler("buttons-action.dt", [
                  dt2.button(button2),
                  dt2,
                  button2,
                  config2
                ]);
                button2.attr("aria-expanded", true);
              };
              var dropButton = $('<button class="' + this.c.dom.splitDropdown.className + ' dt-button"><span class="dt-btn-split-drop-arrow">' + this.c.dom.splitDropdown.text + "</span></button>").on("click.dtb", function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (!dropButton.hasClass(buttonDom.disabled)) {
                  splitAction(e, dt, dropButton, dropButtonConfig);
                }
                if (clickBlurs) {
                  dropButton.trigger("blur");
                }
              }).on("keypress.dtb", function(e) {
                if (e.keyCode === 13) {
                  e.preventDefault();
                  if (!dropButton.hasClass(buttonDom.disabled)) {
                    splitAction(e, dt, dropButton, dropButtonConfig);
                  }
                }
              });
              if (config.split.length === 0) {
                dropButton.addClass("dtb-hide-drop");
              }
              splitDiv.append(dropButton).attr(dropButtonConfig.attr);
            }
            return {
              conf: config,
              node: isSplit ? splitDiv.get(0) : button.get(0),
              inserter: isSplit ? splitDiv : inserter,
              buttons: [],
              inCollection,
              isSplit,
              inSplit,
              collection: null
            };
          },
          _nodeToButton: function(node, buttons) {
            if (!buttons) {
              buttons = this.s.buttons;
            }
            for (var i = 0, ien = buttons.length; i < ien; i++) {
              if (buttons[i].node === node) {
                return buttons[i];
              }
              if (buttons[i].buttons.length) {
                var ret = this._nodeToButton(node, buttons[i].buttons);
                if (ret) {
                  return ret;
                }
              }
            }
          },
          _nodeToHost: function(node, buttons) {
            if (!buttons) {
              buttons = this.s.buttons;
            }
            for (var i = 0, ien = buttons.length; i < ien; i++) {
              if (buttons[i].node === node) {
                return buttons;
              }
              if (buttons[i].buttons.length) {
                var ret = this._nodeToHost(node, buttons[i].buttons);
                if (ret) {
                  return ret;
                }
              }
            }
          },
          _keypress: function(character, e) {
            if (e._buttonsHandled) {
              return;
            }
            var run = function(conf, node) {
              if (!conf.key) {
                return;
              }
              if (conf.key === character) {
                e._buttonsHandled = true;
                $(node).click();
              } else if ($.isPlainObject(conf.key)) {
                if (conf.key.key !== character) {
                  return;
                }
                if (conf.key.shiftKey && !e.shiftKey) {
                  return;
                }
                if (conf.key.altKey && !e.altKey) {
                  return;
                }
                if (conf.key.ctrlKey && !e.ctrlKey) {
                  return;
                }
                if (conf.key.metaKey && !e.metaKey) {
                  return;
                }
                e._buttonsHandled = true;
                $(node).click();
              }
            };
            var recurse = function(a) {
              for (var i = 0, ien = a.length; i < ien; i++) {
                run(a[i].conf, a[i].node);
                if (a[i].buttons.length) {
                  recurse(a[i].buttons);
                }
              }
            };
            recurse(this.s.buttons);
          },
          _removeKey: function(conf) {
            if (conf.key) {
              var character = $.isPlainObject(conf.key) ? conf.key.key : conf.key;
              var a = this.s.listenKeys.split("");
              var idx = $.inArray(character, a);
              a.splice(idx, 1);
              this.s.listenKeys = a.join("");
            }
          },
          _resolveExtends: function(conf) {
            var that = this;
            var dt = this.s.dt;
            var i, ien;
            var toConfObject = function(base) {
              var loop = 0;
              while (!$.isPlainObject(base) && !Array.isArray(base)) {
                if (base === undefined2) {
                  return;
                }
                if (typeof base === "function") {
                  base = base.call(that, dt, conf);
                  if (!base) {
                    return false;
                  }
                } else if (typeof base === "string") {
                  if (!_dtButtons[base]) {
                    return { html: base };
                  }
                  base = _dtButtons[base];
                }
                loop++;
                if (loop > 30) {
                  throw "Buttons: Too many iterations";
                }
              }
              return Array.isArray(base) ? base : $.extend({}, base);
            };
            conf = toConfObject(conf);
            while (conf && conf.extend) {
              if (!_dtButtons[conf.extend]) {
                throw "Cannot extend unknown button type: " + conf.extend;
              }
              var objArray = toConfObject(_dtButtons[conf.extend]);
              if (Array.isArray(objArray)) {
                return objArray;
              } else if (!objArray) {
                return false;
              }
              var originalClassName = objArray.className;
              if (conf.config !== undefined2 && objArray.config !== undefined2) {
                conf.config = $.extend({}, objArray.config, conf.config);
              }
              conf = $.extend({}, objArray, conf);
              if (originalClassName && conf.className !== originalClassName) {
                conf.className = originalClassName + " " + conf.className;
              }
              var postfixButtons = conf.postfixButtons;
              if (postfixButtons) {
                if (!conf.buttons) {
                  conf.buttons = [];
                }
                for (i = 0, ien = postfixButtons.length; i < ien; i++) {
                  conf.buttons.push(postfixButtons[i]);
                }
                conf.postfixButtons = null;
              }
              var prefixButtons = conf.prefixButtons;
              if (prefixButtons) {
                if (!conf.buttons) {
                  conf.buttons = [];
                }
                for (i = 0, ien = prefixButtons.length; i < ien; i++) {
                  conf.buttons.splice(i, 0, prefixButtons[i]);
                }
                conf.prefixButtons = null;
              }
              conf.extend = objArray.extend;
            }
            return conf;
          },
          _popover: function(content, hostButton, inOpts, e) {
            var dt = hostButton;
            var buttonsSettings = this.c;
            var closed = false;
            var options = $.extend({
              align: "button-left",
              autoClose: false,
              background: true,
              backgroundClassName: "dt-button-background",
              closeButton: true,
              contentClassName: buttonsSettings.dom.collection.className,
              collectionLayout: "",
              collectionTitle: "",
              dropup: false,
              fade: 400,
              popoverTitle: "",
              rightAlignClassName: "dt-button-right",
              splitRightAlignClassName: "dt-button-split-right",
              splitLeftAlignClassName: "dt-button-split-left",
              tag: buttonsSettings.dom.collection.tag
            }, inOpts);
            var hostNode = hostButton.node();
            var close = function() {
              closed = true;
              _fadeOut($(".dt-button-collection"), options.fade, function() {
                $(this).detach();
              });
              $(dt.buttons('[aria-haspopup="true"][aria-expanded="true"]').nodes()).attr("aria-expanded", "false");
              $("div.dt-button-background").off("click.dtb-collection");
              Buttons.background(false, options.backgroundClassName, options.fade, hostNode);
              $(window2).off("resize.resize.dtb-collection");
              $("body").off(".dtb-collection");
              dt.off("buttons-action.b-internal");
              dt.off("destroy");
            };
            if (content === false) {
              close();
              return;
            }
            var existingExpanded = $(dt.buttons('[aria-haspopup="true"][aria-expanded="true"]').nodes());
            if (existingExpanded.length) {
              if (hostNode.closest("div.dt-button-collection").length) {
                hostNode = existingExpanded.eq(0);
              }
              close();
            }
            var display = $("<div/>").addClass("dt-button-collection").addClass(options.collectionLayout).addClass(options.splitAlignClass).css("display", "none");
            content = $(content).addClass(options.contentClassName).attr("role", "menu").appendTo(display);
            hostNode.attr("aria-expanded", "true");
            if (hostNode.parents("body")[0] !== document2.body) {
              hostNode = document2.body.lastChild;
            }
            if (options.popoverTitle) {
              display.prepend('<div class="dt-button-collection-title">' + options.popoverTitle + "</div>");
            } else if (options.collectionTitle) {
              display.prepend('<div class="dt-button-collection-title">' + options.collectionTitle + "</div>");
            }
            if (options.closeButton) {
              display.prepend('<div class="dtb-popover-close">x</div>').addClass("dtb-collection-closeable");
            }
            _fadeIn(display.insertAfter(hostNode), options.fade);
            var tableContainer = $(hostButton.table().container());
            var position = display.css("position");
            if (options.align === "dt-container") {
              hostNode = hostNode.parent();
              display.css("width", tableContainer.width());
            }
            if (position === "absolute") {
              var hostPosition = hostNode.position();
              var buttonPosition = $(hostButton.node()).position();
              display.css({
                top: $($(hostButton[0].node).parent()[0]).hasClass("dt-buttons") ? buttonPosition.top + hostNode.outerHeight() : hostPosition.top + hostNode.outerHeight(),
                left: hostPosition.left
              });
              var collectionHeight = display.outerHeight();
              var tableBottom = tableContainer.offset().top + tableContainer.height();
              var listBottom = buttonPosition.top + hostNode.outerHeight() + collectionHeight;
              var bottomOverflow = listBottom - tableBottom;
              var listTop = buttonPosition.top - collectionHeight;
              var tableTop = tableContainer.offset().top;
              var topOverflow = tableTop - listTop;
              var moveTop = buttonPosition.top - collectionHeight - 5;
              if ((bottomOverflow > topOverflow || options.dropup) && -moveTop < tableTop) {
                display.css("top", moveTop);
              }
              var tableLeft = tableContainer.offset().left;
              var tableWidth = tableContainer.width();
              var tableRight = tableLeft + tableWidth;
              var popoverLeft = display.offset().left;
              var popoverWidth = display.outerWidth();
              if (popoverWidth === 0) {
                if (display.children().length > 0) {
                  popoverWidth = $(display.children()[0]).outerWidth();
                }
              }
              var popoverRight = popoverLeft + popoverWidth;
              var buttonsLeft = hostNode.offset().left;
              var buttonsWidth = hostNode.outerWidth();
              var buttonsRight = buttonsLeft + buttonsWidth;
              if (display.hasClass(options.rightAlignClassName) || display.hasClass(options.leftAlignClassName) || display.hasClass(options.splitAlignClass) || options.align === "dt-container") {
                var splitButtonLeft = buttonsLeft;
                var splitButtonWidth = buttonsWidth;
                var splitButtonRight = buttonsRight;
                if (hostNode.hasClass("dt-btn-split-wrapper") && hostNode.children("button.dt-btn-split-drop").length > 0) {
                  splitButtonLeft = hostNode.children("button.dt-btn-split-drop").offset().left;
                  splitButtonWidth = hostNode.children("button.dt-btn-split-drop").outerWidth();
                  splitButtonRight = splitButtonLeft + splitButtonWidth;
                }
                var popoverShuffle = 0;
                if (display.hasClass(options.rightAlignClassName)) {
                  popoverShuffle = buttonsRight - popoverRight;
                  if (tableLeft > popoverLeft + popoverShuffle) {
                    var leftGap = tableLeft - (popoverLeft + popoverShuffle);
                    var rightGap = tableRight - (popoverRight + popoverShuffle);
                    if (leftGap > rightGap) {
                      popoverShuffle += rightGap;
                    } else {
                      popoverShuffle += leftGap;
                    }
                  }
                } else if (display.hasClass(options.splitRightAlignClassName)) {
                  popoverShuffle = splitButtonRight - popoverRight;
                  if (tableLeft > popoverLeft + popoverShuffle) {
                    var leftGap = tableLeft - (popoverLeft + popoverShuffle);
                    var rightGap = tableRight - (popoverRight + popoverShuffle);
                    if (leftGap > rightGap) {
                      popoverShuffle += rightGap;
                    } else {
                      popoverShuffle += leftGap;
                    }
                  }
                } else if (display.hasClass(options.splitLeftAlignClassName)) {
                  popoverShuffle = splitButtonLeft - popoverLeft;
                  if (tableRight < popoverRight + popoverShuffle || tableLeft > popoverLeft + popoverShuffle) {
                    var leftGap = tableLeft - (popoverLeft + popoverShuffle);
                    var rightGap = tableRight - (popoverRight + popoverShuffle);
                    if (leftGap > rightGap) {
                      popoverShuffle += rightGap;
                    } else {
                      popoverShuffle += leftGap;
                    }
                  }
                } else {
                  popoverShuffle = tableLeft - popoverLeft;
                  if (tableRight < popoverRight + popoverShuffle) {
                    var leftGap = tableLeft - (popoverLeft + popoverShuffle);
                    var rightGap = tableRight - (popoverRight + popoverShuffle);
                    if (leftGap > rightGap) {
                      popoverShuffle += rightGap;
                    } else {
                      popoverShuffle += leftGap;
                    }
                  }
                }
                display.css("left", display.position().left + popoverShuffle);
              } else {
                var top = hostNode.offset().top;
                var popoverShuffle = 0;
                popoverShuffle = options.align === "button-right" ? buttonsRight - popoverRight : buttonsLeft - popoverLeft;
                display.css("left", display.position().left + popoverShuffle);
              }
            } else {
              var position = function() {
                var half = $(window2).height() / 2;
                var top2 = display.height() / 2;
                if (top2 > half) {
                  top2 = half;
                }
                display.css("marginTop", top2 * -1);
              };
              position();
              $(window2).on("resize.dtb-collection", function() {
                position();
              });
            }
            if (options.background) {
              Buttons.background(true, options.backgroundClassName, options.fade, options.backgroundHost || hostNode);
            }
            $("div.dt-button-background").on("click.dtb-collection", function() {
            });
            if (options.autoClose) {
              setTimeout(function() {
                dt.on("buttons-action.b-internal", function(e2, btn, dt2, node) {
                  if (node[0] === hostNode[0]) {
                    return;
                  }
                  close();
                });
              }, 0);
            }
            $(display).trigger("buttons-popover.dt");
            dt.on("destroy", close);
            setTimeout(function() {
              closed = false;
              $("body").on("click.dtb-collection", function(e2) {
                if (closed) {
                  return;
                }
                var back = $.fn.addBack ? "addBack" : "andSelf";
                var parent = $(e2.target).parent()[0];
                if (!$(e2.target).parents()[back]().filter(content).length && !$(parent).hasClass("dt-buttons") || $(e2.target).hasClass("dt-button-background")) {
                  close();
                }
              }).on("keyup.dtb-collection", function(e2) {
                if (e2.keyCode === 27) {
                  close();
                }
              });
            }, 0);
          }
        });
        Buttons.background = function(show, className, fade, insertPoint) {
          if (fade === undefined2) {
            fade = 400;
          }
          if (!insertPoint) {
            insertPoint = document2.body;
          }
          if (show) {
            _fadeIn($("<div/>").addClass(className).css("display", "none").insertAfter(insertPoint), fade);
          } else {
            _fadeOut($("div." + className), fade, function() {
              $(this).removeClass(className).remove();
            });
          }
        };
        Buttons.instanceSelector = function(group, buttons) {
          if (group === undefined2 || group === null) {
            return $.map(buttons, function(v) {
              return v.inst;
            });
          }
          var ret = [];
          var names = $.map(buttons, function(v) {
            return v.name;
          });
          var process = function(input) {
            if (Array.isArray(input)) {
              for (var i = 0, ien = input.length; i < ien; i++) {
                process(input[i]);
              }
              return;
            }
            if (typeof input === "string") {
              if (input.indexOf(",") !== -1) {
                process(input.split(","));
              } else {
                var idx = $.inArray(input.trim(), names);
                if (idx !== -1) {
                  ret.push(buttons[idx].inst);
                }
              }
            } else if (typeof input === "number") {
              ret.push(buttons[input].inst);
            } else if (typeof input === "object") {
              ret.push(input);
            }
          };
          process(group);
          return ret;
        };
        Buttons.buttonSelector = function(insts, selector) {
          var ret = [];
          var nodeBuilder = function(a, buttons, baseIdx) {
            var button;
            var idx;
            for (var i2 = 0, ien2 = buttons.length; i2 < ien2; i2++) {
              button = buttons[i2];
              if (button) {
                idx = baseIdx !== undefined2 ? baseIdx + i2 : i2 + "";
                a.push({
                  node: button.node,
                  name: button.conf.name,
                  idx
                });
                if (button.buttons) {
                  nodeBuilder(a, button.buttons, idx + "-");
                }
              }
            }
          };
          var run = function(selector2, inst2) {
            var i2, ien2;
            var buttons = [];
            nodeBuilder(buttons, inst2.s.buttons);
            var nodes = $.map(buttons, function(v) {
              return v.node;
            });
            if (Array.isArray(selector2) || selector2 instanceof $) {
              for (i2 = 0, ien2 = selector2.length; i2 < ien2; i2++) {
                run(selector2[i2], inst2);
              }
              return;
            }
            if (selector2 === null || selector2 === undefined2 || selector2 === "*") {
              for (i2 = 0, ien2 = buttons.length; i2 < ien2; i2++) {
                ret.push({
                  inst: inst2,
                  node: buttons[i2].node
                });
              }
            } else if (typeof selector2 === "number") {
              if (inst2.s.buttons[selector2]) {
                ret.push({
                  inst: inst2,
                  node: inst2.s.buttons[selector2].node
                });
              }
            } else if (typeof selector2 === "string") {
              if (selector2.indexOf(",") !== -1) {
                var a = selector2.split(",");
                for (i2 = 0, ien2 = a.length; i2 < ien2; i2++) {
                  run(a[i2].trim(), inst2);
                }
              } else if (selector2.match(/^\d+(\-\d+)*$/)) {
                var indexes = $.map(buttons, function(v) {
                  return v.idx;
                });
                ret.push({
                  inst: inst2,
                  node: buttons[$.inArray(selector2, indexes)].node
                });
              } else if (selector2.indexOf(":name") !== -1) {
                var name = selector2.replace(":name", "");
                for (i2 = 0, ien2 = buttons.length; i2 < ien2; i2++) {
                  if (buttons[i2].name === name) {
                    ret.push({
                      inst: inst2,
                      node: buttons[i2].node
                    });
                  }
                }
              } else {
                $(nodes).filter(selector2).each(function() {
                  ret.push({
                    inst: inst2,
                    node: this
                  });
                });
              }
            } else if (typeof selector2 === "object" && selector2.nodeName) {
              var idx = $.inArray(selector2, nodes);
              if (idx !== -1) {
                ret.push({
                  inst: inst2,
                  node: nodes[idx]
                });
              }
            }
          };
          for (var i = 0, ien = insts.length; i < ien; i++) {
            var inst = insts[i];
            run(selector, inst);
          }
          return ret;
        };
        Buttons.stripData = function(str, config) {
          if (typeof str !== "string") {
            return str;
          }
          str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
          str = str.replace(/<!\-\-.*?\-\->/g, "");
          if (!config || config.stripHtml) {
            str = str.replace(/<[^>]*>/g, "");
          }
          if (!config || config.trim) {
            str = str.replace(/^\s+|\s+$/g, "");
          }
          if (!config || config.stripNewlines) {
            str = str.replace(/\n/g, " ");
          }
          if (!config || config.decodeEntities) {
            _exportTextarea.innerHTML = str;
            str = _exportTextarea.value;
          }
          return str;
        };
        Buttons.defaults = {
          buttons: ["copy", "excel", "csv", "pdf", "print"],
          name: "main",
          tabIndex: 0,
          dom: {
            container: {
              tag: "div",
              className: "dt-buttons"
            },
            collection: {
              tag: "div",
              className: ""
            },
            button: {
              tag: "button",
              className: "dt-button",
              active: "active",
              disabled: "disabled",
              spacerClass: ""
            },
            buttonLiner: {
              tag: "span",
              className: ""
            },
            split: {
              tag: "div",
              className: "dt-button-split"
            },
            splitWrapper: {
              tag: "div",
              className: "dt-btn-split-wrapper"
            },
            splitDropdown: {
              tag: "button",
              text: "&#x25BC;",
              className: "dt-btn-split-drop",
              align: "split-right",
              splitAlignClass: "dt-button-split-left"
            },
            splitDropdownButton: {
              tag: "button",
              className: "dt-btn-split-drop-button dt-button"
            },
            splitCollection: {
              tag: "div",
              className: "dt-button-split-collection"
            }
          }
        };
        Buttons.version = "2.2.1";
        $.extend(_dtButtons, {
          collection: {
            text: function(dt) {
              return dt.i18n("buttons.collection", "Collection");
            },
            className: "buttons-collection",
            closeButton: false,
            init: function(dt, button, config) {
              button.attr("aria-expanded", false);
            },
            action: function(e, dt, button, config) {
              if (config._collection.parents("body").length) {
                this.popover(false, config);
              } else {
                this.popover(config._collection, config);
              }
            },
            attr: {
              "aria-haspopup": true
            }
          },
          split: {
            text: function(dt) {
              return dt.i18n("buttons.split", "Split");
            },
            className: "buttons-split",
            closeButton: false,
            init: function(dt, button, config) {
              return button.attr("aria-expanded", false);
            },
            action: function(e, dt, button, config) {
              this.popover(config._collection, config);
            },
            attr: {
              "aria-haspopup": true
            }
          },
          copy: function(dt, conf) {
            if (_dtButtons.copyHtml5) {
              return "copyHtml5";
            }
          },
          csv: function(dt, conf) {
            if (_dtButtons.csvHtml5 && _dtButtons.csvHtml5.available(dt, conf)) {
              return "csvHtml5";
            }
          },
          excel: function(dt, conf) {
            if (_dtButtons.excelHtml5 && _dtButtons.excelHtml5.available(dt, conf)) {
              return "excelHtml5";
            }
          },
          pdf: function(dt, conf) {
            if (_dtButtons.pdfHtml5 && _dtButtons.pdfHtml5.available(dt, conf)) {
              return "pdfHtml5";
            }
          },
          pageLength: function(dt) {
            var lengthMenu = dt.settings()[0].aLengthMenu;
            var vals = [];
            var lang = [];
            var text = function(dt2) {
              return dt2.i18n("buttons.pageLength", {
                "-1": "Show all rows",
                _: "Show %d rows"
              }, dt2.page.len());
            };
            if (Array.isArray(lengthMenu[0])) {
              vals = lengthMenu[0];
              lang = lengthMenu[1];
            } else {
              for (var i = 0; i < lengthMenu.length; i++) {
                var option = lengthMenu[i];
                if ($.isPlainObject(option)) {
                  vals.push(option.value);
                  lang.push(option.label);
                } else {
                  vals.push(option);
                  lang.push(option);
                }
              }
            }
            return {
              extend: "collection",
              text,
              className: "buttons-page-length",
              autoClose: true,
              buttons: $.map(vals, function(val, i2) {
                return {
                  text: lang[i2],
                  className: "button-page-length",
                  action: function(e, dt2) {
                    dt2.page.len(val).draw();
                  },
                  init: function(dt2, node, conf) {
                    var that = this;
                    var fn = function() {
                      that.active(dt2.page.len() === val);
                    };
                    dt2.on("length.dt" + conf.namespace, fn);
                    fn();
                  },
                  destroy: function(dt2, node, conf) {
                    dt2.off("length.dt" + conf.namespace);
                  }
                };
              }),
              init: function(dt2, node, conf) {
                var that = this;
                dt2.on("length.dt" + conf.namespace, function() {
                  that.text(conf.text);
                });
              },
              destroy: function(dt2, node, conf) {
                dt2.off("length.dt" + conf.namespace);
              }
            };
          },
          spacer: {
            style: "empty",
            spacer: true,
            text: function(dt) {
              return dt.i18n("buttons.spacer", "");
            }
          }
        });
        DataTable2.Api.register("buttons()", function(group, selector) {
          if (selector === undefined2) {
            selector = group;
            group = undefined2;
          }
          this.selector.buttonGroup = group;
          var res = this.iterator(true, "table", function(ctx) {
            if (ctx._buttons) {
              return Buttons.buttonSelector(Buttons.instanceSelector(group, ctx._buttons), selector);
            }
          }, true);
          res._groupSelector = group;
          return res;
        });
        DataTable2.Api.register("button()", function(group, selector) {
          var buttons = this.buttons(group, selector);
          if (buttons.length > 1) {
            buttons.splice(1, buttons.length);
          }
          return buttons;
        });
        DataTable2.Api.registerPlural("buttons().active()", "button().active()", function(flag) {
          if (flag === undefined2) {
            return this.map(function(set) {
              return set.inst.active(set.node);
            });
          }
          return this.each(function(set) {
            set.inst.active(set.node, flag);
          });
        });
        DataTable2.Api.registerPlural("buttons().action()", "button().action()", function(action) {
          if (action === undefined2) {
            return this.map(function(set) {
              return set.inst.action(set.node);
            });
          }
          return this.each(function(set) {
            set.inst.action(set.node, action);
          });
        });
        DataTable2.Api.registerPlural("buttons().collectionRebuild()", "button().collectionRebuild()", function(buttons) {
          return this.each(function(set) {
            for (var i = 0; i < buttons.length; i++) {
              if (typeof buttons[i] === "object") {
                buttons[i].parentConf = set;
              }
            }
            set.inst.collectionRebuild(set.node, buttons);
          });
        });
        DataTable2.Api.register(["buttons().enable()", "button().enable()"], function(flag) {
          return this.each(function(set) {
            set.inst.enable(set.node, flag);
          });
        });
        DataTable2.Api.register(["buttons().disable()", "button().disable()"], function() {
          return this.each(function(set) {
            set.inst.disable(set.node);
          });
        });
        DataTable2.Api.register("button().index()", function() {
          var idx = null;
          this.each(function(set) {
            var res = set.inst.index(set.node);
            if (res !== null) {
              idx = res;
            }
          });
          return idx;
        });
        DataTable2.Api.registerPlural("buttons().nodes()", "button().node()", function() {
          var jq = $();
          $(this.each(function(set) {
            jq = jq.add(set.inst.node(set.node));
          }));
          return jq;
        });
        DataTable2.Api.registerPlural("buttons().processing()", "button().processing()", function(flag) {
          if (flag === undefined2) {
            return this.map(function(set) {
              return set.inst.processing(set.node);
            });
          }
          return this.each(function(set) {
            set.inst.processing(set.node, flag);
          });
        });
        DataTable2.Api.registerPlural("buttons().text()", "button().text()", function(label) {
          if (label === undefined2) {
            return this.map(function(set) {
              return set.inst.text(set.node);
            });
          }
          return this.each(function(set) {
            set.inst.text(set.node, label);
          });
        });
        DataTable2.Api.registerPlural("buttons().trigger()", "button().trigger()", function() {
          return this.each(function(set) {
            set.inst.node(set.node).trigger("click");
          });
        });
        DataTable2.Api.register("button().popover()", function(content, options) {
          return this.map(function(set) {
            return set.inst._popover(content, this.button(this[0].node), options);
          });
        });
        DataTable2.Api.register("buttons().containers()", function() {
          var jq = $();
          var groupSelector = this._groupSelector;
          this.iterator(true, "table", function(ctx) {
            if (ctx._buttons) {
              var insts = Buttons.instanceSelector(groupSelector, ctx._buttons);
              for (var i = 0, ien = insts.length; i < ien; i++) {
                jq = jq.add(insts[i].container());
              }
            }
          });
          return jq;
        });
        DataTable2.Api.register("buttons().container()", function() {
          return this.containers().eq(0);
        });
        DataTable2.Api.register("button().add()", function(idx, conf, draw) {
          var ctx = this.context;
          if (ctx.length) {
            var inst = Buttons.instanceSelector(this._groupSelector, ctx[0]._buttons);
            if (inst.length) {
              inst[0].add(conf, idx, draw);
            }
          }
          return this.button(this._groupSelector, idx);
        });
        DataTable2.Api.register("buttons().destroy()", function() {
          this.pluck("inst").unique().each(function(inst) {
            inst.destroy();
          });
          return this;
        });
        DataTable2.Api.registerPlural("buttons().remove()", "buttons().remove()", function() {
          this.each(function(set) {
            set.inst.remove(set.node);
          });
          return this;
        });
        var _infoTimer;
        DataTable2.Api.register("buttons.info()", function(title, message, time) {
          var that = this;
          if (title === false) {
            this.off("destroy.btn-info");
            _fadeOut($("#datatables_buttons_info"), 400, function() {
              $(this).remove();
            });
            clearTimeout(_infoTimer);
            _infoTimer = null;
            return this;
          }
          if (_infoTimer) {
            clearTimeout(_infoTimer);
          }
          if ($("#datatables_buttons_info").length) {
            $("#datatables_buttons_info").remove();
          }
          title = title ? "<h2>" + title + "</h2>" : "";
          _fadeIn($('<div id="datatables_buttons_info" class="dt-button-info"/>').html(title).append($("<div/>")[typeof message === "string" ? "html" : "append"](message)).css("display", "none").appendTo("body"));
          if (time !== undefined2 && time !== 0) {
            _infoTimer = setTimeout(function() {
              that.buttons.info(false);
            }, time);
          }
          this.on("destroy.btn-info", function() {
            that.buttons.info(false);
          });
          return this;
        });
        DataTable2.Api.register("buttons.exportData()", function(options) {
          if (this.context.length) {
            return _exportData(new DataTable2.Api(this.context[0]), options);
          }
        });
        DataTable2.Api.register("buttons.exportInfo()", function(conf) {
          if (!conf) {
            conf = {};
          }
          return {
            filename: _filename(conf),
            title: _title(conf),
            messageTop: _message(this, conf.message || conf.messageTop, "top"),
            messageBottom: _message(this, conf.messageBottom, "bottom")
          };
        });
        var _filename = function(config) {
          var filename = config.filename === "*" && config.title !== "*" && config.title !== undefined2 && config.title !== null && config.title !== "" ? config.title : config.filename;
          if (typeof filename === "function") {
            filename = filename();
          }
          if (filename === undefined2 || filename === null) {
            return null;
          }
          if (filename.indexOf("*") !== -1) {
            filename = filename.replace("*", $("head > title").text()).trim();
          }
          filename = filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, "");
          var extension = _stringOrFunction(config.extension);
          if (!extension) {
            extension = "";
          }
          return filename + extension;
        };
        var _stringOrFunction = function(option) {
          if (option === null || option === undefined2) {
            return null;
          } else if (typeof option === "function") {
            return option();
          }
          return option;
        };
        var _title = function(config) {
          var title = _stringOrFunction(config.title);
          return title === null ? null : title.indexOf("*") !== -1 ? title.replace("*", $("head > title").text() || "Exported data") : title;
        };
        var _message = function(dt, option, position) {
          var message = _stringOrFunction(option);
          if (message === null) {
            return null;
          }
          var caption = $("caption", dt.table().container()).eq(0);
          if (message === "*") {
            var side = caption.css("caption-side");
            if (side !== position) {
              return null;
            }
            return caption.length ? caption.text() : "";
          }
          return message;
        };
        var _exportTextarea = $("<textarea/>")[0];
        var _exportData = function(dt, inOpts) {
          var config = $.extend(true, {}, {
            rows: null,
            columns: "",
            modifier: {
              search: "applied",
              order: "applied"
            },
            orthogonal: "display",
            stripHtml: true,
            stripNewlines: true,
            decodeEntities: true,
            trim: true,
            format: {
              header: function(d) {
                return Buttons.stripData(d, config);
              },
              footer: function(d) {
                return Buttons.stripData(d, config);
              },
              body: function(d) {
                return Buttons.stripData(d, config);
              }
            },
            customizeData: null
          }, inOpts);
          var header = dt.columns(config.columns).indexes().map(function(idx) {
            var el = dt.column(idx).header();
            return config.format.header(el.innerHTML, idx, el);
          }).toArray();
          var footer = dt.table().footer() ? dt.columns(config.columns).indexes().map(function(idx) {
            var el = dt.column(idx).footer();
            return config.format.footer(el ? el.innerHTML : "", idx, el);
          }).toArray() : null;
          var modifier = $.extend({}, config.modifier);
          if (dt.select && typeof dt.select.info === "function" && modifier.selected === undefined2) {
            if (dt.rows(config.rows, $.extend({ selected: true }, modifier)).any()) {
              $.extend(modifier, { selected: true });
            }
          }
          var rowIndexes = dt.rows(config.rows, modifier).indexes().toArray();
          var selectedCells = dt.cells(rowIndexes, config.columns);
          var cells = selectedCells.render(config.orthogonal).toArray();
          var cellNodes = selectedCells.nodes().toArray();
          var columns = header.length;
          var rows = columns > 0 ? cells.length / columns : 0;
          var body = [];
          var cellCounter = 0;
          for (var i = 0, ien = rows; i < ien; i++) {
            var row = [columns];
            for (var j = 0; j < columns; j++) {
              row[j] = config.format.body(cells[cellCounter], i, j, cellNodes[cellCounter]);
              cellCounter++;
            }
            body[i] = row;
          }
          var data = {
            header,
            footer,
            body
          };
          if (config.customizeData) {
            config.customizeData(data);
          }
          return data;
        };
        $.fn.dataTable.Buttons = Buttons;
        $.fn.DataTable.Buttons = Buttons;
        $(document2).on("init.dt plugin-init.dt", function(e, settings) {
          if (e.namespace !== "dt") {
            return;
          }
          var opts = settings.oInit.buttons || DataTable2.defaults.buttons;
          if (opts && !settings._buttons) {
            new Buttons(settings, opts).container();
          }
        });
        function _init(settings, options) {
          var api = new DataTable2.Api(settings);
          var opts = options ? options : api.init().buttons || DataTable2.defaults.buttons;
          return new Buttons(api, opts).container();
        }
        DataTable2.ext.feature.push({
          fnInit: _init,
          cFeature: "B"
        });
        if (DataTable2.ext.features) {
          DataTable2.ext.features.register("buttons", _init);
        }
        return Buttons;
      });
    }
  });

  // node_modules/datatables.net-buttons/js/buttons.html5.js
  var require_buttons_html5 = __commonJS({
    "node_modules/datatables.net-buttons/js/buttons.html5.js"(exports, module) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["jquery", "datatables.net", "datatables.net-buttons"], function($) {
            return factory($, window, document);
          });
        } else if (typeof exports === "object") {
          module.exports = function(root, $, jszip, pdfmake) {
            if (!root) {
              root = window;
            }
            if (!$ || !$.fn.dataTable) {
              $ = require_jquery_dataTables()(root, $).$;
            }
            if (!$.fn.dataTable.Buttons) {
              require_dataTables_buttons()(root, $);
            }
            return factory($, root, root.document, jszip, pdfmake);
          };
        } else {
          factory(jQuery, window, document);
        }
      })(function($, window2, document2, jszip, pdfmake, undefined2) {
        "use strict";
        var DataTable2 = $.fn.dataTable;
        function _jsZip() {
          return jszip || window2.JSZip;
        }
        function _pdfMake() {
          return pdfmake || window2.pdfMake;
        }
        DataTable2.Buttons.pdfMake = function(_) {
          if (!_) {
            return _pdfMake();
          }
          pdfmake = _;
        };
        DataTable2.Buttons.jszip = function(_) {
          if (!_) {
            return _jsZip();
          }
          jszip = _;
        };
        var _saveAs = function(view) {
          "use strict";
          if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
            return;
          }
          var doc = view.document, get_URL = function() {
            return view.URL || view.webkitURL || view;
          }, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"), can_use_save_link = "download" in save_link, click = function(node) {
            var event = new MouseEvent("click");
            node.dispatchEvent(event);
          }, is_safari = /constructor/i.test(view.HTMLElement) || view.safari, is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent), throw_outside = function(ex) {
            (view.setImmediate || view.setTimeout)(function() {
              throw ex;
            }, 0);
          }, force_saveable_type = "application/octet-stream", arbitrary_revoke_timeout = 1e3 * 40, revoke = function(file) {
            var revoker = function() {
              if (typeof file === "string") {
                get_URL().revokeObjectURL(file);
              } else {
                file.remove();
              }
            };
            setTimeout(revoker, arbitrary_revoke_timeout);
          }, dispatch2 = function(filesaver, event_types, event) {
            event_types = [].concat(event_types);
            var i = event_types.length;
            while (i--) {
              var listener = filesaver["on" + event_types[i]];
              if (typeof listener === "function") {
                try {
                  listener.call(filesaver, event || filesaver);
                } catch (ex) {
                  throw_outside(ex);
                }
              }
            }
          }, auto_bom = function(blob) {
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
              return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
            }
            return blob;
          }, FileSaver = function(blob, name, no_auto_bom) {
            if (!no_auto_bom) {
              blob = auto_bom(blob);
            }
            var filesaver = this, type = blob.type, force = type === force_saveable_type, object_url, dispatch_all = function() {
              dispatch2(filesaver, "writestart progress write writeend".split(" "));
            }, fs_error = function() {
              if ((is_chrome_ios || force && is_safari) && view.FileReader) {
                var reader = new FileReader();
                reader.onloadend = function() {
                  var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, "data:attachment/file;");
                  var popup = view.open(url, "_blank");
                  if (!popup)
                    view.location.href = url;
                  url = undefined2;
                  filesaver.readyState = filesaver.DONE;
                  dispatch_all();
                };
                reader.readAsDataURL(blob);
                filesaver.readyState = filesaver.INIT;
                return;
              }
              if (!object_url) {
                object_url = get_URL().createObjectURL(blob);
              }
              if (force) {
                view.location.href = object_url;
              } else {
                var opened = view.open(object_url, "_blank");
                if (!opened) {
                  view.location.href = object_url;
                }
              }
              filesaver.readyState = filesaver.DONE;
              dispatch_all();
              revoke(object_url);
            };
            filesaver.readyState = filesaver.INIT;
            if (can_use_save_link) {
              object_url = get_URL().createObjectURL(blob);
              setTimeout(function() {
                save_link.href = object_url;
                save_link.download = name;
                click(save_link);
                dispatch_all();
                revoke(object_url);
                filesaver.readyState = filesaver.DONE;
              });
              return;
            }
            fs_error();
          }, FS_proto = FileSaver.prototype, saveAs = function(blob, name, no_auto_bom) {
            return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
          };
          if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
            return function(blob, name, no_auto_bom) {
              name = name || blob.name || "download";
              if (!no_auto_bom) {
                blob = auto_bom(blob);
              }
              return navigator.msSaveOrOpenBlob(blob, name);
            };
          }
          FS_proto.abort = function() {
          };
          FS_proto.readyState = FS_proto.INIT = 0;
          FS_proto.WRITING = 1;
          FS_proto.DONE = 2;
          FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;
          return saveAs;
        }(typeof self !== "undefined" && self || typeof window2 !== "undefined" && window2 || this.content);
        DataTable2.fileSave = _saveAs;
        var _sheetname = function(config) {
          var sheetName = "Sheet1";
          if (config.sheetName) {
            sheetName = config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, "");
          }
          return sheetName;
        };
        var _newLine = function(config) {
          return config.newline ? config.newline : navigator.userAgent.match(/Windows/) ? "\r\n" : "\n";
        };
        var _exportData = function(dt, config) {
          var newLine = _newLine(config);
          var data = dt.buttons.exportData(config.exportOptions);
          var boundary = config.fieldBoundary;
          var separator = config.fieldSeparator;
          var reBoundary = new RegExp(boundary, "g");
          var escapeChar = config.escapeChar !== undefined2 ? config.escapeChar : "\\";
          var join = function(a) {
            var s = "";
            for (var i2 = 0, ien2 = a.length; i2 < ien2; i2++) {
              if (i2 > 0) {
                s += separator;
              }
              s += boundary ? boundary + ("" + a[i2]).replace(reBoundary, escapeChar + boundary) + boundary : a[i2];
            }
            return s;
          };
          var header = config.header ? join(data.header) + newLine : "";
          var footer = config.footer && data.footer ? newLine + join(data.footer) : "";
          var body = [];
          for (var i = 0, ien = data.body.length; i < ien; i++) {
            body.push(join(data.body[i]));
          }
          return {
            str: header + body.join(newLine) + footer,
            rows: body.length
          };
        };
        var _isDuffSafari = function() {
          var safari = navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("Chrome") === -1 && navigator.userAgent.indexOf("Opera") === -1;
          if (!safari) {
            return false;
          }
          var version = navigator.userAgent.match(/AppleWebKit\/(\d+\.\d+)/);
          if (version && version.length > 1 && version[1] * 1 < 603.1) {
            return true;
          }
          return false;
        };
        function createCellPos(n) {
          var ordA = "A".charCodeAt(0);
          var ordZ = "Z".charCodeAt(0);
          var len = ordZ - ordA + 1;
          var s = "";
          while (n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
          }
          return s;
        }
        try {
          var _serialiser = new XMLSerializer();
          var _ieExcel;
        } catch (t) {
        }
        function _addToZip(zip2, obj) {
          if (_ieExcel === undefined2) {
            _ieExcel = _serialiser.serializeToString(new window2.DOMParser().parseFromString(excelStrings["xl/worksheets/sheet1.xml"], "text/xml")).indexOf("xmlns:r") === -1;
          }
          $.each(obj, function(name, val) {
            if ($.isPlainObject(val)) {
              var newDir = zip2.folder(name);
              _addToZip(newDir, val);
            } else {
              if (_ieExcel) {
                var worksheet = val.childNodes[0];
                var i, ien;
                var attrs = [];
                for (i = worksheet.attributes.length - 1; i >= 0; i--) {
                  var attrName = worksheet.attributes[i].nodeName;
                  var attrValue = worksheet.attributes[i].nodeValue;
                  if (attrName.indexOf(":") !== -1) {
                    attrs.push({ name: attrName, value: attrValue });
                    worksheet.removeAttribute(attrName);
                  }
                }
                for (i = 0, ien = attrs.length; i < ien; i++) {
                  var attr = val.createAttribute(attrs[i].name.replace(":", "_dt_b_namespace_token_"));
                  attr.value = attrs[i].value;
                  worksheet.setAttributeNode(attr);
                }
              }
              var str = _serialiser.serializeToString(val);
              if (_ieExcel) {
                if (str.indexOf("<?xml") === -1) {
                  str = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + str;
                }
                str = str.replace(/_dt_b_namespace_token_/g, ":");
                str = str.replace(/xmlns:NS[\d]+="" NS[\d]+:/g, "");
              }
              str = str.replace(/<([^<>]*?) xmlns=""([^<>]*?)>/g, "<$1 $2>");
              zip2.file(name, str);
            }
          });
        }
        function _createNode(doc, nodeName, opts) {
          var tempNode = doc.createElement(nodeName);
          if (opts) {
            if (opts.attr) {
              $(tempNode).attr(opts.attr);
            }
            if (opts.children) {
              $.each(opts.children, function(key, value) {
                tempNode.appendChild(value);
              });
            }
            if (opts.text !== null && opts.text !== undefined2) {
              tempNode.appendChild(doc.createTextNode(opts.text));
            }
          }
          return tempNode;
        }
        function _excelColWidth(data, col) {
          var max = data.header[col].length;
          var len, lineSplit, str;
          if (data.footer && data.footer[col].length > max) {
            max = data.footer[col].length;
          }
          for (var i = 0, ien = data.body.length; i < ien; i++) {
            var point = data.body[i][col];
            str = point !== null && point !== undefined2 ? point.toString() : "";
            if (str.indexOf("\n") !== -1) {
              lineSplit = str.split("\n");
              lineSplit.sort(function(a, b) {
                return b.length - a.length;
              });
              len = lineSplit[0].length;
            } else {
              len = str.length;
            }
            if (len > max) {
              max = len;
            }
            if (max > 40) {
              return 54;
            }
          }
          max *= 1.35;
          return max > 6 ? max : 6;
        }
        var excelStrings = {
          "_rels/.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
          "xl/_rels/workbook.xml.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
          "[Content_Types].xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml" /><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" /><Default Extension="jpeg" ContentType="image/jpeg" /><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" /><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" /><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" /></Types>',
          "xl/workbook.xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/><workbookPr showInkAnnotation="0" autoCompressPictures="0"/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets><definedNames/></workbook>',
          "xl/worksheets/sheet1.xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><sheetData/><mergeCells count="0"/></worksheet>',
          "xl/styles.xml": '<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><numFmts count="6"><numFmt numFmtId="164" formatCode="#,##0.00_- [$$-45C]"/><numFmt numFmtId="165" formatCode="&quot;\xA3&quot;#,##0.00"/><numFmt numFmtId="166" formatCode="[$\u20AC-2] #,##0.00"/><numFmt numFmtId="167" formatCode="0.0%"/><numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/><numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/></numFmts><fonts count="5" x14ac:knownFonts="1"><font><sz val="11" /><name val="Calibri" /></font><font><sz val="11" /><name val="Calibri" /><color rgb="FFFFFFFF" /></font><font><sz val="11" /><name val="Calibri" /><b /></font><font><sz val="11" /><name val="Calibri" /><i /></font><font><sz val="11" /><name val="Calibri" /><u /></font></fonts><fills count="6"><fill><patternFill patternType="none" /></fill><fill><patternFill patternType="none" /></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9D9D9" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD99795" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="ffc6efce" /><bgColor indexed="64" /></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="ffc6cfef" /><bgColor indexed="64" /></patternFill></fill></fills><borders count="2"><border><left /><right /><top /><bottom /><diagonal /></border><border diagonalUp="false" diagonalDown="false"><left style="thin"><color auto="1" /></left><right style="thin"><color auto="1" /></right><top style="thin"><color auto="1" /></top><bottom style="thin"><color auto="1" /></bottom><diagonal /></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" /></cellStyleXfs><cellXfs count="68"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="left"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment horizontal="fill"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment textRotation="90"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1"><alignment wrapText="1"/></xf><xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="1" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="2" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="14" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0" /></cellStyles><dxfs count="0" /><tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" /></styleSheet>'
        };
        var _excelSpecials = [
          { match: /^\-?\d+\.\d%$/, style: 60, fmt: function(d) {
            return d / 100;
          } },
          { match: /^\-?\d+\.?\d*%$/, style: 56, fmt: function(d) {
            return d / 100;
          } },
          { match: /^\-?\$[\d,]+.?\d*$/, style: 57 },
          { match: /^\-?£[\d,]+.?\d*$/, style: 58 },
          { match: /^\-?€[\d,]+.?\d*$/, style: 59 },
          { match: /^\-?\d+$/, style: 65 },
          { match: /^\-?\d+\.\d{2}$/, style: 66 },
          { match: /^\([\d,]+\)$/, style: 61, fmt: function(d) {
            return -1 * d.replace(/[\(\)]/g, "");
          } },
          { match: /^\([\d,]+\.\d{2}\)$/, style: 62, fmt: function(d) {
            return -1 * d.replace(/[\(\)]/g, "");
          } },
          { match: /^\-?[\d,]+$/, style: 63 },
          { match: /^\-?[\d,]+\.\d{2}$/, style: 64 },
          { match: /^[\d]{4}\-[\d]{2}\-[\d]{2}$/, style: 67, fmt: function(d) {
            return Math.round(25569 + Date.parse(d) / (86400 * 1e3));
          } }
        ];
        DataTable2.ext.buttons.copyHtml5 = {
          className: "buttons-copy buttons-html5",
          text: function(dt) {
            return dt.i18n("buttons.copy", "Copy");
          },
          action: function(e, dt, button, config) {
            this.processing(true);
            var that = this;
            var exportData = _exportData(dt, config);
            var info = dt.buttons.exportInfo(config);
            var newline = _newLine(config);
            var output = exportData.str;
            var hiddenDiv = $("<div/>").css({
              height: 1,
              width: 1,
              overflow: "hidden",
              position: "fixed",
              top: 0,
              left: 0
            });
            if (info.title) {
              output = info.title + newline + newline + output;
            }
            if (info.messageTop) {
              output = info.messageTop + newline + newline + output;
            }
            if (info.messageBottom) {
              output = output + newline + newline + info.messageBottom;
            }
            if (config.customize) {
              output = config.customize(output, config, dt);
            }
            var textarea = $("<textarea readonly/>").val(output).appendTo(hiddenDiv);
            if (document2.queryCommandSupported("copy")) {
              hiddenDiv.appendTo(dt.table().container());
              textarea[0].focus();
              textarea[0].select();
              try {
                var successful = document2.execCommand("copy");
                hiddenDiv.remove();
                if (successful) {
                  dt.buttons.info(dt.i18n("buttons.copyTitle", "Copy to clipboard"), dt.i18n("buttons.copySuccess", {
                    1: "Copied one row to clipboard",
                    _: "Copied %d rows to clipboard"
                  }, exportData.rows), 2e3);
                  this.processing(false);
                  return;
                }
              } catch (t) {
              }
            }
            var message = $("<span>" + dt.i18n("buttons.copyKeys", "Press <i>ctrl</i> or <i>\u2318</i> + <i>C</i> to copy the table data<br>to your system clipboard.<br><br>To cancel, click this message or press escape.") + "</span>").append(hiddenDiv);
            dt.buttons.info(dt.i18n("buttons.copyTitle", "Copy to clipboard"), message, 0);
            textarea[0].focus();
            textarea[0].select();
            var container = $(message).closest(".dt-button-info");
            var close = function() {
              container.off("click.buttons-copy");
              $(document2).off(".buttons-copy");
              dt.buttons.info(false);
            };
            container.on("click.buttons-copy", close);
            $(document2).on("keydown.buttons-copy", function(e2) {
              if (e2.keyCode === 27) {
                close();
                that.processing(false);
              }
            }).on("copy.buttons-copy cut.buttons-copy", function() {
              close();
              that.processing(false);
            });
          },
          exportOptions: {},
          fieldSeparator: "	",
          fieldBoundary: "",
          header: true,
          footer: false,
          title: "*",
          messageTop: "*",
          messageBottom: "*"
        };
        DataTable2.ext.buttons.csvHtml5 = {
          bom: false,
          className: "buttons-csv buttons-html5",
          available: function() {
            return window2.FileReader !== undefined2 && window2.Blob;
          },
          text: function(dt) {
            return dt.i18n("buttons.csv", "CSV");
          },
          action: function(e, dt, button, config) {
            this.processing(true);
            var output = _exportData(dt, config).str;
            var info = dt.buttons.exportInfo(config);
            var charset = config.charset;
            if (config.customize) {
              output = config.customize(output, config, dt);
            }
            if (charset !== false) {
              if (!charset) {
                charset = document2.characterSet || document2.charset;
              }
              if (charset) {
                charset = ";charset=" + charset;
              }
            } else {
              charset = "";
            }
            if (config.bom) {
              output = String.fromCharCode(65279) + output;
            }
            _saveAs(new Blob([output], { type: "text/csv" + charset }), info.filename, true);
            this.processing(false);
          },
          filename: "*",
          extension: ".csv",
          exportOptions: {},
          fieldSeparator: ",",
          fieldBoundary: '"',
          escapeChar: '"',
          charset: null,
          header: true,
          footer: false
        };
        DataTable2.ext.buttons.excelHtml5 = {
          className: "buttons-excel buttons-html5",
          available: function() {
            return window2.FileReader !== undefined2 && _jsZip() !== undefined2 && !_isDuffSafari() && _serialiser;
          },
          text: function(dt) {
            return dt.i18n("buttons.excel", "Excel");
          },
          action: function(e, dt, button, config) {
            this.processing(true);
            var that = this;
            var rowPos = 0;
            var dataStartRow, dataEndRow;
            var getXml = function(type) {
              var str = excelStrings[type];
              return $.parseXML(str);
            };
            var rels = getXml("xl/worksheets/sheet1.xml");
            var relsGet = rels.getElementsByTagName("sheetData")[0];
            var xlsx = {
              _rels: {
                ".rels": getXml("_rels/.rels")
              },
              xl: {
                _rels: {
                  "workbook.xml.rels": getXml("xl/_rels/workbook.xml.rels")
                },
                "workbook.xml": getXml("xl/workbook.xml"),
                "styles.xml": getXml("xl/styles.xml"),
                "worksheets": {
                  "sheet1.xml": rels
                }
              },
              "[Content_Types].xml": getXml("[Content_Types].xml")
            };
            var data = dt.buttons.exportData(config.exportOptions);
            var currentRow, rowNode;
            var addRow = function(row) {
              currentRow = rowPos + 1;
              rowNode = _createNode(rels, "row", { attr: { r: currentRow } });
              for (var i2 = 0, ien2 = row.length; i2 < ien2; i2++) {
                var cellId = createCellPos(i2) + "" + currentRow;
                var cell = null;
                if (row[i2] === null || row[i2] === undefined2 || row[i2] === "") {
                  if (config.createEmptyCells === true) {
                    row[i2] = "";
                  } else {
                    continue;
                  }
                }
                var originalContent = row[i2];
                row[i2] = typeof row[i2].trim === "function" ? row[i2].trim() : row[i2];
                for (var j = 0, jen = _excelSpecials.length; j < jen; j++) {
                  var special = _excelSpecials[j];
                  if (row[i2].match && !row[i2].match(/^0\d+/) && row[i2].match(special.match)) {
                    var val = row[i2].replace(/[^\d\.\-]/g, "");
                    if (special.fmt) {
                      val = special.fmt(val);
                    }
                    cell = _createNode(rels, "c", {
                      attr: {
                        r: cellId,
                        s: special.style
                      },
                      children: [
                        _createNode(rels, "v", { text: val })
                      ]
                    });
                    break;
                  }
                }
                if (!cell) {
                  if (typeof row[i2] === "number" || row[i2].match && row[i2].match(/^-?\d+(\.\d+)?([eE]\-?\d+)?$/) && !row[i2].match(/^0\d+/)) {
                    cell = _createNode(rels, "c", {
                      attr: {
                        t: "n",
                        r: cellId
                      },
                      children: [
                        _createNode(rels, "v", { text: row[i2] })
                      ]
                    });
                  } else {
                    var text = !originalContent.replace ? originalContent : originalContent.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
                    cell = _createNode(rels, "c", {
                      attr: {
                        t: "inlineStr",
                        r: cellId
                      },
                      children: {
                        row: _createNode(rels, "is", {
                          children: {
                            row: _createNode(rels, "t", {
                              text,
                              attr: {
                                "xml:space": "preserve"
                              }
                            })
                          }
                        })
                      }
                    });
                  }
                }
                rowNode.appendChild(cell);
              }
              relsGet.appendChild(rowNode);
              rowPos++;
            };
            if (config.customizeData) {
              config.customizeData(data);
            }
            var mergeCells = function(row, colspan) {
              var mergeCells2 = $("mergeCells", rels);
              mergeCells2[0].appendChild(_createNode(rels, "mergeCell", {
                attr: {
                  ref: "A" + row + ":" + createCellPos(colspan) + row
                }
              }));
              mergeCells2.attr("count", parseFloat(mergeCells2.attr("count")) + 1);
              $("row:eq(" + (row - 1) + ") c", rels).attr("s", "51");
            };
            var exportInfo = dt.buttons.exportInfo(config);
            if (exportInfo.title) {
              addRow([exportInfo.title], rowPos);
              mergeCells(rowPos, data.header.length - 1);
            }
            if (exportInfo.messageTop) {
              addRow([exportInfo.messageTop], rowPos);
              mergeCells(rowPos, data.header.length - 1);
            }
            if (config.header) {
              addRow(data.header, rowPos);
              $("row:last c", rels).attr("s", "2");
            }
            dataStartRow = rowPos;
            for (var n = 0, ie = data.body.length; n < ie; n++) {
              addRow(data.body[n], rowPos);
            }
            dataEndRow = rowPos;
            if (config.footer && data.footer) {
              addRow(data.footer, rowPos);
              $("row:last c", rels).attr("s", "2");
            }
            if (exportInfo.messageBottom) {
              addRow([exportInfo.messageBottom], rowPos);
              mergeCells(rowPos, data.header.length - 1);
            }
            var cols = _createNode(rels, "cols");
            $("worksheet", rels).prepend(cols);
            for (var i = 0, ien = data.header.length; i < ien; i++) {
              cols.appendChild(_createNode(rels, "col", {
                attr: {
                  min: i + 1,
                  max: i + 1,
                  width: _excelColWidth(data, i),
                  customWidth: 1
                }
              }));
            }
            var workbook = xlsx.xl["workbook.xml"];
            $("sheets sheet", workbook).attr("name", _sheetname(config));
            if (config.autoFilter) {
              $("mergeCells", rels).before(_createNode(rels, "autoFilter", {
                attr: {
                  ref: "A" + dataStartRow + ":" + createCellPos(data.header.length - 1) + dataEndRow
                }
              }));
              $("definedNames", workbook).append(_createNode(workbook, "definedName", {
                attr: {
                  name: "_xlnm._FilterDatabase",
                  localSheetId: "0",
                  hidden: 1
                },
                text: _sheetname(config) + "!$A$" + dataStartRow + ":" + createCellPos(data.header.length - 1) + dataEndRow
              }));
            }
            if (config.customize) {
              config.customize(xlsx, config, dt);
            }
            if ($("mergeCells", rels).children().length === 0) {
              $("mergeCells", rels).remove();
            }
            var jszip2 = _jsZip();
            var zip2 = new jszip2();
            var zipConfig = {
              type: "blob",
              mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };
            _addToZip(zip2, xlsx);
            if (zip2.generateAsync) {
              zip2.generateAsync(zipConfig).then(function(blob) {
                _saveAs(blob, exportInfo.filename);
                that.processing(false);
              });
            } else {
              _saveAs(zip2.generate(zipConfig), exportInfo.filename);
              this.processing(false);
            }
          },
          filename: "*",
          extension: ".xlsx",
          exportOptions: {},
          header: true,
          footer: false,
          title: "*",
          messageTop: "*",
          messageBottom: "*",
          createEmptyCells: false,
          autoFilter: false,
          sheetName: ""
        };
        DataTable2.ext.buttons.pdfHtml5 = {
          className: "buttons-pdf buttons-html5",
          available: function() {
            return window2.FileReader !== undefined2 && _pdfMake();
          },
          text: function(dt) {
            return dt.i18n("buttons.pdf", "PDF");
          },
          action: function(e, dt, button, config) {
            this.processing(true);
            var that = this;
            var data = dt.buttons.exportData(config.exportOptions);
            var info = dt.buttons.exportInfo(config);
            var rows = [];
            if (config.header) {
              rows.push($.map(data.header, function(d) {
                return {
                  text: typeof d === "string" ? d : d + "",
                  style: "tableHeader"
                };
              }));
            }
            for (var i = 0, ien = data.body.length; i < ien; i++) {
              rows.push($.map(data.body[i], function(d) {
                if (d === null || d === undefined2) {
                  d = "";
                }
                return {
                  text: typeof d === "string" ? d : d + "",
                  style: i % 2 ? "tableBodyEven" : "tableBodyOdd"
                };
              }));
            }
            if (config.footer && data.footer) {
              rows.push($.map(data.footer, function(d) {
                return {
                  text: typeof d === "string" ? d : d + "",
                  style: "tableFooter"
                };
              }));
            }
            var doc = {
              pageSize: config.pageSize,
              pageOrientation: config.orientation,
              content: [
                {
                  table: {
                    headerRows: 1,
                    body: rows
                  },
                  layout: "noBorders"
                }
              ],
              styles: {
                tableHeader: {
                  bold: true,
                  fontSize: 11,
                  color: "white",
                  fillColor: "#2d4154",
                  alignment: "center"
                },
                tableBodyEven: {},
                tableBodyOdd: {
                  fillColor: "#f3f3f3"
                },
                tableFooter: {
                  bold: true,
                  fontSize: 11,
                  color: "white",
                  fillColor: "#2d4154"
                },
                title: {
                  alignment: "center",
                  fontSize: 15
                },
                message: {}
              },
              defaultStyle: {
                fontSize: 10
              }
            };
            if (info.messageTop) {
              doc.content.unshift({
                text: info.messageTop,
                style: "message",
                margin: [0, 0, 0, 12]
              });
            }
            if (info.messageBottom) {
              doc.content.push({
                text: info.messageBottom,
                style: "message",
                margin: [0, 0, 0, 12]
              });
            }
            if (info.title) {
              doc.content.unshift({
                text: info.title,
                style: "title",
                margin: [0, 0, 0, 12]
              });
            }
            if (config.customize) {
              config.customize(doc, config, dt);
            }
            var pdf = _pdfMake().createPdf(doc);
            if (config.download === "open" && !_isDuffSafari()) {
              pdf.open();
            } else {
              pdf.download(info.filename);
            }
            this.processing(false);
          },
          title: "*",
          filename: "*",
          extension: ".pdf",
          exportOptions: {},
          orientation: "portrait",
          pageSize: "A4",
          header: true,
          footer: false,
          messageTop: "*",
          messageBottom: "*",
          customize: null,
          download: "download"
        };
        return DataTable2.Buttons;
      });
    }
  });

  // node_modules/datatables.net-buttons/js/buttons.print.js
  var require_buttons_print = __commonJS({
    "node_modules/datatables.net-buttons/js/buttons.print.js"(exports, module) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["jquery", "datatables.net", "datatables.net-buttons"], function($) {
            return factory($, window, document);
          });
        } else if (typeof exports === "object") {
          module.exports = function(root, $) {
            if (!root) {
              root = window;
            }
            if (!$ || !$.fn.dataTable) {
              $ = require_jquery_dataTables()(root, $).$;
            }
            if (!$.fn.dataTable.Buttons) {
              require_dataTables_buttons()(root, $);
            }
            return factory($, root, root.document);
          };
        } else {
          factory(jQuery, window, document);
        }
      })(function($, window2, document2, undefined2) {
        "use strict";
        var DataTable2 = $.fn.dataTable;
        var _link = document2.createElement("a");
        var _styleToAbs = function(el) {
          var url;
          var clone = $(el).clone()[0];
          var linkHost;
          if (clone.nodeName.toLowerCase() === "link") {
            clone.href = _relToAbs(clone.href);
          }
          return clone.outerHTML;
        };
        var _relToAbs = function(href) {
          _link.href = href;
          var linkHost = _link.host;
          if (linkHost.indexOf("/") === -1 && _link.pathname.indexOf("/") !== 0) {
            linkHost += "/";
          }
          return _link.protocol + "//" + linkHost + _link.pathname + _link.search;
        };
        DataTable2.ext.buttons.print = {
          className: "buttons-print",
          text: function(dt) {
            return dt.i18n("buttons.print", "Print");
          },
          action: function(e, dt, button, config) {
            var data = dt.buttons.exportData($.extend({ decodeEntities: false }, config.exportOptions));
            var exportInfo = dt.buttons.exportInfo(config);
            var columnClasses = dt.columns(config.exportOptions.columns).flatten().map(function(idx) {
              return dt.settings()[0].aoColumns[dt.column(idx).index()].sClass;
            }).toArray();
            var addRow = function(d, tag) {
              var str = "<tr>";
              for (var i2 = 0, ien2 = d.length; i2 < ien2; i2++) {
                var dataOut = d[i2] === null || d[i2] === undefined2 ? "" : d[i2];
                var classAttr = columnClasses[i2] ? 'class="' + columnClasses[i2] + '"' : "";
                str += "<" + tag + " " + classAttr + ">" + dataOut + "</" + tag + ">";
              }
              return str + "</tr>";
            };
            var html = '<table class="' + dt.table().node().className + '">';
            if (config.header) {
              html += "<thead>" + addRow(data.header, "th") + "</thead>";
            }
            html += "<tbody>";
            for (var i = 0, ien = data.body.length; i < ien; i++) {
              html += addRow(data.body[i], "td");
            }
            html += "</tbody>";
            if (config.footer && data.footer) {
              html += "<tfoot>" + addRow(data.footer, "th") + "</tfoot>";
            }
            html += "</table>";
            var win = window2.open("", "");
            if (!win) {
              dt.buttons.info(dt.i18n("buttons.printErrorTitle", "Unable to open print view"), dt.i18n("buttons.printErrorMsg", "Please allow popups in your browser for this site to be able to view the print view."), 5e3);
              return;
            }
            win.document.close();
            var head = "<title>" + exportInfo.title + "</title>";
            $("style, link").each(function() {
              head += _styleToAbs(this);
            });
            try {
              win.document.head.innerHTML = head;
            } catch (e2) {
              $(win.document.head).html(head);
            }
            win.document.body.innerHTML = "<h1>" + exportInfo.title + "</h1><div>" + (exportInfo.messageTop || "") + "</div>" + html + "<div>" + (exportInfo.messageBottom || "") + "</div>";
            $(win.document.body).addClass("dt-print-view");
            $("img", win.document.body).each(function(i2, img) {
              img.setAttribute("src", _relToAbs(img.getAttribute("src")));
            });
            if (config.customize) {
              config.customize(win, config, dt);
            }
            var autoPrint = function() {
              if (config.autoPrint) {
                win.print();
                win.close();
              }
            };
            if (navigator.userAgent.match(/Trident\/\d.\d/)) {
              autoPrint();
            } else {
              win.setTimeout(autoPrint, 1e3);
            }
          },
          title: "*",
          messageTop: "*",
          messageBottom: "*",
          exportOptions: {},
          header: true,
          footer: false,
          autoPrint: true,
          customize: null
        };
        return DataTable2.Buttons;
      });
    }
  });

  // node_modules/datatables.net-bs5/js/dataTables.bootstrap5.js
  var require_dataTables_bootstrap5 = __commonJS({
    "node_modules/datatables.net-bs5/js/dataTables.bootstrap5.js"(exports, module) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["jquery", "datatables.net"], function($) {
            return factory($, window, document);
          });
        } else if (typeof exports === "object") {
          module.exports = function(root, $) {
            if (!root) {
              root = window;
            }
            if (!$ || !$.fn.dataTable) {
              $ = require_jquery_dataTables()(root, $).$;
            }
            return factory($, root, root.document);
          };
        } else {
          factory(jQuery, window, document);
        }
      })(function($, window2, document2, undefined2) {
        "use strict";
        var DataTable2 = $.fn.dataTable;
        $.extend(true, DataTable2.defaults, {
          dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
          renderer: "bootstrap"
        });
        $.extend(DataTable2.ext.classes, {
          sWrapper: "dataTables_wrapper dt-bootstrap5",
          sFilterInput: "form-control form-control-sm",
          sLengthSelect: "form-select form-select-sm",
          sProcessing: "dataTables_processing card",
          sPageButton: "paginate_button page-item"
        });
        DataTable2.ext.renderer.pageButton.bootstrap = function(settings, host, idx, buttons, page, pages) {
          var api = new DataTable2.Api(settings);
          var classes = settings.oClasses;
          var lang = settings.oLanguage.oPaginate;
          var aria = settings.oLanguage.oAria.paginate || {};
          var btnDisplay, btnClass, counter = 0;
          var attach = function(container, buttons2) {
            var i, ien, node, button;
            var clickHandler = function(e) {
              e.preventDefault();
              if (!$(e.currentTarget).hasClass("disabled") && api.page() != e.data.action) {
                api.page(e.data.action).draw("page");
              }
            };
            for (i = 0, ien = buttons2.length; i < ien; i++) {
              button = buttons2[i];
              if (Array.isArray(button)) {
                attach(container, button);
              } else {
                btnDisplay = "";
                btnClass = "";
                switch (button) {
                  case "ellipsis":
                    btnDisplay = "&#x2026;";
                    btnClass = "disabled";
                    break;
                  case "first":
                    btnDisplay = lang.sFirst;
                    btnClass = button + (page > 0 ? "" : " disabled");
                    break;
                  case "previous":
                    btnDisplay = lang.sPrevious;
                    btnClass = button + (page > 0 ? "" : " disabled");
                    break;
                  case "next":
                    btnDisplay = lang.sNext;
                    btnClass = button + (page < pages - 1 ? "" : " disabled");
                    break;
                  case "last":
                    btnDisplay = lang.sLast;
                    btnClass = button + (page < pages - 1 ? "" : " disabled");
                    break;
                  default:
                    btnDisplay = button + 1;
                    btnClass = page === button ? "active" : "";
                    break;
                }
                if (btnDisplay) {
                  node = $("<li>", {
                    "class": classes.sPageButton + " " + btnClass,
                    "id": idx === 0 && typeof button === "string" ? settings.sTableId + "_" + button : null
                  }).append($("<a>", {
                    "href": "#",
                    "aria-controls": settings.sTableId,
                    "aria-label": aria[button],
                    "data-dt-idx": counter,
                    "tabindex": settings.iTabIndex,
                    "class": "page-link"
                  }).html(btnDisplay)).appendTo(container);
                  settings.oApi._fnBindAction(node, { action: button }, clickHandler);
                  counter++;
                }
              }
            }
          };
          var activeEl;
          try {
            activeEl = $(host).find(document2.activeElement).data("dt-idx");
          } catch (e) {
          }
          attach($(host).empty().html('<ul class="pagination"/>').children("ul"), buttons);
          if (activeEl !== undefined2) {
            $(host).find("[data-dt-idx=" + activeEl + "]").trigger("focus");
          }
        };
        return DataTable2;
      });
    }
  });

  // node_modules/datatables.net-buttons-bs5/js/buttons.bootstrap5.js
  var require_buttons_bootstrap5 = __commonJS({
    "node_modules/datatables.net-buttons-bs5/js/buttons.bootstrap5.js"(exports, module) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["jquery", "datatables.net-bs5", "datatables.net-buttons"], function($) {
            return factory($, window, document);
          });
        } else if (typeof exports === "object") {
          module.exports = function(root, $) {
            if (!root) {
              root = window;
            }
            if (!$ || !$.fn.dataTable) {
              $ = require_dataTables_bootstrap5()(root, $).$;
            }
            if (!$.fn.dataTable.Buttons) {
              require_dataTables_buttons()(root, $);
            }
            return factory($, root, root.document);
          };
        } else {
          factory(jQuery, window, document);
        }
      })(function($, window2, document2, undefined2) {
        "use strict";
        var DataTable2 = $.fn.dataTable;
        $.extend(true, DataTable2.Buttons.defaults, {
          dom: {
            container: {
              className: "dt-buttons btn-group flex-wrap"
            },
            button: {
              className: "btn btn-secondary"
            },
            collection: {
              tag: "div",
              className: "dropdown-menu",
              closeButton: false,
              button: {
                tag: "a",
                className: "dt-button dropdown-item",
                active: "active",
                disabled: "disabled"
              }
            },
            splitWrapper: {
              tag: "div",
              className: "dt-btn-split-wrapper btn-group",
              closeButton: false
            },
            splitDropdown: {
              tag: "button",
              text: "",
              className: "btn btn-secondary dt-btn-split-drop dropdown-toggle dropdown-toggle-split",
              closeButton: false,
              align: "split-left",
              splitAlignClass: "dt-button-split-left"
            },
            splitDropdownButton: {
              tag: "button",
              className: "dt-btn-split-drop-button btn btn-secondary",
              closeButton: false
            }
          },
          buttonCreated: function(config, button) {
            return config.buttons ? $('<div class="btn-group"/>').append(button) : button;
          }
        });
        DataTable2.ext.buttons.collection.className += " dropdown-toggle";
        DataTable2.ext.buttons.collection.rightAlignClassName = "dropdown-menu-right";
        return DataTable2.Buttons;
      });
    }
  });

  // node_modules/datatables.net-responsive/js/dataTables.responsive.js
  var require_dataTables_responsive = __commonJS({
    "node_modules/datatables.net-responsive/js/dataTables.responsive.js"(exports, module) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["jquery", "datatables.net"], function($) {
            return factory($, window, document);
          });
        } else if (typeof exports === "object") {
          module.exports = function(root, $) {
            if (!root) {
              root = window;
            }
            if (!$ || !$.fn.dataTable) {
              $ = require_jquery_dataTables()(root, $).$;
            }
            return factory($, root, root.document);
          };
        } else {
          factory(jQuery, window, document);
        }
      })(function($, window2, document2, undefined2) {
        "use strict";
        var DataTable2 = $.fn.dataTable;
        var Responsive = function(settings, opts) {
          if (!DataTable2.versionCheck || !DataTable2.versionCheck("1.10.10")) {
            throw "DataTables Responsive requires DataTables 1.10.10 or newer";
          }
          this.s = {
            dt: new DataTable2.Api(settings),
            columns: [],
            current: []
          };
          if (this.s.dt.settings()[0].responsive) {
            return;
          }
          if (opts && typeof opts.details === "string") {
            opts.details = { type: opts.details };
          } else if (opts && opts.details === false) {
            opts.details = { type: false };
          } else if (opts && opts.details === true) {
            opts.details = { type: "inline" };
          }
          this.c = $.extend(true, {}, Responsive.defaults, DataTable2.defaults.responsive, opts);
          settings.responsive = this;
          this._constructor();
        };
        $.extend(Responsive.prototype, {
          _constructor: function() {
            var that = this;
            var dt = this.s.dt;
            var dtPrivateSettings = dt.settings()[0];
            var oldWindowWidth = $(window2).innerWidth();
            dt.settings()[0]._responsive = this;
            $(window2).on("resize.dtr orientationchange.dtr", DataTable2.util.throttle(function() {
              var width = $(window2).innerWidth();
              if (width !== oldWindowWidth) {
                that._resize();
                oldWindowWidth = width;
              }
            }));
            dtPrivateSettings.oApi._fnCallbackReg(dtPrivateSettings, "aoRowCreatedCallback", function(tr, data, idx) {
              if ($.inArray(false, that.s.current) !== -1) {
                $(">td, >th", tr).each(function(i) {
                  var idx2 = dt.column.index("toData", i);
                  if (that.s.current[idx2] === false) {
                    $(this).css("display", "none");
                  }
                });
              }
            });
            dt.on("destroy.dtr", function() {
              dt.off(".dtr");
              $(dt.table().body()).off(".dtr");
              $(window2).off("resize.dtr orientationchange.dtr");
              dt.cells(".dtr-control").nodes().to$().removeClass("dtr-control");
              $.each(that.s.current, function(i, val) {
                if (val === false) {
                  that._setColumnVis(i, true);
                }
              });
            });
            this.c.breakpoints.sort(function(a, b) {
              return a.width < b.width ? 1 : a.width > b.width ? -1 : 0;
            });
            this._classLogic();
            this._resizeAuto();
            var details = this.c.details;
            if (details.type !== false) {
              that._detailsInit();
              dt.on("column-visibility.dtr", function() {
                if (that._timer) {
                  clearTimeout(that._timer);
                }
                that._timer = setTimeout(function() {
                  that._timer = null;
                  that._classLogic();
                  that._resizeAuto();
                  that._resize(true);
                  that._redrawChildren();
                }, 100);
              });
              dt.on("draw.dtr", function() {
                that._redrawChildren();
              });
              $(dt.table().node()).addClass("dtr-" + details.type);
            }
            dt.on("column-reorder.dtr", function(e, settings, details2) {
              that._classLogic();
              that._resizeAuto();
              that._resize(true);
            });
            dt.on("column-sizing.dtr", function() {
              that._resizeAuto();
              that._resize();
            });
            dt.on("preXhr.dtr", function() {
              var rowIds = [];
              dt.rows().every(function() {
                if (this.child.isShown()) {
                  rowIds.push(this.id(true));
                }
              });
              dt.one("draw.dtr", function() {
                that._resizeAuto();
                that._resize();
                dt.rows(rowIds).every(function() {
                  that._detailsDisplay(this, false);
                });
              });
            });
            dt.on("draw.dtr", function() {
              that._controlClass();
            }).on("init.dtr", function(e, settings, details2) {
              if (e.namespace !== "dt") {
                return;
              }
              that._resizeAuto();
              that._resize();
              if ($.inArray(false, that.s.current)) {
                dt.columns.adjust();
              }
            });
            this._resize();
          },
          _columnsVisiblity: function(breakpoint) {
            var dt = this.s.dt;
            var columns = this.s.columns;
            var i, ien;
            var order = columns.map(function(col, idx) {
              return {
                columnIdx: idx,
                priority: col.priority
              };
            }).sort(function(a, b) {
              if (a.priority !== b.priority) {
                return a.priority - b.priority;
              }
              return a.columnIdx - b.columnIdx;
            });
            var display = $.map(columns, function(col, i2) {
              if (dt.column(i2).visible() === false) {
                return "not-visible";
              }
              return col.auto && col.minWidth === null ? false : col.auto === true ? "-" : $.inArray(breakpoint, col.includeIn) !== -1;
            });
            var requiredWidth = 0;
            for (i = 0, ien = display.length; i < ien; i++) {
              if (display[i] === true) {
                requiredWidth += columns[i].minWidth;
              }
            }
            var scrolling = dt.settings()[0].oScroll;
            var bar = scrolling.sY || scrolling.sX ? scrolling.iBarWidth : 0;
            var widthAvailable = dt.table().container().offsetWidth - bar;
            var usedWidth = widthAvailable - requiredWidth;
            for (i = 0, ien = display.length; i < ien; i++) {
              if (columns[i].control) {
                usedWidth -= columns[i].minWidth;
              }
            }
            var empty = false;
            for (i = 0, ien = order.length; i < ien; i++) {
              var colIdx = order[i].columnIdx;
              if (display[colIdx] === "-" && !columns[colIdx].control && columns[colIdx].minWidth) {
                if (empty || usedWidth - columns[colIdx].minWidth < 0) {
                  empty = true;
                  display[colIdx] = false;
                } else {
                  display[colIdx] = true;
                }
                usedWidth -= columns[colIdx].minWidth;
              }
            }
            var showControl = false;
            for (i = 0, ien = columns.length; i < ien; i++) {
              if (!columns[i].control && !columns[i].never && display[i] === false) {
                showControl = true;
                break;
              }
            }
            for (i = 0, ien = columns.length; i < ien; i++) {
              if (columns[i].control) {
                display[i] = showControl;
              }
              if (display[i] === "not-visible") {
                display[i] = false;
              }
            }
            if ($.inArray(true, display) === -1) {
              display[0] = true;
            }
            return display;
          },
          _classLogic: function() {
            var that = this;
            var calc = {};
            var breakpoints = this.c.breakpoints;
            var dt = this.s.dt;
            var columns = dt.columns().eq(0).map(function(i) {
              var column2 = this.column(i);
              var className = column2.header().className;
              var priority = dt.settings()[0].aoColumns[i].responsivePriority;
              var dataPriority = column2.header().getAttribute("data-priority");
              if (priority === undefined2) {
                priority = dataPriority === undefined2 || dataPriority === null ? 1e4 : dataPriority * 1;
              }
              return {
                className,
                includeIn: [],
                auto: false,
                control: false,
                never: className.match(/\bnever\b/) ? true : false,
                priority
              };
            });
            var add2 = function(colIdx, name) {
              var includeIn = columns[colIdx].includeIn;
              if ($.inArray(name, includeIn) === -1) {
                includeIn.push(name);
              }
            };
            var column = function(colIdx, name, operator, matched) {
              var size, i, ien;
              if (!operator) {
                columns[colIdx].includeIn.push(name);
              } else if (operator === "max-") {
                size = that._find(name).width;
                for (i = 0, ien = breakpoints.length; i < ien; i++) {
                  if (breakpoints[i].width <= size) {
                    add2(colIdx, breakpoints[i].name);
                  }
                }
              } else if (operator === "min-") {
                size = that._find(name).width;
                for (i = 0, ien = breakpoints.length; i < ien; i++) {
                  if (breakpoints[i].width >= size) {
                    add2(colIdx, breakpoints[i].name);
                  }
                }
              } else if (operator === "not-") {
                for (i = 0, ien = breakpoints.length; i < ien; i++) {
                  if (breakpoints[i].name.indexOf(matched) === -1) {
                    add2(colIdx, breakpoints[i].name);
                  }
                }
              }
            };
            columns.each(function(col, i) {
              var classNames = col.className.split(" ");
              var hasClass = false;
              for (var k = 0, ken = classNames.length; k < ken; k++) {
                var className = classNames[k].trim();
                if (className === "all") {
                  hasClass = true;
                  col.includeIn = $.map(breakpoints, function(a) {
                    return a.name;
                  });
                  return;
                } else if (className === "none" || col.never) {
                  hasClass = true;
                  return;
                } else if (className === "control" || className === "dtr-control") {
                  hasClass = true;
                  col.control = true;
                  return;
                }
                $.each(breakpoints, function(j, breakpoint) {
                  var brokenPoint = breakpoint.name.split("-");
                  var re = new RegExp("(min\\-|max\\-|not\\-)?(" + brokenPoint[0] + ")(\\-[_a-zA-Z0-9])?");
                  var match = className.match(re);
                  if (match) {
                    hasClass = true;
                    if (match[2] === brokenPoint[0] && match[3] === "-" + brokenPoint[1]) {
                      column(i, breakpoint.name, match[1], match[2] + match[3]);
                    } else if (match[2] === brokenPoint[0] && !match[3]) {
                      column(i, breakpoint.name, match[1], match[2]);
                    }
                  }
                });
              }
              if (!hasClass) {
                col.auto = true;
              }
            });
            this.s.columns = columns;
          },
          _controlClass: function() {
            if (this.c.details.type === "inline") {
              var dt = this.s.dt;
              var columnsVis = this.s.current;
              var firstVisible = $.inArray(true, columnsVis);
              dt.cells(null, function(idx) {
                return idx !== firstVisible;
              }, { page: "current" }).nodes().to$().filter(".dtr-control").removeClass("dtr-control");
              dt.cells(null, firstVisible, { page: "current" }).nodes().to$().addClass("dtr-control");
            }
          },
          _detailsDisplay: function(row, update) {
            var that = this;
            var dt = this.s.dt;
            var details = this.c.details;
            if (details && details.type !== false) {
              var res = details.display(row, update, function() {
                return details.renderer(dt, row[0], that._detailsObj(row[0]));
              });
              if (res === true || res === false) {
                $(dt.table().node()).triggerHandler("responsive-display.dt", [dt, row, res, update]);
              }
            }
          },
          _detailsInit: function() {
            var that = this;
            var dt = this.s.dt;
            var details = this.c.details;
            if (details.type === "inline") {
              details.target = "td.dtr-control, th.dtr-control";
            }
            dt.on("draw.dtr", function() {
              that._tabIndexes();
            });
            that._tabIndexes();
            $(dt.table().body()).on("keyup.dtr", "td, th", function(e) {
              if (e.keyCode === 13 && $(this).data("dtr-keyboard")) {
                $(this).click();
              }
            });
            var target = details.target;
            var selector = typeof target === "string" ? target : "td, th";
            if (target !== undefined2 || target !== null) {
              $(dt.table().body()).on("click.dtr mousedown.dtr mouseup.dtr", selector, function(e) {
                if (!$(dt.table().node()).hasClass("collapsed")) {
                  return;
                }
                if ($.inArray($(this).closest("tr").get(0), dt.rows().nodes().toArray()) === -1) {
                  return;
                }
                if (typeof target === "number") {
                  var targetIdx = target < 0 ? dt.columns().eq(0).length + target : target;
                  if (dt.cell(this).index().column !== targetIdx) {
                    return;
                  }
                }
                var row = dt.row($(this).closest("tr"));
                if (e.type === "click") {
                  that._detailsDisplay(row, false);
                } else if (e.type === "mousedown") {
                  $(this).css("outline", "none");
                } else if (e.type === "mouseup") {
                  $(this).trigger("blur").css("outline", "");
                }
              });
            }
          },
          _detailsObj: function(rowIdx) {
            var that = this;
            var dt = this.s.dt;
            return $.map(this.s.columns, function(col, i) {
              if (col.never || col.control) {
                return;
              }
              var dtCol = dt.settings()[0].aoColumns[i];
              return {
                className: dtCol.sClass,
                columnIndex: i,
                data: dt.cell(rowIdx, i).render(that.c.orthogonal),
                hidden: dt.column(i).visible() && !that.s.current[i],
                rowIndex: rowIdx,
                title: dtCol.sTitle !== null ? dtCol.sTitle : $(dt.column(i).header()).text()
              };
            });
          },
          _find: function(name) {
            var breakpoints = this.c.breakpoints;
            for (var i = 0, ien = breakpoints.length; i < ien; i++) {
              if (breakpoints[i].name === name) {
                return breakpoints[i];
              }
            }
          },
          _redrawChildren: function() {
            var that = this;
            var dt = this.s.dt;
            dt.rows({ page: "current" }).iterator("row", function(settings, idx) {
              var row = dt.row(idx);
              that._detailsDisplay(dt.row(idx), true);
            });
          },
          _resize: function(forceRedraw) {
            var that = this;
            var dt = this.s.dt;
            var width = $(window2).innerWidth();
            var breakpoints = this.c.breakpoints;
            var breakpoint = breakpoints[0].name;
            var columns = this.s.columns;
            var i, ien;
            var oldVis = this.s.current.slice();
            for (i = breakpoints.length - 1; i >= 0; i--) {
              if (width <= breakpoints[i].width) {
                breakpoint = breakpoints[i].name;
                break;
              }
            }
            var columnsVis = this._columnsVisiblity(breakpoint);
            this.s.current = columnsVis;
            var collapsedClass = false;
            for (i = 0, ien = columns.length; i < ien; i++) {
              if (columnsVis[i] === false && !columns[i].never && !columns[i].control && !dt.column(i).visible() === false) {
                collapsedClass = true;
                break;
              }
            }
            $(dt.table().node()).toggleClass("collapsed", collapsedClass);
            var changed = false;
            var visible = 0;
            dt.columns().eq(0).each(function(colIdx, i2) {
              if (columnsVis[i2] === true) {
                visible++;
              }
              if (forceRedraw || columnsVis[i2] !== oldVis[i2]) {
                changed = true;
                that._setColumnVis(colIdx, columnsVis[i2]);
              }
            });
            if (changed) {
              this._redrawChildren();
              $(dt.table().node()).trigger("responsive-resize.dt", [dt, this.s.current]);
              if (dt.page.info().recordsDisplay === 0) {
                $("td", dt.table().body()).eq(0).attr("colspan", visible);
              }
            }
            that._controlClass();
          },
          _resizeAuto: function() {
            var dt = this.s.dt;
            var columns = this.s.columns;
            if (!this.c.auto) {
              return;
            }
            if ($.inArray(true, $.map(columns, function(c) {
              return c.auto;
            })) === -1) {
              return;
            }
            if (!$.isEmptyObject(_childNodeStore)) {
              $.each(_childNodeStore, function(key) {
                var idx = key.split("-");
                _childNodesRestore(dt, idx[0] * 1, idx[1] * 1);
              });
            }
            var tableWidth = dt.table().node().offsetWidth;
            var columnWidths = dt.columns;
            var clonedTable = dt.table().node().cloneNode(false);
            var clonedHeader = $(dt.table().header().cloneNode(false)).appendTo(clonedTable);
            var clonedBody = $(dt.table().body()).clone(false, false).empty().appendTo(clonedTable);
            clonedTable.style.width = "auto";
            var headerCells = dt.columns().header().filter(function(idx) {
              return dt.column(idx).visible();
            }).to$().clone(false).css("display", "table-cell").css("width", "auto").css("min-width", 0);
            $(clonedBody).append($(dt.rows({ page: "current" }).nodes()).clone(false)).find("th, td").css("display", "");
            var footer = dt.table().footer();
            if (footer) {
              var clonedFooter = $(footer.cloneNode(false)).appendTo(clonedTable);
              var footerCells = dt.columns().footer().filter(function(idx) {
                return dt.column(idx).visible();
              }).to$().clone(false).css("display", "table-cell");
              $("<tr/>").append(footerCells).appendTo(clonedFooter);
            }
            $("<tr/>").append(headerCells).appendTo(clonedHeader);
            if (this.c.details.type === "inline") {
              $(clonedTable).addClass("dtr-inline collapsed");
            }
            $(clonedTable).find("[name]").removeAttr("name");
            $(clonedTable).css("position", "relative");
            var inserted = $("<div/>").css({
              width: 1,
              height: 1,
              overflow: "hidden",
              clear: "both"
            }).append(clonedTable);
            inserted.insertBefore(dt.table().node());
            headerCells.each(function(i) {
              var idx = dt.column.index("fromVisible", i);
              columns[idx].minWidth = this.offsetWidth || 0;
            });
            inserted.remove();
          },
          _responsiveOnlyHidden: function() {
            var dt = this.s.dt;
            return $.map(this.s.current, function(v, i) {
              if (dt.column(i).visible() === false) {
                return true;
              }
              return v;
            });
          },
          _setColumnVis: function(col, showHide) {
            var dt = this.s.dt;
            var display = showHide ? "" : "none";
            $(dt.column(col).header()).css("display", display);
            $(dt.column(col).footer()).css("display", display);
            dt.column(col).nodes().to$().css("display", display);
            if (!$.isEmptyObject(_childNodeStore)) {
              dt.cells(null, col).indexes().each(function(idx) {
                _childNodesRestore(dt, idx.row, idx.column);
              });
            }
          },
          _tabIndexes: function() {
            var dt = this.s.dt;
            var cells = dt.cells({ page: "current" }).nodes().to$();
            var ctx = dt.settings()[0];
            var target = this.c.details.target;
            cells.filter("[data-dtr-keyboard]").removeData("[data-dtr-keyboard]");
            if (typeof target === "number") {
              dt.cells(null, target, { page: "current" }).nodes().to$().attr("tabIndex", ctx.iTabIndex).data("dtr-keyboard", 1);
            } else {
              if (target === "td:first-child, th:first-child") {
                target = ">td:first-child, >th:first-child";
              }
              $(target, dt.rows({ page: "current" }).nodes()).attr("tabIndex", ctx.iTabIndex).data("dtr-keyboard", 1);
            }
          }
        });
        Responsive.breakpoints = [
          { name: "desktop", width: Infinity },
          { name: "tablet-l", width: 1024 },
          { name: "tablet-p", width: 768 },
          { name: "mobile-l", width: 480 },
          { name: "mobile-p", width: 320 }
        ];
        Responsive.display = {
          childRow: function(row, update, render) {
            if (update) {
              if ($(row.node()).hasClass("parent")) {
                row.child(render(), "child").show();
                return true;
              }
            } else {
              if (!row.child.isShown()) {
                row.child(render(), "child").show();
                $(row.node()).addClass("parent");
                return true;
              } else {
                row.child(false);
                $(row.node()).removeClass("parent");
                return false;
              }
            }
          },
          childRowImmediate: function(row, update, render) {
            if (!update && row.child.isShown() || !row.responsive.hasHidden()) {
              row.child(false);
              $(row.node()).removeClass("parent");
              return false;
            } else {
              row.child(render(), "child").show();
              $(row.node()).addClass("parent");
              return true;
            }
          },
          modal: function(options) {
            return function(row, update, render) {
              if (!update) {
                var close = function() {
                  modal.remove();
                  $(document2).off("keypress.dtr");
                };
                var modal = $('<div class="dtr-modal"/>').append($('<div class="dtr-modal-display"/>').append($('<div class="dtr-modal-content"/>').append(render())).append($('<div class="dtr-modal-close">&times;</div>').click(function() {
                  close();
                }))).append($('<div class="dtr-modal-background"/>').click(function() {
                  close();
                })).appendTo("body");
                $(document2).on("keyup.dtr", function(e) {
                  if (e.keyCode === 27) {
                    e.stopPropagation();
                    close();
                  }
                });
              } else {
                $("div.dtr-modal-content").empty().append(render());
              }
              if (options && options.header) {
                $("div.dtr-modal-content").prepend("<h2>" + options.header(row) + "</h2>");
              }
            };
          }
        };
        var _childNodeStore = {};
        function _childNodes(dt, row, col) {
          var name = row + "-" + col;
          if (_childNodeStore[name]) {
            return _childNodeStore[name];
          }
          var nodes = [];
          var children = dt.cell(row, col).node().childNodes;
          for (var i = 0, ien = children.length; i < ien; i++) {
            nodes.push(children[i]);
          }
          _childNodeStore[name] = nodes;
          return nodes;
        }
        function _childNodesRestore(dt, row, col) {
          var name = row + "-" + col;
          if (!_childNodeStore[name]) {
            return;
          }
          var node = dt.cell(row, col).node();
          var store = _childNodeStore[name];
          var parent = store[0].parentNode;
          var parentChildren = parent.childNodes;
          var a = [];
          for (var i = 0, ien = parentChildren.length; i < ien; i++) {
            a.push(parentChildren[i]);
          }
          for (var j = 0, jen = a.length; j < jen; j++) {
            node.appendChild(a[j]);
          }
          _childNodeStore[name] = undefined2;
        }
        Responsive.renderer = {
          listHiddenNodes: function() {
            return function(api, rowIdx, columns) {
              var ul = $('<ul data-dtr-index="' + rowIdx + '" class="dtr-details"/>');
              var found = false;
              var data = $.each(columns, function(i, col) {
                if (col.hidden) {
                  var klass = col.className ? 'class="' + col.className + '"' : "";
                  $("<li " + klass + ' data-dtr-index="' + col.columnIndex + '" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '"><span class="dtr-title">' + col.title + "</span> </li>").append($('<span class="dtr-data"/>').append(_childNodes(api, col.rowIndex, col.columnIndex))).appendTo(ul);
                  found = true;
                }
              });
              return found ? ul : false;
            };
          },
          listHidden: function() {
            return function(api, rowIdx, columns) {
              var data = $.map(columns, function(col) {
                var klass = col.className ? 'class="' + col.className + '"' : "";
                return col.hidden ? "<li " + klass + ' data-dtr-index="' + col.columnIndex + '" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '"><span class="dtr-title">' + col.title + '</span> <span class="dtr-data">' + col.data + "</span></li>" : "";
              }).join("");
              return data ? $('<ul data-dtr-index="' + rowIdx + '" class="dtr-details"/>').append(data) : false;
            };
          },
          tableAll: function(options) {
            options = $.extend({
              tableClass: ""
            }, options);
            return function(api, rowIdx, columns) {
              var data = $.map(columns, function(col) {
                var klass = col.className ? 'class="' + col.className + '"' : "";
                return "<tr " + klass + ' data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '"><td>' + col.title + ":</td> <td>" + col.data + "</td></tr>";
              }).join("");
              return $('<table class="' + options.tableClass + ' dtr-details" width="100%"/>').append(data);
            };
          }
        };
        Responsive.defaults = {
          breakpoints: Responsive.breakpoints,
          auto: true,
          details: {
            display: Responsive.display.childRow,
            renderer: Responsive.renderer.listHidden(),
            target: 0,
            type: "inline"
          },
          orthogonal: "display"
        };
        var Api = $.fn.dataTable.Api;
        Api.register("responsive()", function() {
          return this;
        });
        Api.register("responsive.index()", function(li) {
          li = $(li);
          return {
            column: li.data("dtr-index"),
            row: li.parent().data("dtr-index")
          };
        });
        Api.register("responsive.rebuild()", function() {
          return this.iterator("table", function(ctx) {
            if (ctx._responsive) {
              ctx._responsive._classLogic();
            }
          });
        });
        Api.register("responsive.recalc()", function() {
          return this.iterator("table", function(ctx) {
            if (ctx._responsive) {
              ctx._responsive._resizeAuto();
              ctx._responsive._resize();
            }
          });
        });
        Api.register("responsive.hasHidden()", function() {
          var ctx = this.context[0];
          return ctx._responsive ? $.inArray(false, ctx._responsive._responsiveOnlyHidden()) !== -1 : false;
        });
        Api.registerPlural("columns().responsiveHidden()", "column().responsiveHidden()", function() {
          return this.iterator("column", function(settings, column) {
            return settings._responsive ? settings._responsive._responsiveOnlyHidden()[column] : false;
          }, 1);
        });
        Responsive.version = "2.2.9";
        $.fn.dataTable.Responsive = Responsive;
        $.fn.DataTable.Responsive = Responsive;
        $(document2).on("preInit.dt.dtr", function(e, settings, json) {
          if (e.namespace !== "dt") {
            return;
          }
          if ($(settings.nTable).hasClass("responsive") || $(settings.nTable).hasClass("dt-responsive") || settings.oInit.responsive || DataTable2.defaults.responsive) {
            var init = settings.oInit.responsive;
            if (init !== false) {
              new Responsive(settings, $.isPlainObject(init) ? init : {});
            }
          }
        });
        return Responsive;
      });
    }
  });

  // node_modules/datatables.net-select/js/dataTables.select.js
  var require_dataTables_select = __commonJS({
    "node_modules/datatables.net-select/js/dataTables.select.js"(exports, module) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["jquery", "datatables.net"], function($) {
            return factory($, window, document);
          });
        } else if (typeof exports === "object") {
          module.exports = function(root, $) {
            if (!root) {
              root = window;
            }
            if (!$ || !$.fn.dataTable) {
              $ = require_jquery_dataTables()(root, $).$;
            }
            return factory($, root, root.document);
          };
        } else {
          factory(jQuery, window, document);
        }
      })(function($, window2, document2, undefined2) {
        "use strict";
        var DataTable2 = $.fn.dataTable;
        DataTable2.select = {};
        DataTable2.select.version = "1.3.4-dev";
        DataTable2.select.init = function(dt) {
          var ctx = dt.settings()[0];
          if (ctx._select) {
            return;
          }
          var savedSelected = dt.state.loaded();
          var selectAndSave = function(e, settings, data) {
            if (data === null || data.select === undefined2) {
              return;
            }
            dt.rows().deselect();
            dt.columns().deselect();
            dt.cells().deselect();
            if (data.select.rows !== undefined2) {
              dt.rows(data.select.rows).select();
            }
            if (data.select.columns !== undefined2) {
              dt.columns(data.select.columns).select();
            }
            if (data.select.cells !== undefined2) {
              for (var i = 0; i < data.select.cells.length; i++) {
                dt.cell(data.select.cells[i].row, data.select.cells[i].column).select();
              }
            }
            dt.state.save();
          };
          dt.one("init", function() {
            dt.on("stateSaveParams", function(e, settings, data) {
              data.select = {};
              data.select.rows = dt.rows({ selected: true }).ids(true).toArray();
              data.select.columns = dt.columns({ selected: true })[0];
              data.select.cells = dt.cells({ selected: true })[0].map(function(coords) {
                return { row: dt.row(coords.row).id(true), column: coords.column };
              });
            });
            selectAndSave(undefined2, undefined2, savedSelected);
            dt.on("stateLoaded stateLoadParams", selectAndSave);
          });
          var init2 = ctx.oInit.select;
          var defaults = DataTable2.defaults.select;
          var opts = init2 === undefined2 ? defaults : init2;
          var items = "row";
          var style = "api";
          var blurable = false;
          var toggleable = true;
          var info2 = true;
          var selector = "td, th";
          var className = "selected";
          var setStyle = false;
          ctx._select = {};
          if (opts === true) {
            style = "os";
            setStyle = true;
          } else if (typeof opts === "string") {
            style = opts;
            setStyle = true;
          } else if ($.isPlainObject(opts)) {
            if (opts.blurable !== undefined2) {
              blurable = opts.blurable;
            }
            if (opts.toggleable !== undefined2) {
              toggleable = opts.toggleable;
            }
            if (opts.info !== undefined2) {
              info2 = opts.info;
            }
            if (opts.items !== undefined2) {
              items = opts.items;
            }
            if (opts.style !== undefined2) {
              style = opts.style;
              setStyle = true;
            } else {
              style = "os";
              setStyle = true;
            }
            if (opts.selector !== undefined2) {
              selector = opts.selector;
            }
            if (opts.className !== undefined2) {
              className = opts.className;
            }
          }
          dt.select.selector(selector);
          dt.select.items(items);
          dt.select.style(style);
          dt.select.blurable(blurable);
          dt.select.toggleable(toggleable);
          dt.select.info(info2);
          ctx._select.className = className;
          $.fn.dataTable.ext.order["select-checkbox"] = function(settings, col) {
            return this.api().column(col, { order: "index" }).nodes().map(function(td) {
              if (settings._select.items === "row") {
                return $(td).parent().hasClass(settings._select.className);
              } else if (settings._select.items === "cell") {
                return $(td).hasClass(settings._select.className);
              }
              return false;
            });
          };
          if (!setStyle && $(dt.table().node()).hasClass("selectable")) {
            dt.select.style("os");
          }
        };
        function cellRange(dt, idx, last) {
          var indexes;
          var columnIndexes;
          var rowIndexes;
          var selectColumns = function(start2, end) {
            if (start2 > end) {
              var tmp = end;
              end = start2;
              start2 = tmp;
            }
            var record = false;
            return dt.columns(":visible").indexes().filter(function(i) {
              if (i === start2) {
                record = true;
              }
              if (i === end) {
                record = false;
                return true;
              }
              return record;
            });
          };
          var selectRows = function(start2, end) {
            var indexes2 = dt.rows({ search: "applied" }).indexes();
            if (indexes2.indexOf(start2) > indexes2.indexOf(end)) {
              var tmp = end;
              end = start2;
              start2 = tmp;
            }
            var record = false;
            return indexes2.filter(function(i) {
              if (i === start2) {
                record = true;
              }
              if (i === end) {
                record = false;
                return true;
              }
              return record;
            });
          };
          if (!dt.cells({ selected: true }).any() && !last) {
            columnIndexes = selectColumns(0, idx.column);
            rowIndexes = selectRows(0, idx.row);
          } else {
            columnIndexes = selectColumns(last.column, idx.column);
            rowIndexes = selectRows(last.row, idx.row);
          }
          indexes = dt.cells(rowIndexes, columnIndexes).flatten();
          if (!dt.cells(idx, { selected: true }).any()) {
            dt.cells(indexes).select();
          } else {
            dt.cells(indexes).deselect();
          }
        }
        function disableMouseSelection(dt) {
          var ctx = dt.settings()[0];
          var selector = ctx._select.selector;
          $(dt.table().container()).off("mousedown.dtSelect", selector).off("mouseup.dtSelect", selector).off("click.dtSelect", selector);
          $("body").off("click.dtSelect" + _safeId(dt.table().node()));
        }
        function enableMouseSelection(dt) {
          var container = $(dt.table().container());
          var ctx = dt.settings()[0];
          var selector = ctx._select.selector;
          var matchSelection;
          container.on("mousedown.dtSelect", selector, function(e) {
            if (e.shiftKey || e.metaKey || e.ctrlKey) {
              container.css("-moz-user-select", "none").one("selectstart.dtSelect", selector, function() {
                return false;
              });
            }
            if (window2.getSelection) {
              matchSelection = window2.getSelection();
            }
          }).on("mouseup.dtSelect", selector, function() {
            container.css("-moz-user-select", "");
          }).on("click.dtSelect", selector, function(e) {
            var items = dt.select.items();
            var idx;
            if (matchSelection) {
              var selection = window2.getSelection();
              if (!selection.anchorNode || $(selection.anchorNode).closest("table")[0] === dt.table().node()) {
                if (selection !== matchSelection) {
                  return;
                }
              }
            }
            var ctx2 = dt.settings()[0];
            var wrapperClass = dt.settings()[0].oClasses.sWrapper.trim().replace(/ +/g, ".");
            if ($(e.target).closest("div." + wrapperClass)[0] != dt.table().container()) {
              return;
            }
            var cell = dt.cell($(e.target).closest("td, th"));
            if (!cell.any()) {
              return;
            }
            var event = $.Event("user-select.dt");
            eventTrigger(dt, event, [items, cell, e]);
            if (event.isDefaultPrevented()) {
              return;
            }
            var cellIndex = cell.index();
            if (items === "row") {
              idx = cellIndex.row;
              typeSelect(e, dt, ctx2, "row", idx);
            } else if (items === "column") {
              idx = cell.index().column;
              typeSelect(e, dt, ctx2, "column", idx);
            } else if (items === "cell") {
              idx = cell.index();
              typeSelect(e, dt, ctx2, "cell", idx);
            }
            ctx2._select_lastCell = cellIndex;
          });
          $("body").on("click.dtSelect" + _safeId(dt.table().node()), function(e) {
            if (ctx._select.blurable) {
              if ($(e.target).parents().filter(dt.table().container()).length) {
                return;
              }
              if ($(e.target).parents("html").length === 0) {
                return;
              }
              if ($(e.target).parents("div.DTE").length) {
                return;
              }
              clear(ctx, true);
            }
          });
        }
        function eventTrigger(api, type, args, any) {
          if (any && !api.flatten().length) {
            return;
          }
          if (typeof type === "string") {
            type = type + ".dt";
          }
          args.unshift(api);
          $(api.table().node()).trigger(type, args);
        }
        function info(api) {
          var ctx = api.settings()[0];
          if (!ctx._select.info || !ctx.aanFeatures.i) {
            return;
          }
          if (api.select.style() === "api") {
            return;
          }
          var rows = api.rows({ selected: true }).flatten().length;
          var columns = api.columns({ selected: true }).flatten().length;
          var cells = api.cells({ selected: true }).flatten().length;
          var add2 = function(el, name, num) {
            el.append($('<span class="select-item"/>').append(api.i18n("select." + name + "s", { _: "%d " + name + "s selected", 0: "", 1: "1 " + name + " selected" }, num)));
          };
          $.each(ctx.aanFeatures.i, function(i, el) {
            el = $(el);
            var output = $('<span class="select-info"/>');
            add2(output, "row", rows);
            add2(output, "column", columns);
            add2(output, "cell", cells);
            var exisiting = el.children("span.select-info");
            if (exisiting.length) {
              exisiting.remove();
            }
            if (output.text() !== "") {
              el.append(output);
            }
          });
        }
        function init(ctx) {
          var api = new DataTable2.Api(ctx);
          ctx._select_init = true;
          ctx.aoRowCreatedCallback.push({
            fn: function(row, data, index) {
              var i, ien;
              var d = ctx.aoData[index];
              if (d._select_selected) {
                $(row).addClass(ctx._select.className);
              }
              for (i = 0, ien = ctx.aoColumns.length; i < ien; i++) {
                if (ctx.aoColumns[i]._select_selected || d._selected_cells && d._selected_cells[i]) {
                  $(d.anCells[i]).addClass(ctx._select.className);
                }
              }
            },
            sName: "select-deferRender"
          });
          api.on("preXhr.dt.dtSelect", function(e, settings) {
            if (settings !== api.settings()[0]) {
              return;
            }
            var rows = api.rows({ selected: true }).ids(true).filter(function(d) {
              return d !== undefined2;
            });
            var cells = api.cells({ selected: true }).eq(0).map(function(cellIdx) {
              var id = api.row(cellIdx.row).id(true);
              return id ? { row: id, column: cellIdx.column } : undefined2;
            }).filter(function(d) {
              return d !== undefined2;
            });
            api.one("draw.dt.dtSelect", function() {
              api.rows(rows).select();
              if (cells.any()) {
                cells.each(function(id) {
                  api.cells(id.row, id.column).select();
                });
              }
            });
          });
          api.on("draw.dtSelect.dt select.dtSelect.dt deselect.dtSelect.dt info.dt", function() {
            info(api);
            api.state.save();
          });
          api.on("destroy.dtSelect", function() {
            api.rows({ selected: true }).deselect();
            disableMouseSelection(api);
            api.off(".dtSelect");
            $("body").off(".dtSelect" + _safeId(api.table().node()));
          });
        }
        function rowColumnRange(dt, type, idx, last) {
          var indexes = dt[type + "s"]({ search: "applied" }).indexes();
          var idx1 = $.inArray(last, indexes);
          var idx2 = $.inArray(idx, indexes);
          if (!dt[type + "s"]({ selected: true }).any() && idx1 === -1) {
            indexes.splice($.inArray(idx, indexes) + 1, indexes.length);
          } else {
            if (idx1 > idx2) {
              var tmp = idx2;
              idx2 = idx1;
              idx1 = tmp;
            }
            indexes.splice(idx2 + 1, indexes.length);
            indexes.splice(0, idx1);
          }
          if (!dt[type](idx, { selected: true }).any()) {
            dt[type + "s"](indexes).select();
          } else {
            indexes.splice($.inArray(idx, indexes), 1);
            dt[type + "s"](indexes).deselect();
          }
        }
        function clear(ctx, force) {
          if (force || ctx._select.style === "single") {
            var api = new DataTable2.Api(ctx);
            api.rows({ selected: true }).deselect();
            api.columns({ selected: true }).deselect();
            api.cells({ selected: true }).deselect();
          }
        }
        function typeSelect(e, dt, ctx, type, idx) {
          var style = dt.select.style();
          var toggleable = dt.select.toggleable();
          var isSelected = dt[type](idx, { selected: true }).any();
          if (isSelected && !toggleable) {
            return;
          }
          if (style === "os") {
            if (e.ctrlKey || e.metaKey) {
              dt[type](idx).select(!isSelected);
            } else if (e.shiftKey) {
              if (type === "cell") {
                cellRange(dt, idx, ctx._select_lastCell || null);
              } else {
                rowColumnRange(dt, type, idx, ctx._select_lastCell ? ctx._select_lastCell[type] : null);
              }
            } else {
              var selected = dt[type + "s"]({ selected: true });
              if (isSelected && selected.flatten().length === 1) {
                dt[type](idx).deselect();
              } else {
                selected.deselect();
                dt[type](idx).select();
              }
            }
          } else if (style == "multi+shift") {
            if (e.shiftKey) {
              if (type === "cell") {
                cellRange(dt, idx, ctx._select_lastCell || null);
              } else {
                rowColumnRange(dt, type, idx, ctx._select_lastCell ? ctx._select_lastCell[type] : null);
              }
            } else {
              dt[type](idx).select(!isSelected);
            }
          } else {
            dt[type](idx).select(!isSelected);
          }
        }
        function _safeId(node) {
          return node.id.replace(/[^a-zA-Z0-9\-\_]/g, "-");
        }
        $.each([
          { type: "row", prop: "aoData" },
          { type: "column", prop: "aoColumns" }
        ], function(i, o) {
          DataTable2.ext.selector[o.type].push(function(settings, opts, indexes) {
            var selected = opts.selected;
            var data;
            var out = [];
            if (selected !== true && selected !== false) {
              return indexes;
            }
            for (var i2 = 0, ien = indexes.length; i2 < ien; i2++) {
              data = settings[o.prop][indexes[i2]];
              if (selected === true && data._select_selected === true || selected === false && !data._select_selected) {
                out.push(indexes[i2]);
              }
            }
            return out;
          });
        });
        DataTable2.ext.selector.cell.push(function(settings, opts, cells) {
          var selected = opts.selected;
          var rowData;
          var out = [];
          if (selected === undefined2) {
            return cells;
          }
          for (var i = 0, ien = cells.length; i < ien; i++) {
            rowData = settings.aoData[cells[i].row];
            if (selected === true && rowData._selected_cells && rowData._selected_cells[cells[i].column] === true || selected === false && (!rowData._selected_cells || !rowData._selected_cells[cells[i].column])) {
              out.push(cells[i]);
            }
          }
          return out;
        });
        var apiRegister = DataTable2.Api.register;
        var apiRegisterPlural = DataTable2.Api.registerPlural;
        apiRegister("select()", function() {
          return this.iterator("table", function(ctx) {
            DataTable2.select.init(new DataTable2.Api(ctx));
          });
        });
        apiRegister("select.blurable()", function(flag) {
          if (flag === undefined2) {
            return this.context[0]._select.blurable;
          }
          return this.iterator("table", function(ctx) {
            ctx._select.blurable = flag;
          });
        });
        apiRegister("select.toggleable()", function(flag) {
          if (flag === undefined2) {
            return this.context[0]._select.toggleable;
          }
          return this.iterator("table", function(ctx) {
            ctx._select.toggleable = flag;
          });
        });
        apiRegister("select.info()", function(flag) {
          if (flag === undefined2) {
            return this.context[0]._select.info;
          }
          return this.iterator("table", function(ctx) {
            ctx._select.info = flag;
          });
        });
        apiRegister("select.items()", function(items) {
          if (items === undefined2) {
            return this.context[0]._select.items;
          }
          return this.iterator("table", function(ctx) {
            ctx._select.items = items;
            eventTrigger(new DataTable2.Api(ctx), "selectItems", [items]);
          });
        });
        apiRegister("select.style()", function(style) {
          if (style === undefined2) {
            return this.context[0]._select.style;
          }
          return this.iterator("table", function(ctx) {
            if (!ctx._select) {
              DataTable2.select.init(new DataTable2.Api(ctx));
            }
            if (!ctx._select_init) {
              init(ctx);
            }
            ctx._select.style = style;
            var dt = new DataTable2.Api(ctx);
            disableMouseSelection(dt);
            if (style !== "api") {
              enableMouseSelection(dt);
            }
            eventTrigger(new DataTable2.Api(ctx), "selectStyle", [style]);
          });
        });
        apiRegister("select.selector()", function(selector) {
          if (selector === undefined2) {
            return this.context[0]._select.selector;
          }
          return this.iterator("table", function(ctx) {
            disableMouseSelection(new DataTable2.Api(ctx));
            ctx._select.selector = selector;
            if (ctx._select.style !== "api") {
              enableMouseSelection(new DataTable2.Api(ctx));
            }
          });
        });
        apiRegisterPlural("rows().select()", "row().select()", function(select) {
          var api = this;
          if (select === false) {
            return this.deselect();
          }
          this.iterator("row", function(ctx, idx) {
            clear(ctx);
            ctx.aoData[idx]._select_selected = true;
            $(ctx.aoData[idx].nTr).addClass(ctx._select.className);
          });
          this.iterator("table", function(ctx, i) {
            eventTrigger(api, "select", ["row", api[i]], true);
          });
          return this;
        });
        apiRegisterPlural("columns().select()", "column().select()", function(select) {
          var api = this;
          if (select === false) {
            return this.deselect();
          }
          this.iterator("column", function(ctx, idx) {
            clear(ctx);
            ctx.aoColumns[idx]._select_selected = true;
            var column = new DataTable2.Api(ctx).column(idx);
            $(column.header()).addClass(ctx._select.className);
            $(column.footer()).addClass(ctx._select.className);
            column.nodes().to$().addClass(ctx._select.className);
          });
          this.iterator("table", function(ctx, i) {
            eventTrigger(api, "select", ["column", api[i]], true);
          });
          return this;
        });
        apiRegisterPlural("cells().select()", "cell().select()", function(select) {
          var api = this;
          if (select === false) {
            return this.deselect();
          }
          this.iterator("cell", function(ctx, rowIdx, colIdx) {
            clear(ctx);
            var data = ctx.aoData[rowIdx];
            if (data._selected_cells === undefined2) {
              data._selected_cells = [];
            }
            data._selected_cells[colIdx] = true;
            if (data.anCells) {
              $(data.anCells[colIdx]).addClass(ctx._select.className);
            }
          });
          this.iterator("table", function(ctx, i) {
            eventTrigger(api, "select", ["cell", api.cells(api[i]).indexes().toArray()], true);
          });
          return this;
        });
        apiRegisterPlural("rows().deselect()", "row().deselect()", function() {
          var api = this;
          this.iterator("row", function(ctx, idx) {
            ctx.aoData[idx]._select_selected = false;
            ctx._select_lastCell = null;
            $(ctx.aoData[idx].nTr).removeClass(ctx._select.className);
          });
          this.iterator("table", function(ctx, i) {
            eventTrigger(api, "deselect", ["row", api[i]], true);
          });
          return this;
        });
        apiRegisterPlural("columns().deselect()", "column().deselect()", function() {
          var api = this;
          this.iterator("column", function(ctx, idx) {
            ctx.aoColumns[idx]._select_selected = false;
            var api2 = new DataTable2.Api(ctx);
            var column = api2.column(idx);
            $(column.header()).removeClass(ctx._select.className);
            $(column.footer()).removeClass(ctx._select.className);
            api2.cells(null, idx).indexes().each(function(cellIdx) {
              var data = ctx.aoData[cellIdx.row];
              var cellSelected = data._selected_cells;
              if (data.anCells && (!cellSelected || !cellSelected[cellIdx.column])) {
                $(data.anCells[cellIdx.column]).removeClass(ctx._select.className);
              }
            });
          });
          this.iterator("table", function(ctx, i) {
            eventTrigger(api, "deselect", ["column", api[i]], true);
          });
          return this;
        });
        apiRegisterPlural("cells().deselect()", "cell().deselect()", function() {
          var api = this;
          this.iterator("cell", function(ctx, rowIdx, colIdx) {
            var data = ctx.aoData[rowIdx];
            if (data._selected_cells !== undefined2) {
              data._selected_cells[colIdx] = false;
            }
            if (data.anCells && !ctx.aoColumns[colIdx]._select_selected) {
              $(data.anCells[colIdx]).removeClass(ctx._select.className);
            }
          });
          this.iterator("table", function(ctx, i) {
            eventTrigger(api, "deselect", ["cell", api[i]], true);
          });
          return this;
        });
        function i18n(label, def) {
          return function(dt) {
            return dt.i18n("buttons." + label, def);
          };
        }
        function namespacedEvents(config) {
          var unique = config._eventNamespace;
          return "draw.dt.DT" + unique + " select.dt.DT" + unique + " deselect.dt.DT" + unique;
        }
        function enabled(dt, config) {
          if ($.inArray("rows", config.limitTo) !== -1 && dt.rows({ selected: true }).any()) {
            return true;
          }
          if ($.inArray("columns", config.limitTo) !== -1 && dt.columns({ selected: true }).any()) {
            return true;
          }
          if ($.inArray("cells", config.limitTo) !== -1 && dt.cells({ selected: true }).any()) {
            return true;
          }
          return false;
        }
        var _buttonNamespace = 0;
        $.extend(DataTable2.ext.buttons, {
          selected: {
            text: i18n("selected", "Selected"),
            className: "buttons-selected",
            limitTo: ["rows", "columns", "cells"],
            init: function(dt, node, config) {
              var that = this;
              config._eventNamespace = ".select" + _buttonNamespace++;
              dt.on(namespacedEvents(config), function() {
                that.enable(enabled(dt, config));
              });
              this.disable();
            },
            destroy: function(dt, node, config) {
              dt.off(config._eventNamespace);
            }
          },
          selectedSingle: {
            text: i18n("selectedSingle", "Selected single"),
            className: "buttons-selected-single",
            init: function(dt, node, config) {
              var that = this;
              config._eventNamespace = ".select" + _buttonNamespace++;
              dt.on(namespacedEvents(config), function() {
                var count = dt.rows({ selected: true }).flatten().length + dt.columns({ selected: true }).flatten().length + dt.cells({ selected: true }).flatten().length;
                that.enable(count === 1);
              });
              this.disable();
            },
            destroy: function(dt, node, config) {
              dt.off(config._eventNamespace);
            }
          },
          selectAll: {
            text: i18n("selectAll", "Select all"),
            className: "buttons-select-all",
            action: function() {
              var items = this.select.items();
              this[items + "s"]().select();
            }
          },
          selectNone: {
            text: i18n("selectNone", "Deselect all"),
            className: "buttons-select-none",
            action: function() {
              clear(this.settings()[0], true);
            },
            init: function(dt, node, config) {
              var that = this;
              config._eventNamespace = ".select" + _buttonNamespace++;
              dt.on(namespacedEvents(config), function() {
                var count = dt.rows({ selected: true }).flatten().length + dt.columns({ selected: true }).flatten().length + dt.cells({ selected: true }).flatten().length;
                that.enable(count > 0);
              });
              this.disable();
            },
            destroy: function(dt, node, config) {
              dt.off(config._eventNamespace);
            }
          }
        });
        $.each(["Row", "Column", "Cell"], function(i, item) {
          var lc = item.toLowerCase();
          DataTable2.ext.buttons["select" + item + "s"] = {
            text: i18n("select" + item + "s", "Select " + lc + "s"),
            className: "buttons-select-" + lc + "s",
            action: function() {
              this.select.items(lc);
            },
            init: function(dt) {
              var that = this;
              dt.on("selectItems.dt.DT", function(e, ctx, items) {
                that.active(items === lc);
              });
            }
          };
        });
        $(document2).on("preInit.dt.dtSelect", function(e, ctx) {
          if (e.namespace !== "dt") {
            return;
          }
          DataTable2.select.init(new DataTable2.Api(ctx));
        });
        return DataTable2.select;
      });
    }
  });

  // node_modules/datatables.net-fixedheader/js/dataTables.fixedHeader.js
  var require_dataTables_fixedHeader = __commonJS({
    "node_modules/datatables.net-fixedheader/js/dataTables.fixedHeader.js"(exports, module) {
      (function(factory) {
        if (typeof define === "function" && define.amd) {
          define(["jquery", "datatables.net"], function($) {
            return factory($, window, document);
          });
        } else if (typeof exports === "object") {
          module.exports = function(root, $) {
            if (!root) {
              root = window;
            }
            if (!$ || !$.fn.dataTable) {
              $ = require_jquery_dataTables()(root, $).$;
            }
            return factory($, root, root.document);
          };
        } else {
          factory(jQuery, window, document);
        }
      })(function($, window2, document2, undefined2) {
        "use strict";
        var DataTable2 = $.fn.dataTable;
        var _instCounter = 0;
        var FixedHeader = function(dt, config) {
          if (!(this instanceof FixedHeader)) {
            throw "FixedHeader must be initialised with the 'new' keyword.";
          }
          if (config === true) {
            config = {};
          }
          dt = new DataTable2.Api(dt);
          this.c = $.extend(true, {}, FixedHeader.defaults, config);
          this.s = {
            dt,
            position: {
              theadTop: 0,
              tbodyTop: 0,
              tfootTop: 0,
              tfootBottom: 0,
              width: 0,
              left: 0,
              tfootHeight: 0,
              theadHeight: 0,
              windowHeight: $(window2).height(),
              visible: true
            },
            headerMode: null,
            footerMode: null,
            autoWidth: dt.settings()[0].oFeatures.bAutoWidth,
            namespace: ".dtfc" + _instCounter++,
            scrollLeft: {
              header: -1,
              footer: -1
            },
            enable: true
          };
          this.dom = {
            floatingHeader: null,
            thead: $(dt.table().header()),
            tbody: $(dt.table().body()),
            tfoot: $(dt.table().footer()),
            header: {
              host: null,
              floating: null,
              floatingParent: $('<div class="dtfh-floatingparent">'),
              placeholder: null
            },
            footer: {
              host: null,
              floating: null,
              floatingParent: $('<div class="dtfh-floatingparent">'),
              placeholder: null
            }
          };
          this.dom.header.host = this.dom.thead.parent();
          this.dom.footer.host = this.dom.tfoot.parent();
          var dtSettings = dt.settings()[0];
          if (dtSettings._fixedHeader) {
            throw "FixedHeader already initialised on table " + dtSettings.nTable.id;
          }
          dtSettings._fixedHeader = this;
          this._constructor();
        };
        $.extend(FixedHeader.prototype, {
          destroy: function() {
            this.s.dt.off(".dtfc");
            $(window2).off(this.s.namespace);
            if (this.c.header) {
              this._modeChange("in-place", "header", true);
            }
            if (this.c.footer && this.dom.tfoot.length) {
              this._modeChange("in-place", "footer", true);
            }
          },
          enable: function(enable, update) {
            this.s.enable = enable;
            if (update || update === undefined2) {
              this._positions();
              this._scroll(true);
            }
          },
          enabled: function() {
            return this.s.enable;
          },
          headerOffset: function(offset) {
            if (offset !== undefined2) {
              this.c.headerOffset = offset;
              this.update();
            }
            return this.c.headerOffset;
          },
          footerOffset: function(offset) {
            if (offset !== undefined2) {
              this.c.footerOffset = offset;
              this.update();
            }
            return this.c.footerOffset;
          },
          update: function(force) {
            var table = this.s.dt.table().node();
            if ($(table).is(":visible")) {
              this.enable(true, false);
            } else {
              this.enable(false, false);
            }
            if ($(table).children("thead").length === 0) {
              return;
            }
            this._positions();
            this._scroll(force !== undefined2 ? force : true);
          },
          _constructor: function() {
            var that = this;
            var dt = this.s.dt;
            $(window2).on("scroll" + this.s.namespace, function() {
              that._scroll();
            }).on("resize" + this.s.namespace, DataTable2.util.throttle(function() {
              that.s.position.windowHeight = $(window2).height();
              that.update();
            }, 50));
            var autoHeader = $(".fh-fixedHeader");
            if (!this.c.headerOffset && autoHeader.length) {
              this.c.headerOffset = autoHeader.outerHeight();
            }
            var autoFooter = $(".fh-fixedFooter");
            if (!this.c.footerOffset && autoFooter.length) {
              this.c.footerOffset = autoFooter.outerHeight();
            }
            dt.on("column-reorder.dt.dtfc column-visibility.dt.dtfc column-sizing.dt.dtfc responsive-display.dt.dtfc", function(e, ctx) {
              that.update();
            }).on("draw.dt.dtfc", function(e, ctx) {
              that.update(ctx === dt.settings()[0] ? false : true);
            });
            dt.on("destroy.dtfc", function() {
              that.destroy();
            });
            this._positions();
            this._scroll();
          },
          _clone: function(item, force) {
            var dt = this.s.dt;
            var itemDom = this.dom[item];
            var itemElement = item === "header" ? this.dom.thead : this.dom.tfoot;
            if (item === "footer" && this._scrollEnabled()) {
              return;
            }
            if (!force && itemDom.floating) {
              itemDom.floating.removeClass("fixedHeader-floating fixedHeader-locked");
            } else {
              if (itemDom.floating) {
                if (itemDom.placeholder !== null) {
                  itemDom.placeholder.remove();
                }
                this._unsize(item);
                itemDom.floating.children().detach();
                itemDom.floating.remove();
              }
              var tableNode = $(dt.table().node());
              var scrollBody = $(tableNode.parent());
              var scrollEnabled = this._scrollEnabled();
              itemDom.floating = $(dt.table().node().cloneNode(false)).attr("aria-hidden", "true").css({
                "table-layout": "fixed",
                top: 0,
                left: 0
              }).removeAttr("id").append(itemElement);
              itemDom.floatingParent.css({
                width: scrollBody.width(),
                overflow: "hidden",
                height: "fit-content",
                position: "fixed",
                left: scrollEnabled ? tableNode.offset().left + scrollBody.scrollLeft() : 0
              }).css(item === "header" ? {
                top: this.c.headerOffset,
                bottom: ""
              } : {
                top: "",
                bottom: this.c.footerOffset
              }).addClass(item === "footer" ? "dtfh-floatingparentfoot" : "dtfh-floatingparenthead").append(itemDom.floating).appendTo("body");
              this._stickyPosition(itemDom.floating, "-");
              var scrollLeftUpdate = () => {
                var scrollLeft = scrollBody.scrollLeft();
                this.s.scrollLeft = { footer: scrollLeft, header: scrollLeft };
                itemDom.floatingParent.scrollLeft(this.s.scrollLeft.header);
              };
              scrollLeftUpdate();
              scrollBody.scroll(scrollLeftUpdate);
              itemDom.placeholder = itemElement.clone(false);
              itemDom.placeholder.find("*[id]").removeAttr("id");
              itemDom.host.prepend(itemDom.placeholder);
              this._matchWidths(itemDom.placeholder, itemDom.floating);
            }
          },
          _stickyPosition(el, sign) {
            if (this._scrollEnabled()) {
              var that = this;
              var rtl = $(that.s.dt.table().node()).css("direction") === "rtl";
              el.find("th").each(function() {
                if ($(this).css("position") === "sticky") {
                  var right = $(this).css("right");
                  var left = $(this).css("left");
                  if (right !== "auto" && !rtl) {
                    var potential = +right.replace(/px/g, "") + (sign === "-" ? -1 : 1) * that.s.dt.settings()[0].oBrowser.barWidth;
                    $(this).css("right", potential > 0 ? potential : 0);
                  } else if (left !== "auto" && rtl) {
                    var potential = +left.replace(/px/g, "") + (sign === "-" ? -1 : 1) * that.s.dt.settings()[0].oBrowser.barWidth;
                    $(this).css("left", potential > 0 ? potential : 0);
                  }
                }
              });
            }
          },
          _matchWidths: function(from, to) {
            var get = function(name) {
              return $(name, from).map(function() {
                return $(this).css("width").replace(/[^\d\.]/g, "") * 1;
              }).toArray();
            };
            var set = function(name, toWidths) {
              $(name, to).each(function(i) {
                $(this).css({
                  width: toWidths[i],
                  minWidth: toWidths[i]
                });
              });
            };
            var thWidths = get("th");
            var tdWidths = get("td");
            set("th", thWidths);
            set("td", tdWidths);
          },
          _unsize: function(item) {
            var el = this.dom[item].floating;
            if (el && (item === "footer" || item === "header" && !this.s.autoWidth)) {
              $("th, td", el).css({
                width: "",
                minWidth: ""
              });
            } else if (el && item === "header") {
              $("th, td", el).css("min-width", "");
            }
          },
          _horizontal: function(item, scrollLeft) {
            var itemDom = this.dom[item];
            var position = this.s.position;
            var lastScrollLeft = this.s.scrollLeft;
            if (itemDom.floating && lastScrollLeft[item] !== scrollLeft) {
              if (this._scrollEnabled()) {
                var newScrollLeft = $($(this.s.dt.table().node()).parent()).scrollLeft();
                itemDom.floating.scrollLeft(newScrollLeft);
                itemDom.floatingParent.scrollLeft(newScrollLeft);
              }
              lastScrollLeft[item] = scrollLeft;
            }
          },
          _modeChange: function(mode, item, forceChange) {
            var dt = this.s.dt;
            var itemDom = this.dom[item];
            var position = this.s.position;
            var scrollEnabled = this._scrollEnabled();
            if (item === "footer" && scrollEnabled) {
              return;
            }
            var importantWidth = function(w) {
              itemDom.floating.attr("style", function(i, s) {
                return (s || "") + "width: " + w + "px !important;";
              });
              if (!scrollEnabled) {
                itemDom.floatingParent.attr("style", function(i, s) {
                  return (s || "") + "width: " + w + "px !important;";
                });
              }
            };
            var tablePart = this.dom[item === "footer" ? "tfoot" : "thead"];
            var focus = $.contains(tablePart[0], document2.activeElement) ? document2.activeElement : null;
            var scrollBody = $($(this.s.dt.table().node()).parent());
            if (mode === "in-place") {
              if (itemDom.placeholder) {
                itemDom.placeholder.remove();
                itemDom.placeholder = null;
              }
              this._unsize(item);
              if (item === "header") {
                itemDom.host.prepend(tablePart);
              } else {
                itemDom.host.append(tablePart);
              }
              if (itemDom.floating) {
                itemDom.floating.remove();
                itemDom.floating = null;
                this._stickyPosition(itemDom.host, "+");
              }
              if (itemDom.floatingParent) {
                itemDom.floatingParent.remove();
              }
              $($(itemDom.host.parent()).parent()).scrollLeft(scrollBody.scrollLeft());
            } else if (mode === "in") {
              this._clone(item, forceChange);
              var scrollOffset = scrollBody.offset();
              var windowTop = $(document2).scrollTop();
              var windowHeight = $(window2).height();
              var windowBottom = windowTop + windowHeight;
              var bodyTop = scrollEnabled ? scrollOffset.top : position.tbodyTop;
              var bodyBottom = scrollEnabled ? scrollOffset.top + scrollBody.outerHeight() : position.tfootTop;
              var shuffle = item === "footer" ? bodyTop > windowBottom ? position.tfootHeight : bodyTop + position.tfootHeight - windowBottom : windowTop + this.c.headerOffset + position.theadHeight - bodyBottom;
              var prop = item === "header" ? "top" : "bottom";
              var val = this.c[item + "Offset"] - (shuffle > 0 ? shuffle : 0);
              itemDom.floating.addClass("fixedHeader-floating");
              itemDom.floatingParent.css(prop, val).css({
                "left": position.left,
                "height": item === "header" ? position.theadHeight : position.tfootHeight,
                "z-index": 2
              }).append(itemDom.floating);
              importantWidth(position.width);
              if (item === "footer") {
                itemDom.floating.css("top", "");
              }
            } else if (mode === "below") {
              this._clone(item, forceChange);
              itemDom.floating.addClass("fixedHeader-locked");
              itemDom.floatingParent.css({
                position: "absolute",
                top: position.tfootTop - position.theadHeight,
                left: position.left + "px"
              });
              importantWidth(position.width);
            } else if (mode === "above") {
              this._clone(item, forceChange);
              itemDom.floating.addClass("fixedHeader-locked");
              itemDom.floatingParent.css({
                position: "absolute",
                top: position.tbodyTop,
                left: position.left + "px"
              });
              importantWidth(position.width);
            }
            if (focus && focus !== document2.activeElement) {
              setTimeout(function() {
                focus.focus();
              }, 10);
            }
            this.s.scrollLeft.header = -1;
            this.s.scrollLeft.footer = -1;
            this.s[item + "Mode"] = mode;
          },
          _positions: function() {
            var dt = this.s.dt;
            var table = dt.table();
            var position = this.s.position;
            var dom = this.dom;
            var tableNode = $(table.node());
            var scrollEnabled = this._scrollEnabled();
            var thead = $(dt.table().header());
            var tfoot = $(dt.table().footer());
            var tbody = dom.tbody;
            var scrollBody = tableNode.parent();
            position.visible = tableNode.is(":visible");
            position.width = tableNode.outerWidth();
            position.left = tableNode.offset().left;
            position.theadTop = thead.offset().top;
            position.tbodyTop = scrollEnabled ? scrollBody.offset().top : tbody.offset().top;
            position.tbodyHeight = scrollEnabled ? scrollBody.outerHeight() : tbody.outerHeight();
            position.theadHeight = thead.outerHeight();
            position.theadBottom = position.theadTop + position.theadHeight;
            if (tfoot.length) {
              position.tfootTop = position.tbodyTop + position.tbodyHeight;
              position.tfootBottom = position.tfootTop + tfoot.outerHeight();
              position.tfootHeight = tfoot.outerHeight();
            } else {
              position.tfootTop = position.tbodyTop + tbody.outerHeight();
              position.tfootBottom = position.tfootTop;
              position.tfootHeight = position.tfootTop;
            }
          },
          _scroll: function(forceChange) {
            var scrollEnabled = this._scrollEnabled();
            var scrollBody = $(this.s.dt.table().node()).parent();
            var scrollOffset = scrollBody.offset();
            var scrollHeight = scrollBody.outerHeight();
            var windowLeft = $(document2).scrollLeft();
            var windowTop = $(document2).scrollTop();
            var windowHeight = $(window2).height();
            var windowBottom = windowHeight + windowTop;
            var position = this.s.position;
            var headerMode, footerMode;
            var bodyTop = scrollEnabled ? scrollOffset.top : position.tbodyTop;
            var bodyLeft = scrollEnabled ? scrollOffset.left : position.left;
            var bodyBottom = scrollEnabled ? scrollOffset.top + scrollHeight : position.tfootTop;
            var bodyWidth = scrollEnabled ? scrollBody.outerWidth() : position.tbodyWidth;
            var windowBottom = windowTop + windowHeight;
            if (this.c.header) {
              if (!this.s.enable) {
                headerMode = "in-place";
              } else if (!position.visible || windowTop + this.c.headerOffset + position.theadHeight <= bodyTop) {
                headerMode = "in-place";
              } else if (windowTop + this.c.headerOffset + position.theadHeight > bodyTop && windowTop + this.c.headerOffset < bodyBottom) {
                headerMode = "in";
                var scrollBody = $($(this.s.dt.table().node()).parent());
                if (windowTop + this.c.headerOffset + position.theadHeight > bodyBottom || this.dom.header.floatingParent === undefined2) {
                  forceChange = true;
                } else {
                  this.dom.header.floatingParent.css({
                    "top": this.c.headerOffset,
                    "position": "fixed"
                  }).append(this.dom.header.floating);
                }
              } else {
                headerMode = "below";
              }
              if (forceChange || headerMode !== this.s.headerMode) {
                this._modeChange(headerMode, "header", forceChange);
              }
              this._horizontal("header", windowLeft);
            }
            var header = {
              offset: { top: 0, left: 0 },
              height: 0
            };
            var footer = {
              offset: { top: 0, left: 0 },
              height: 0
            };
            if (this.c.footer && this.dom.tfoot.length) {
              if (!this.s.enable) {
                footerMode = "in-place";
              } else if (!position.visible || position.tfootBottom + this.c.footerOffset <= windowBottom) {
                footerMode = "in-place";
              } else if (bodyBottom + position.tfootHeight + this.c.footerOffset > windowBottom && bodyTop + this.c.footerOffset < windowBottom) {
                footerMode = "in";
                forceChange = true;
              } else {
                footerMode = "above";
              }
              if (forceChange || footerMode !== this.s.footerMode) {
                this._modeChange(footerMode, "footer", forceChange);
              }
              this._horizontal("footer", windowLeft);
              var getOffsetHeight = (el) => {
                return {
                  offset: el.offset(),
                  height: el.outerHeight()
                };
              };
              header = this.dom.header.floating ? getOffsetHeight(this.dom.header.floating) : getOffsetHeight(this.dom.thead);
              footer = this.dom.footer.floating ? getOffsetHeight(this.dom.footer.floating) : getOffsetHeight(this.dom.tfoot);
              if (scrollEnabled && footer.offset.top > windowTop) {
                var overlap = windowTop - scrollOffset.top;
                var newHeight = windowBottom + (overlap > -header.height ? overlap : 0) - (header.offset.top + (overlap < -header.height ? header.height : 0) + footer.height);
                if (newHeight < 0) {
                  newHeight = 0;
                }
                scrollBody.outerHeight(newHeight);
                if (Math.round(scrollBody.outerHeight()) >= Math.round(newHeight)) {
                  $(this.dom.tfoot.parent()).addClass("fixedHeader-floating");
                } else {
                  $(this.dom.tfoot.parent()).removeClass("fixedHeader-floating");
                }
              }
            }
            if (this.dom.header.floating) {
              this.dom.header.floatingParent.css("left", bodyLeft - windowLeft);
            }
            if (this.dom.footer.floating) {
              this.dom.footer.floatingParent.css("left", bodyLeft - windowLeft);
            }
            if (this.s.dt.settings()[0]._fixedColumns !== undefined2) {
              var adjustBlocker = (side, end, el) => {
                if (el === undefined2) {
                  let blocker = $("div.dtfc-" + side + "-" + end + "-blocker");
                  el = blocker.length === 0 ? null : blocker.clone().appendTo("body").css("z-index", 1);
                }
                if (el !== null) {
                  el.css({
                    top: end === "top" ? header.offset.top : footer.offset.top,
                    left: side === "right" ? bodyLeft + bodyWidth - el.width() : bodyLeft
                  });
                }
                return el;
              };
              this.dom.header.rightBlocker = adjustBlocker("right", "top", this.dom.header.rightBlocker);
              this.dom.header.leftBlocker = adjustBlocker("left", "top", this.dom.header.leftBlocker);
              this.dom.footer.rightBlocker = adjustBlocker("right", "bottom", this.dom.footer.rightBlocker);
              this.dom.footer.leftBlocker = adjustBlocker("left", "bottom", this.dom.footer.leftBlocker);
            }
          },
          _scrollEnabled: function() {
            var oScroll = this.s.dt.settings()[0].oScroll;
            if (oScroll.sY !== "" || oScroll.sX !== "") {
              return true;
            }
            return false;
          }
        });
        FixedHeader.version = "3.2.1";
        FixedHeader.defaults = {
          header: true,
          footer: false,
          headerOffset: 0,
          footerOffset: 0
        };
        $.fn.dataTable.FixedHeader = FixedHeader;
        $.fn.DataTable.FixedHeader = FixedHeader;
        $(document2).on("init.dt.dtfh", function(e, settings, json) {
          if (e.namespace !== "dt") {
            return;
          }
          var init = settings.oInit.fixedHeader;
          var defaults = DataTable2.defaults.fixedHeader;
          if ((init || defaults) && !settings._fixedHeader) {
            var opts = $.extend({}, defaults, init);
            if (init !== false) {
              new FixedHeader(settings, opts);
            }
          }
        });
        DataTable2.Api.register("fixedHeader()", function() {
        });
        DataTable2.Api.register("fixedHeader.adjust()", function() {
          return this.iterator("table", function(ctx) {
            var fh = ctx._fixedHeader;
            if (fh) {
              fh.update();
            }
          });
        });
        DataTable2.Api.register("fixedHeader.enable()", function(flag) {
          return this.iterator("table", function(ctx) {
            var fh = ctx._fixedHeader;
            flag = flag !== undefined2 ? flag : true;
            if (fh && flag !== fh.enabled()) {
              fh.enable(flag);
            }
          });
        });
        DataTable2.Api.register("fixedHeader.enabled()", function() {
          if (this.context.length) {
            var fh = this.context[0]._fixedHeader;
            if (fh) {
              return fh.enabled();
            }
          }
          return false;
        });
        DataTable2.Api.register("fixedHeader.disable()", function() {
          return this.iterator("table", function(ctx) {
            var fh = ctx._fixedHeader;
            if (fh && fh.enabled()) {
              fh.enable(false);
            }
          });
        });
        $.each(["header", "footer"], function(i, el) {
          DataTable2.Api.register("fixedHeader." + el + "Offset()", function(offset) {
            var ctx = this.context;
            if (offset === undefined2) {
              return ctx.length && ctx[0]._fixedHeader ? ctx[0]._fixedHeader[el + "Offset"]() : undefined2;
            }
            return this.iterator("table", function(ctx2) {
              var fh = ctx2._fixedHeader;
              if (fh) {
                fh[el + "Offset"](offset);
              }
            });
          });
        });
        return FixedHeader;
      });
    }
  });

  // node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
  (function() {
    if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.polyfillWrapFlushCallback) {
      return;
    }
    const BuiltInHTMLElement = HTMLElement;
    const wrapperForTheName = {
      "HTMLElement": function HTMLElement2() {
        return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
      }
    };
    window.HTMLElement = wrapperForTheName["HTMLElement"];
    HTMLElement.prototype = BuiltInHTMLElement.prototype;
    HTMLElement.prototype.constructor = HTMLElement;
    Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
  })();
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function")
      return;
    prototype.requestSubmit = function(submitter) {
      if (submitter) {
        validateSubmitter(submitter, this);
        submitter.click();
      } else {
        submitter = document.createElement("input");
        submitter.type = "submit";
        submitter.hidden = true;
        this.appendChild(submitter);
        submitter.click();
        this.removeChild(submitter);
      }
    };
    function validateSubmitter(submitter, form) {
      submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
    }
  })(HTMLFormElement.prototype);
  var submittersByForm = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element ? element.closest("input, button") : null;
    return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
  }
  function clickCaptured(event) {
    const submitter = findSubmitterFromClickTarget(event.target);
    if (submitter && submitter.form) {
      submittersByForm.set(submitter.form, submitter);
    }
  }
  (function() {
    if ("submitter" in Event.prototype)
      return;
    let prototype;
    if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
      prototype = window.SubmitEvent.prototype;
    } else if ("SubmitEvent" in window) {
      return;
    } else {
      prototype = window.Event.prototype;
    }
    addEventListener("click", clickCaptured, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type == "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm.get(this.target);
        }
      }
    });
  })();
  var FrameLoadingStyle;
  (function(FrameLoadingStyle2) {
    FrameLoadingStyle2["eager"] = "eager";
    FrameLoadingStyle2["lazy"] = "lazy";
  })(FrameLoadingStyle || (FrameLoadingStyle = {}));
  var FrameElement = class extends HTMLElement {
    constructor() {
      super();
      this.loaded = Promise.resolve();
      this.delegate = new FrameElement.delegateConstructor(this);
    }
    static get observedAttributes() {
      return ["disabled", "loading", "src"];
    }
    connectedCallback() {
      this.delegate.connect();
    }
    disconnectedCallback() {
      this.delegate.disconnect();
    }
    reload() {
      const { src } = this;
      this.src = null;
      this.src = src;
    }
    attributeChangedCallback(name) {
      if (name == "loading") {
        this.delegate.loadingStyleChanged();
      } else if (name == "src") {
        this.delegate.sourceURLChanged();
      } else {
        this.delegate.disabledChanged();
      }
    }
    get src() {
      return this.getAttribute("src");
    }
    set src(value) {
      if (value) {
        this.setAttribute("src", value);
      } else {
        this.removeAttribute("src");
      }
    }
    get loading() {
      return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    set loading(value) {
      if (value) {
        this.setAttribute("loading", value);
      } else {
        this.removeAttribute("loading");
      }
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(value) {
      if (value) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    get autoscroll() {
      return this.hasAttribute("autoscroll");
    }
    set autoscroll(value) {
      if (value) {
        this.setAttribute("autoscroll", "");
      } else {
        this.removeAttribute("autoscroll");
      }
    }
    get complete() {
      return !this.delegate.isLoading;
    }
    get isActive() {
      return this.ownerDocument === document && !this.isPreview;
    }
    get isPreview() {
      var _a, _b;
      return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
    }
  };
  function frameLoadingStyleFromString(style) {
    switch (style.toLowerCase()) {
      case "lazy":
        return FrameLoadingStyle.lazy;
      default:
        return FrameLoadingStyle.eager;
    }
  }
  function expandURL(locatable) {
    return new URL(locatable.toString(), document.baseURI);
  }
  function getAnchor(url) {
    let anchorMatch;
    if (url.hash) {
      return url.hash.slice(1);
    } else if (anchorMatch = url.href.match(/#(.*)$/)) {
      return anchorMatch[1];
    }
  }
  function getAction(form, submitter) {
    const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formaction")) || form.getAttribute("action") || form.action;
    return expandURL(action);
  }
  function getExtension(url) {
    return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
  }
  function isHTML(url) {
    return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml))$/);
  }
  function isPrefixedBy(baseURL, url) {
    const prefix = getPrefix(url);
    return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
  }
  function locationIsVisitable(location2, rootLocation) {
    return isPrefixedBy(location2, rootLocation) && isHTML(location2);
  }
  function getRequestURL(url) {
    const anchor = getAnchor(url);
    return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
  }
  function toCacheKey(url) {
    return getRequestURL(url);
  }
  function urlsAreEqual(left, right) {
    return expandURL(left).href == expandURL(right).href;
  }
  function getPathComponents(url) {
    return url.pathname.split("/").slice(1);
  }
  function getLastPathComponent(url) {
    return getPathComponents(url).slice(-1)[0];
  }
  function getPrefix(url) {
    return addTrailingSlash(url.origin + url.pathname);
  }
  function addTrailingSlash(value) {
    return value.endsWith("/") ? value : value + "/";
  }
  var FetchResponse = class {
    constructor(response) {
      this.response = response;
    }
    get succeeded() {
      return this.response.ok;
    }
    get failed() {
      return !this.succeeded;
    }
    get clientError() {
      return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
      return this.response.redirected;
    }
    get location() {
      return expandURL(this.response.url);
    }
    get isHTML() {
      return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
    }
    get statusCode() {
      return this.response.status;
    }
    get contentType() {
      return this.header("Content-Type");
    }
    get responseText() {
      return this.response.clone().text();
    }
    get responseHTML() {
      if (this.isHTML) {
        return this.response.clone().text();
      } else {
        return Promise.resolve(void 0);
      }
    }
    header(name) {
      return this.response.headers.get(name);
    }
  };
  function dispatch(eventName, { target, cancelable, detail } = {}) {
    const event = new CustomEvent(eventName, { cancelable, bubbles: true, detail });
    if (target && target.isConnected) {
      target.dispatchEvent(event);
    } else {
      document.documentElement.dispatchEvent(event);
    }
    return event;
  }
  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  function nextEventLoopTick() {
    return new Promise((resolve) => setTimeout(() => resolve(), 0));
  }
  function nextMicrotask() {
    return Promise.resolve();
  }
  function parseHTMLDocument(html = "") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  function unindent(strings, ...values) {
    const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
    const match = lines[0].match(/^\s+/);
    const indent = match ? match[0].length : 0;
    return lines.map((line) => line.slice(indent)).join("\n");
  }
  function interpolate(strings, values) {
    return strings.reduce((result, string, i) => {
      const value = values[i] == void 0 ? "" : values[i];
      return result + string + value;
    }, "");
  }
  function uuid() {
    return Array.apply(null, { length: 36 }).map((_, i) => {
      if (i == 8 || i == 13 || i == 18 || i == 23) {
        return "-";
      } else if (i == 14) {
        return "4";
      } else if (i == 19) {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      } else {
        return Math.floor(Math.random() * 15).toString(16);
      }
    }).join("");
  }
  function getAttribute(attributeName, ...elements) {
    for (const value of elements.map((element) => element === null || element === void 0 ? void 0 : element.getAttribute(attributeName))) {
      if (typeof value == "string")
        return value;
    }
    return null;
  }
  function markAsBusy(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.setAttribute("busy", "");
      }
      element.setAttribute("aria-busy", "true");
    }
  }
  function clearBusyState(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.removeAttribute("busy");
      }
      element.removeAttribute("aria-busy");
    }
  }
  var FetchMethod;
  (function(FetchMethod2) {
    FetchMethod2[FetchMethod2["get"] = 0] = "get";
    FetchMethod2[FetchMethod2["post"] = 1] = "post";
    FetchMethod2[FetchMethod2["put"] = 2] = "put";
    FetchMethod2[FetchMethod2["patch"] = 3] = "patch";
    FetchMethod2[FetchMethod2["delete"] = 4] = "delete";
  })(FetchMethod || (FetchMethod = {}));
  function fetchMethodFromString(method) {
    switch (method.toLowerCase()) {
      case "get":
        return FetchMethod.get;
      case "post":
        return FetchMethod.post;
      case "put":
        return FetchMethod.put;
      case "patch":
        return FetchMethod.patch;
      case "delete":
        return FetchMethod.delete;
    }
  }
  var FetchRequest = class {
    constructor(delegate, method, location2, body = new URLSearchParams(), target = null) {
      this.abortController = new AbortController();
      this.resolveRequestPromise = (value) => {
      };
      this.delegate = delegate;
      this.method = method;
      this.headers = this.defaultHeaders;
      this.body = body;
      this.url = location2;
      this.target = target;
    }
    get location() {
      return this.url;
    }
    get params() {
      return this.url.searchParams;
    }
    get entries() {
      return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
      this.abortController.abort();
    }
    async perform() {
      var _a, _b;
      const { fetchOptions } = this;
      (_b = (_a = this.delegate).prepareHeadersForRequest) === null || _b === void 0 ? void 0 : _b.call(_a, this.headers, this);
      await this.allowRequestToBeIntercepted(fetchOptions);
      try {
        this.delegate.requestStarted(this);
        const response = await fetch(this.url.href, fetchOptions);
        return await this.receive(response);
      } catch (error2) {
        if (error2.name !== "AbortError") {
          this.delegate.requestErrored(this, error2);
          throw error2;
        }
      } finally {
        this.delegate.requestFinished(this);
      }
    }
    async receive(response) {
      const fetchResponse = new FetchResponse(response);
      const event = dispatch("turbo:before-fetch-response", { cancelable: true, detail: { fetchResponse }, target: this.target });
      if (event.defaultPrevented) {
        this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
      } else if (fetchResponse.succeeded) {
        this.delegate.requestSucceededWithResponse(this, fetchResponse);
      } else {
        this.delegate.requestFailedWithResponse(this, fetchResponse);
      }
      return fetchResponse;
    }
    get fetchOptions() {
      var _a;
      return {
        method: FetchMethod[this.method].toUpperCase(),
        credentials: "same-origin",
        headers: this.headers,
        redirect: "follow",
        body: this.isIdempotent ? null : this.body,
        signal: this.abortSignal,
        referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
      };
    }
    get defaultHeaders() {
      return {
        "Accept": "text/html, application/xhtml+xml"
      };
    }
    get isIdempotent() {
      return this.method == FetchMethod.get;
    }
    get abortSignal() {
      return this.abortController.signal;
    }
    async allowRequestToBeIntercepted(fetchOptions) {
      const requestInterception = new Promise((resolve) => this.resolveRequestPromise = resolve);
      const event = dispatch("turbo:before-fetch-request", {
        cancelable: true,
        detail: {
          fetchOptions,
          url: this.url,
          resume: this.resolveRequestPromise
        },
        target: this.target
      });
      if (event.defaultPrevented)
        await requestInterception;
    }
  };
  var AppearanceObserver = class {
    constructor(delegate, element) {
      this.started = false;
      this.intersect = (entries) => {
        const lastEntry = entries.slice(-1)[0];
        if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
          this.delegate.elementAppearedInViewport(this.element);
        }
      };
      this.delegate = delegate;
      this.element = element;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
      }
    }
  };
  var StreamMessage = class {
    constructor(html) {
      this.templateElement = document.createElement("template");
      this.templateElement.innerHTML = html;
    }
    static wrap(message) {
      if (typeof message == "string") {
        return new this(message);
      } else {
        return message;
      }
    }
    get fragment() {
      const fragment = document.createDocumentFragment();
      for (const element of this.foreignElements) {
        fragment.appendChild(document.importNode(element, true));
      }
      return fragment;
    }
    get foreignElements() {
      return this.templateChildren.reduce((streamElements, child) => {
        if (child.tagName.toLowerCase() == "turbo-stream") {
          return [...streamElements, child];
        } else {
          return streamElements;
        }
      }, []);
    }
    get templateChildren() {
      return Array.from(this.templateElement.content.children);
    }
  };
  StreamMessage.contentType = "text/vnd.turbo-stream.html";
  var FormSubmissionState;
  (function(FormSubmissionState2) {
    FormSubmissionState2[FormSubmissionState2["initialized"] = 0] = "initialized";
    FormSubmissionState2[FormSubmissionState2["requesting"] = 1] = "requesting";
    FormSubmissionState2[FormSubmissionState2["waiting"] = 2] = "waiting";
    FormSubmissionState2[FormSubmissionState2["receiving"] = 3] = "receiving";
    FormSubmissionState2[FormSubmissionState2["stopping"] = 4] = "stopping";
    FormSubmissionState2[FormSubmissionState2["stopped"] = 5] = "stopped";
  })(FormSubmissionState || (FormSubmissionState = {}));
  var FormEnctype;
  (function(FormEnctype2) {
    FormEnctype2["urlEncoded"] = "application/x-www-form-urlencoded";
    FormEnctype2["multipart"] = "multipart/form-data";
    FormEnctype2["plain"] = "text/plain";
  })(FormEnctype || (FormEnctype = {}));
  function formEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FormEnctype.multipart:
        return FormEnctype.multipart;
      case FormEnctype.plain:
        return FormEnctype.plain;
      default:
        return FormEnctype.urlEncoded;
    }
  }
  var FormSubmission = class {
    constructor(delegate, formElement, submitter, mustRedirect = false) {
      this.state = FormSubmissionState.initialized;
      this.delegate = delegate;
      this.formElement = formElement;
      this.submitter = submitter;
      this.formData = buildFormData(formElement, submitter);
      this.location = expandURL(this.action);
      if (this.method == FetchMethod.get) {
        mergeFormDataEntries(this.location, [...this.body.entries()]);
      }
      this.fetchRequest = new FetchRequest(this, this.method, this.location, this.body, this.formElement);
      this.mustRedirect = mustRedirect;
    }
    static confirmMethod(message, element) {
      return confirm(message);
    }
    get method() {
      var _a;
      const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
      return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
    }
    get action() {
      var _a;
      const formElementAction = typeof this.formElement.action === "string" ? this.formElement.action : null;
      return ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formaction")) || this.formElement.getAttribute("action") || formElementAction || "";
    }
    get body() {
      if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
        return new URLSearchParams(this.stringFormData);
      } else {
        return this.formData;
      }
    }
    get enctype() {
      var _a;
      return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
    }
    get isIdempotent() {
      return this.fetchRequest.isIdempotent;
    }
    get stringFormData() {
      return [...this.formData].reduce((entries, [name, value]) => {
        return entries.concat(typeof value == "string" ? [[name, value]] : []);
      }, []);
    }
    get confirmationMessage() {
      return this.formElement.getAttribute("data-turbo-confirm");
    }
    get needsConfirmation() {
      return this.confirmationMessage !== null;
    }
    async start() {
      const { initialized, requesting } = FormSubmissionState;
      if (this.needsConfirmation) {
        const answer = FormSubmission.confirmMethod(this.confirmationMessage, this.formElement);
        if (!answer) {
          return;
        }
      }
      if (this.state == initialized) {
        this.state = requesting;
        return this.fetchRequest.perform();
      }
    }
    stop() {
      const { stopping, stopped } = FormSubmissionState;
      if (this.state != stopping && this.state != stopped) {
        this.state = stopping;
        this.fetchRequest.cancel();
        return true;
      }
    }
    prepareHeadersForRequest(headers, request) {
      if (!request.isIdempotent) {
        const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
        if (token) {
          headers["X-CSRF-Token"] = token;
        }
        headers["Accept"] = [StreamMessage.contentType, headers["Accept"]].join(", ");
      }
    }
    requestStarted(request) {
      var _a;
      this.state = FormSubmissionState.waiting;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "");
      dispatch("turbo:submit-start", { target: this.formElement, detail: { formSubmission: this } });
      this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(request, response) {
      this.result = { success: response.succeeded, fetchResponse: response };
    }
    requestSucceededWithResponse(request, response) {
      if (response.clientError || response.serverError) {
        this.delegate.formSubmissionFailedWithResponse(this, response);
      } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
        const error2 = new Error("Form responses must redirect to another location");
        this.delegate.formSubmissionErrored(this, error2);
      } else {
        this.state = FormSubmissionState.receiving;
        this.result = { success: true, fetchResponse: response };
        this.delegate.formSubmissionSucceededWithResponse(this, response);
      }
    }
    requestFailedWithResponse(request, response) {
      this.result = { success: false, fetchResponse: response };
      this.delegate.formSubmissionFailedWithResponse(this, response);
    }
    requestErrored(request, error2) {
      this.result = { success: false, error: error2 };
      this.delegate.formSubmissionErrored(this, error2);
    }
    requestFinished(request) {
      var _a;
      this.state = FormSubmissionState.stopped;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
      dispatch("turbo:submit-end", { target: this.formElement, detail: Object.assign({ formSubmission: this }, this.result) });
      this.delegate.formSubmissionFinished(this);
    }
    requestMustRedirect(request) {
      return !request.isIdempotent && this.mustRedirect;
    }
  };
  function buildFormData(formElement, submitter) {
    const formData = new FormData(formElement);
    const name = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
    const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");
    if (name && value != null && formData.get(name) != value) {
      formData.append(name, value);
    }
    return formData;
  }
  function getCookieValue(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        return value ? decodeURIComponent(value) : void 0;
      }
    }
  }
  function getMetaContent(name) {
    const element = document.querySelector(`meta[name="${name}"]`);
    return element && element.content;
  }
  function responseSucceededWithoutRedirect(response) {
    return response.statusCode == 200 && !response.redirected;
  }
  function mergeFormDataEntries(url, entries) {
    const searchParams = new URLSearchParams();
    for (const [name, value] of entries) {
      if (value instanceof File)
        continue;
      searchParams.append(name, value);
    }
    url.search = searchParams.toString();
    return url;
  }
  var Snapshot = class {
    constructor(element) {
      this.element = element;
    }
    get children() {
      return [...this.element.children];
    }
    hasAnchor(anchor) {
      return this.getElementForAnchor(anchor) != null;
    }
    getElementForAnchor(anchor) {
      return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
    }
    get isConnected() {
      return this.element.isConnected;
    }
    get firstAutofocusableElement() {
      return this.element.querySelector("[autofocus]");
    }
    get permanentElements() {
      return [...this.element.querySelectorAll("[id][data-turbo-permanent]")];
    }
    getPermanentElementById(id) {
      return this.element.querySelector(`#${id}[data-turbo-permanent]`);
    }
    getPermanentElementMapForSnapshot(snapshot) {
      const permanentElementMap = {};
      for (const currentPermanentElement of this.permanentElements) {
        const { id } = currentPermanentElement;
        const newPermanentElement = snapshot.getPermanentElementById(id);
        if (newPermanentElement) {
          permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
        }
      }
      return permanentElementMap;
    }
  };
  var FormInterceptor = class {
    constructor(delegate, element) {
      this.submitBubbled = (event) => {
        const form = event.target;
        if (!event.defaultPrevented && form instanceof HTMLFormElement && form.closest("turbo-frame, html") == this.element) {
          const submitter = event.submitter || void 0;
          const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.method;
          if (method != "dialog" && this.delegate.shouldInterceptFormSubmission(form, submitter)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.delegate.formSubmissionIntercepted(form, submitter);
          }
        }
      };
      this.delegate = delegate;
      this.element = element;
    }
    start() {
      this.element.addEventListener("submit", this.submitBubbled);
    }
    stop() {
      this.element.removeEventListener("submit", this.submitBubbled);
    }
  };
  var View = class {
    constructor(delegate, element) {
      this.resolveRenderPromise = (value) => {
      };
      this.resolveInterceptionPromise = (value) => {
      };
      this.delegate = delegate;
      this.element = element;
    }
    scrollToAnchor(anchor) {
      const element = this.snapshot.getElementForAnchor(anchor);
      if (element) {
        this.scrollToElement(element);
        this.focusElement(element);
      } else {
        this.scrollToPosition({ x: 0, y: 0 });
      }
    }
    scrollToAnchorFromLocation(location2) {
      this.scrollToAnchor(getAnchor(location2));
    }
    scrollToElement(element) {
      element.scrollIntoView();
    }
    focusElement(element) {
      if (element instanceof HTMLElement) {
        if (element.hasAttribute("tabindex")) {
          element.focus();
        } else {
          element.setAttribute("tabindex", "-1");
          element.focus();
          element.removeAttribute("tabindex");
        }
      }
    }
    scrollToPosition({ x, y }) {
      this.scrollRoot.scrollTo(x, y);
    }
    scrollToTop() {
      this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
      return window;
    }
    async render(renderer) {
      const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
      if (shouldRender) {
        try {
          this.renderPromise = new Promise((resolve) => this.resolveRenderPromise = resolve);
          this.renderer = renderer;
          this.prepareToRenderSnapshot(renderer);
          const renderInterception = new Promise((resolve) => this.resolveInterceptionPromise = resolve);
          const immediateRender = this.delegate.allowsImmediateRender(snapshot, this.resolveInterceptionPromise);
          if (!immediateRender)
            await renderInterception;
          await this.renderSnapshot(renderer);
          this.delegate.viewRenderedSnapshot(snapshot, isPreview);
          this.finishRenderingSnapshot(renderer);
        } finally {
          delete this.renderer;
          this.resolveRenderPromise(void 0);
          delete this.renderPromise;
        }
      } else {
        this.invalidate();
      }
    }
    invalidate() {
      this.delegate.viewInvalidated();
    }
    prepareToRenderSnapshot(renderer) {
      this.markAsPreview(renderer.isPreview);
      renderer.prepareToRender();
    }
    markAsPreview(isPreview) {
      if (isPreview) {
        this.element.setAttribute("data-turbo-preview", "");
      } else {
        this.element.removeAttribute("data-turbo-preview");
      }
    }
    async renderSnapshot(renderer) {
      await renderer.render();
    }
    finishRenderingSnapshot(renderer) {
      renderer.finishRendering();
    }
  };
  var FrameView = class extends View {
    invalidate() {
      this.element.innerHTML = "";
    }
    get snapshot() {
      return new Snapshot(this.element);
    }
  };
  var LinkInterceptor = class {
    constructor(delegate, element) {
      this.clickBubbled = (event) => {
        if (this.respondsToEventTarget(event.target)) {
          this.clickEvent = event;
        } else {
          delete this.clickEvent;
        }
      };
      this.linkClicked = (event) => {
        if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
          if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url)) {
            this.clickEvent.preventDefault();
            event.preventDefault();
            this.delegate.linkClickIntercepted(event.target, event.detail.url);
          }
        }
        delete this.clickEvent;
      };
      this.willVisit = () => {
        delete this.clickEvent;
      };
      this.delegate = delegate;
      this.element = element;
    }
    start() {
      this.element.addEventListener("click", this.clickBubbled);
      document.addEventListener("turbo:click", this.linkClicked);
      document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
      this.element.removeEventListener("click", this.clickBubbled);
      document.removeEventListener("turbo:click", this.linkClicked);
      document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    respondsToEventTarget(target) {
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      return element && element.closest("turbo-frame, html") == this.element;
    }
  };
  var Bardo = class {
    constructor(permanentElementMap) {
      this.permanentElementMap = permanentElementMap;
    }
    static preservingPermanentElements(permanentElementMap, callback) {
      const bardo = new this(permanentElementMap);
      bardo.enter();
      callback();
      bardo.leave();
    }
    enter() {
      for (const id in this.permanentElementMap) {
        const [, newPermanentElement] = this.permanentElementMap[id];
        this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
      }
    }
    leave() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement] = this.permanentElementMap[id];
        this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
        this.replacePlaceholderWithPermanentElement(currentPermanentElement);
      }
    }
    replaceNewPermanentElementWithPlaceholder(permanentElement) {
      const placeholder = createPlaceholderForPermanentElement(permanentElement);
      permanentElement.replaceWith(placeholder);
    }
    replaceCurrentPermanentElementWithClone(permanentElement) {
      const clone = permanentElement.cloneNode(true);
      permanentElement.replaceWith(clone);
    }
    replacePlaceholderWithPermanentElement(permanentElement) {
      const placeholder = this.getPlaceholderById(permanentElement.id);
      placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
    }
    getPlaceholderById(id) {
      return this.placeholders.find((element) => element.content == id);
    }
    get placeholders() {
      return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
    }
  };
  function createPlaceholderForPermanentElement(permanentElement) {
    const element = document.createElement("meta");
    element.setAttribute("name", "turbo-permanent-placeholder");
    element.setAttribute("content", permanentElement.id);
    return element;
  }
  var Renderer = class {
    constructor(currentSnapshot, newSnapshot, isPreview, willRender = true) {
      this.currentSnapshot = currentSnapshot;
      this.newSnapshot = newSnapshot;
      this.isPreview = isPreview;
      this.willRender = willRender;
      this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
    }
    get shouldRender() {
      return true;
    }
    prepareToRender() {
      return;
    }
    finishRendering() {
      if (this.resolvingFunctions) {
        this.resolvingFunctions.resolve();
        delete this.resolvingFunctions;
      }
    }
    createScriptElement(element) {
      if (element.getAttribute("data-turbo-eval") == "false") {
        return element;
      } else {
        const createdScriptElement = document.createElement("script");
        if (this.cspNonce) {
          createdScriptElement.nonce = this.cspNonce;
        }
        createdScriptElement.textContent = element.textContent;
        createdScriptElement.async = false;
        copyElementAttributes(createdScriptElement, element);
        return createdScriptElement;
      }
    }
    preservingPermanentElements(callback) {
      Bardo.preservingPermanentElements(this.permanentElementMap, callback);
    }
    focusFirstAutofocusableElement() {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (elementIsFocusable(element)) {
        element.focus();
      }
    }
    get connectedSnapshot() {
      return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
    }
    get currentElement() {
      return this.currentSnapshot.element;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    get permanentElementMap() {
      return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
    }
    get cspNonce() {
      var _a;
      return (_a = document.head.querySelector('meta[name="csp-nonce"]')) === null || _a === void 0 ? void 0 : _a.getAttribute("content");
    }
  };
  function copyElementAttributes(destinationElement, sourceElement) {
    for (const { name, value } of [...sourceElement.attributes]) {
      destinationElement.setAttribute(name, value);
    }
  }
  function elementIsFocusable(element) {
    return element && typeof element.focus == "function";
  }
  var FrameRenderer = class extends Renderer {
    get shouldRender() {
      return true;
    }
    async render() {
      await nextAnimationFrame();
      this.preservingPermanentElements(() => {
        this.loadFrameElement();
      });
      this.scrollFrameIntoView();
      await nextAnimationFrame();
      this.focusFirstAutofocusableElement();
      await nextAnimationFrame();
      this.activateScriptElements();
    }
    loadFrameElement() {
      var _a;
      const destinationRange = document.createRange();
      destinationRange.selectNodeContents(this.currentElement);
      destinationRange.deleteContents();
      const frameElement = this.newElement;
      const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();
      if (sourceRange) {
        sourceRange.selectNodeContents(frameElement);
        this.currentElement.appendChild(sourceRange.extractContents());
      }
    }
    scrollFrameIntoView() {
      if (this.currentElement.autoscroll || this.newElement.autoscroll) {
        const element = this.currentElement.firstElementChild;
        const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
        if (element) {
          element.scrollIntoView({ block });
          return true;
        }
      }
      return false;
    }
    activateScriptElements() {
      for (const inertScriptElement of this.newScriptElements) {
        const activatedScriptElement = this.createScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    get newScriptElements() {
      return this.currentElement.querySelectorAll("script");
    }
  };
  function readScrollLogicalPosition(value, defaultValue) {
    if (value == "end" || value == "start" || value == "center" || value == "nearest") {
      return value;
    } else {
      return defaultValue;
    }
  }
  var ProgressBar = class {
    constructor() {
      this.hiding = false;
      this.value = 0;
      this.visible = false;
      this.trickle = () => {
        this.setValue(this.value + Math.random() / 100);
      };
      this.stylesheetElement = this.createStylesheetElement();
      this.progressElement = this.createProgressElement();
      this.installStylesheetElement();
      this.setValue(0);
    }
    static get defaultCSS() {
      return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 9999;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    show() {
      if (!this.visible) {
        this.visible = true;
        this.installProgressElement();
        this.startTrickling();
      }
    }
    hide() {
      if (this.visible && !this.hiding) {
        this.hiding = true;
        this.fadeProgressElement(() => {
          this.uninstallProgressElement();
          this.stopTrickling();
          this.visible = false;
          this.hiding = false;
        });
      }
    }
    setValue(value) {
      this.value = value;
      this.refresh();
    }
    installStylesheetElement() {
      document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
    }
    installProgressElement() {
      this.progressElement.style.width = "0";
      this.progressElement.style.opacity = "1";
      document.documentElement.insertBefore(this.progressElement, document.body);
      this.refresh();
    }
    fadeProgressElement(callback) {
      this.progressElement.style.opacity = "0";
      setTimeout(callback, ProgressBar.animationDuration * 1.5);
    }
    uninstallProgressElement() {
      if (this.progressElement.parentNode) {
        document.documentElement.removeChild(this.progressElement);
      }
    }
    startTrickling() {
      if (!this.trickleInterval) {
        this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration);
      }
    }
    stopTrickling() {
      window.clearInterval(this.trickleInterval);
      delete this.trickleInterval;
    }
    refresh() {
      requestAnimationFrame(() => {
        this.progressElement.style.width = `${10 + this.value * 90}%`;
      });
    }
    createStylesheetElement() {
      const element = document.createElement("style");
      element.type = "text/css";
      element.textContent = ProgressBar.defaultCSS;
      return element;
    }
    createProgressElement() {
      const element = document.createElement("div");
      element.className = "turbo-progress-bar";
      return element;
    }
  };
  ProgressBar.animationDuration = 300;
  var HeadSnapshot = class extends Snapshot {
    constructor() {
      super(...arguments);
      this.detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
        const { outerHTML } = element;
        const details = outerHTML in result ? result[outerHTML] : {
          type: elementType(element),
          tracked: elementIsTracked(element),
          elements: []
        };
        return Object.assign(Object.assign({}, result), { [outerHTML]: Object.assign(Object.assign({}, details), { elements: [...details.elements, element] }) });
      }, {});
    }
    get trackedElementSignature() {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
    }
    getScriptElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
    }
    getStylesheetElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
    }
    getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
    }
    get provisionalElements() {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
        if (type == null && !tracked) {
          return [...result, ...elements];
        } else if (elements.length > 1) {
          return [...result, ...elements.slice(1)];
        } else {
          return result;
        }
      }, []);
    }
    getMetaValue(name) {
      const element = this.findMetaElementByName(name);
      return element ? element.getAttribute("content") : null;
    }
    findMetaElementByName(name) {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { elements: [element] } = this.detailsByOuterHTML[outerHTML];
        return elementIsMetaElementWithName(element, name) ? element : result;
      }, void 0);
    }
  };
  function elementType(element) {
    if (elementIsScript(element)) {
      return "script";
    } else if (elementIsStylesheet(element)) {
      return "stylesheet";
    }
  }
  function elementIsTracked(element) {
    return element.getAttribute("data-turbo-track") == "reload";
  }
  function elementIsScript(element) {
    const tagName = element.tagName.toLowerCase();
    return tagName == "script";
  }
  function elementIsNoscript(element) {
    const tagName = element.tagName.toLowerCase();
    return tagName == "noscript";
  }
  function elementIsStylesheet(element) {
    const tagName = element.tagName.toLowerCase();
    return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
  }
  function elementIsMetaElementWithName(element, name) {
    const tagName = element.tagName.toLowerCase();
    return tagName == "meta" && element.getAttribute("name") == name;
  }
  function elementWithoutNonce(element) {
    if (element.hasAttribute("nonce")) {
      element.setAttribute("nonce", "");
    }
    return element;
  }
  var PageSnapshot = class extends Snapshot {
    constructor(element, headSnapshot) {
      super(element);
      this.headSnapshot = headSnapshot;
    }
    static fromHTMLString(html = "") {
      return this.fromDocument(parseHTMLDocument(html));
    }
    static fromElement(element) {
      return this.fromDocument(element.ownerDocument);
    }
    static fromDocument({ head, body }) {
      return new this(body, new HeadSnapshot(head));
    }
    clone() {
      return new PageSnapshot(this.element.cloneNode(true), this.headSnapshot);
    }
    get headElement() {
      return this.headSnapshot.element;
    }
    get rootLocation() {
      var _a;
      const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    get cacheControlValue() {
      return this.getSetting("cache-control");
    }
    get isPreviewable() {
      return this.cacheControlValue != "no-preview";
    }
    get isCacheable() {
      return this.cacheControlValue != "no-cache";
    }
    get isVisitable() {
      return this.getSetting("visit-control") != "reload";
    }
    getSetting(name) {
      return this.headSnapshot.getMetaValue(`turbo-${name}`);
    }
  };
  var TimingMetric;
  (function(TimingMetric2) {
    TimingMetric2["visitStart"] = "visitStart";
    TimingMetric2["requestStart"] = "requestStart";
    TimingMetric2["requestEnd"] = "requestEnd";
    TimingMetric2["visitEnd"] = "visitEnd";
  })(TimingMetric || (TimingMetric = {}));
  var VisitState;
  (function(VisitState2) {
    VisitState2["initialized"] = "initialized";
    VisitState2["started"] = "started";
    VisitState2["canceled"] = "canceled";
    VisitState2["failed"] = "failed";
    VisitState2["completed"] = "completed";
  })(VisitState || (VisitState = {}));
  var defaultOptions = {
    action: "advance",
    historyChanged: false,
    visitCachedSnapshot: () => {
    },
    willRender: true
  };
  var SystemStatusCode;
  (function(SystemStatusCode2) {
    SystemStatusCode2[SystemStatusCode2["networkFailure"] = 0] = "networkFailure";
    SystemStatusCode2[SystemStatusCode2["timeoutFailure"] = -1] = "timeoutFailure";
    SystemStatusCode2[SystemStatusCode2["contentTypeMismatch"] = -2] = "contentTypeMismatch";
  })(SystemStatusCode || (SystemStatusCode = {}));
  var Visit = class {
    constructor(delegate, location2, restorationIdentifier, options = {}) {
      this.identifier = uuid();
      this.timingMetrics = {};
      this.followedRedirect = false;
      this.historyChanged = false;
      this.scrolled = false;
      this.snapshotCached = false;
      this.state = VisitState.initialized;
      this.delegate = delegate;
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier || uuid();
      const { action, historyChanged, referrer, snapshotHTML, response, visitCachedSnapshot, willRender } = Object.assign(Object.assign({}, defaultOptions), options);
      this.action = action;
      this.historyChanged = historyChanged;
      this.referrer = referrer;
      this.snapshotHTML = snapshotHTML;
      this.response = response;
      this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      this.visitCachedSnapshot = visitCachedSnapshot;
      this.willRender = willRender;
      this.scrolled = !willRender;
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    get restorationData() {
      return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
    }
    get silent() {
      return this.isSamePage;
    }
    start() {
      if (this.state == VisitState.initialized) {
        this.recordTimingMetric(TimingMetric.visitStart);
        this.state = VisitState.started;
        this.adapter.visitStarted(this);
        this.delegate.visitStarted(this);
      }
    }
    cancel() {
      if (this.state == VisitState.started) {
        if (this.request) {
          this.request.cancel();
        }
        this.cancelRender();
        this.state = VisitState.canceled;
      }
    }
    complete() {
      if (this.state == VisitState.started) {
        this.recordTimingMetric(TimingMetric.visitEnd);
        this.state = VisitState.completed;
        this.adapter.visitCompleted(this);
        this.delegate.visitCompleted(this);
        this.followRedirect();
      }
    }
    fail() {
      if (this.state == VisitState.started) {
        this.state = VisitState.failed;
        this.adapter.visitFailed(this);
      }
    }
    changeHistory() {
      var _a;
      if (!this.historyChanged) {
        const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
        const method = this.getHistoryMethodForAction(actionForHistory);
        this.history.update(method, this.location, this.restorationIdentifier);
        this.historyChanged = true;
      }
    }
    issueRequest() {
      if (this.hasPreloadedResponse()) {
        this.simulateRequest();
      } else if (this.shouldIssueRequest() && !this.request) {
        this.request = new FetchRequest(this, FetchMethod.get, this.location);
        this.request.perform();
      }
    }
    simulateRequest() {
      if (this.response) {
        this.startRequest();
        this.recordResponse();
        this.finishRequest();
      }
    }
    startRequest() {
      this.recordTimingMetric(TimingMetric.requestStart);
      this.adapter.visitRequestStarted(this);
    }
    recordResponse(response = this.response) {
      this.response = response;
      if (response) {
        const { statusCode } = response;
        if (isSuccessful(statusCode)) {
          this.adapter.visitRequestCompleted(this);
        } else {
          this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
        }
      }
    }
    finishRequest() {
      this.recordTimingMetric(TimingMetric.requestEnd);
      this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
      if (this.response) {
        const { statusCode, responseHTML } = this.response;
        this.render(async () => {
          this.cacheSnapshot();
          if (this.view.renderPromise)
            await this.view.renderPromise;
          if (isSuccessful(statusCode) && responseHTML != null) {
            await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML), false, this.willRender);
            this.adapter.visitRendered(this);
            this.complete();
          } else {
            await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML));
            this.adapter.visitRendered(this);
            this.fail();
          }
        });
      }
    }
    getCachedSnapshot() {
      const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
      if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
        if (this.action == "restore" || snapshot.isPreviewable) {
          return snapshot;
        }
      }
    }
    getPreloadedSnapshot() {
      if (this.snapshotHTML) {
        return PageSnapshot.fromHTMLString(this.snapshotHTML);
      }
    }
    hasCachedSnapshot() {
      return this.getCachedSnapshot() != null;
    }
    loadCachedSnapshot() {
      const snapshot = this.getCachedSnapshot();
      if (snapshot) {
        const isPreview = this.shouldIssueRequest();
        this.render(async () => {
          this.cacheSnapshot();
          if (this.isSamePage) {
            this.adapter.visitRendered(this);
          } else {
            if (this.view.renderPromise)
              await this.view.renderPromise;
            await this.view.renderPage(snapshot, isPreview, this.willRender);
            this.adapter.visitRendered(this);
            if (!isPreview) {
              this.complete();
            }
          }
        });
      }
    }
    followRedirect() {
      var _a;
      if (this.redirectedToLocation && !this.followedRedirect && ((_a = this.response) === null || _a === void 0 ? void 0 : _a.redirected)) {
        this.adapter.visitProposedToLocation(this.redirectedToLocation, {
          action: "replace",
          response: this.response
        });
        this.followedRedirect = true;
      }
    }
    goToSamePageAnchor() {
      if (this.isSamePage) {
        this.render(async () => {
          this.cacheSnapshot();
          this.adapter.visitRendered(this);
        });
      }
    }
    requestStarted() {
      this.startRequest();
    }
    requestPreventedHandlingResponse(request, response) {
    }
    async requestSucceededWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({ statusCode: SystemStatusCode.contentTypeMismatch, redirected });
      } else {
        this.redirectedToLocation = response.redirected ? response.location : void 0;
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    async requestFailedWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({ statusCode: SystemStatusCode.contentTypeMismatch, redirected });
      } else {
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    requestErrored(request, error2) {
      this.recordResponse({ statusCode: SystemStatusCode.networkFailure, redirected: false });
    }
    requestFinished() {
      this.finishRequest();
    }
    performScroll() {
      if (!this.scrolled) {
        if (this.action == "restore") {
          this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
        } else {
          this.scrollToAnchor() || this.view.scrollToTop();
        }
        if (this.isSamePage) {
          this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
        }
        this.scrolled = true;
      }
    }
    scrollToRestoredPosition() {
      const { scrollPosition } = this.restorationData;
      if (scrollPosition) {
        this.view.scrollToPosition(scrollPosition);
        return true;
      }
    }
    scrollToAnchor() {
      const anchor = getAnchor(this.location);
      if (anchor != null) {
        this.view.scrollToAnchor(anchor);
        return true;
      }
    }
    recordTimingMetric(metric) {
      this.timingMetrics[metric] = new Date().getTime();
    }
    getTimingMetrics() {
      return Object.assign({}, this.timingMetrics);
    }
    getHistoryMethodForAction(action) {
      switch (action) {
        case "replace":
          return history.replaceState;
        case "advance":
        case "restore":
          return history.pushState;
      }
    }
    hasPreloadedResponse() {
      return typeof this.response == "object";
    }
    shouldIssueRequest() {
      if (this.isSamePage) {
        return false;
      } else if (this.action == "restore") {
        return !this.hasCachedSnapshot();
      } else {
        return this.willRender;
      }
    }
    cacheSnapshot() {
      if (!this.snapshotCached) {
        this.view.cacheSnapshot().then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
        this.snapshotCached = true;
      }
    }
    async render(callback) {
      this.cancelRender();
      await new Promise((resolve) => {
        this.frame = requestAnimationFrame(() => resolve());
      });
      await callback();
      delete this.frame;
      this.performScroll();
    }
    cancelRender() {
      if (this.frame) {
        cancelAnimationFrame(this.frame);
        delete this.frame;
      }
    }
  };
  function isSuccessful(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }
  var BrowserAdapter = class {
    constructor(session2) {
      this.progressBar = new ProgressBar();
      this.showProgressBar = () => {
        this.progressBar.show();
      };
      this.session = session2;
    }
    visitProposedToLocation(location2, options) {
      this.navigator.startVisit(location2, uuid(), options);
    }
    visitStarted(visit2) {
      visit2.loadCachedSnapshot();
      visit2.issueRequest();
      visit2.changeHistory();
      visit2.goToSamePageAnchor();
    }
    visitRequestStarted(visit2) {
      this.progressBar.setValue(0);
      if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
        this.showVisitProgressBarAfterDelay();
      } else {
        this.showProgressBar();
      }
    }
    visitRequestCompleted(visit2) {
      visit2.loadResponse();
    }
    visitRequestFailedWithStatusCode(visit2, statusCode) {
      switch (statusCode) {
        case SystemStatusCode.networkFailure:
        case SystemStatusCode.timeoutFailure:
        case SystemStatusCode.contentTypeMismatch:
          return this.reload();
        default:
          return visit2.loadResponse();
      }
    }
    visitRequestFinished(visit2) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    visitCompleted(visit2) {
    }
    pageInvalidated() {
      this.reload();
    }
    visitFailed(visit2) {
    }
    visitRendered(visit2) {
    }
    formSubmissionStarted(formSubmission) {
      this.progressBar.setValue(0);
      this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(formSubmission) {
      this.progressBar.setValue(1);
      this.hideFormProgressBar();
    }
    showVisitProgressBarAfterDelay() {
      this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
    hideVisitProgressBar() {
      this.progressBar.hide();
      if (this.visitProgressBarTimeout != null) {
        window.clearTimeout(this.visitProgressBarTimeout);
        delete this.visitProgressBarTimeout;
      }
    }
    showFormProgressBarAfterDelay() {
      if (this.formProgressBarTimeout == null) {
        this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
    }
    hideFormProgressBar() {
      this.progressBar.hide();
      if (this.formProgressBarTimeout != null) {
        window.clearTimeout(this.formProgressBarTimeout);
        delete this.formProgressBarTimeout;
      }
    }
    reload() {
      window.location.reload();
    }
    get navigator() {
      return this.session.navigator;
    }
  };
  var CacheObserver = class {
    constructor() {
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-cache", this.removeStaleElements, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-cache", this.removeStaleElements, false);
      }
    }
    removeStaleElements() {
      const staleElements = [...document.querySelectorAll('[data-turbo-cache="false"]')];
      for (const element of staleElements) {
        element.remove();
      }
    }
  };
  var FormSubmitObserver = class {
    constructor(delegate) {
      this.started = false;
      this.submitCaptured = () => {
        removeEventListener("submit", this.submitBubbled, false);
        addEventListener("submit", this.submitBubbled, false);
      };
      this.submitBubbled = (event) => {
        if (!event.defaultPrevented) {
          const form = event.target instanceof HTMLFormElement ? event.target : void 0;
          const submitter = event.submitter || void 0;
          if (form) {
            const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.getAttribute("method");
            if (method != "dialog" && this.delegate.willSubmitForm(form, submitter)) {
              event.preventDefault();
              this.delegate.formSubmitted(form, submitter);
            }
          }
        }
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("submit", this.submitCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("submit", this.submitCaptured, true);
        this.started = false;
      }
    }
  };
  var FrameRedirector = class {
    constructor(element) {
      this.element = element;
      this.linkInterceptor = new LinkInterceptor(this, element);
      this.formInterceptor = new FormInterceptor(this, element);
    }
    start() {
      this.linkInterceptor.start();
      this.formInterceptor.start();
    }
    stop() {
      this.linkInterceptor.stop();
      this.formInterceptor.stop();
    }
    shouldInterceptLinkClick(element, url) {
      return this.shouldRedirect(element);
    }
    linkClickIntercepted(element, url) {
      const frame = this.findFrameElement(element);
      if (frame) {
        frame.delegate.linkClickIntercepted(element, url);
      }
    }
    shouldInterceptFormSubmission(element, submitter) {
      return this.shouldSubmit(element, submitter);
    }
    formSubmissionIntercepted(element, submitter) {
      const frame = this.findFrameElement(element, submitter);
      if (frame) {
        frame.removeAttribute("reloadable");
        frame.delegate.formSubmissionIntercepted(element, submitter);
      }
    }
    shouldSubmit(form, submitter) {
      var _a;
      const action = getAction(form, submitter);
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const rootLocation = expandURL((_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/");
      return this.shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
    }
    shouldRedirect(element, submitter) {
      const frame = this.findFrameElement(element, submitter);
      return frame ? frame != element.closest("turbo-frame") : false;
    }
    findFrameElement(element, submitter) {
      const id = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame");
      if (id && id != "_top") {
        const frame = this.element.querySelector(`#${id}:not([disabled])`);
        if (frame instanceof FrameElement) {
          return frame;
        }
      }
    }
  };
  var History = class {
    constructor(delegate) {
      this.restorationIdentifier = uuid();
      this.restorationData = {};
      this.started = false;
      this.pageLoaded = false;
      this.onPopState = (event) => {
        if (this.shouldHandlePopState()) {
          const { turbo } = event.state || {};
          if (turbo) {
            this.location = new URL(window.location.href);
            const { restorationIdentifier } = turbo;
            this.restorationIdentifier = restorationIdentifier;
            this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
          }
        }
      };
      this.onPageLoad = async (event) => {
        await nextMicrotask();
        this.pageLoaded = true;
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("popstate", this.onPopState, false);
        addEventListener("load", this.onPageLoad, false);
        this.started = true;
        this.replace(new URL(window.location.href));
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("popstate", this.onPopState, false);
        removeEventListener("load", this.onPageLoad, false);
        this.started = false;
      }
    }
    push(location2, restorationIdentifier) {
      this.update(history.pushState, location2, restorationIdentifier);
    }
    replace(location2, restorationIdentifier) {
      this.update(history.replaceState, location2, restorationIdentifier);
    }
    update(method, location2, restorationIdentifier = uuid()) {
      const state = { turbo: { restorationIdentifier } };
      method.call(history, state, "", location2.href);
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier;
    }
    getRestorationDataForIdentifier(restorationIdentifier) {
      return this.restorationData[restorationIdentifier] || {};
    }
    updateRestorationData(additionalData) {
      const { restorationIdentifier } = this;
      const restorationData = this.restorationData[restorationIdentifier];
      this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
    }
    assumeControlOfScrollRestoration() {
      var _a;
      if (!this.previousScrollRestoration) {
        this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
        history.scrollRestoration = "manual";
      }
    }
    relinquishControlOfScrollRestoration() {
      if (this.previousScrollRestoration) {
        history.scrollRestoration = this.previousScrollRestoration;
        delete this.previousScrollRestoration;
      }
    }
    shouldHandlePopState() {
      return this.pageIsLoaded();
    }
    pageIsLoaded() {
      return this.pageLoaded || document.readyState == "complete";
    }
  };
  var LinkClickObserver = class {
    constructor(delegate) {
      this.started = false;
      this.clickCaptured = () => {
        removeEventListener("click", this.clickBubbled, false);
        addEventListener("click", this.clickBubbled, false);
      };
      this.clickBubbled = (event) => {
        if (this.clickEventIsSignificant(event)) {
          const target = event.composedPath && event.composedPath()[0] || event.target;
          const link = this.findLinkFromClickTarget(target);
          if (link) {
            const location2 = this.getLocationForLink(link);
            if (this.delegate.willFollowLinkToLocation(link, location2)) {
              event.preventDefault();
              this.delegate.followedLinkToLocation(link, location2);
            }
          }
        }
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("click", this.clickCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("click", this.clickCaptured, true);
        this.started = false;
      }
    }
    clickEventIsSignificant(event) {
      return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
    findLinkFromClickTarget(target) {
      if (target instanceof Element) {
        return target.closest("a[href]:not([target^=_]):not([download])");
      }
    }
    getLocationForLink(link) {
      return expandURL(link.getAttribute("href") || "");
    }
  };
  function isAction(action) {
    return action == "advance" || action == "replace" || action == "restore";
  }
  var Navigator = class {
    constructor(delegate) {
      this.delegate = delegate;
    }
    proposeVisit(location2, options = {}) {
      if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
        if (locationIsVisitable(location2, this.view.snapshot.rootLocation)) {
          this.delegate.visitProposedToLocation(location2, options);
        } else {
          window.location.href = location2.toString();
        }
      }
    }
    startVisit(locatable, restorationIdentifier, options = {}) {
      this.stop();
      this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({ referrer: this.location }, options));
      this.currentVisit.start();
    }
    submitForm(form, submitter) {
      this.stop();
      this.formSubmission = new FormSubmission(this, form, submitter, true);
      this.formSubmission.start();
    }
    stop() {
      if (this.formSubmission) {
        this.formSubmission.stop();
        delete this.formSubmission;
      }
      if (this.currentVisit) {
        this.currentVisit.cancel();
        delete this.currentVisit;
      }
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    formSubmissionStarted(formSubmission) {
      if (typeof this.adapter.formSubmissionStarted === "function") {
        this.adapter.formSubmissionStarted(formSubmission);
      }
    }
    async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
      if (formSubmission == this.formSubmission) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          if (formSubmission.method != FetchMethod.get) {
            this.view.clearSnapshotCache();
          }
          const { statusCode, redirected } = fetchResponse;
          const action = this.getActionForFormSubmission(formSubmission);
          const visitOptions = { action, response: { statusCode, responseHTML, redirected } };
          this.proposeVisit(fetchResponse.location, visitOptions);
        }
      }
    }
    async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        if (fetchResponse.serverError) {
          await this.view.renderError(snapshot);
        } else {
          await this.view.renderPage(snapshot);
        }
        this.view.scrollToTop();
        this.view.clearSnapshotCache();
      }
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished(formSubmission) {
      if (typeof this.adapter.formSubmissionFinished === "function") {
        this.adapter.formSubmissionFinished(formSubmission);
      }
    }
    visitStarted(visit2) {
      this.delegate.visitStarted(visit2);
    }
    visitCompleted(visit2) {
      this.delegate.visitCompleted(visit2);
    }
    locationWithActionIsSamePage(location2, action) {
      const anchor = getAnchor(location2);
      const currentAnchor = getAnchor(this.view.lastRenderedLocation);
      const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
      return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    getActionForFormSubmission(formSubmission) {
      const { formElement, submitter } = formSubmission;
      const action = getAttribute("data-turbo-action", submitter, formElement);
      return isAction(action) ? action : "advance";
    }
  };
  var PageStage;
  (function(PageStage2) {
    PageStage2[PageStage2["initial"] = 0] = "initial";
    PageStage2[PageStage2["loading"] = 1] = "loading";
    PageStage2[PageStage2["interactive"] = 2] = "interactive";
    PageStage2[PageStage2["complete"] = 3] = "complete";
  })(PageStage || (PageStage = {}));
  var PageObserver = class {
    constructor(delegate) {
      this.stage = PageStage.initial;
      this.started = false;
      this.interpretReadyState = () => {
        const { readyState } = this;
        if (readyState == "interactive") {
          this.pageIsInteractive();
        } else if (readyState == "complete") {
          this.pageIsComplete();
        }
      };
      this.pageWillUnload = () => {
        this.delegate.pageWillUnload();
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        if (this.stage == PageStage.initial) {
          this.stage = PageStage.loading;
        }
        document.addEventListener("readystatechange", this.interpretReadyState, false);
        addEventListener("pagehide", this.pageWillUnload, false);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        document.removeEventListener("readystatechange", this.interpretReadyState, false);
        removeEventListener("pagehide", this.pageWillUnload, false);
        this.started = false;
      }
    }
    pageIsInteractive() {
      if (this.stage == PageStage.loading) {
        this.stage = PageStage.interactive;
        this.delegate.pageBecameInteractive();
      }
    }
    pageIsComplete() {
      this.pageIsInteractive();
      if (this.stage == PageStage.interactive) {
        this.stage = PageStage.complete;
        this.delegate.pageLoaded();
      }
    }
    get readyState() {
      return document.readyState;
    }
  };
  var ScrollObserver = class {
    constructor(delegate) {
      this.started = false;
      this.onScroll = () => {
        this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("scroll", this.onScroll, false);
        this.onScroll();
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("scroll", this.onScroll, false);
        this.started = false;
      }
    }
    updatePosition(position) {
      this.delegate.scrollPositionChanged(position);
    }
  };
  var StreamObserver = class {
    constructor(delegate) {
      this.sources = /* @__PURE__ */ new Set();
      this.started = false;
      this.inspectFetchResponse = (event) => {
        const response = fetchResponseFromEvent(event);
        if (response && fetchResponseIsStream(response)) {
          event.preventDefault();
          this.receiveMessageResponse(response);
        }
      };
      this.receiveMessageEvent = (event) => {
        if (this.started && typeof event.data == "string") {
          this.receiveMessageHTML(event.data);
        }
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    connectStreamSource(source) {
      if (!this.streamSourceIsConnected(source)) {
        this.sources.add(source);
        source.addEventListener("message", this.receiveMessageEvent, false);
      }
    }
    disconnectStreamSource(source) {
      if (this.streamSourceIsConnected(source)) {
        this.sources.delete(source);
        source.removeEventListener("message", this.receiveMessageEvent, false);
      }
    }
    streamSourceIsConnected(source) {
      return this.sources.has(source);
    }
    async receiveMessageResponse(response) {
      const html = await response.responseHTML;
      if (html) {
        this.receiveMessageHTML(html);
      }
    }
    receiveMessageHTML(html) {
      this.delegate.receivedMessageFromStream(new StreamMessage(html));
    }
  };
  function fetchResponseFromEvent(event) {
    var _a;
    const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;
    if (fetchResponse instanceof FetchResponse) {
      return fetchResponse;
    }
  }
  function fetchResponseIsStream(response) {
    var _a;
    const contentType = (_a = response.contentType) !== null && _a !== void 0 ? _a : "";
    return contentType.startsWith(StreamMessage.contentType);
  }
  var ErrorRenderer = class extends Renderer {
    async render() {
      this.replaceHeadAndBody();
      this.activateScriptElements();
    }
    replaceHeadAndBody() {
      const { documentElement, head, body } = document;
      documentElement.replaceChild(this.newHead, head);
      documentElement.replaceChild(this.newElement, body);
    }
    activateScriptElements() {
      for (const replaceableElement of this.scriptElements) {
        const parentNode = replaceableElement.parentNode;
        if (parentNode) {
          const element = this.createScriptElement(replaceableElement);
          parentNode.replaceChild(element, replaceableElement);
        }
      }
    }
    get newHead() {
      return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
      return [...document.documentElement.querySelectorAll("script")];
    }
  };
  var PageRenderer = class extends Renderer {
    get shouldRender() {
      return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    prepareToRender() {
      this.mergeHead();
    }
    async render() {
      if (this.willRender) {
        this.replaceBody();
      }
    }
    finishRendering() {
      super.finishRendering();
      if (!this.isPreview) {
        this.focusFirstAutofocusableElement();
      }
    }
    get currentHeadSnapshot() {
      return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
      return this.newSnapshot.headSnapshot;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    mergeHead() {
      this.copyNewHeadStylesheetElements();
      this.copyNewHeadScriptElements();
      this.removeCurrentHeadProvisionalElements();
      this.copyNewHeadProvisionalElements();
    }
    replaceBody() {
      this.preservingPermanentElements(() => {
        this.activateNewBody();
        this.assignNewBody();
      });
    }
    get trackedElementsAreIdentical() {
      return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
    }
    copyNewHeadStylesheetElements() {
      for (const element of this.newHeadStylesheetElements) {
        document.head.appendChild(element);
      }
    }
    copyNewHeadScriptElements() {
      for (const element of this.newHeadScriptElements) {
        document.head.appendChild(this.createScriptElement(element));
      }
    }
    removeCurrentHeadProvisionalElements() {
      for (const element of this.currentHeadProvisionalElements) {
        document.head.removeChild(element);
      }
    }
    copyNewHeadProvisionalElements() {
      for (const element of this.newHeadProvisionalElements) {
        document.head.appendChild(element);
      }
    }
    activateNewBody() {
      document.adoptNode(this.newElement);
      this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
      for (const inertScriptElement of this.newBodyScriptElements) {
        const activatedScriptElement = this.createScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    assignNewBody() {
      if (document.body && this.newElement instanceof HTMLBodyElement) {
        document.body.replaceWith(this.newElement);
      } else {
        document.documentElement.appendChild(this.newElement);
      }
    }
    get newHeadStylesheetElements() {
      return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get newHeadScriptElements() {
      return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get currentHeadProvisionalElements() {
      return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
      return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
      return this.newElement.querySelectorAll("script");
    }
  };
  var SnapshotCache = class {
    constructor(size) {
      this.keys = [];
      this.snapshots = {};
      this.size = size;
    }
    has(location2) {
      return toCacheKey(location2) in this.snapshots;
    }
    get(location2) {
      if (this.has(location2)) {
        const snapshot = this.read(location2);
        this.touch(location2);
        return snapshot;
      }
    }
    put(location2, snapshot) {
      this.write(location2, snapshot);
      this.touch(location2);
      return snapshot;
    }
    clear() {
      this.snapshots = {};
    }
    read(location2) {
      return this.snapshots[toCacheKey(location2)];
    }
    write(location2, snapshot) {
      this.snapshots[toCacheKey(location2)] = snapshot;
    }
    touch(location2) {
      const key = toCacheKey(location2);
      const index = this.keys.indexOf(key);
      if (index > -1)
        this.keys.splice(index, 1);
      this.keys.unshift(key);
      this.trim();
    }
    trim() {
      for (const key of this.keys.splice(this.size)) {
        delete this.snapshots[key];
      }
    }
  };
  var PageView = class extends View {
    constructor() {
      super(...arguments);
      this.snapshotCache = new SnapshotCache(10);
      this.lastRenderedLocation = new URL(location.href);
    }
    renderPage(snapshot, isPreview = false, willRender = true) {
      const renderer = new PageRenderer(this.snapshot, snapshot, isPreview, willRender);
      return this.render(renderer);
    }
    renderError(snapshot) {
      const renderer = new ErrorRenderer(this.snapshot, snapshot, false);
      return this.render(renderer);
    }
    clearSnapshotCache() {
      this.snapshotCache.clear();
    }
    async cacheSnapshot() {
      if (this.shouldCacheSnapshot) {
        this.delegate.viewWillCacheSnapshot();
        const { snapshot, lastRenderedLocation: location2 } = this;
        await nextEventLoopTick();
        const cachedSnapshot = snapshot.clone();
        this.snapshotCache.put(location2, cachedSnapshot);
        return cachedSnapshot;
      }
    }
    getCachedSnapshotForLocation(location2) {
      return this.snapshotCache.get(location2);
    }
    get snapshot() {
      return PageSnapshot.fromElement(this.element);
    }
    get shouldCacheSnapshot() {
      return this.snapshot.isCacheable;
    }
  };
  var Session = class {
    constructor() {
      this.navigator = new Navigator(this);
      this.history = new History(this);
      this.view = new PageView(this, document.documentElement);
      this.adapter = new BrowserAdapter(this);
      this.pageObserver = new PageObserver(this);
      this.cacheObserver = new CacheObserver();
      this.linkClickObserver = new LinkClickObserver(this);
      this.formSubmitObserver = new FormSubmitObserver(this);
      this.scrollObserver = new ScrollObserver(this);
      this.streamObserver = new StreamObserver(this);
      this.frameRedirector = new FrameRedirector(document.documentElement);
      this.drive = true;
      this.enabled = true;
      this.progressBarDelay = 500;
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.pageObserver.start();
        this.cacheObserver.start();
        this.linkClickObserver.start();
        this.formSubmitObserver.start();
        this.scrollObserver.start();
        this.streamObserver.start();
        this.frameRedirector.start();
        this.history.start();
        this.started = true;
        this.enabled = true;
      }
    }
    disable() {
      this.enabled = false;
    }
    stop() {
      if (this.started) {
        this.pageObserver.stop();
        this.cacheObserver.stop();
        this.linkClickObserver.stop();
        this.formSubmitObserver.stop();
        this.scrollObserver.stop();
        this.streamObserver.stop();
        this.frameRedirector.stop();
        this.history.stop();
        this.started = false;
      }
    }
    registerAdapter(adapter) {
      this.adapter = adapter;
    }
    visit(location2, options = {}) {
      this.navigator.proposeVisit(expandURL(location2), options);
    }
    connectStreamSource(source) {
      this.streamObserver.connectStreamSource(source);
    }
    disconnectStreamSource(source) {
      this.streamObserver.disconnectStreamSource(source);
    }
    renderStreamMessage(message) {
      document.documentElement.appendChild(StreamMessage.wrap(message).fragment);
    }
    clearCache() {
      this.view.clearSnapshotCache();
    }
    setProgressBarDelay(delay) {
      this.progressBarDelay = delay;
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    historyPoppedToLocationWithRestorationIdentifier(location2, restorationIdentifier) {
      if (this.enabled) {
        this.navigator.startVisit(location2, restorationIdentifier, { action: "restore", historyChanged: true });
      } else {
        this.adapter.pageInvalidated();
      }
    }
    scrollPositionChanged(position) {
      this.history.updateRestorationData({ scrollPosition: position });
    }
    willFollowLinkToLocation(link, location2) {
      return this.elementDriveEnabled(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2);
    }
    followedLinkToLocation(link, location2) {
      const action = this.getActionForLink(link);
      this.convertLinkWithMethodClickToFormSubmission(link) || this.visit(location2.href, { action });
    }
    convertLinkWithMethodClickToFormSubmission(link) {
      const linkMethod = link.getAttribute("data-turbo-method");
      if (linkMethod) {
        const form = document.createElement("form");
        form.method = linkMethod;
        form.action = link.getAttribute("href") || "undefined";
        form.hidden = true;
        if (link.hasAttribute("data-turbo-confirm")) {
          form.setAttribute("data-turbo-confirm", link.getAttribute("data-turbo-confirm"));
        }
        const frame = this.getTargetFrameForLink(link);
        if (frame) {
          form.setAttribute("data-turbo-frame", frame);
          form.addEventListener("turbo:submit-start", () => form.remove());
        } else {
          form.addEventListener("submit", () => form.remove());
        }
        document.body.appendChild(form);
        return dispatch("submit", { cancelable: true, target: form });
      } else {
        return false;
      }
    }
    allowsVisitingLocationWithAction(location2, action) {
      return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
    }
    visitProposedToLocation(location2, options) {
      extendURLWithDeprecatedProperties(location2);
      this.adapter.visitProposedToLocation(location2, options);
    }
    visitStarted(visit2) {
      extendURLWithDeprecatedProperties(visit2.location);
      if (!visit2.silent) {
        this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
      }
    }
    visitCompleted(visit2) {
      this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
    }
    locationWithActionIsSamePage(location2, action) {
      return this.navigator.locationWithActionIsSamePage(location2, action);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
    }
    willSubmitForm(form, submitter) {
      const action = getAction(form, submitter);
      return this.elementDriveEnabled(form) && (!submitter || this.elementDriveEnabled(submitter)) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
    }
    formSubmitted(form, submitter) {
      this.navigator.submitForm(form, submitter);
    }
    pageBecameInteractive() {
      this.view.lastRenderedLocation = this.location;
      this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
      this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
      this.history.relinquishControlOfScrollRestoration();
    }
    receivedMessageFromStream(message) {
      this.renderStreamMessage(message);
    }
    viewWillCacheSnapshot() {
      var _a;
      if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
        this.notifyApplicationBeforeCachingSnapshot();
      }
    }
    allowsImmediateRender({ element }, resume) {
      const event = this.notifyApplicationBeforeRender(element, resume);
      return !event.defaultPrevented;
    }
    viewRenderedSnapshot(snapshot, isPreview) {
      this.view.lastRenderedLocation = this.history.location;
      this.notifyApplicationAfterRender();
    }
    viewInvalidated() {
      this.adapter.pageInvalidated();
    }
    frameLoaded(frame) {
      this.notifyApplicationAfterFrameLoad(frame);
    }
    frameRendered(fetchResponse, frame) {
      this.notifyApplicationAfterFrameRender(fetchResponse, frame);
    }
    applicationAllowsFollowingLinkToLocation(link, location2) {
      const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2);
      return !event.defaultPrevented;
    }
    applicationAllowsVisitingLocation(location2) {
      const event = this.notifyApplicationBeforeVisitingLocation(location2);
      return !event.defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(link, location2) {
      return dispatch("turbo:click", { target: link, detail: { url: location2.href }, cancelable: true });
    }
    notifyApplicationBeforeVisitingLocation(location2) {
      return dispatch("turbo:before-visit", { detail: { url: location2.href }, cancelable: true });
    }
    notifyApplicationAfterVisitingLocation(location2, action) {
      markAsBusy(document.documentElement);
      return dispatch("turbo:visit", { detail: { url: location2.href, action } });
    }
    notifyApplicationBeforeCachingSnapshot() {
      return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(newBody, resume) {
      return dispatch("turbo:before-render", { detail: { newBody, resume }, cancelable: true });
    }
    notifyApplicationAfterRender() {
      return dispatch("turbo:render");
    }
    notifyApplicationAfterPageLoad(timing = {}) {
      clearBusyState(document.documentElement);
      return dispatch("turbo:load", { detail: { url: this.location.href, timing } });
    }
    notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
      dispatchEvent(new HashChangeEvent("hashchange", { oldURL: oldURL.toString(), newURL: newURL.toString() }));
    }
    notifyApplicationAfterFrameLoad(frame) {
      return dispatch("turbo:frame-load", { target: frame });
    }
    notifyApplicationAfterFrameRender(fetchResponse, frame) {
      return dispatch("turbo:frame-render", { detail: { fetchResponse }, target: frame, cancelable: true });
    }
    elementDriveEnabled(element) {
      const container = element === null || element === void 0 ? void 0 : element.closest("[data-turbo]");
      if (this.drive) {
        if (container) {
          return container.getAttribute("data-turbo") != "false";
        } else {
          return true;
        }
      } else {
        if (container) {
          return container.getAttribute("data-turbo") == "true";
        } else {
          return false;
        }
      }
    }
    getActionForLink(link) {
      const action = link.getAttribute("data-turbo-action");
      return isAction(action) ? action : "advance";
    }
    getTargetFrameForLink(link) {
      const frame = link.getAttribute("data-turbo-frame");
      if (frame) {
        return frame;
      } else {
        const container = link.closest("turbo-frame");
        if (container) {
          return container.id;
        }
      }
    }
    get snapshot() {
      return this.view.snapshot;
    }
  };
  function extendURLWithDeprecatedProperties(url) {
    Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
  }
  var deprecatedLocationPropertyDescriptors = {
    absoluteURL: {
      get() {
        return this.toString();
      }
    }
  };
  var session = new Session();
  var { navigator: navigator$1 } = session;
  function start() {
    session.start();
  }
  function registerAdapter(adapter) {
    session.registerAdapter(adapter);
  }
  function visit(location2, options) {
    session.visit(location2, options);
  }
  function connectStreamSource(source) {
    session.connectStreamSource(source);
  }
  function disconnectStreamSource(source) {
    session.disconnectStreamSource(source);
  }
  function renderStreamMessage(message) {
    session.renderStreamMessage(message);
  }
  function clearCache() {
    session.clearCache();
  }
  function setProgressBarDelay(delay) {
    session.setProgressBarDelay(delay);
  }
  function setConfirmMethod(confirmMethod) {
    FormSubmission.confirmMethod = confirmMethod;
  }
  var Turbo = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session,
    PageRenderer,
    PageSnapshot,
    start,
    registerAdapter,
    visit,
    connectStreamSource,
    disconnectStreamSource,
    renderStreamMessage,
    clearCache,
    setProgressBarDelay,
    setConfirmMethod
  });
  var FrameController = class {
    constructor(element) {
      this.fetchResponseLoaded = (fetchResponse) => {
      };
      this.currentFetchRequest = null;
      this.resolveVisitPromise = () => {
      };
      this.connected = false;
      this.hasBeenLoaded = false;
      this.settingSourceURL = false;
      this.element = element;
      this.view = new FrameView(this, this.element);
      this.appearanceObserver = new AppearanceObserver(this, this.element);
      this.linkInterceptor = new LinkInterceptor(this, this.element);
      this.formInterceptor = new FormInterceptor(this, this.element);
    }
    connect() {
      if (!this.connected) {
        this.connected = true;
        this.reloadable = false;
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        }
        this.linkInterceptor.start();
        this.formInterceptor.start();
        this.sourceURLChanged();
      }
    }
    disconnect() {
      if (this.connected) {
        this.connected = false;
        this.appearanceObserver.stop();
        this.linkInterceptor.stop();
        this.formInterceptor.stop();
      }
    }
    disabledChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager) {
        this.loadSourceURL();
      }
    }
    sourceURLChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
        this.loadSourceURL();
      }
    }
    loadingStyleChanged() {
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.appearanceObserver.stop();
        this.loadSourceURL();
      }
    }
    async loadSourceURL() {
      if (!this.settingSourceURL && this.enabled && this.isActive && (this.reloadable || this.sourceURL != this.currentURL)) {
        const previousURL = this.currentURL;
        this.currentURL = this.sourceURL;
        if (this.sourceURL) {
          try {
            this.element.loaded = this.visit(expandURL(this.sourceURL));
            this.appearanceObserver.stop();
            await this.element.loaded;
            this.hasBeenLoaded = true;
          } catch (error2) {
            this.currentURL = previousURL;
            throw error2;
          }
        }
      }
    }
    async loadResponse(fetchResponse) {
      if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
        this.sourceURL = fetchResponse.response.url;
      }
      try {
        const html = await fetchResponse.responseHTML;
        if (html) {
          const { body } = parseHTMLDocument(html);
          const snapshot = new Snapshot(await this.extractForeignFrameElement(body));
          const renderer = new FrameRenderer(this.view.snapshot, snapshot, false, false);
          if (this.view.renderPromise)
            await this.view.renderPromise;
          await this.view.render(renderer);
          session.frameRendered(fetchResponse, this.element);
          session.frameLoaded(this.element);
          this.fetchResponseLoaded(fetchResponse);
        }
      } catch (error2) {
        console.error(error2);
        this.view.invalidate();
      } finally {
        this.fetchResponseLoaded = () => {
        };
      }
    }
    elementAppearedInViewport(element) {
      this.loadSourceURL();
    }
    shouldInterceptLinkClick(element, url) {
      if (element.hasAttribute("data-turbo-method")) {
        return false;
      } else {
        return this.shouldInterceptNavigation(element);
      }
    }
    linkClickIntercepted(element, url) {
      this.reloadable = true;
      this.navigateFrame(element, url);
    }
    shouldInterceptFormSubmission(element, submitter) {
      return this.shouldInterceptNavigation(element, submitter);
    }
    formSubmissionIntercepted(element, submitter) {
      if (this.formSubmission) {
        this.formSubmission.stop();
      }
      this.reloadable = false;
      this.formSubmission = new FormSubmission(this, element, submitter);
      const { fetchRequest } = this.formSubmission;
      this.prepareHeadersForRequest(fetchRequest.headers, fetchRequest);
      this.formSubmission.start();
    }
    prepareHeadersForRequest(headers, request) {
      headers["Turbo-Frame"] = this.id;
    }
    requestStarted(request) {
      markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(request, response) {
      this.resolveVisitPromise();
    }
    async requestSucceededWithResponse(request, response) {
      await this.loadResponse(response);
      this.resolveVisitPromise();
    }
    requestFailedWithResponse(request, response) {
      console.error(response);
      this.resolveVisitPromise();
    }
    requestErrored(request, error2) {
      console.error(error2);
      this.resolveVisitPromise();
    }
    requestFinished(request) {
      clearBusyState(this.element);
    }
    formSubmissionStarted({ formElement }) {
      markAsBusy(formElement, this.findFrameElement(formElement));
    }
    formSubmissionSucceededWithResponse(formSubmission, response) {
      const frame = this.findFrameElement(formSubmission.formElement, formSubmission.submitter);
      this.proposeVisitIfNavigatedWithAction(frame, formSubmission.formElement, formSubmission.submitter);
      frame.delegate.loadResponse(response);
    }
    formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      this.element.delegate.loadResponse(fetchResponse);
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished({ formElement }) {
      clearBusyState(formElement, this.findFrameElement(formElement));
    }
    allowsImmediateRender(snapshot, resume) {
      return true;
    }
    viewRenderedSnapshot(snapshot, isPreview) {
    }
    viewInvalidated() {
    }
    async visit(url) {
      var _a;
      const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
      (_a = this.currentFetchRequest) === null || _a === void 0 ? void 0 : _a.cancel();
      this.currentFetchRequest = request;
      return new Promise((resolve) => {
        this.resolveVisitPromise = () => {
          this.resolveVisitPromise = () => {
          };
          this.currentFetchRequest = null;
          resolve();
        };
        request.perform();
      });
    }
    navigateFrame(element, url, submitter) {
      const frame = this.findFrameElement(element, submitter);
      this.proposeVisitIfNavigatedWithAction(frame, element, submitter);
      frame.setAttribute("reloadable", "");
      frame.src = url;
    }
    proposeVisitIfNavigatedWithAction(frame, element, submitter) {
      const action = getAttribute("data-turbo-action", submitter, element, frame);
      if (isAction(action)) {
        const { visitCachedSnapshot } = new SnapshotSubstitution(frame);
        frame.delegate.fetchResponseLoaded = (fetchResponse) => {
          if (frame.src) {
            const { statusCode, redirected } = fetchResponse;
            const responseHTML = frame.ownerDocument.documentElement.outerHTML;
            const response = { statusCode, redirected, responseHTML };
            session.visit(frame.src, { action, response, visitCachedSnapshot, willRender: false });
          }
        };
      }
    }
    findFrameElement(element, submitter) {
      var _a;
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      return (_a = getFrameElementById(id)) !== null && _a !== void 0 ? _a : this.element;
    }
    async extractForeignFrameElement(container) {
      let element;
      const id = CSS.escape(this.id);
      try {
        if (element = activateElement(container.querySelector(`turbo-frame#${id}`), this.currentURL)) {
          return element;
        }
        if (element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.currentURL)) {
          await element.loaded;
          return await this.extractForeignFrameElement(element);
        }
        console.error(`Response has no matching <turbo-frame id="${id}"> element`);
      } catch (error2) {
        console.error(error2);
      }
      return new FrameElement();
    }
    formActionIsVisitable(form, submitter) {
      const action = getAction(form, submitter);
      return locationIsVisitable(expandURL(action), this.rootLocation);
    }
    shouldInterceptNavigation(element, submitter) {
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      if (element instanceof HTMLFormElement && !this.formActionIsVisitable(element, submitter)) {
        return false;
      }
      if (!this.enabled || id == "_top") {
        return false;
      }
      if (id) {
        const frameElement = getFrameElementById(id);
        if (frameElement) {
          return !frameElement.disabled;
        }
      }
      if (!session.elementDriveEnabled(element)) {
        return false;
      }
      if (submitter && !session.elementDriveEnabled(submitter)) {
        return false;
      }
      return true;
    }
    get id() {
      return this.element.id;
    }
    get enabled() {
      return !this.element.disabled;
    }
    get sourceURL() {
      if (this.element.src) {
        return this.element.src;
      }
    }
    get reloadable() {
      const frame = this.findFrameElement(this.element);
      return frame.hasAttribute("reloadable");
    }
    set reloadable(value) {
      const frame = this.findFrameElement(this.element);
      if (value) {
        frame.setAttribute("reloadable", "");
      } else {
        frame.removeAttribute("reloadable");
      }
    }
    set sourceURL(sourceURL) {
      this.settingSourceURL = true;
      this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
      this.currentURL = this.element.src;
      this.settingSourceURL = false;
    }
    get loadingStyle() {
      return this.element.loading;
    }
    get isLoading() {
      return this.formSubmission !== void 0 || this.resolveVisitPromise() !== void 0;
    }
    get isActive() {
      return this.element.isActive && this.connected;
    }
    get rootLocation() {
      var _a;
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const root = (_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
  };
  var SnapshotSubstitution = class {
    constructor(element) {
      this.visitCachedSnapshot = ({ element: element2 }) => {
        var _a;
        const { id, clone } = this;
        (_a = element2.querySelector("#" + id)) === null || _a === void 0 ? void 0 : _a.replaceWith(clone);
      };
      this.clone = element.cloneNode(true);
      this.id = element.id;
    }
  };
  function getFrameElementById(id) {
    if (id != null) {
      const element = document.getElementById(id);
      if (element instanceof FrameElement) {
        return element;
      }
    }
  }
  function activateElement(element, currentURL) {
    if (element) {
      const src = element.getAttribute("src");
      if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
        throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
      }
      if (element.ownerDocument !== document) {
        element = document.importNode(element, true);
      }
      if (element instanceof FrameElement) {
        element.connectedCallback();
        element.disconnectedCallback();
        return element;
      }
    }
  }
  var StreamActions = {
    after() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e.nextSibling);
      });
    },
    append() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.append(this.templateContent));
    },
    before() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e);
      });
    },
    prepend() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.prepend(this.templateContent));
    },
    remove() {
      this.targetElements.forEach((e) => e.remove());
    },
    replace() {
      this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
    },
    update() {
      this.targetElements.forEach((e) => {
        e.innerHTML = "";
        e.append(this.templateContent);
      });
    }
  };
  var StreamElement = class extends HTMLElement {
    async connectedCallback() {
      try {
        await this.render();
      } catch (error2) {
        console.error(error2);
      } finally {
        this.disconnect();
      }
    }
    async render() {
      var _a;
      return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
        if (this.dispatchEvent(this.beforeRenderEvent)) {
          await nextAnimationFrame();
          this.performAction();
        }
      })();
    }
    disconnect() {
      try {
        this.remove();
      } catch (_a) {
      }
    }
    removeDuplicateTargetChildren() {
      this.duplicateChildren.forEach((c) => c.remove());
    }
    get duplicateChildren() {
      var _a;
      const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
      const newChildrenIds = [...(_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children].filter((c) => !!c.id).map((c) => c.id);
      return existingChildren.filter((c) => newChildrenIds.includes(c.id));
    }
    get performAction() {
      if (this.action) {
        const actionFunction = StreamActions[this.action];
        if (actionFunction) {
          return actionFunction;
        }
        this.raise("unknown action");
      }
      this.raise("action attribute is missing");
    }
    get targetElements() {
      if (this.target) {
        return this.targetElementsById;
      } else if (this.targets) {
        return this.targetElementsByQuery;
      } else {
        this.raise("target or targets attribute is missing");
      }
    }
    get templateContent() {
      return this.templateElement.content.cloneNode(true);
    }
    get templateElement() {
      if (this.firstElementChild instanceof HTMLTemplateElement) {
        return this.firstElementChild;
      }
      this.raise("first child element must be a <template> element");
    }
    get action() {
      return this.getAttribute("action");
    }
    get target() {
      return this.getAttribute("target");
    }
    get targets() {
      return this.getAttribute("targets");
    }
    raise(message) {
      throw new Error(`${this.description}: ${message}`);
    }
    get description() {
      var _a, _b;
      return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
    }
    get beforeRenderEvent() {
      return new CustomEvent("turbo:before-stream-render", { bubbles: true, cancelable: true });
    }
    get targetElementsById() {
      var _a;
      const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);
      if (element !== null) {
        return [element];
      } else {
        return [];
      }
    }
    get targetElementsByQuery() {
      var _a;
      const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);
      if (elements.length !== 0) {
        return Array.prototype.slice.call(elements);
      } else {
        return [];
      }
    }
  };
  FrameElement.delegateConstructor = FrameController;
  customElements.define("turbo-frame", FrameElement);
  customElements.define("turbo-stream", StreamElement);
  (() => {
    let element = document.currentScript;
    if (!element)
      return;
    if (element.hasAttribute("data-turbo-suppress-warning"))
      return;
    while (element = element.parentElement) {
      if (element == document.body) {
        return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
      }
    }
  })();
  window.Turbo = Turbo;
  start();

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
  var consumer;
  async function getConsumer() {
    return consumer || setConsumer(createConsumer2().then(setConsumer));
  }
  function setConsumer(newConsumer) {
    return consumer = newConsumer;
  }
  async function createConsumer2() {
    const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
    return createConsumer3();
  }
  async function subscribeTo(channel, mixin) {
    const { subscriptions } = await getConsumer();
    return subscriptions.create(channel, mixin);
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
  var TurboCableStreamSourceElement = class extends HTMLElement {
    async connectedCallback() {
      connectStreamSource(this);
      this.subscription = await subscribeTo(this.channel, { received: this.dispatchMessageEvent.bind(this) });
    }
    disconnectedCallback() {
      disconnectStreamSource(this);
      if (this.subscription)
        this.subscription.unsubscribe();
    }
    dispatchMessageEvent(data) {
      const event = new MessageEvent("message", { data });
      return this.dispatchEvent(event);
    }
    get channel() {
      const channel = this.getAttribute("channel");
      const signed_stream_name = this.getAttribute("signed-stream-name");
      return { channel, signed_stream_name };
    }
  };
  customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);

  // node_modules/@hotwired/stimulus/dist/stimulus.js
  var EventListener = class {
    constructor(eventTarget, eventName, eventOptions) {
      this.eventTarget = eventTarget;
      this.eventName = eventName;
      this.eventOptions = eventOptions;
      this.unorderedBindings = /* @__PURE__ */ new Set();
    }
    connect() {
      this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
    }
    disconnect() {
      this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
    }
    bindingConnected(binding) {
      this.unorderedBindings.add(binding);
    }
    bindingDisconnected(binding) {
      this.unorderedBindings.delete(binding);
    }
    handleEvent(event) {
      const extendedEvent = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent);
        }
      }
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left, right) => {
        const leftIndex = left.index, rightIndex = right.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    }
  };
  function extendEvent(event) {
    if ("immediatePropagationStopped" in event) {
      return event;
    } else {
      const { stopImmediatePropagation } = event;
      return Object.assign(event, {
        immediatePropagationStopped: false,
        stopImmediatePropagation() {
          this.immediatePropagationStopped = true;
          stopImmediatePropagation.call(this);
        }
      });
    }
  }
  var Dispatcher = class {
    constructor(application2) {
      this.application = application2;
      this.eventListenerMaps = /* @__PURE__ */ new Map();
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.eventListeners.forEach((eventListener) => eventListener.connect());
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.eventListeners.forEach((eventListener) => eventListener.disconnect());
      }
    }
    get eventListeners() {
      return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
    }
    bindingConnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingConnected(binding);
    }
    bindingDisconnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
    }
    handleError(error2, message, detail = {}) {
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    fetchEventListenerForBinding(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      return this.fetchEventListener(eventTarget, eventName, eventOptions);
    }
    fetchEventListener(eventTarget, eventName, eventOptions) {
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      let eventListener = eventListenerMap.get(cacheKey);
      if (!eventListener) {
        eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
        eventListenerMap.set(cacheKey, eventListener);
      }
      return eventListener;
    }
    createEventListener(eventTarget, eventName, eventOptions) {
      const eventListener = new EventListener(eventTarget, eventName, eventOptions);
      if (this.started) {
        eventListener.connect();
      }
      return eventListener;
    }
    fetchEventListenerMapForEventTarget(eventTarget) {
      let eventListenerMap = this.eventListenerMaps.get(eventTarget);
      if (!eventListenerMap) {
        eventListenerMap = /* @__PURE__ */ new Map();
        this.eventListenerMaps.set(eventTarget, eventListenerMap);
      }
      return eventListenerMap;
    }
    cacheKey(eventName, eventOptions) {
      const parts = [eventName];
      Object.keys(eventOptions).sort().forEach((key) => {
        parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
      });
      return parts.join(":");
    }
  };
  var descriptorPattern = /^((.+?)(@(window|document))?->)?(.+?)(#([^:]+?))(:(.+))?$/;
  function parseActionDescriptorString(descriptorString) {
    const source = descriptorString.trim();
    const matches = source.match(descriptorPattern) || [];
    return {
      eventTarget: parseEventTarget(matches[4]),
      eventName: matches[2],
      eventOptions: matches[9] ? parseEventOptions(matches[9]) : {},
      identifier: matches[5],
      methodName: matches[7]
    };
  }
  function parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    } else if (eventTargetName == "document") {
      return document;
    }
  }
  function parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
  }
  function stringifyEventTarget(eventTarget) {
    if (eventTarget == window) {
      return "window";
    } else if (eventTarget == document) {
      return "document";
    }
  }
  function camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
  }
  function tokenize(value) {
    return value.match(/[^\s]+/g) || [];
  }
  var Action = class {
    constructor(element, index, descriptor) {
      this.element = element;
      this.index = index;
      this.eventTarget = descriptor.eventTarget || element;
      this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
      this.eventOptions = descriptor.eventOptions || {};
      this.identifier = descriptor.identifier || error("missing identifier");
      this.methodName = descriptor.methodName || error("missing method name");
    }
    static forToken(token) {
      return new this(token.element, token.index, parseActionDescriptorString(token.content));
    }
    toString() {
      const eventNameSuffix = this.eventTargetName ? `@${this.eventTargetName}` : "";
      return `${this.eventName}${eventNameSuffix}->${this.identifier}#${this.methodName}`;
    }
    get params() {
      if (this.eventTarget instanceof Element) {
        return this.getParamsFromEventTargetAttributes(this.eventTarget);
      } else {
        return {};
      }
    }
    getParamsFromEventTargetAttributes(eventTarget) {
      const params = {};
      const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`);
      const attributes = Array.from(eventTarget.attributes);
      attributes.forEach(({ name, value }) => {
        const match = name.match(pattern);
        const key = match && match[1];
        if (key) {
          Object.assign(params, { [camelize(key)]: typecast(value) });
        }
      });
      return params;
    }
    get eventTargetName() {
      return stringifyEventTarget(this.eventTarget);
    }
  };
  var defaultEventNames = {
    "a": (e) => "click",
    "button": (e) => "click",
    "form": (e) => "submit",
    "details": (e) => "toggle",
    "input": (e) => e.getAttribute("type") == "submit" ? "click" : "input",
    "select": (e) => "change",
    "textarea": (e) => "input"
  };
  function getDefaultEventNameForElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName in defaultEventNames) {
      return defaultEventNames[tagName](element);
    }
  }
  function error(message) {
    throw new Error(message);
  }
  function typecast(value) {
    try {
      return JSON.parse(value);
    } catch (o_O) {
      return value;
    }
  }
  var Binding = class {
    constructor(context, action) {
      this.context = context;
      this.action = action;
    }
    get index() {
      return this.action.index;
    }
    get eventTarget() {
      return this.action.eventTarget;
    }
    get eventOptions() {
      return this.action.eventOptions;
    }
    get identifier() {
      return this.context.identifier;
    }
    handleEvent(event) {
      if (this.willBeInvokedByEvent(event)) {
        this.invokeWithEvent(event);
      }
    }
    get eventName() {
      return this.action.eventName;
    }
    get method() {
      const method = this.controller[this.methodName];
      if (typeof method == "function") {
        return method;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    invokeWithEvent(event) {
      const { target, currentTarget } = event;
      try {
        const { params } = this.action;
        const actionEvent = Object.assign(event, { params });
        this.method.call(this.controller, actionEvent);
        this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
      } catch (error2) {
        const { identifier, controller, element, index } = this;
        const detail = { identifier, controller, element, index, event };
        this.context.handleError(error2, `invoking action "${this.action}"`, detail);
      }
    }
    willBeInvokedByEvent(event) {
      const eventTarget = event.target;
      if (this.element === eventTarget) {
        return true;
      } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
        return this.scope.containsElement(eventTarget);
      } else {
        return this.scope.containsElement(this.action.element);
      }
    }
    get controller() {
      return this.context.controller;
    }
    get methodName() {
      return this.action.methodName;
    }
    get element() {
      return this.scope.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var ElementObserver = class {
    constructor(element, delegate) {
      this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
      this.element = element;
      this.started = false;
      this.delegate = delegate;
      this.elements = /* @__PURE__ */ new Set();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.refresh();
      }
    }
    pause(callback) {
      if (this.started) {
        this.mutationObserver.disconnect();
        this.started = false;
      }
      callback();
      if (!this.started) {
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        const matches = new Set(this.matchElementsInTree());
        for (const element of Array.from(this.elements)) {
          if (!matches.has(element)) {
            this.removeElement(element);
          }
        }
        for (const element of Array.from(matches)) {
          this.addElement(element);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      if (mutation.type == "attributes") {
        this.processAttributeChange(mutation.target, mutation.attributeName);
      } else if (mutation.type == "childList") {
        this.processRemovedNodes(mutation.removedNodes);
        this.processAddedNodes(mutation.addedNodes);
      }
    }
    processAttributeChange(node, attributeName) {
      const element = node;
      if (this.elements.has(element)) {
        if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
          this.delegate.elementAttributeChanged(element, attributeName);
        } else {
          this.removeElement(element);
        }
      } else if (this.matchElement(element)) {
        this.addElement(element);
      }
    }
    processRemovedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element) {
          this.processTree(element, this.removeElement);
        }
      }
    }
    processAddedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element && this.elementIsActive(element)) {
          this.processTree(element, this.addElement);
        }
      }
    }
    matchElement(element) {
      return this.delegate.matchElement(element);
    }
    matchElementsInTree(tree = this.element) {
      return this.delegate.matchElementsInTree(tree);
    }
    processTree(tree, processor) {
      for (const element of this.matchElementsInTree(tree)) {
        processor.call(this, element);
      }
    }
    elementFromNode(node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        return node;
      }
    }
    elementIsActive(element) {
      if (element.isConnected != this.element.isConnected) {
        return false;
      } else {
        return this.element.contains(element);
      }
    }
    addElement(element) {
      if (!this.elements.has(element)) {
        if (this.elementIsActive(element)) {
          this.elements.add(element);
          if (this.delegate.elementMatched) {
            this.delegate.elementMatched(element);
          }
        }
      }
    }
    removeElement(element) {
      if (this.elements.has(element)) {
        this.elements.delete(element);
        if (this.delegate.elementUnmatched) {
          this.delegate.elementUnmatched(element);
        }
      }
    }
  };
  var AttributeObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeName = attributeName;
      this.delegate = delegate;
      this.elementObserver = new ElementObserver(element, this);
    }
    get element() {
      return this.elementObserver.element;
    }
    get selector() {
      return `[${this.attributeName}]`;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get started() {
      return this.elementObserver.started;
    }
    matchElement(element) {
      return element.hasAttribute(this.attributeName);
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector));
      return match.concat(matches);
    }
    elementMatched(element) {
      if (this.delegate.elementMatchedAttribute) {
        this.delegate.elementMatchedAttribute(element, this.attributeName);
      }
    }
    elementUnmatched(element) {
      if (this.delegate.elementUnmatchedAttribute) {
        this.delegate.elementUnmatchedAttribute(element, this.attributeName);
      }
    }
    elementAttributeChanged(element, attributeName) {
      if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
        this.delegate.elementAttributeValueChanged(element, attributeName);
      }
    }
  };
  var StringMapObserver = class {
    constructor(element, delegate) {
      this.element = element;
      this.delegate = delegate;
      this.started = false;
      this.stringMap = /* @__PURE__ */ new Map();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
        this.refresh();
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        for (const attributeName of this.knownAttributeNames) {
          this.refreshAttribute(attributeName, null);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      const attributeName = mutation.attributeName;
      if (attributeName) {
        this.refreshAttribute(attributeName, mutation.oldValue);
      }
    }
    refreshAttribute(attributeName, oldValue) {
      const key = this.delegate.getStringMapKeyForAttribute(attributeName);
      if (key != null) {
        if (!this.stringMap.has(attributeName)) {
          this.stringMapKeyAdded(key, attributeName);
        }
        const value = this.element.getAttribute(attributeName);
        if (this.stringMap.get(attributeName) != value) {
          this.stringMapValueChanged(value, key, oldValue);
        }
        if (value == null) {
          const oldValue2 = this.stringMap.get(attributeName);
          this.stringMap.delete(attributeName);
          if (oldValue2)
            this.stringMapKeyRemoved(key, attributeName, oldValue2);
        } else {
          this.stringMap.set(attributeName, value);
        }
      }
    }
    stringMapKeyAdded(key, attributeName) {
      if (this.delegate.stringMapKeyAdded) {
        this.delegate.stringMapKeyAdded(key, attributeName);
      }
    }
    stringMapValueChanged(value, key, oldValue) {
      if (this.delegate.stringMapValueChanged) {
        this.delegate.stringMapValueChanged(value, key, oldValue);
      }
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      if (this.delegate.stringMapKeyRemoved) {
        this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
      }
    }
    get knownAttributeNames() {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    }
    get currentAttributeNames() {
      return Array.from(this.element.attributes).map((attribute) => attribute.name);
    }
    get recordedAttributeNames() {
      return Array.from(this.stringMap.keys());
    }
  };
  function add(map, key, value) {
    fetch2(map, key).add(value);
  }
  function del(map, key, value) {
    fetch2(map, key).delete(value);
    prune(map, key);
  }
  function fetch2(map, key) {
    let values = map.get(key);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      map.set(key, values);
    }
    return values;
  }
  function prune(map, key) {
    const values = map.get(key);
    if (values != null && values.size == 0) {
      map.delete(key);
    }
  }
  var Multimap = class {
    constructor() {
      this.valuesByKey = /* @__PURE__ */ new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((values, set) => values.concat(Array.from(set)), []);
    }
    get size() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((size, set) => size + set.size, 0);
    }
    add(key, value) {
      add(this.valuesByKey, key, value);
    }
    delete(key, value) {
      del(this.valuesByKey, key, value);
    }
    has(key, value) {
      const values = this.valuesByKey.get(key);
      return values != null && values.has(value);
    }
    hasKey(key) {
      return this.valuesByKey.has(key);
    }
    hasValue(value) {
      const sets = Array.from(this.valuesByKey.values());
      return sets.some((set) => set.has(value));
    }
    getValuesForKey(key) {
      const values = this.valuesByKey.get(key);
      return values ? Array.from(values) : [];
    }
    getKeysForValue(value) {
      return Array.from(this.valuesByKey).filter(([key, values]) => values.has(value)).map(([key, values]) => key);
    }
  };
  var TokenListObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeObserver = new AttributeObserver(element, attributeName, this);
      this.delegate = delegate;
      this.tokensByElement = new Multimap();
    }
    get started() {
      return this.attributeObserver.started;
    }
    start() {
      this.attributeObserver.start();
    }
    pause(callback) {
      this.attributeObserver.pause(callback);
    }
    stop() {
      this.attributeObserver.stop();
    }
    refresh() {
      this.attributeObserver.refresh();
    }
    get element() {
      return this.attributeObserver.element;
    }
    get attributeName() {
      return this.attributeObserver.attributeName;
    }
    elementMatchedAttribute(element) {
      this.tokensMatched(this.readTokensForElement(element));
    }
    elementAttributeValueChanged(element) {
      const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
      this.tokensUnmatched(unmatchedTokens);
      this.tokensMatched(matchedTokens);
    }
    elementUnmatchedAttribute(element) {
      this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
    }
    tokensMatched(tokens) {
      tokens.forEach((token) => this.tokenMatched(token));
    }
    tokensUnmatched(tokens) {
      tokens.forEach((token) => this.tokenUnmatched(token));
    }
    tokenMatched(token) {
      this.delegate.tokenMatched(token);
      this.tokensByElement.add(token.element, token);
    }
    tokenUnmatched(token) {
      this.delegate.tokenUnmatched(token);
      this.tokensByElement.delete(token.element, token);
    }
    refreshTokensForElement(element) {
      const previousTokens = this.tokensByElement.getValuesForKey(element);
      const currentTokens = this.readTokensForElement(element);
      const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
      if (firstDifferingIndex == -1) {
        return [[], []];
      } else {
        return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
      }
    }
    readTokensForElement(element) {
      const attributeName = this.attributeName;
      const tokenString = element.getAttribute(attributeName) || "";
      return parseTokenString(tokenString, element, attributeName);
    }
  };
  function parseTokenString(tokenString, element, attributeName) {
    return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
  }
  function zip(left, right) {
    const length = Math.max(left.length, right.length);
    return Array.from({ length }, (_, index) => [left[index], right[index]]);
  }
  function tokensAreEqual(left, right) {
    return left && right && left.index == right.index && left.content == right.content;
  }
  var ValueListObserver = class {
    constructor(element, attributeName, delegate) {
      this.tokenListObserver = new TokenListObserver(element, attributeName, this);
      this.delegate = delegate;
      this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
      this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
    }
    get started() {
      return this.tokenListObserver.started;
    }
    start() {
      this.tokenListObserver.start();
    }
    stop() {
      this.tokenListObserver.stop();
    }
    refresh() {
      this.tokenListObserver.refresh();
    }
    get element() {
      return this.tokenListObserver.element;
    }
    get attributeName() {
      return this.tokenListObserver.attributeName;
    }
    tokenMatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).set(token, value);
        this.delegate.elementMatchedValue(element, value);
      }
    }
    tokenUnmatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).delete(token);
        this.delegate.elementUnmatchedValue(element, value);
      }
    }
    fetchParseResultForToken(token) {
      let parseResult = this.parseResultsByToken.get(token);
      if (!parseResult) {
        parseResult = this.parseToken(token);
        this.parseResultsByToken.set(token, parseResult);
      }
      return parseResult;
    }
    fetchValuesByTokenForElement(element) {
      let valuesByToken = this.valuesByTokenByElement.get(element);
      if (!valuesByToken) {
        valuesByToken = /* @__PURE__ */ new Map();
        this.valuesByTokenByElement.set(element, valuesByToken);
      }
      return valuesByToken;
    }
    parseToken(token) {
      try {
        const value = this.delegate.parseValueForToken(token);
        return { value };
      } catch (error2) {
        return { error: error2 };
      }
    }
  };
  var BindingObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.bindingsByAction = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.valueListObserver) {
        this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
        this.valueListObserver.start();
      }
    }
    stop() {
      if (this.valueListObserver) {
        this.valueListObserver.stop();
        delete this.valueListObserver;
        this.disconnectAllActions();
      }
    }
    get element() {
      return this.context.element;
    }
    get identifier() {
      return this.context.identifier;
    }
    get actionAttribute() {
      return this.schema.actionAttribute;
    }
    get schema() {
      return this.context.schema;
    }
    get bindings() {
      return Array.from(this.bindingsByAction.values());
    }
    connectAction(action) {
      const binding = new Binding(this.context, action);
      this.bindingsByAction.set(action, binding);
      this.delegate.bindingConnected(binding);
    }
    disconnectAction(action) {
      const binding = this.bindingsByAction.get(action);
      if (binding) {
        this.bindingsByAction.delete(action);
        this.delegate.bindingDisconnected(binding);
      }
    }
    disconnectAllActions() {
      this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding));
      this.bindingsByAction.clear();
    }
    parseValueForToken(token) {
      const action = Action.forToken(token);
      if (action.identifier == this.identifier) {
        return action;
      }
    }
    elementMatchedValue(element, action) {
      this.connectAction(action);
    }
    elementUnmatchedValue(element, action) {
      this.disconnectAction(action);
    }
  };
  var ValueObserver = class {
    constructor(context, receiver) {
      this.context = context;
      this.receiver = receiver;
      this.stringMapObserver = new StringMapObserver(this.element, this);
      this.valueDescriptorMap = this.controller.valueDescriptorMap;
      this.invokeChangedCallbacksForDefaultValues();
    }
    start() {
      this.stringMapObserver.start();
    }
    stop() {
      this.stringMapObserver.stop();
    }
    get element() {
      return this.context.element;
    }
    get controller() {
      return this.context.controller;
    }
    getStringMapKeyForAttribute(attributeName) {
      if (attributeName in this.valueDescriptorMap) {
        return this.valueDescriptorMap[attributeName].name;
      }
    }
    stringMapKeyAdded(key, attributeName) {
      const descriptor = this.valueDescriptorMap[attributeName];
      if (!this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
      }
    }
    stringMapValueChanged(value, name, oldValue) {
      const descriptor = this.valueDescriptorNameMap[name];
      if (value === null)
        return;
      if (oldValue === null) {
        oldValue = descriptor.writer(descriptor.defaultValue);
      }
      this.invokeChangedCallback(name, value, oldValue);
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      const descriptor = this.valueDescriptorNameMap[key];
      if (this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
      } else {
        this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
      }
    }
    invokeChangedCallbacksForDefaultValues() {
      for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
        if (defaultValue != void 0 && !this.controller.data.has(key)) {
          this.invokeChangedCallback(name, writer(defaultValue), void 0);
        }
      }
    }
    invokeChangedCallback(name, rawValue, rawOldValue) {
      const changedMethodName = `${name}Changed`;
      const changedMethod = this.receiver[changedMethodName];
      if (typeof changedMethod == "function") {
        const descriptor = this.valueDescriptorNameMap[name];
        const value = descriptor.reader(rawValue);
        let oldValue = rawOldValue;
        if (rawOldValue) {
          oldValue = descriptor.reader(rawOldValue);
        }
        changedMethod.call(this.receiver, value, oldValue);
      }
    }
    get valueDescriptors() {
      const { valueDescriptorMap } = this;
      return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
    }
    get valueDescriptorNameMap() {
      const descriptors = {};
      Object.keys(this.valueDescriptorMap).forEach((key) => {
        const descriptor = this.valueDescriptorMap[key];
        descriptors[descriptor.name] = descriptor;
      });
      return descriptors;
    }
    hasValue(attributeName) {
      const descriptor = this.valueDescriptorNameMap[attributeName];
      const hasMethodName = `has${capitalize(descriptor.name)}`;
      return this.receiver[hasMethodName];
    }
  };
  var TargetObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.targetsByName = new Multimap();
    }
    start() {
      if (!this.tokenListObserver) {
        this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
        this.tokenListObserver.start();
      }
    }
    stop() {
      if (this.tokenListObserver) {
        this.disconnectAllTargets();
        this.tokenListObserver.stop();
        delete this.tokenListObserver;
      }
    }
    tokenMatched({ element, content: name }) {
      if (this.scope.containsElement(element)) {
        this.connectTarget(element, name);
      }
    }
    tokenUnmatched({ element, content: name }) {
      this.disconnectTarget(element, name);
    }
    connectTarget(element, name) {
      var _a;
      if (!this.targetsByName.has(name, element)) {
        this.targetsByName.add(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
      }
    }
    disconnectTarget(element, name) {
      var _a;
      if (this.targetsByName.has(name, element)) {
        this.targetsByName.delete(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
      }
    }
    disconnectAllTargets() {
      for (const name of this.targetsByName.keys) {
        for (const element of this.targetsByName.getValuesForKey(name)) {
          this.disconnectTarget(element, name);
        }
      }
    }
    get attributeName() {
      return `data-${this.context.identifier}-target`;
    }
    get element() {
      return this.context.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var Context = class {
    constructor(module, scope) {
      this.logDebugActivity = (functionName, detail = {}) => {
        const { identifier, controller, element } = this;
        detail = Object.assign({ identifier, controller, element }, detail);
        this.application.logDebugActivity(this.identifier, functionName, detail);
      };
      this.module = module;
      this.scope = scope;
      this.controller = new module.controllerConstructor(this);
      this.bindingObserver = new BindingObserver(this, this.dispatcher);
      this.valueObserver = new ValueObserver(this, this.controller);
      this.targetObserver = new TargetObserver(this, this);
      try {
        this.controller.initialize();
        this.logDebugActivity("initialize");
      } catch (error2) {
        this.handleError(error2, "initializing controller");
      }
    }
    connect() {
      this.bindingObserver.start();
      this.valueObserver.start();
      this.targetObserver.start();
      try {
        this.controller.connect();
        this.logDebugActivity("connect");
      } catch (error2) {
        this.handleError(error2, "connecting controller");
      }
    }
    disconnect() {
      try {
        this.controller.disconnect();
        this.logDebugActivity("disconnect");
      } catch (error2) {
        this.handleError(error2, "disconnecting controller");
      }
      this.targetObserver.stop();
      this.valueObserver.stop();
      this.bindingObserver.stop();
    }
    get application() {
      return this.module.application;
    }
    get identifier() {
      return this.module.identifier;
    }
    get schema() {
      return this.application.schema;
    }
    get dispatcher() {
      return this.application.dispatcher;
    }
    get element() {
      return this.scope.element;
    }
    get parentElement() {
      return this.element.parentElement;
    }
    handleError(error2, message, detail = {}) {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    targetConnected(element, name) {
      this.invokeControllerMethod(`${name}TargetConnected`, element);
    }
    targetDisconnected(element, name) {
      this.invokeControllerMethod(`${name}TargetDisconnected`, element);
    }
    invokeControllerMethod(methodName, ...args) {
      const controller = this.controller;
      if (typeof controller[methodName] == "function") {
        controller[methodName](...args);
      }
    }
  };
  function readInheritableStaticArrayValues(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
  }
  function bless(constructor) {
    return shadow(constructor, getBlessedProperties(constructor));
  }
  function shadow(constructor, properties) {
    const shadowConstructor = extend2(constructor);
    const shadowProperties = getShadowProperties(constructor.prototype, properties);
    Object.defineProperties(shadowConstructor.prototype, shadowProperties);
    return shadowConstructor;
  }
  function getBlessedProperties(constructor) {
    const blessings = readInheritableStaticArrayValues(constructor, "blessings");
    return blessings.reduce((blessedProperties, blessing) => {
      const properties = blessing(constructor);
      for (const key in properties) {
        const descriptor = blessedProperties[key] || {};
        blessedProperties[key] = Object.assign(descriptor, properties[key]);
      }
      return blessedProperties;
    }, {});
  }
  function getShadowProperties(prototype, properties) {
    return getOwnKeys(properties).reduce((shadowProperties, key) => {
      const descriptor = getShadowedDescriptor(prototype, properties, key);
      if (descriptor) {
        Object.assign(shadowProperties, { [key]: descriptor });
      }
      return shadowProperties;
    }, {});
  }
  function getShadowedDescriptor(prototype, properties, key) {
    const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
    if (!shadowedByValue) {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
      if (shadowingDescriptor) {
        descriptor.get = shadowingDescriptor.get || descriptor.get;
        descriptor.set = shadowingDescriptor.set || descriptor.set;
      }
      return descriptor;
    }
  }
  var getOwnKeys = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [
        ...Object.getOwnPropertyNames(object),
        ...Object.getOwnPropertySymbols(object)
      ];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend2 = (() => {
    function extendWithReflect(constructor) {
      function extended() {
        return Reflect.construct(constructor, arguments, new.target);
      }
      extended.prototype = Object.create(constructor.prototype, {
        constructor: { value: extended }
      });
      Reflect.setPrototypeOf(extended, constructor);
      return extended;
    }
    function testReflectExtension() {
      const a = function() {
        this.a.call(this);
      };
      const b = extendWithReflect(a);
      b.prototype.a = function() {
      };
      return new b();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error2) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  function blessDefinition(definition) {
    return {
      identifier: definition.identifier,
      controllerConstructor: bless(definition.controllerConstructor)
    };
  }
  var Module = class {
    constructor(application2, definition) {
      this.application = application2;
      this.definition = blessDefinition(definition);
      this.contextsByScope = /* @__PURE__ */ new WeakMap();
      this.connectedContexts = /* @__PURE__ */ new Set();
    }
    get identifier() {
      return this.definition.identifier;
    }
    get controllerConstructor() {
      return this.definition.controllerConstructor;
    }
    get contexts() {
      return Array.from(this.connectedContexts);
    }
    connectContextForScope(scope) {
      const context = this.fetchContextForScope(scope);
      this.connectedContexts.add(context);
      context.connect();
    }
    disconnectContextForScope(scope) {
      const context = this.contextsByScope.get(scope);
      if (context) {
        this.connectedContexts.delete(context);
        context.disconnect();
      }
    }
    fetchContextForScope(scope) {
      let context = this.contextsByScope.get(scope);
      if (!context) {
        context = new Context(this, scope);
        this.contextsByScope.set(scope, context);
      }
      return context;
    }
  };
  var ClassMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    has(name) {
      return this.data.has(this.getDataKey(name));
    }
    get(name) {
      return this.getAll(name)[0];
    }
    getAll(name) {
      const tokenString = this.data.get(this.getDataKey(name)) || "";
      return tokenize(tokenString);
    }
    getAttributeName(name) {
      return this.data.getAttributeNameForKey(this.getDataKey(name));
    }
    getDataKey(name) {
      return `${name}-class`;
    }
    get data() {
      return this.scope.data;
    }
  };
  var DataMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.getAttribute(name);
    }
    set(key, value) {
      const name = this.getAttributeNameForKey(key);
      this.element.setAttribute(name, value);
      return this.get(key);
    }
    has(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.hasAttribute(name);
    }
    delete(key) {
      if (this.has(key)) {
        const name = this.getAttributeNameForKey(key);
        this.element.removeAttribute(name);
        return true;
      } else {
        return false;
      }
    }
    getAttributeNameForKey(key) {
      return `data-${this.identifier}-${dasherize(key)}`;
    }
  };
  var Guide = class {
    constructor(logger) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger;
    }
    warn(object, key, message) {
      let warnedKeys = this.warnedKeysByObject.get(object);
      if (!warnedKeys) {
        warnedKeys = /* @__PURE__ */ new Set();
        this.warnedKeysByObject.set(object, warnedKeys);
      }
      if (!warnedKeys.has(key)) {
        warnedKeys.add(key);
        this.logger.warn(message, object);
      }
    }
  };
  function attributeValueContainsToken(attributeName, token) {
    return `[${attributeName}~="${token}"]`;
  }
  var TargetSet = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(targetName) {
      return this.find(targetName) != null;
    }
    find(...targetNames) {
      return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
    }
    findAll(...targetNames) {
      return targetNames.reduce((targets, targetName) => [
        ...targets,
        ...this.findAllTargets(targetName),
        ...this.findAllLegacyTargets(targetName)
      ], []);
    }
    findTarget(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector);
    }
    findAllTargets(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
    }
    getLegacySelectorForTargetName(targetName) {
      const targetDescriptor = `${this.identifier}.${targetName}`;
      return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
    }
    deprecate(element, targetName) {
      if (element) {
        const { identifier } = this;
        const attributeName = this.schema.targetAttribute;
        const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
        this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
      }
      return element;
    }
    get guide() {
      return this.scope.guide;
    }
  };
  var Scope = class {
    constructor(schema, element, identifier, logger) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger);
    }
    findElement(selector) {
      return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
    }
    findAllElements(selector) {
      return [
        ...this.element.matches(selector) ? [this.element] : [],
        ...this.queryElements(selector).filter(this.containsElement)
      ];
    }
    queryElements(selector) {
      return Array.from(this.element.querySelectorAll(selector));
    }
    get controllerSelector() {
      return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
    }
  };
  var ScopeObserver = class {
    constructor(element, schema, delegate) {
      this.element = element;
      this.schema = schema;
      this.delegate = delegate;
      this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
      this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
      this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
    }
    start() {
      this.valueListObserver.start();
    }
    stop() {
      this.valueListObserver.stop();
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    parseValueForToken(token) {
      const { element, content: identifier } = token;
      const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
      let scope = scopesByIdentifier.get(identifier);
      if (!scope) {
        scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
        scopesByIdentifier.set(identifier, scope);
      }
      return scope;
    }
    elementMatchedValue(element, value) {
      const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
      this.scopeReferenceCounts.set(value, referenceCount);
      if (referenceCount == 1) {
        this.delegate.scopeConnected(value);
      }
    }
    elementUnmatchedValue(element, value) {
      const referenceCount = this.scopeReferenceCounts.get(value);
      if (referenceCount) {
        this.scopeReferenceCounts.set(value, referenceCount - 1);
        if (referenceCount == 1) {
          this.delegate.scopeDisconnected(value);
        }
      }
    }
    fetchScopesByIdentifierForElement(element) {
      let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
      if (!scopesByIdentifier) {
        scopesByIdentifier = /* @__PURE__ */ new Map();
        this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
      }
      return scopesByIdentifier;
    }
  };
  var Router = class {
    constructor(application2) {
      this.application = application2;
      this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
      this.scopesByIdentifier = new Multimap();
      this.modulesByIdentifier = /* @__PURE__ */ new Map();
    }
    get element() {
      return this.application.element;
    }
    get schema() {
      return this.application.schema;
    }
    get logger() {
      return this.application.logger;
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    get modules() {
      return Array.from(this.modulesByIdentifier.values());
    }
    get contexts() {
      return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
    }
    start() {
      this.scopeObserver.start();
    }
    stop() {
      this.scopeObserver.stop();
    }
    loadDefinition(definition) {
      this.unloadIdentifier(definition.identifier);
      const module = new Module(this.application, definition);
      this.connectModule(module);
    }
    unloadIdentifier(identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        this.disconnectModule(module);
      }
    }
    getContextForElementAndIdentifier(element, identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        return module.contexts.find((context) => context.element == element);
      }
    }
    handleError(error2, message, detail) {
      this.application.handleError(error2, message, detail);
    }
    createScopeForElementAndIdentifier(element, identifier) {
      return new Scope(this.schema, element, identifier, this.logger);
    }
    scopeConnected(scope) {
      this.scopesByIdentifier.add(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.connectContextForScope(scope);
      }
    }
    scopeDisconnected(scope) {
      this.scopesByIdentifier.delete(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.disconnectContextForScope(scope);
      }
    }
    connectModule(module) {
      this.modulesByIdentifier.set(module.identifier, module);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.connectContextForScope(scope));
    }
    disconnectModule(module) {
      this.modulesByIdentifier.delete(module.identifier);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.disconnectContextForScope(scope));
    }
  };
  var defaultSchema = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`
  };
  var Application = class {
    constructor(element = document.documentElement, schema = defaultSchema) {
      this.logger = console;
      this.debug = false;
      this.logDebugActivity = (identifier, functionName, detail = {}) => {
        if (this.debug) {
          this.logFormattedMessage(identifier, functionName, detail);
        }
      };
      this.element = element;
      this.schema = schema;
      this.dispatcher = new Dispatcher(this);
      this.router = new Router(this);
    }
    static start(element, schema) {
      const application2 = new Application(element, schema);
      application2.start();
      return application2;
    }
    async start() {
      await domReady();
      this.logDebugActivity("application", "starting");
      this.dispatcher.start();
      this.router.start();
      this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping");
      this.dispatcher.stop();
      this.router.stop();
      this.logDebugActivity("application", "stop");
    }
    register(identifier, controllerConstructor) {
      if (controllerConstructor.shouldLoad) {
        this.load({ identifier, controllerConstructor });
      }
    }
    load(head, ...rest) {
      const definitions = Array.isArray(head) ? head : [head, ...rest];
      definitions.forEach((definition) => this.router.loadDefinition(definition));
    }
    unload(head, ...rest) {
      const identifiers = Array.isArray(head) ? head : [head, ...rest];
      identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
    }
    get controllers() {
      return this.router.contexts.map((context) => context.controller);
    }
    getControllerForElementAndIdentifier(element, identifier) {
      const context = this.router.getContextForElementAndIdentifier(element, identifier);
      return context ? context.controller : null;
    }
    handleError(error2, message, detail) {
      var _a;
      this.logger.error(`%s

%o

%o`, message, error2, detail);
      (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
    }
    logFormattedMessage(identifier, functionName, detail = {}) {
      detail = Object.assign({ application: this }, detail);
      this.logger.groupCollapsed(`${identifier} #${functionName}`);
      this.logger.log("details:", Object.assign({}, detail));
      this.logger.groupEnd();
    }
  };
  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }
  function ClassPropertiesBlessing(constructor) {
    const classes = readInheritableStaticArrayValues(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition(key) {
    return {
      [`${key}Class`]: {
        get() {
          const { classes } = this;
          if (classes.has(key)) {
            return classes.get(key);
          } else {
            const attribute = classes.getAttributeName(key);
            throw new Error(`Missing attribute "${attribute}"`);
          }
        }
      },
      [`${key}Classes`]: {
        get() {
          return this.classes.getAll(key);
        }
      },
      [`has${capitalize(key)}Class`]: {
        get() {
          return this.classes.has(key);
        }
      }
    };
  }
  function TargetPropertiesBlessing(constructor) {
    const targets = readInheritableStaticArrayValues(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition(name) {
    return {
      [`${name}Target`]: {
        get() {
          const target = this.targets.find(name);
          if (target) {
            return target;
          } else {
            throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${name}Targets`]: {
        get() {
          return this.targets.findAll(name);
        }
      },
      [`has${capitalize(name)}Target`]: {
        get() {
          return this.targets.has(name);
        }
      }
    };
  }
  function ValuePropertiesBlessing(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair(valueDefinitionPair) {
    const definition = parseValueDefinitionPair(valueDefinitionPair);
    const { key, name, reader: read, writer: write } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write(value));
          }
        }
      },
      [`has${capitalize(name)}`]: {
        get() {
          return this.data.has(key) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair([token, typeDefinition]) {
    return valueDescriptorForTokenAndTypeDefinition(token, typeDefinition);
  }
  function parseValueTypeConstant(constant) {
    switch (constant) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function parseValueTypeDefault(defaultValue) {
    switch (typeof defaultValue) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(defaultValue))
      return "array";
    if (Object.prototype.toString.call(defaultValue) === "[object Object]")
      return "object";
  }
  function parseValueTypeObject(typeObject) {
    const typeFromObject = parseValueTypeConstant(typeObject.type);
    if (typeFromObject) {
      const defaultValueType = parseValueTypeDefault(typeObject.default);
      if (typeFromObject !== defaultValueType) {
        throw new Error(`Type "${typeFromObject}" must match the type of the default value. Given default value: "${typeObject.default}" as "${defaultValueType}"`);
      }
      return typeFromObject;
    }
  }
  function parseValueTypeDefinition(typeDefinition) {
    const typeFromObject = parseValueTypeObject(typeDefinition);
    const typeFromDefaultValue = parseValueTypeDefault(typeDefinition);
    const typeFromConstant = parseValueTypeConstant(typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    throw new Error(`Unknown value type "${typeDefinition}"`);
  }
  function defaultValueForDefinition(typeDefinition) {
    const constant = parseValueTypeConstant(typeDefinition);
    if (constant)
      return defaultValuesByType[constant];
    const defaultValue = typeDefinition.default;
    if (defaultValue !== void 0)
      return defaultValue;
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition(token, typeDefinition) {
    const key = `${dasherize(token)}-value`;
    const type = parseValueTypeDefinition(typeDefinition);
    return {
      type,
      key,
      name: camelize(key),
      get defaultValue() {
        return defaultValueForDefinition(typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault(typeDefinition) !== void 0;
      },
      reader: readers[type],
      writer: writers[type] || writers.default
    };
  }
  var defaultValuesByType = {
    get array() {
      return [];
    },
    boolean: false,
    number: 0,
    get object() {
      return {};
    },
    string: ""
  };
  var readers = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError("Expected array");
      }
      return array;
    },
    boolean(value) {
      return !(value == "0" || value == "false");
    },
    number(value) {
      return Number(value);
    },
    object(value) {
      const object = JSON.parse(value);
      if (object === null || typeof object != "object" || Array.isArray(object)) {
        throw new TypeError("Expected object");
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers = {
    default: writeString,
    array: writeJSON,
    object: writeJSON
  };
  function writeJSON(value) {
    return JSON.stringify(value);
  }
  function writeString(value) {
    return `${value}`;
  }
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    static get shouldLoad() {
      return true;
    }
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {
    }
    connect() {
    }
    disconnect() {
    }
    dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
      const type = prefix ? `${prefix}:${eventName}` : eventName;
      const event = new CustomEvent(type, { detail, bubbles, cancelable });
      target.dispatchEvent(event);
      return event;
    }
  };
  Controller.blessings = [ClassPropertiesBlessing, TargetPropertiesBlessing, ValuePropertiesBlessing];
  Controller.targets = [];
  Controller.values = {};

  // app/javascript/controllers/application.js
  var application = Application.start();
  application.debug = false;
  window.Stimulus = application;

  // app/javascript/controllers/hello_controller.js
  var hello_controller_default = class extends Controller {
    connect() {
      this.element.textContent = "Hello World!";
    }
  };

  // app/javascript/controllers/index.js
  application.register("hello", hello_controller_default);

  // app/javascript/application.js
  var import_jquery = __toESM(require_jquery());
  var import_datatables = __toESM(require_jquery_dataTables());
  var import_datatables2 = __toESM(require_dataTables_buttons());
  var import_buttons_html5 = __toESM(require_buttons_html5());
  var import_buttons_print = __toESM(require_buttons_print());
  var import_datatables3 = __toESM(require_buttons_bootstrap5());
  var import_datatables4 = __toESM(require_dataTables_responsive());
  var import_datatables5 = __toESM(require_dataTables_select());
  var import_datatables6 = __toESM(require_dataTables_fixedHeader());
  var import_datatables7 = __toESM(require_dataTables_bootstrap5());
  require_jquery();
  window.$ = window.JQuery = import_jquery.default;
  window.DataTable = (0, import_datatables7.default)();
})();
/*!
 * HTML5 export buttons for Buttons and DataTables.
 * 2016 SpryMedia Ltd - datatables.net/license
 *
 * FileSaver.js (1.3.3) - MIT license
 * Copyright © 2016 Eli Grey - http://eligrey.com
 */
/*!
 * Print button for Buttons and DataTables.
 * 2016 SpryMedia Ltd - datatables.net/license
 */
/*!
 * jQuery JavaScript Library v3.6.0
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2021-03-02T17:08Z
 */
/*! Bootstrap integration for DataTables' Buttons
 * ©2016 SpryMedia Ltd - datatables.net/license
 */
/*! Buttons for DataTables 2.2.1
 * ©2016-2022 SpryMedia Ltd - datatables.net/license
 */
/*! DataTables 1.11.3
 * ©2008-2021 SpryMedia Ltd - datatables.net/license
 */
/*! DataTables Bootstrap 5 integration
 * 2020 SpryMedia Ltd - datatables.net/license
 */
/*! FixedHeader 3.2.1
 * ©2009-2021 SpryMedia Ltd - datatables.net/license
 */
/*! Responsive 2.2.9
 * 2014-2021 SpryMedia Ltd - datatables.net/license
 */
/*! Select for DataTables 1.3.4-dev
 * 2015-2021 SpryMedia Ltd - datatables.net/license/mit
 */
//# sourceMappingURL=application.js.map
