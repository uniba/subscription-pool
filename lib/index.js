
/**
 * Module
 */

var Emitter = require('events').EventEmitter;
var Subscription = require('./subscription');
var debug = require('debug')('subscription-pool:pool');

/**
 * Expose `Pool`.
 */

module.exports = Pool;

/**
 * @param {Driver} driver
 */

function Pool(driver) {
  if (!(this instanceof Pool)) return new Pool(driver);
  this.subscriptions = {};
  this.driver = driver;
  this.driver.on('message', this.onmessage.bind(this));
}

/**
 * Inherits from `Emitter`.
 */

Pool.prototype.__proto__ = Emitter.prototype;

/**
 * @param {String} channel
 * @return {Subscription}
 * @api public
 */

Pool.prototype.subscribe = function(channel) {
  return new Subscription(this, channel);
};

/**
 * @param {String} channel
 * @param {Object} message
 * @api private
 */

Pool.prototype.onmessage = function(channel, message) {
  if (!this.subscriptions[channel]) return;
  this.emit(channel, message);
};