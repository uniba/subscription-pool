
# subscription-pool

Subscription pooling and abstraction layer for Node.js

## Installation

npm:

    $ npm install subscription-pool

## Example

```javascript
var Pool = require('subscription-pool');
var Redis = require('subscription-pool/lib/drivers/redis');
var pool = new Pool(driver);

var sub = pool.subscribe('awesomechannelname');
sub.on('message', function(message) {
  // message => { foo: 'bar' }
});
sub.once('subscribed', function() {
  driver.publish('awesomechannelname', { foo: 'bar' });
});
```

## License

The MIT License

Copyright (c) 2014 Seiya Konno &lt;nulltask@gmail.com&gt;