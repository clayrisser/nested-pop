# nested-pop
Promise based nested populate for Waterline and SailsJS

## Installation

```sh
$ npm install --save nested-pop
```

## Usage

```js
var nestedPop = require('nested-pop');

User.find()
.populate('dog')
.then(function(users) {

    return nestedPop(users, {
        dog: [
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

If the property is named differently than the model, you may need to use it the following way.

```js
var nestedPop = require('nested-pop');

User.find()
.populate('canine')
.then(function(users) {

    return nestedPop(users, {
        canine: {
            as: 'dog',
            populate: [
                'breed'
            ]
        } 
    }).then(function(users) {
        return users
    }).catch(function(err) {
        throw err;
    });
    
}).catch(function(err) {
    throw err;
);
```

If the property is plural, but the model is in the singular form, it usually automatically detects it.
This only works when the property's plural form only adds a single 's' to the end of the model name.

```js
var nestedPop = require('nested-pop');

User.find()
.populate('dogs')
.then(function(users) {

    return nestedPop(users, {
        dogs: [
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
