
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var debug = require('debug')('subscription:subscription');

/**
 * Expose `Subscription`.
 */

module.exports = Subscription;

/**
 * @param {Pool} pool
 * @param {String} channel
 */

function Subscription(pool, channel) {
  Emitter.call(this);
  this.pool = pool;
  this.channel = channel;
  this.driver = pool.driver;
  this.onmessage = this.onmessage.bind(this);
  this.subscribe();
}

/**
 * Inherits from `EventEmitter`.
 */

Subscription.prototype.__proto__ = Emitter.prototype;

/**
 * @api public
 */

Subscription.prototype.subscribe = function() {
  var self = this;
  this.readyState = 'subscribing';

  if (!this.pool.subscriptions[this.channel]) {
    debug('subscribing %s', this.channel);
    this.pool.subscriptions[this.channel] = 0;
    this.driver.subscribe(this.channel, function(err) {
      if (err) return self.emit('error', err);
      self.readyState = 'subscribed';
      self.emit('subscribed');
    });
  } else {
    this.readyState = 'subscribed';
    setImmediate(function() {
      self.emit('subscribed');
    });
  }

  ++this.pool.subscriptions[this.channel];
  this.pool.on(this.channel, this.onmessage);
};

/**
 * @api public
 */

Subscription.prototype.unsubscribe = function() {
  var destroy = 'subscribing' !== this.readyState && 'subscribed' !== this.readyState;
  if (destroy) return debug('ignore destroy');
  var self = this;
  this.pool.removeListener(this.channel, this.onmessage);
  this.pool.subscriptions[this.channel]--;
  if (!this.pool.subscriptions[this.channel]) {
    this.driver.unsubscribe(this.channel, function() {
      debug('confirmed unsubscription');
    });
  }
  this.readyState = 'unsubscribed';
  this.emit('unsubscribed');
  this.removeAllListeners();
};

/**
 * @param {Object} obj
 * @api private
 */

Subscription.prototype.onmessage = function(obj) {
  this.emit('message', obj);
};