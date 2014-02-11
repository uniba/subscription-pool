
var assert = require('better-assert');

var Pool = require('../');
var Subscription = require('../lib/subscription');
var Redis = require('../lib/drivers/redis');

var driver = new Redis();
var pool = new Pool(driver);

describe('subscription-pool', function() {
  it('should expose Pool', function() {
    assert('function' == typeof Pool);
  });
  it('should expose Subscription', function() {
    assert('function' == typeof Subscription);
  });
  it('should expose Redis', function() {
    assert('function' == typeof Redis);
  });
  describe('Pool', function() {
    describe('#subscribe()', function() {
      var sub = pool.subscribe('foo');
      it('should return subscription', function() {
        assert(sub instanceof Subscription);
        sub.unsubscribe();
      });
    });
  });
  describe('Subscription', function() {
    it('should emit subscribed', function(done) {
      var foo = pool.subscribe('foo');
      foo.once('subscribed', function() {
        done();
        foo.unsubscribe();
      });
    });
    it('should emit unsubscribed', function(done) {
      var foo = pool.subscribe('foo');
      foo.once('unsubscribed', function() {
        done();
      });
      foo.once('subscribed', function() {
        foo.unsubscribe();
      });
    });
    it('should emit message', function(done) {
      var foo = pool.subscribe('foo');
      foo.once('message', function(message) {
        assert(1 == message.foo);
        foo.unsubscribe();
        done();
      });
      driver.publish('foo', { foo: 1 });
    });
    it('should handle same channel', function(done) {
      var i = 0;
      var s1 = pool.subscribe('foo');
      var s2 = pool.subscribe('foo');
      s1.once('message', function(message) {
        assert('foo' == message.foo);
        s1.unsubscribe();
        if (++i == 2) done();
      });
      s2.once('message', function(message) {
        assert('foo' == message.foo);
        s2.unsubscribe();
        if (++i == 2) done();
      });
      driver.publish('foo', { foo: 'foo' });
    })
    it('should handle multiple channel', function(done) {
      var i = 0;
      var foo = pool.subscribe('foo');
      var bar = pool.subscribe('bar');
      var baz = pool.subscribe('baz');
      foo.once('message', function(message) {
        assert('foo' == message.foo);
        foo.unsubscribe();
        if (++i == 3) done();
      });
      bar.once('message', function(message) {
        assert('bar' == message.bar);
        bar.unsubscribe();
        if (++i == 3) done();
      });
      baz.once('message', function(message) {
        assert('baz' == message.baz);
        baz.unsubscribe();
        if (++i == 3) done();
      });
      driver.publish('foo', { foo: 'foo' });
      driver.publish('bar', { bar: 'bar' });
      driver.publish('baz', { baz: 'baz' });
    });
  });
});