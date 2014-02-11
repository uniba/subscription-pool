
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var redis = require('redis');

/**
 * Expose `Redis`.
 */

module.exports = Redis;

/**
 * noop reference.
 */

var noop = function() {};

/**
 * @param {Object} options
 */

function Redis(options) {
  if (!(this instanceof Redis)) return new Redis(options);
  Emitter.call(this);
  options = options || {};
  this.onmessage = this.onmessage.bind(this);
  if (!options.pack || !options.unpack) {
    try {
      var msgpack = require('megpack');
      this.pack = msgpack.pack;
      this.unpack = msgpack.unpack;
    } catch (e) {
      this.pack = JSON.stringify;
      this.unpack = JSON.parse;
    }
  } else {
    this.pack = options.pack;
    this.unpack = options.unpack;
  }
  this.pub = options.pub || redis.createClient();
  this.sub = options.sub || redis.createClient();
  this.sub.on('message', this.onmessage);
}

/**
 * Inherits from `EventEmitter`.
 */

Redis.prototype.__proto__ = Emitter.prototype;

/**
 * @param {String} channel
 * @param {Function} callback
 * @return {Redis}
 * @api public
 */

Redis.prototype.subscribe = function(channel, callback) {
  callback = callback || noop;
  this.sub.subscribe(channel, function(err) {
    if (err) return callback(err);
    callback(null);
  });
  return this;
};

/**
 * @param {String} channel
 * @param {Function} callback
 * @return {Redis}
 * @api public
 */

Redis.prototype.unsubscribe = function(channel, callback) {
  callback = callback || noop;
  this.sub.unsubscribe(channel, function(err) {
    if (err) return callback(err);
    callback(null);
  });
  return this;
};

/**
 * @param {String} channel
 * @param {Object} message
 * @param {Function} callback
 * @return {Redis}
 * @api public
 */

Redis.prototype.publish = function(channel, message, callback) {
  callback = callback || noop;
  this.pub.publish(channel, this.pack(message), function(err) {
    if (err) return callback(err);
    callback(null);
  });
  return this;
};

/**
 * @param {String} channel
 * @param {Object} message
 * @api private
 */

Redis.prototype.onmessage = function(channel, message) {
  this.emit('message', channel, this.unpack(message));
};