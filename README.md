# nested-pop
Nested populate for SailsJS

## Installation

```sh
$ npm install --save nested-pop
```

## Usage

```js
var nestedPop = require('nested-pop');

User.find()
.populate('dogs')
.then(function(users) {
  nestedPop(users, {
    pets: [
      'breed'
    ]
  }).then(function(users) {
    return users
  }).catch(function(err) {
    throw err;
  });
}).catch(function(err) {
  throw err;
);
```
## License

MIT © [Jam Risser](http://jam.jamrizzi.com)

[npm-url]: https://npmjs.org/package/nested-pop